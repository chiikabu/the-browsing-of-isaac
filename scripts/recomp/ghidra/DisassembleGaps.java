// Coverage recovery, part 2: Ghidra's analyzers never reached some .text regions at all,
// so those bytes are not even disassembled - RecoverMissingFunctions cannot help because
// there are no instructions to attach a function to. Disassemble at the head of every
// non-padding undefined run, following flow, then let RecoverMissingFunctions run again.
//
// Writes to the program, so run WITHOUT -readOnly.
//
// Args: <outTsv> [minRunBytes] [maxRounds]
//
// @category IsaacRecomp

import ghidra.app.script.GhidraScript;
import ghidra.program.model.address.Address;
import ghidra.program.model.address.AddressRange;
import ghidra.program.model.address.AddressSet;
import ghidra.program.model.listing.Data;
import ghidra.program.model.listing.DataIterator;
import ghidra.program.model.listing.Instruction;
import ghidra.program.model.listing.InstructionIterator;
import ghidra.program.model.listing.Listing;
import ghidra.program.model.mem.MemoryBlock;

import java.io.BufferedWriter;
import java.io.File;
import java.io.FileOutputStream;
import java.io.OutputStreamWriter;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

public class DisassembleGaps extends GhidraScript {

    private static boolean isPadByte(int b) {
        return b == 0xcc || b == 0x90 || b == 0x00;
    }

    @Override
    protected void run() throws Exception {
        String[] args = getScriptArgs();
        File out = new File(args[0]).getCanonicalFile();
        int minRun = args.length > 1 ? Integer.parseInt(args[1]) : 16;
        int maxRounds = args.length > 2 ? Integer.parseInt(args[2]) : 8;
        out.getParentFile().mkdirs();

        MemoryBlock text = currentProgram.getMemory().getBlock(".text");
        AddressSet textSet = new AddressSet(text.getStart(), text.getEnd());
        Listing listing = currentProgram.getListing();

        BufferedWriter w = new BufferedWriter(
            new OutputStreamWriter(new FileOutputStream(out, false), StandardCharsets.UTF_8), 1 << 16);
        long attemptedTotal = 0;
        long succeededTotal = 0;
        try {
            w.write("round\tva\trunBytes\tdisassembled\n");
            for (int round = 1; round <= maxRounds; round++) {
                if (monitor.isCancelled()) {
                    break;
                }
                AddressSet instrSet = new AddressSet();
                InstructionIterator iit = listing.getInstructions(textSet, true);
                while (iit.hasNext()) {
                    Instruction i = iit.next();
                    instrSet.addRange(i.getMinAddress(), i.getMaxAddress());
                }
                AddressSet dataSet = new AddressSet();
                DataIterator dit = listing.getDefinedData(textSet, true);
                while (dit.hasNext()) {
                    Data d = dit.next();
                    dataSet.addRange(d.getMinAddress(), d.getMaxAddress());
                }
                AddressSet undef = new AddressSet(textSet);
                undef = undef.subtract(instrSet);
                undef = undef.subtract(dataSet);

                List<Address> heads = new ArrayList<Address>();
                List<Long> sizes = new ArrayList<Long>();
                Iterator<AddressRange> rit = undef.iterator();
                byte[] buf = new byte[4096];
                while (rit.hasNext()) {
                    AddressRange r = rit.next();
                    long len = r.getLength();
                    if (len < minRun) {
                        continue;
                    }
                    // Skip leading padding inside the run and start at the first real byte.
                    long off = 0;
                    Address head = null;
                    while (off < len && head == null) {
                        int n = (int) Math.min(buf.length, len - off);
                        int got;
                        try {
                            got = currentProgram.getMemory().getBytes(r.getMinAddress().add(off), buf, 0, n);
                        }
                        catch (Exception e) {
                            break;
                        }
                        for (int k = 0; k < got; k++) {
                            if (!isPadByte(buf[k] & 0xff)) {
                                head = r.getMinAddress().add(off + k);
                                break;
                            }
                        }
                        off += got;
                    }
                    if (head == null) {
                        continue; // pure padding
                    }
                    if (r.getMaxAddress().getOffset() - head.getOffset() + 1 < minRun) {
                        continue;
                    }
                    heads.add(head);
                    sizes.add(Long.valueOf(r.getMaxAddress().getOffset() - head.getOffset() + 1));
                }
                println("round " + round + ": " + undef.getNumAddresses() + " undefined bytes, "
                    + heads.size() + " gap heads >= " + minRun + " bytes");
                if (heads.isEmpty()) {
                    break;
                }

                long ok = 0;
                for (int k = 0; k < heads.size(); k++) {
                    if (monitor.isCancelled()) {
                        break;
                    }
                    Address a = heads.get(k);
                    if (listing.getInstructionAt(a) != null || listing.getDefinedDataAt(a) != null) {
                        continue;
                    }
                    attemptedTotal++;
                    boolean did = false;
                    try {
                        did = disassemble(a);
                    }
                    catch (Exception e) {
                        did = false;
                    }
                    if (did) {
                        ok++;
                        succeededTotal++;
                    }
                    w.write(round + "\t0x" + String.format("%08x", a.getOffset()) + "\t"
                        + sizes.get(k) + "\t" + did + "\n");
                    if ((attemptedTotal % 500) == 0) {
                        println("  attempted " + attemptedTotal + ", disassembled " + succeededTotal);
                        w.flush();
                    }
                }
                println("round " + round + ": disassembled " + ok + " of " + heads.size() + " gap heads");
                if (ok == 0) {
                    break;
                }
            }
        }
        finally {
            w.close();
        }
        println("gap disassembly: attempted " + attemptedTotal + ", succeeded " + succeededTotal);
        println("detail -> " + out);
    }
}
