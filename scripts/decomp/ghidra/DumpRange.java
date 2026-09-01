// Dump a disassembly address range following linear order. Local-only evidence tool.
// @category Isaac

import ghidra.app.script.GhidraScript;
import ghidra.program.model.address.Address;
import ghidra.program.model.listing.Instruction;
import ghidra.program.model.listing.Listing;
import java.io.BufferedWriter;
import java.io.File;
import java.io.FileWriter;

public class DumpRange extends GhidraScript {
    @Override
    protected void run() throws Exception {
        String[] args = getScriptArgs();
        if (args.length != 3) {
            throw new IllegalArgumentException("Expected: <startVa> <endVa> <outFile>");
        }
        Address start = currentProgram.getAddressFactory().getDefaultAddressSpace().getAddress(args[0]);
        Address end = currentProgram.getAddressFactory().getDefaultAddressSpace().getAddress(args[1]);
        File out = new File(args[2]).getCanonicalFile();
        Listing listing = currentProgram.getListing();
        try (BufferedWriter w = new BufferedWriter(new FileWriter(out))) {
            Address addr = start;
            int count = 0;
            while (addr != null && addr.compareTo(end) <= 0) {
                Instruction insn = listing.getInstructionAt(addr);
                if (insn == null) {
                    addr = addr.add(1);
                    continue;
                }
                StringBuilder hex = new StringBuilder();
                byte[] b = insn.getBytes();
                for (byte v : b) hex.append(String.format("%02x", v & 0xff));
                w.write(String.format("0x%s: %-24s %s%n", insn.getAddress(), hex, insn.toString()));
                addr = insn.getAddress().add(insn.getLength());
                count++;
                if (count % 512 == 0) monitor.checkCanceled();
            }
            println("dumped " + count + " instructions to " + out);
        }
    }
}
