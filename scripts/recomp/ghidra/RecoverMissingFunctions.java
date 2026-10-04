// Coverage recovery: Ghidra's auto-analysis leaves runs of disassembled .text
// instructions that belong to no function (code only reached through unrecovered jump
// tables or indirect calls). Nothing downstream can export code that is not in a
// function, so create one at the head of every such run.
//
// Writes changes to the program, so run this WITHOUT -readOnly.
//
// Args: <outTsv> [maxRounds]
//
// @category IsaacRecomp

import ghidra.app.script.GhidraScript;
import ghidra.program.model.address.Address;
import ghidra.program.model.address.AddressRange;
import ghidra.program.model.address.AddressSet;
import ghidra.program.model.listing.Function;
import ghidra.program.model.listing.FunctionIterator;
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

public class RecoverMissingFunctions extends GhidraScript {

    private static final int MIN_RUN_BYTES = 8;

    private static boolean isPadding(Instruction i) {
        if (i == null) {
            return true;
        }
        String m = i.getMnemonicString();
        return "NOP".equals(m) || "INT3".equals(m) || "??".equals(m);
    }

    @Override
    protected void run() throws Exception {
        String[] args = getScriptArgs();
        File out = new File(args[0]).getCanonicalFile();
        int maxRounds = args.length > 1 ? Integer.parseInt(args[1]) : 6;
        out.getParentFile().mkdirs();

        MemoryBlock text = currentProgram.getMemory().getBlock(".text");
        AddressSet textSet = new AddressSet(text.getStart(), text.getEnd());
        Listing listing = currentProgram.getListing();

        BufferedWriter w = new BufferedWriter(
            new OutputStreamWriter(new FileOutputStream(out, false), StandardCharsets.UTF_8), 1 << 16);
        long createdTotal = 0;
        try {
            w.write("round\tva\trunBytes\tbodyBytes\tfirstInsn\tlooksLikePrologue\n");
            for (int round = 1; round <= maxRounds; round++) {
                if (monitor.isCancelled()) {
                    break;
                }
                AddressSet bodies = new AddressSet();
                FunctionIterator fit = currentProgram.getFunctionManager().getFunctions(true);
                while (fit.hasNext()) {
                    bodies.add(fit.next().getBody());
                }
                AddressSet instrSet = new AddressSet();
                InstructionIterator iit = listing.getInstructions(textSet, true);
                while (iit.hasNext()) {
                    Instruction i = iit.next();
                    instrSet.addRange(i.getMinAddress(), i.getMaxAddress());
                }
                AddressSet uncovered = new AddressSet(instrSet);
                uncovered = uncovered.subtract(bodies);

                List<Address> targets = new ArrayList<Address>();
                List<Long> runSizes = new ArrayList<Long>();
                Iterator<AddressRange> rit = uncovered.iterator();
                while (rit.hasNext()) {
                    AddressRange r = rit.next();
                    if (r.getLength() < MIN_RUN_BYTES) {
                        continue;
                    }
                    Address s = r.getMinAddress();
                    Instruction first = listing.getInstructionAt(s);
                    if (first == null) {
                        continue;
                    }
                    // Skip alignment padding: walk past leading NOP/INT3 to the real code.
                    while (first != null && isPadding(first) && r.contains(first.getAddress())) {
                        first = first.getNext();
                    }
                    if (first == null || !r.contains(first.getAddress())) {
                        continue;
                    }
                    if (currentProgram.getFunctionManager().getFunctionContaining(first.getAddress()) != null) {
                        continue;
                    }
                    targets.add(first.getAddress());
                    runSizes.add(Long.valueOf(r.getMaxAddress().getOffset() - first.getAddress().getOffset() + 1));
                }
                println("round " + round + ": " + uncovered.getNumAddresses() + " uncovered bytes, "
                    + targets.size() + " candidate entries");
                if (targets.isEmpty()) {
                    break;
                }

                long created = 0;
                for (int k = 0; k < targets.size(); k++) {
                    if (monitor.isCancelled()) {
                        break;
                    }
                    Address a = targets.get(k);
                    if (currentProgram.getFunctionManager().getFunctionContaining(a) != null) {
                        continue;
                    }
                    Instruction first = listing.getInstructionAt(a);
                    String t1 = first == null ? "" : first.toString();
                    Function f = null;
                    try {
                        f = createFunction(a, null);
                    }
                    catch (Exception e) {
                        f = null;
                    }
                    if (f == null) {
                        continue;
                    }
                    created++;
                    createdTotal++;
                    boolean prologue = t1.startsWith("PUSH EBP") || t1.startsWith("MOV EDI,EDI")
                        || t1.startsWith("PUSH EBX") || t1.startsWith("PUSH ESI") || t1.startsWith("PUSH EDI")
                        || t1.startsWith("SUB ESP") || t1.startsWith("PUSH -0x1");
                    w.write(round + "\t0x" + String.format("%08x", a.getOffset()) + "\t"
                        + runSizes.get(k) + "\t" + f.getBody().getNumAddresses() + "\t" + t1 + "\t" + prologue + "\n");
                    if ((created % 200) == 0) {
                        println("  created " + created + " functions this round");
                        w.flush();
                    }
                }
                println("round " + round + ": created " + created + " functions");
                if (created == 0) {
                    break;
                }
            }
        }
        finally {
            w.close();
        }
        println("recovered functions total: " + createdTotal);
        println("detail -> " + out);
    }
}
