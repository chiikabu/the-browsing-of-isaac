// Bulk export stage 1: dump every function Ghidra knows about as JSONL, plus
// program-wide .text coverage statistics. Read-only; no database changes.
//
// Args: <functions.raw.jsonl> <ghidra-stats.json> <maxFunctions|0>
//
// @category IsaacRecomp

import ghidra.app.script.GhidraScript;
import ghidra.program.model.address.Address;
import ghidra.program.model.address.AddressSet;
import ghidra.program.model.address.AddressSetView;
import ghidra.program.model.data.DataType;
import ghidra.program.model.listing.Bookmark;
import ghidra.program.model.listing.BookmarkManager;
import ghidra.program.model.listing.Data;
import ghidra.program.model.listing.DataIterator;
import ghidra.program.model.listing.Function;
import ghidra.program.model.listing.FunctionIterator;
import ghidra.program.model.listing.Instruction;
import ghidra.program.model.listing.InstructionIterator;
import ghidra.program.model.listing.Listing;
import ghidra.program.model.listing.Parameter;
import ghidra.program.model.mem.MemoryBlock;
import ghidra.program.model.symbol.FlowType;
import ghidra.program.model.symbol.Reference;
import ghidra.program.model.symbol.Symbol;
import ghidra.program.model.symbol.SymbolTable;

import java.io.BufferedWriter;
import java.io.File;
import java.io.FileOutputStream;
import java.io.OutputStreamWriter;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.TreeSet;
import java.util.regex.Pattern;

public class ExportInventory extends GhidraScript {

    // MSVC structured / C++ exception handling helper names.
    private static final Pattern EH_NAME = Pattern.compile(
        "(?i)^[_@]{0,3}(SEH_prolog|SEH_epilog|EH_prolog|EH_epilog|except_handler|CxxFrameHandler|"
        + "CxxThrowException|local_unwind|global_unwind|XcptFilter|unwind_|FrameUnwind|"
        + "CppXcptFilter|SEH_prolog4|SEH_epilog4).*");

    private static String esc(String s) {
        if (s == null) {
            return "null";
        }
        StringBuilder b = new StringBuilder(s.length() + 8);
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

    private static String hex(Address a) {
        if (a == null) {
            return "null";
        }
        return "\"0x" + String.format("%08x", a.getOffset()) + "\"";
    }

    private static String hexs(long v) {
        return "\"0x" + String.format("%08x", v) + "\"";
    }

    @Override
    protected void run() throws Exception {
        String[] args = getScriptArgs();
        if (args.length < 2) {
            throw new IllegalArgumentException("Expected: <outJsonl> <outStatsJson> [maxFunctions]");
        }
        File outFile = new File(args[0]).getCanonicalFile();
        File statsFile = new File(args[1]).getCanonicalFile();
        int maxFunctions = args.length > 2 ? Integer.parseInt(args[2]) : 0;
        outFile.getParentFile().mkdirs();
        statsFile.getParentFile().mkdirs();

        Listing listing = currentProgram.getListing();
        SymbolTable symtab = currentProgram.getSymbolTable();
        BookmarkManager bmarks = currentProgram.getBookmarkManager();

        MemoryBlock textBlock = null;
        StringBuilder blocksJson = new StringBuilder("[");
        boolean firstBlock = true;
        for (MemoryBlock mb : currentProgram.getMemory().getBlocks()) {
            if (!firstBlock) {
                blocksJson.append(',');
            }
            firstBlock = false;
            blocksJson.append("{\"name\":").append(esc(mb.getName()))
                .append(",\"start\":").append(hex(mb.getStart()))
                .append(",\"end\":").append(hex(mb.getEnd()))
                .append(",\"size\":").append(mb.getSize())
                .append(",\"exec\":").append(mb.isExecute())
                .append(",\"write\":").append(mb.isWrite())
                .append(",\"init\":").append(mb.isInitialized())
                .append('}');
            if (".text".equals(mb.getName())) {
                textBlock = mb;
            }
        }
        blocksJson.append(']');
        if (textBlock == null) {
            throw new IllegalStateException("No .text memory block found");
        }
        AddressSet textSet = new AddressSet(textBlock.getStart(), textBlock.getEnd());

        AddressSet functionBodies = new AddressSet();
        long total = 0;
        long written = 0;
        long instrTotal = 0;

        BufferedWriter w = new BufferedWriter(
            new OutputStreamWriter(new FileOutputStream(outFile, false), StandardCharsets.UTF_8), 1 << 20);
        try {
            FunctionIterator fit = currentProgram.getFunctionManager().getFunctions(true);
            while (fit.hasNext()) {
                if (monitor.isCancelled()) {
                    break;
                }
                Function f = fit.next();
                total++;
                AddressSetView body = f.getBody();
                // Coverage stats always span every function, even when --max-functions
                // truncates the JSONL for a smoke test.
                functionBodies.add(body);
                if (maxFunctions > 0 && written >= maxFunctions) {
                    continue;
                }

                long instrCount = 0;
                long indirectCalls = 0;
                long directCalls = 0;
                long computedJumps = 0;
                long unresolvedComputedJumps = 0;
                boolean fsSegment = false;
                Set<String> callees = new TreeSet<String>();
                Set<String> calleeNames = new LinkedHashSet<String>();

                InstructionIterator iit = listing.getInstructions(body, true);
                while (iit.hasNext()) {
                    Instruction insn = iit.next();
                    instrCount++;
                    if (!fsSegment && insn.toString().indexOf("FS:") >= 0) {
                        fsSegment = true;
                    }
                    FlowType ft = insn.getFlowType();
                    if (ft.isCall()) {
                        if (ft.isComputed()) {
                            indirectCalls++;
                        }
                        else {
                            directCalls++;
                        }
                    }
                    if (ft.isJump() && ft.isComputed()) {
                        computedJumps++;
                        Address[] flows = insn.getFlows();
                        if (flows == null || flows.length == 0) {
                            unresolvedComputedJumps++;
                        }
                    }
                    for (Reference ref : insn.getReferencesFrom()) {
                        if (ref.getReferenceType().isCall()) {
                            Address to = ref.getToAddress();
                            callees.add("0x" + String.format("%08x", to.getOffset()));
                            Function cf = currentProgram.getFunctionManager().getFunctionAt(to);
                            if (cf != null) {
                                calleeNames.add(cf.getName());
                            }
                        }
                    }
                }
                instrTotal += instrCount;

                boolean ehCallee = false;
                for (String cn : calleeNames) {
                    if (EH_NAME.matcher(cn).matches()) {
                        ehCallee = true;
                        break;
                    }
                }

                // Bookmarks at the entry point: the Function ID analyzer leaves one with
                // category "Function ID Analyzer", which is how we flag library code.
                boolean fid = false;
                StringBuilder bmJson = new StringBuilder("[");
                boolean firstBm = true;
                Bookmark[] bms = bmarks.getBookmarks(f.getEntryPoint());
                if (bms != null) {
                    for (Bookmark b : bms) {
                        if (!firstBm) {
                            bmJson.append(',');
                        }
                        firstBm = false;
                        bmJson.append("{\"type\":").append(esc(b.getTypeString()))
                            .append(",\"category\":").append(esc(b.getCategory()))
                            .append(",\"comment\":").append(esc(b.getComment()))
                            .append('}');
                        String cat = b.getCategory();
                        String cmt = b.getComment();
                        if ((cat != null && cat.toLowerCase().contains("function id"))
                            || (cmt != null && cmt.startsWith("Library Function"))) {
                            fid = true;
                        }
                    }
                }
                bmJson.append(']');

                StringBuilder symJson = new StringBuilder("[");
                String mangled = null;
                boolean firstSym = true;
                Symbol[] syms = symtab.getSymbols(f.getEntryPoint());
                if (syms != null) {
                    for (Symbol sym : syms) {
                        if (!firstSym) {
                            symJson.append(',');
                        }
                        firstSym = false;
                        symJson.append(esc(sym.getName()));
                        String n = sym.getName();
                        if (mangled == null && n != null && (n.startsWith("?") || n.startsWith("__imp_?"))) {
                            mangled = n;
                        }
                    }
                }
                symJson.append(']');

                StringBuilder paramJson = new StringBuilder("[");
                Parameter[] params = f.getParameters();
                for (int i = 0; i < params.length; i++) {
                    if (i > 0) {
                        paramJson.append(',');
                    }
                    Parameter p = params[i];
                    DataType dt = p.getDataType();
                    paramJson.append("{\"name\":").append(esc(p.getName()))
                        .append(",\"type\":").append(esc(dt == null ? null : dt.getDisplayName()))
                        .append(",\"size\":").append(dt == null ? 0 : dt.getLength())
                        .append(",\"storage\":").append(esc(String.valueOf(p.getVariableStorage())))
                        .append('}');
                }
                paramJson.append(']');

                StringBuilder calleeJson = new StringBuilder("[");
                boolean firstCallee = true;
                for (String c : callees) {
                    if (!firstCallee) {
                        calleeJson.append(',');
                    }
                    firstCallee = false;
                    calleeJson.append('"').append(c).append('"');
                }
                calleeJson.append(']');

                Address minA = body.getMinAddress();
                Address maxA = body.getMaxAddress();
                boolean inText = minA != null && textSet.contains(minA);
                Function thunked = f.isThunk() ? f.getThunkedFunction(true) : null;
                DataType ret = f.getReturnType();
                boolean defaultName = f.getName().startsWith("FUN_") || f.getName().startsWith("SUB_");
                boolean hasSeh = fsSegment || ehCallee;

                StringBuilder sb = new StringBuilder(1024);
                sb.append('{');
                sb.append("\"va\":").append(hex(f.getEntryPoint()));
                sb.append(",\"minVa\":").append(hex(minA));
                sb.append(",\"maxVa\":").append(hex(maxA));
                sb.append(",\"endVa\":").append(maxA == null ? "null" : hexs(maxA.getOffset() + 1));
                sb.append(",\"bodyBytes\":").append(body.getNumAddresses());
                sb.append(",\"bodyRanges\":").append(countRanges(body));
                sb.append(",\"instructionCount\":").append(instrCount);
                sb.append(",\"name\":").append(esc(f.getName()));
                sb.append(",\"qualifiedName\":").append(esc(f.getName(true)));
                sb.append(",\"namespace\":").append(esc(f.getParentNamespace() == null ? null : f.getParentNamespace().getName(true)));
                sb.append(",\"mangled\":").append(esc(mangled));
                sb.append(",\"symbols\":").append(symJson);
                sb.append(",\"defaultName\":").append(defaultName);
                sb.append(",\"callingConvention\":").append(esc(f.getCallingConventionName()));
                sb.append(",\"stackPurge\":").append(f.getStackPurgeSize());
                sb.append(",\"stackPurgeValid\":").append(f.isStackPurgeSizeValid());
                sb.append(",\"stackFrameSize\":").append(f.getStackFrame() == null ? -1 : f.getStackFrame().getFrameSize());
                sb.append(",\"returnType\":").append(esc(ret == null ? null : ret.getDisplayName()));
                sb.append(",\"parameterCount\":").append(f.getParameterCount());
                sb.append(",\"parameters\":").append(paramJson);
                sb.append(",\"varArgs\":").append(f.hasVarArgs());
                sb.append(",\"noReturn\":").append(f.hasNoReturn());
                sb.append(",\"inline\":").append(f.isInline());
                sb.append(",\"external\":").append(f.isExternal());
                sb.append(",\"thunk\":").append(f.isThunk());
                sb.append(",\"thunkTarget\":").append(thunked == null ? "null" : hex(thunked.getEntryPoint()));
                sb.append(",\"signatureSource\":").append(esc(String.valueOf(f.getSignatureSource())));
                sb.append(",\"prototype\":").append(esc(f.getSignature().getPrototypeString(true)));
                sb.append(",\"fid\":").append(fid);
                sb.append(",\"bookmarks\":").append(bmJson);
                sb.append(",\"hasSeh\":").append(hasSeh);
                sb.append(",\"sehFsSegment\":").append(fsSegment);
                sb.append(",\"sehHandlerCallee\":").append(ehCallee);
                sb.append(",\"directCalls\":").append(directCalls);
                sb.append(",\"indirectCalls\":").append(indirectCalls);
                sb.append(",\"computedJumps\":").append(computedJumps);
                sb.append(",\"unresolvedComputedJumps\":").append(unresolvedComputedJumps);
                sb.append(",\"inText\":").append(inText);
                sb.append(",\"callees\":").append(calleeJson);
                sb.append('}');
                w.write(sb.toString());
                w.write('\n');
                written++;
                if (written % 2000 == 0) {
                    println("inventory: " + written + " functions");
                    w.flush();
                }
            }
        }
        finally {
            w.close();
        }

        println("inventory: walking .text instructions for coverage");
        AddressSet instrSet = new AddressSet();
        InstructionIterator tit = listing.getInstructions(textSet, true);
        long textInstr = 0;
        while (tit.hasNext()) {
            Instruction insn = tit.next();
            instrSet.addRange(insn.getMinAddress(), insn.getMaxAddress());
            textInstr++;
            if ((textInstr % 500000) == 0) {
                println("  .text instructions: " + textInstr);
            }
        }
        AddressSet dataSet = new AddressSet();
        DataIterator dit = listing.getDefinedData(textSet, true);
        long textData = 0;
        while (dit.hasNext()) {
            Data d = dit.next();
            dataSet.addRange(d.getMinAddress(), d.getMaxAddress());
            textData++;
        }

        AddressSet bodiesInText = new AddressSet(functionBodies);
        bodiesInText = bodiesInText.intersect(textSet);
        AddressSet instrOutside = new AddressSet(instrSet);
        instrOutside = instrOutside.subtract(bodiesInText);
        AddressSet defined = new AddressSet(instrSet);
        defined.add(dataSet);
        AddressSet undefined = new AddressSet(textSet);
        undefined = undefined.subtract(defined);

        List<String> lines = new ArrayList<String>();
        lines.add("{");
        lines.add("  \"program\": " + esc(currentProgram.getName()) + ",");
        lines.add("  \"languageId\": " + esc(currentProgram.getLanguageID().getIdAsString()) + ",");
        lines.add("  \"compilerSpec\": " + esc(currentProgram.getCompilerSpec().getCompilerSpecID().getIdAsString()) + ",");
        lines.add("  \"imageBase\": " + hex(currentProgram.getImageBase()) + ",");
        lines.add("  \"executableSha256\": " + esc(currentProgram.getExecutableSHA256()) + ",");
        lines.add("  \"functionCount\": " + total + ",");
        lines.add("  \"functionsWritten\": " + written + ",");
        lines.add("  \"instructionsInFunctions\": " + instrTotal + ",");
        lines.add("  \"blocks\": " + blocksJson + ",");
        lines.add("  \"textSection\": {\"start\": " + hex(textBlock.getStart()) + ", \"end\": " + hex(textBlock.getEnd())
            + ", \"virtualSize\": " + textBlock.getSize() + ", \"addressBytes\": " + textSet.getNumAddresses() + "},");
        lines.add("  \"coverage\": {");
        lines.add("    \"functionBodyBytesTotal\": " + functionBodies.getNumAddresses() + ",");
        lines.add("    \"functionBodyBytesInText\": " + bodiesInText.getNumAddresses() + ",");
        lines.add("    \"instructionBytesInText\": " + instrSet.getNumAddresses() + ",");
        lines.add("    \"instructionCountInText\": " + textInstr + ",");
        lines.add("    \"instructionBytesInTextOutsideFunctions\": " + instrOutside.getNumAddresses() + ",");
        lines.add("    \"dataBytesInText\": " + dataSet.getNumAddresses() + ",");
        lines.add("    \"definedDataItemsInText\": " + textData + ",");
        lines.add("    \"undefinedBytesInText\": " + undefined.getNumAddresses());
        lines.add("  }");
        lines.add("}");
        StringBuilder statsOut = new StringBuilder();
        for (String l : lines) {
            statsOut.append(l).append('\n');
        }
        BufferedWriter sw = new BufferedWriter(
            new OutputStreamWriter(new FileOutputStream(statsFile, false), StandardCharsets.UTF_8));
        try {
            sw.write(statsOut.toString());
        }
        finally {
            sw.close();
        }
        println("inventory: " + written + " of " + total + " functions -> " + outFile);
        println("inventory: stats -> " + statsFile);
    }

    private static long countRanges(AddressSetView set) {
        long n = 0;
        java.util.Iterator<ghidra.program.model.address.AddressRange> it = set.iterator();
        while (it.hasNext()) {
            it.next();
            n++;
        }
        return n;
    }
}
