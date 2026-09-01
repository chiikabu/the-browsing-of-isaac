// Diagnostic: report the contiguous runs of disassembled .text instructions that are
// not inside any function, so we can tell "Ghidra missed a function start" apart from
// "this is padding / data / a shared code fragment". Read-only.
//
// Args: <outTsv> [maxRunsToPrint]
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
import ghidra.program.model.symbol.Reference;
import ghidra.program.model.symbol.ReferenceManager;

import java.io.BufferedWriter;
import java.io.File;
import java.io.FileOutputStream;
import java.io.OutputStreamWriter;
import java.nio.charset.StandardCharsets;
import java.util.Iterator;

public class ReportUncovered extends GhidraScript {

    @Override
    protected void run() throws Exception {
        String[] args = getScriptArgs();
        File out = new File(args[0]).getCanonicalFile();
        out.getParentFile().mkdirs();

        MemoryBlock text = currentProgram.getMemory().getBlock(".text");
        AddressSet textSet = new AddressSet(text.getStart(), text.getEnd());
        Listing listing = currentProgram.getListing();
        ReferenceManager refs = currentProgram.getReferenceManager();

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

        long totalBytes = uncovered.getNumAddresses();
        long runs = 0;
        long runsWithIncomingCall = 0;
        long runsStartingWithPrologue = 0;
        long bytesWithIncomingCall = 0;

        BufferedWriter w = new BufferedWriter(
            new OutputStreamWriter(new FileOutputStream(out, false), StandardCharsets.UTF_8), 1 << 20);
        try {
            w.write("start\tend\tbytes\tincomingCallRefs\tincomingAnyRefs\tfirstInsn\tsecondInsn\n");
            Iterator<AddressRange> it = uncovered.iterator();
            while (it.hasNext()) {
                AddressRange r = it.next();
                runs++;
                Address s = r.getMinAddress();
                int callRefs = 0;
                int anyRefs = 0;
                for (Reference ref : refs.getReferencesTo(s)) {
                    anyRefs++;
                    if (ref.getReferenceType().isCall()) {
                        callRefs++;
                    }
                }
                Instruction i1 = listing.getInstructionAt(s);
                Instruction i2 = i1 == null ? null : i1.getNext();
                String t1 = i1 == null ? "" : i1.toString();
                String t2 = i2 == null ? "" : i2.toString();
                if (callRefs > 0) {
                    runsWithIncomingCall++;
                    bytesWithIncomingCall += r.getLength();
                }
                if (t1.startsWith("PUSH EBP") || t1.startsWith("MOV EDI,EDI") || t1.startsWith("SUB ESP")
                    || t1.startsWith("PUSH EBX") || t1.startsWith("PUSH ESI") || t1.startsWith("PUSH -0x1")) {
                    runsStartingWithPrologue++;
                }
                w.write(String.format("0x%08x\t0x%08x\t%d\t%d\t%d\t%s\t%s%n",
                    r.getMinAddress().getOffset(), r.getMaxAddress().getOffset(), r.getLength(),
                    callRefs, anyRefs, t1, t2));
            }
        }
        finally {
            w.close();
        }
        // Second question: what is in the .text bytes that are neither instructions nor
        // defined data? Classify each undefined run by its byte content so "padding" and
        // "content we never looked at" are separate numbers.
        AddressSet definedData = new AddressSet();
        ghidra.program.model.listing.DataIterator ddit = listing.getDefinedData(textSet, true);
        while (ddit.hasNext()) {
            ghidra.program.model.listing.Data d = ddit.next();
            definedData.addRange(d.getMinAddress(), d.getMaxAddress());
        }
        AddressSet undef = new AddressSet(textSet);
        undef = undef.subtract(instrSet);
        undef = undef.subtract(definedData);
        long undefTotal = undef.getNumAddresses();
        long padOnlyBytes = 0;
        long padOnlyRuns = 0;
        long otherBytes = 0;
        long otherRuns = 0;
        long biggestOther = 0;
        Address biggestOtherAt = null;
        Iterator<AddressRange> uit = undef.iterator();
        byte[] tmp = new byte[4096];
        while (uit.hasNext()) {
            AddressRange r = uit.next();
            long len = r.getLength();
            boolean allPad = true;
            long off = 0;
            while (off < len && allPad) {
                int n = (int) Math.min(tmp.length, len - off);
                int got;
                try {
                    got = currentProgram.getMemory().getBytes(r.getMinAddress().add(off), tmp, 0, n);
                }
                catch (Exception e) {
                    allPad = false;
                    break;
                }
                for (int k = 0; k < got; k++) {
                    int b = tmp[k] & 0xff;
                    if (b != 0xcc && b != 0x90 && b != 0x00) {
                        allPad = false;
                        break;
                    }
                }
                off += got;
            }
            if (allPad) {
                padOnlyRuns++;
                padOnlyBytes += len;
            }
            else {
                otherRuns++;
                otherBytes += len;
                if (len > biggestOther) {
                    biggestOther = len;
                    biggestOtherAt = r.getMinAddress();
                }
            }
        }
        println("undefined bytes in .text: " + undefTotal);
        println("  pure padding runs (only cc/90/00): " + padOnlyRuns + " runs, " + padOnlyBytes + " bytes");
        println("  other undefined runs: " + otherRuns + " runs, " + otherBytes + " bytes"
            + (biggestOtherAt == null ? "" : ", biggest " + biggestOther + " bytes at 0x"
                + String.format("%08x", biggestOtherAt.getOffset())));

        println("uncovered instruction bytes in .text: " + totalBytes);
        println("contiguous runs: " + runs);
        println("runs with an incoming CALL reference: " + runsWithIncomingCall
            + " (" + bytesWithIncomingCall + " bytes)");
        println("runs starting with a classic MSVC prologue: " + runsStartingWithPrologue);
        println("detail -> " + out);
    }
}
