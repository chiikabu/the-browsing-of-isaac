// Bulk export stage 2: decompile every function to C and dump its high + raw P-Code.
// Multi-threaded (one DecompInterface per worker), resumable (a function whose status
// line already exists is skipped), read-only with respect to the Ghidra database.
//
// Args: <exportRoot> <threads> <timeoutSec> <maxFunctions|0> <emitC 0|1> <emitPcode 0|1>
//       <emitRawPcode 0|1> <runStamp> [skipListFile]
//
// skipListFile: one "0xXXXXXXXX" VA per line. Those functions get raw P-Code only - the
// decompiler is never invoked on them. Used for the mid-function fragments produced by
// the coverage-recovery pass: decompiling one costs ~27s and just re-derives the high
// P-Code of the enclosing region that its neighbours already produced, while its own raw
// P-Code (which is what a mechanical lifter consumes) is exact and costs nothing.
//
// Layout:
//   <exportRoot>/c/<VA>>16 as 4 hex>/<VA>.c
//   <exportRoot>/pcode/<VA>>16 as 4 hex>/<VA>.pcode.json.gz
//   <exportRoot>/status/decomp-<runStamp>.jsonl
//   <exportRoot>/decompile-complete.marker   (only when nothing was left to do)
//
// @category IsaacRecomp

import ghidra.app.decompiler.DecompInterface;
import ghidra.app.decompiler.DecompileOptions;
import ghidra.app.decompiler.DecompileResults;
import ghidra.app.decompiler.DecompiledFunction;
import ghidra.app.script.GhidraScript;
import ghidra.program.model.address.Address;
import ghidra.program.model.address.AddressSetView;
import ghidra.program.model.data.DataType;
import ghidra.program.model.lang.Register;
import ghidra.program.model.listing.Function;
import ghidra.program.model.listing.FunctionIterator;
import ghidra.program.model.listing.Instruction;
import ghidra.program.model.listing.InstructionIterator;
import ghidra.program.model.listing.Listing;
import ghidra.program.model.pcode.FunctionPrototype;
import ghidra.program.model.pcode.GlobalSymbolMap;
import ghidra.program.model.pcode.HighFunction;
import ghidra.program.model.pcode.HighSymbol;
import ghidra.program.model.pcode.JumpTable;
import ghidra.program.model.pcode.LocalSymbolMap;
import ghidra.program.model.pcode.PcodeBlockBasic;
import ghidra.program.model.pcode.PcodeOp;
import ghidra.program.model.pcode.Varnode;
import ghidra.program.model.pcode.VarnodeAST;
import ghidra.util.task.TaskMonitor;

import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;
import java.io.Writer;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.Iterator;
import java.util.List;
import java.util.Set;
import java.util.concurrent.ConcurrentLinkedQueue;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicLong;
import java.util.zip.GZIPOutputStream;

public class ExportDecompiled extends GhidraScript {

    private File cRoot;
    private File pcodeRoot;
    private boolean emitC;
    private boolean emitPcode;
    private boolean emitRawPcode;
    private int timeoutSec;

    private Writer statusWriter;
    private final Object statusLock = new Object();

    private final AtomicInteger done = new AtomicInteger();
    private final AtomicInteger okCount = new AtomicInteger();
    private final AtomicInteger failCount = new AtomicInteger();
    private final AtomicLong highOpTotal = new AtomicLong();
    private final AtomicLong rawOpTotal = new AtomicLong();
    /** VAs that get raw P-Code only: the decompiler is never invoked on them. */
    private final Set<String> rawOnly = new HashSet<String>();
    private final AtomicInteger skippedCount = new AtomicInteger();
    /** worker name -> VA currently being decompiled, so a hang names the culprit. */
    private final java.util.concurrent.ConcurrentHashMap<String, String> inFlight =
        new java.util.concurrent.ConcurrentHashMap<String, String>();

    // ------------------------------------------------------------------ helpers

    private static String esc(String s) {
        if (s == null) {
            return "null";
        }
        StringBuilder b = new StringBuilder(s.length() + 16);
        b.append('"');
        for (int i = 0; i < s.length(); i++) {
            char c = s.charAt(i);
            switch (c) {
                case '"': b.append("\\\""); break;
                case '\\': b.append("\\\\"); break;
                case '\n': b.append("\\n"); break;
                case '\r': b.append("\\r"); break;
                case '\t': b.append("\\t"); break;
                default:
                    if (c < 0x20 || c == 0x7f) {
                        b.append(String.format("\\u%04x", (int) c));
                    }
                    else {
                        b.append(c);
                    }
            }
        }
        b.append('"');
        return b.toString();
    }

    private static String va8(Address a) {
        return String.format("%08x", a.getOffset());
    }

    private static String shard(Address a) {
        return String.format("%04x", (a.getOffset() >>> 16) & 0xffffL);
    }

    // ---------------------------------------------------------------------- run

    @Override
    protected void run() throws Exception {
        String[] args = getScriptArgs();
        if (args.length < 8) {
            throw new IllegalArgumentException(
                "Expected: <exportRoot> <threads> <timeoutSec> <maxFunctions> <emitC> <emitPcode> <emitRawPcode> <stamp>");
        }
        File exportRoot = new File(args[0]).getCanonicalFile();
        int threads = Integer.parseInt(args[1]);
        timeoutSec = Integer.parseInt(args[2]);
        int maxFunctions = Integer.parseInt(args[3]);
        emitC = "1".equals(args[4]);
        emitPcode = "1".equals(args[5]);
        emitRawPcode = "1".equals(args[6]);
        String stamp = args[7];
        if (args.length > 8 && !"-".equals(args[8])) {
            File skipFile = new File(args[8]);
            if (skipFile.isFile()) {
                BufferedReader r = new BufferedReader(
                    new InputStreamReader(new FileInputStream(skipFile), StandardCharsets.UTF_8));
                try {
                    String line;
                    while ((line = r.readLine()) != null) {
                        String t = line.trim();
                        if (t.startsWith("0x")) {
                            rawOnly.add(t);
                        }
                    }
                }
                finally {
                    r.close();
                }
            }
            println("raw-P-Code-only list: " + rawOnly.size() + " functions");
        }

        cRoot = new File(exportRoot, "c");
        pcodeRoot = new File(exportRoot, "pcode");
        File statusDir = new File(exportRoot, "status");
        cRoot.mkdirs();
        pcodeRoot.mkdirs();
        statusDir.mkdirs();
        File marker = new File(exportRoot, "decompile-complete.marker");
        if (marker.exists()) {
            marker.delete();
        }

        Set<String> alreadyDone = readCompleted(statusDir);
        println("resume: " + alreadyDone.size() + " functions already have a status record");

        ConcurrentLinkedQueue<Function> queue = new ConcurrentLinkedQueue<Function>();
        int total = 0;
        int outstanding = 0;
        int queued = 0;
        FunctionIterator fit = currentProgram.getFunctionManager().getFunctions(true);
        while (fit.hasNext()) {
            Function f = fit.next();
            total++;
            String key = "0x" + va8(f.getEntryPoint());
            if (alreadyDone.contains(key)) {
                continue;
            }
            outstanding++;
            if (maxFunctions > 0 && queued >= maxFunctions) {
                continue;
            }
            queue.add(f);
            queued++;
        }
        println("queue: " + queued + " this pass; " + outstanding + " outstanding of " + total
            + " total functions; " + threads + " threads");
        if (queued == 0) {
            writeMarker(marker, "nothing to do");
            println("REMAINING 0");
            return;
        }

        File statusFile = new File(statusDir, "decomp-" + stamp + ".jsonl");
        statusWriter = new BufferedWriter(
            new OutputStreamWriter(new FileOutputStream(statusFile, true), StandardCharsets.UTF_8), 1 << 16);

        final int workerCount = Math.max(1, threads);
        final CountDownLatch latch = new CountDownLatch(workerCount);
        final int startTotal = queued;
        List<Thread> pool = new ArrayList<Thread>();
        for (int i = 0; i < workerCount; i++) {
            final int wid = i;
            Thread t = new Thread(new Runnable() {
                @Override
                public void run() {
                    DecompInterface d = null;
                    try {
                        d = newDecompiler();
                        for (;;) {
                            Function f = queue.poll();
                            if (f == null) {
                                break;
                            }
                            inFlight.put(Thread.currentThread().getName(), "0x" + va8(f.getEntryPoint())
                                + " (" + f.getBody().getNumAddresses() + "B)");
                            try {
                                processFunction(d, f);
                            }
                            catch (Throwable t2) {
                                try {
                                    writeStatus(f, false, "worker exception: " + t2.getClass().getName() + ": "
                                        + t2.getMessage(), 0, -1, null, null, -1, 0, 0, 0);
                                }
                                catch (Exception ignore) {
                                    // status writing is best effort
                                }
                                failCount.incrementAndGet();
                            }
                            done.incrementAndGet();
                        }
                    }
                    catch (Throwable fatal) {
                        System.err.println("worker " + wid + " fatal: " + fatal);
                    }
                    finally {
                        if (d != null) {
                            d.dispose();
                        }
                        latch.countDown();
                    }
                }
            }, "decomp-" + i);
            t.setDaemon(false);
            pool.add(t);
            t.start();
        }

        long t0 = System.currentTimeMillis();
        // Watchdog: if nothing finishes for this long the JVM is wedged on some function.
        // Bail out loudly so the driver restarts the pass instead of hanging forever.
        final long stallLimitMs = Math.max(15L * 60_000L, timeoutSec * 4L * 1000L);
        int lastDone = -1;
        long lastChangeMs = System.currentTimeMillis();
        while (!latch.await(15, java.util.concurrent.TimeUnit.SECONDS)) {
            int d = done.get();
            long now = System.currentTimeMillis();
            if (d != lastDone) {
                lastDone = d;
                lastChangeMs = now;
            }
            long secs = Math.max(1, (now - t0) / 1000);
            println("progress " + d + "/" + startTotal + " ok=" + okCount.get() + " fail=" + failCount.get()
                + " rate=" + (d / secs) + "/s elapsed=" + secs + "s");
            synchronized (statusLock) {
                statusWriter.flush();
            }
            if (now - lastChangeMs > stallLimitMs) {
                println("STALLED: no function completed for " + ((now - lastChangeMs) / 1000)
                    + "s; in-flight = " + inFlight);
                synchronized (statusLock) {
                    statusWriter.flush();
                }
                println("REMAINING " + queue.size());
                Runtime.getRuntime().halt(3);
            }
        }
        for (Thread t : pool) {
            t.join();
        }
        synchronized (statusLock) {
            statusWriter.flush();
            statusWriter.close();
        }

        int remaining = queue.size();
        println("done=" + done.get() + " ok=" + okCount.get() + " fail=" + failCount.get()
            + " rawOnly=" + skippedCount.get()
            + " highOps=" + highOpTotal.get() + " rawOps=" + rawOpTotal.get());
        println("wall=" + ((System.currentTimeMillis() - t0) / 1000) + "s");
        if (remaining == 0 && (maxFunctions <= 0 || startTotal < maxFunctions)) {
            writeMarker(marker, "completed " + done.get() + " functions");
        }
        println("REMAINING " + remaining);
    }

    private void writeMarker(File marker, String text) throws Exception {
        BufferedWriter w = new BufferedWriter(
            new OutputStreamWriter(new FileOutputStream(marker, false), StandardCharsets.UTF_8));
        try {
            w.write(text);
            w.write('\n');
        }
        finally {
            w.close();
        }
    }

    private Set<String> readCompleted(File statusDir) {
        Set<String> out = new HashSet<String>();
        File[] files = statusDir.listFiles();
        if (files == null) {
            return out;
        }
        for (File f : files) {
            if (!f.isFile() || !f.getName().startsWith("decomp-") || !f.getName().endsWith(".jsonl")) {
                continue;
            }
            try {
                BufferedReader r = new BufferedReader(
                    new InputStreamReader(new FileInputStream(f), StandardCharsets.UTF_8), 1 << 20);
                try {
                    String line;
                    while ((line = r.readLine()) != null) {
                        int i = line.indexOf("\"va\":\"");
                        if (i < 0 || !line.endsWith("}")) {
                            continue;
                        }
                        int s = i + 6;
                        int e = line.indexOf('"', s);
                        if (e > s) {
                            out.add(line.substring(s, e));
                        }
                    }
                }
                finally {
                    r.close();
                }
            }
            catch (Exception e) {
                println("warning: could not read status file " + f + ": " + e);
            }
        }
        return out;
    }

    private DecompInterface newDecompiler() {
        DecompInterface d = new DecompInterface();
        DecompileOptions opts = new DecompileOptions();
        opts.setMaxPayloadMBytes(128);
        d.setOptions(opts);
        d.toggleCCode(emitC);
        d.toggleSyntaxTree(true);
        d.setSimplificationStyle("decompile");
        if (!d.openProgram(currentProgram)) {
            throw new IllegalStateException("DecompInterface.openProgram failed: " + d.getLastMessage());
        }
        return d;
    }

    // ------------------------------------------------------------- per function

    private void processFunction(DecompInterface d, Function f) throws Exception {
        Address entry = f.getEntryPoint();
        long start = System.currentTimeMillis();

        if (f.isExternal()) {
            writeStatus(f, false, "external function (no body)", System.currentTimeMillis() - start,
                0, null, null, 0, 0, 0, 0);
            failCount.incrementAndGet();
            return;
        }

        boolean rawOnlyThis = rawOnly.contains("0x" + va8(entry));
        DecompileResults res = rawOnlyThis ? null : d.decompileFunction(f, timeoutSec, TaskMonitor.DUMMY);
        long ms = System.currentTimeMillis() - start;
        boolean ok = res != null && res.decompileCompleted();
        String err;
        if (rawOnlyThis) {
            err = "raw-pcode-only by policy (recovered mid-function fragment)";
            skippedCount.incrementAndGet();
        }
        else {
            err = res == null ? "decompileFunction returned null" : res.getErrorMessage();
            if (err != null && err.trim().isEmpty()) {
                err = null;
            }
        }

        String cPath = null;
        int cBytes = -1;
        if (ok && emitC) {
            DecompiledFunction df = res.getDecompiledFunction();
            if (df != null && df.getC() != null) {
                File dir = new File(cRoot, shard(entry));
                dir.mkdirs();
                File out = new File(dir, va8(entry) + ".c");
                byte[] bytes = buildCFile(f, df).getBytes(StandardCharsets.UTF_8);
                FileOutputStream fos = new FileOutputStream(out, false);
                try {
                    fos.write(bytes);
                }
                finally {
                    fos.close();
                }
                cBytes = bytes.length;
                cPath = "c/" + shard(entry) + "/" + va8(entry) + ".c";
            }
        }

        String pcodePath = null;
        long pcodeGzBytes = -1;
        int highOps = 0;
        int highBlocks = 0;
        int rawOps = 0;
        if (emitPcode) {
            HighFunction hf = res == null ? null : res.getHighFunction();
            int[] counters = new int[3];
            File dir = new File(pcodeRoot, shard(entry));
            dir.mkdirs();
            File out = new File(dir, va8(entry) + ".pcode.json.gz");
            FileOutputStream fos = new FileOutputStream(out, false);
            try {
                GZIPOutputStream gz = new GZIPOutputStream(fos, 1 << 16);
                Writer w = new OutputStreamWriter(gz, StandardCharsets.UTF_8);
                writePcodeJson(w, f, hf, ok, err, ms, counters);
                w.flush();
                gz.finish();
            }
            finally {
                fos.close();
            }
            highOps = counters[0];
            highBlocks = counters[1];
            rawOps = counters[2];
            pcodeGzBytes = out.length();
            pcodePath = "pcode/" + shard(entry) + "/" + va8(entry) + ".pcode.json.gz";
            highOpTotal.addAndGet(highOps);
            rawOpTotal.addAndGet(rawOps);
        }

        if (ok) {
            okCount.incrementAndGet();
        }
        else {
            failCount.incrementAndGet();
        }
        writeStatus(f, ok, err, ms, cBytes, cPath, pcodePath, pcodeGzBytes, highOps, highBlocks, rawOps);
    }

    private String buildCFile(Function f, DecompiledFunction df) {
        StringBuilder b = new StringBuilder(df.getC().length() + 256);
        b.append("/* Ghidra decompilation\n");
        b.append(" * entry:      0x").append(va8(f.getEntryPoint())).append('\n');
        b.append(" * name:       ").append(f.getName()).append('\n');
        b.append(" * qualified:  ").append(f.getName(true)).append('\n');
        b.append(" * convention: ").append(f.getCallingConventionName()).append('\n');
        b.append(" * bodyBytes:  ").append(f.getBody().getNumAddresses()).append('\n');
        b.append(" * signature:  ").append(df.getSignature()).append('\n');
        b.append(" */\n");
        b.append(df.getC());
        return b.toString();
    }

    private void writeStatus(Function f, boolean ok, String err, long ms, int cBytes, String cPath,
            String pcodePath, long pcodeGzBytes, int highOps, int highBlocks, int rawOps) throws Exception {
        StringBuilder b = new StringBuilder(256);
        b.append("{\"va\":\"0x").append(va8(f.getEntryPoint())).append('"');
        b.append(",\"ok\":").append(ok);
        b.append(",\"error\":").append(esc(err));
        b.append(",\"ms\":").append(ms);
        b.append(",\"cBytes\":").append(cBytes);
        b.append(",\"cPath\":").append(esc(cPath));
        b.append(",\"pcodePath\":").append(esc(pcodePath));
        b.append(",\"pcodeGzBytes\":").append(pcodeGzBytes);
        b.append(",\"highOps\":").append(highOps);
        b.append(",\"highBlocks\":").append(highBlocks);
        b.append(",\"rawOps\":").append(rawOps);
        b.append(",\"skipped\":").append(rawOnly.contains("0x" + va8(f.getEntryPoint())));
        b.append("}\n");
        String line = b.toString();
        synchronized (statusLock) {
            statusWriter.write(line);
        }
    }

    // ------------------------------------------------------------------- P-Code

    private void varnodeJson(StringBuilder b, Varnode vn) {
        if (vn == null) {
            b.append("null");
            return;
        }
        Address a = vn.getAddress();
        String space = a == null ? "unknown" : a.getAddressSpace().getName();
        b.append("{\"space\":").append(esc(space));
        b.append(",\"offset\":\"0x").append(Long.toHexString(vn.getOffset())).append('"');
        b.append(",\"size\":").append(vn.getSize());
        if (vn.isRegister() && a != null) {
            Register reg = currentProgram.getLanguage().getRegister(a, vn.getSize());
            if (reg == null) {
                reg = currentProgram.getLanguage().getRegister(a, 0);
            }
            if (reg != null) {
                b.append(",\"register\":").append(esc(reg.getName()));
            }
        }
        if (vn.isConstant()) {
            b.append(",\"kind\":\"const\"");
        }
        else if (vn.isRegister()) {
            b.append(",\"kind\":\"register\"");
        }
        else if (vn.isUnique()) {
            b.append(",\"kind\":\"unique\"");
        }
        else if (vn.isAddress()) {
            b.append(",\"kind\":\"ram\"");
        }
        else {
            b.append(",\"kind\":\"other\"");
        }
        if (vn.isInput()) {
            b.append(",\"input\":true");
        }
        if (vn.isAddrTied()) {
            b.append(",\"addrTied\":true");
        }
        if (vn instanceof VarnodeAST) {
            b.append(",\"id\":").append(((VarnodeAST) vn).getUniqueId());
        }
        PcodeOp def = vn.getDef();
        if (def != null && def.getSeqnum() != null) {
            b.append(",\"def\":").append(def.getSeqnum().getTime());
        }
        b.append('}');
    }

    private void opJson(StringBuilder b, PcodeOp op, boolean high) {
        b.append('{');
        if (high && op.getSeqnum() != null) {
            b.append("\"seq\":").append(op.getSeqnum().getTime()).append(',');
            Address t = op.getSeqnum().getTarget();
            b.append("\"addr\":").append(t == null ? "null" : ("\"0x" + va8(t) + "\"")).append(',');
        }
        b.append("\"op\":").append(esc(op.getMnemonic()));
        b.append(",\"opcode\":").append(op.getOpcode());
        b.append(",\"output\":");
        varnodeJson(b, op.getOutput());
        b.append(",\"inputs\":[");
        Varnode[] ins = op.getInputs();
        for (int i = 0; i < ins.length; i++) {
            if (i > 0) {
                b.append(',');
            }
            varnodeJson(b, ins[i]);
        }
        b.append("]}");
    }

    private void symbolJson(StringBuilder b, HighSymbol s) {
        DataType dt = s.getDataType();
        b.append("{\"name\":").append(esc(s.getName()));
        b.append(",\"type\":").append(esc(dt == null ? null : dt.getDisplayName()));
        b.append(",\"size\":").append(s.getSize());
        b.append(",\"storage\":").append(esc(String.valueOf(s.getStorage())));
        b.append(",\"isParameter\":").append(s.isParameter());
        b.append(",\"isGlobal\":").append(s.isGlobal());
        Address pc = s.getPCAddress();
        b.append(",\"pc\":").append(pc == null || pc == Address.NO_ADDRESS ? "null" : ("\"0x" + va8(pc) + "\""));
        b.append('}');
    }

    /** Keep per-worker memory bounded: spill the JSON buffer to the gzip stream as it grows. */
    private static void spill(Writer w, StringBuilder b) throws java.io.IOException {
        if (b.length() > (1 << 20)) {
            w.write(b.toString());
            b.setLength(0);
        }
    }

    private void writePcodeJson(Writer w, Function f, HighFunction hf, boolean ok, String err, long ms,
            int[] counters) throws java.io.IOException {
        StringBuilder b = new StringBuilder(1 << 16);
        Address entry = f.getEntryPoint();
        b.append("{\"schema\":\"isaac-pcode/1\"");
        b.append(",\"va\":\"0x").append(va8(entry)).append('"');
        b.append(",\"name\":").append(esc(f.getName()));
        b.append(",\"qualifiedName\":").append(esc(f.getName(true)));
        b.append(",\"callingConvention\":").append(esc(f.getCallingConventionName()));
        b.append(",\"bodyBytes\":").append(f.getBody().getNumAddresses());
        b.append(",\"decompiled\":").append(ok);
        b.append(",\"decompileError\":").append(esc(err));
        b.append(",\"decompileMs\":").append(ms);

        if (hf != null) {
            FunctionPrototype proto = hf.getFunctionPrototype();
            if (proto != null) {
                b.append(",\"prototype\":{");
                b.append("\"model\":").append(esc(proto.getModelName()));
                DataType rt = proto.getReturnType();
                b.append(",\"returnType\":").append(esc(rt == null ? null : rt.getDisplayName()));
                b.append(",\"returnStorage\":").append(esc(String.valueOf(proto.getReturnStorage())));
                b.append(",\"varArgs\":").append(proto.isVarArg());
                b.append(",\"noReturn\":").append(proto.hasNoReturn());
                b.append(",\"inline\":").append(proto.isInline());
                b.append(",\"extraPop\":").append(proto.getExtraPop());
                b.append(",\"params\":[");
                for (int i = 0; i < proto.getNumParams(); i++) {
                    if (i > 0) {
                        b.append(',');
                    }
                    symbolJson(b, proto.getParam(i));
                }
                b.append("]}");
            }

            LocalSymbolMap lsm = hf.getLocalSymbolMap();
            if (lsm != null) {
                b.append(",\"locals\":[");
                Iterator<HighSymbol> it = lsm.getSymbols();
                boolean first = true;
                while (it.hasNext()) {
                    if (!first) {
                        b.append(',');
                    }
                    first = false;
                    symbolJson(b, it.next());
                }
                b.append(']');
            }
            GlobalSymbolMap gsm = hf.getGlobalSymbolMap();
            if (gsm != null) {
                b.append(",\"globals\":[");
                Iterator<HighSymbol> it = gsm.getSymbols();
                boolean first = true;
                while (it.hasNext()) {
                    if (!first) {
                        b.append(',');
                    }
                    first = false;
                    symbolJson(b, it.next());
                }
                b.append(']');
            }

            JumpTable[] jts = hf.getJumpTables();
            b.append(",\"jumpTables\":[");
            if (jts != null) {
                for (int i = 0; i < jts.length; i++) {
                    if (i > 0) {
                        b.append(',');
                    }
                    JumpTable jt = jts[i];
                    b.append("{\"switch\":\"0x").append(va8(jt.getSwitchAddress())).append('"');
                    b.append(",\"cases\":[");
                    Address[] cases = jt.getCases();
                    if (cases != null) {
                        for (int j = 0; j < cases.length; j++) {
                            if (j > 0) {
                                b.append(',');
                            }
                            b.append("\"0x").append(va8(cases[j])).append('"');
                        }
                    }
                    b.append("]}");
                }
            }
            b.append(']');

            ArrayList<PcodeBlockBasic> blocks = hf.getBasicBlocks();
            int opCount = 0;
            b.append(",\"high\":{\"blocks\":[");
            if (blocks != null) {
                for (int i = 0; i < blocks.size(); i++) {
                    PcodeBlockBasic blk = blocks.get(i);
                    if (i > 0) {
                        b.append(',');
                    }
                    b.append("{\"index\":").append(blk.getIndex());
                    b.append(",\"start\":\"0x").append(va8(blk.getStart())).append('"');
                    b.append(",\"stop\":\"0x").append(va8(blk.getStop())).append('"');
                    b.append(",\"in\":[");
                    for (int k = 0; k < blk.getInSize(); k++) {
                        if (k > 0) {
                            b.append(',');
                        }
                        b.append(blk.getIn(k).getIndex());
                    }
                    b.append("],\"out\":[");
                    for (int k = 0; k < blk.getOutSize(); k++) {
                        if (k > 0) {
                            b.append(',');
                        }
                        b.append(blk.getOut(k).getIndex());
                    }
                    b.append("],\"ops\":[");
                    Iterator<PcodeOp> oit = blk.getIterator();
                    boolean firstOp = true;
                    while (oit.hasNext()) {
                        if (!firstOp) {
                            b.append(',');
                        }
                        firstOp = false;
                        opJson(b, oit.next(), true);
                        opCount++;
                    }
                    b.append("]}");
                    spill(w, b);
                }
            }
            b.append("],\"blockCount\":").append(blocks == null ? 0 : blocks.size());
            b.append(",\"opCount\":").append(opCount).append('}');
            counters[0] = opCount;
            counters[1] = blocks == null ? 0 : blocks.size();
        }
        else {
            b.append(",\"high\":null");
        }

        if (emitRawPcode) {
            Listing listing = currentProgram.getListing();
            AddressSetView body = f.getBody();
            int rawOps = 0;
            int instrCount = 0;
            b.append(",\"raw\":{\"instructions\":[");
            InstructionIterator it = listing.getInstructions(body, true);
            boolean first = true;
            while (it.hasNext()) {
                Instruction insn = it.next();
                if (!first) {
                    b.append(',');
                }
                first = false;
                instrCount++;
                b.append("{\"addr\":\"0x").append(va8(insn.getAddress())).append('"');
                b.append(",\"length\":").append(insn.getLength());
                StringBuilder hexb = new StringBuilder();
                try {
                    for (byte v : insn.getBytes()) {
                        hexb.append(String.format("%02x", v & 0xff));
                    }
                }
                catch (Exception e) {
                    hexb.setLength(0);
                }
                b.append(",\"bytes\":\"").append(hexb).append('"');
                b.append(",\"text\":").append(esc(insn.toString()));
                b.append(",\"ops\":[");
                PcodeOp[] ops;
                try {
                    ops = insn.getPcode();
                }
                catch (Exception e) {
                    ops = new PcodeOp[0];
                }
                for (int i = 0; i < ops.length; i++) {
                    if (i > 0) {
                        b.append(',');
                    }
                    opJson(b, ops[i], false);
                    rawOps++;
                }
                b.append("]}");
                spill(w, b);
            }
            b.append("],\"instructionCount\":").append(instrCount);
            b.append(",\"opCount\":").append(rawOps).append('}');
            counters[2] = rawOps;
        }
        else {
            b.append(",\"raw\":null");
        }

        b.append('}');
        w.write(b.toString());
    }
}
