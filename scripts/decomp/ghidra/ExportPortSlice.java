// Local-only decompiler exporter. Generated C and manifests belong under output/.
// @category Isaac

import ghidra.app.decompiler.DecompInterface;
import ghidra.app.decompiler.DecompileResults;
import ghidra.app.script.GhidraScript;
import ghidra.program.model.address.Address;
import ghidra.program.model.listing.Function;
import ghidra.program.model.listing.FunctionManager;
import ghidra.program.model.listing.Instruction;
import ghidra.program.model.listing.Listing;
import ghidra.program.model.symbol.Reference;
import ghidra.program.model.symbol.ReferenceIterator;
import ghidra.program.model.symbol.SourceType;

import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.File;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Queue;
import java.util.Set;

public class ExportPortSlice extends GhidraScript {
    private static class Seed {
        String symbol;
        long rva;
        String reason;

        Seed(String symbol, long rva, String reason) {
            this.symbol = symbol;
            this.rva = rva;
            this.reason = reason;
        }
    }

    private static class Edge {
        Address caller;
        Address callsite;
        Address target;
        String targetName;
        boolean external;

        Edge(Address caller, Address callsite, Address target, String targetName, boolean external) {
            this.caller = caller;
            this.callsite = callsite;
            this.target = target;
            this.targetName = targetName;
            this.external = external;
        }
    }

    @Override
    protected void run() throws Exception {
        String[] args = getScriptArgs();
        if (args.length != 4) {
            throw new IllegalArgumentException(
                "Expected: <roots.tsv> <manifest.json> <decompiled-directory> <max-functions>"
            );
        }

        File rootsFile = new File(args[0]).getCanonicalFile();
        File manifestFile = new File(args[1]).getCanonicalFile();
        File outputDirectory = new File(args[2]).getCanonicalFile();
        int maxFunctions = Integer.parseInt(args[3]);
        if (maxFunctions < 1 || maxFunctions > 512) throw new IllegalArgumentException("Invalid max-functions");
        if (!outputDirectory.isDirectory() && !outputDirectory.mkdirs()) {
            throw new IOException("Could not create " + outputDirectory);
        }

        List<Seed> seeds = readSeeds(rootsFile);
        FunctionManager functions = currentProgram.getFunctionManager();
        Listing listing = currentProgram.getListing();
        Address imageBase = currentProgram.getImageBase();
        Map<Address, String> rootSymbols = new HashMap<>();
        List<Function> rootFunctions = new ArrayList<>();
        Queue<Function> work = new ArrayDeque<>();
        Set<Address> queued = new HashSet<>();

        for (Seed seed : seeds) {
            Address address = imageBase.add(seed.rva);
            Function function = functions.getFunctionAt(address);
            if (function == null) function = functions.getFunctionContaining(address);
            if (function == null) {
                disassemble(address);
                function = createFunction(address, safeName(seed.symbol));
            }
            if (function == null) {
                printerr("Could not create function for " + seed.symbol + " at " + address);
                continue;
            }
            try {
                function.setName(safeName(seed.symbol), SourceType.USER_DEFINED);
            } catch (Exception exception) {
                println("Keeping existing name for " + seed.symbol + ": " + exception.getMessage());
            }
            rootSymbols.put(function.getEntryPoint(), seed.symbol);
            rootFunctions.add(function);
            function.setComment("Port root: " + seed.symbol + " — " + seed.reason);
            if (queued.add(function.getEntryPoint())) work.add(function);
        }

        // Pull two caller layers of authoritative roots into the slice before
        // following callees. This reaches the frame-loop neighborhood around
        // Game::Render without promoting an address to a symbol on proximity alone.
        List<Function> callerFrontier = rootFunctions;
        for (int depth = 0; depth < 2; depth++) {
            List<Function> nextCallerFrontier = new ArrayList<>();
            for (Function callee : callerFrontier) {
                ReferenceIterator references = currentProgram.getReferenceManager().getReferencesTo(callee.getEntryPoint());
                while (references.hasNext()) {
                    Reference reference = references.next();
                    if (!reference.getReferenceType().isCall()) continue;
                    Function caller = functions.getFunctionContaining(reference.getFromAddress());
                    if (caller == null || caller.isExternal()) continue;
                    if (queued.add(caller.getEntryPoint())) {
                        work.add(caller);
                        nextCallerFrontier.add(caller);
                    }
                }
            }
            callerFrontier = nextCallerFrontier;
        }

        List<Function> selected = new ArrayList<>();
        List<Edge> edges = new ArrayList<>();
        while (!work.isEmpty() && selected.size() < maxFunctions && !monitor.isCancelled()) {
            Function function = work.remove();
            selected.add(function);
            for (Instruction instruction : listing.getInstructions(function.getBody(), true)) {
                for (Reference reference : instruction.getReferencesFrom()) {
                    if (!reference.getReferenceType().isCall()) continue;
                    Address target = reference.getToAddress();
                    Function targetFunction = functions.getFunctionAt(target);
                    if (targetFunction == null) targetFunction = functions.getFunctionContaining(target);
                    String targetName = targetFunction == null ? target.toString() : targetFunction.getName(true);
                    boolean external = targetFunction == null || targetFunction.isExternal();
                    edges.add(new Edge(function.getEntryPoint(), instruction.getAddress(), target, targetName, external));
                    if (!external && selected.size() + work.size() < maxFunctions && queued.add(targetFunction.getEntryPoint())) {
                        work.add(targetFunction);
                    }
                }
            }
        }

        DecompInterface decompiler = new DecompInterface();
        decompiler.toggleCCode(true);
        decompiler.toggleSyntaxTree(true);
        if (!decompiler.openProgram(currentProgram)) throw new IOException("Decompiler could not open program");

        Map<Address, String> files = new LinkedHashMap<>();
        Map<Address, String> errors = new LinkedHashMap<>();
        try {
            for (Function function : selected) {
                if (monitor.isCancelled()) break;
                monitor.setMessage("Decompiling " + function.getName());
                DecompileResults result = decompiler.decompileFunction(function, 30, monitor);
                if (!result.decompileCompleted() || result.getDecompiledFunction() == null) {
                    errors.put(function.getEntryPoint(), result.getErrorMessage());
                    continue;
                }
                String name = function.getEntryPoint().toString() + "_" + safeName(function.getName()) + ".c";
                File destination = new File(outputDirectory, name);
                String header = "/* Local analysis output. Program: " + currentProgram.getName() +
                    "; entry: " + function.getEntryPoint() + " */\n";
                Files.writeString(destination.toPath(), header + result.getDecompiledFunction().getC(), StandardCharsets.UTF_8);
                files.put(function.getEntryPoint(), destination.getCanonicalPath());
            }
        } finally {
            decompiler.dispose();
        }

        writeManifest(manifestFile, seeds, selected, edges, files, errors, rootSymbols);
        println("Exported " + selected.size() + " functions and " + edges.size() + " call edges to " + manifestFile);
    }

    private List<Seed> readSeeds(File path) throws IOException {
        List<Seed> seeds = new ArrayList<>();
        try (BufferedReader reader = new BufferedReader(new FileReader(path, StandardCharsets.UTF_8))) {
            String line;
            while ((line = reader.readLine()) != null) {
                if (line.isBlank() || line.startsWith("#")) continue;
                String[] fields = line.split("\\t", 3);
                if (fields.length != 3) throw new IOException("Invalid seed line: " + line);
                seeds.add(new Seed(fields[0], Long.decode(fields[1]), fields[2]));
            }
        }
        return seeds;
    }

    private String safeName(String value) {
        String safe = value.replaceAll("[^A-Za-z0-9_]", "_").replaceAll("_+", "_");
        if (safe.isEmpty() || Character.isDigit(safe.charAt(0))) safe = "fn_" + safe;
        return safe;
    }

    private String json(String value) {
        if (value == null) return "null";
        StringBuilder result = new StringBuilder("\"");
        for (int i = 0; i < value.length(); i++) {
            char c = value.charAt(i);
            switch (c) {
                case '\\': result.append("\\\\"); break;
                case '"': result.append("\\\""); break;
                case '\n': result.append("\\n"); break;
                case '\r': result.append("\\r"); break;
                case '\t': result.append("\\t"); break;
                default:
                    if (c < 0x20) result.append(String.format("\\u%04x", (int)c));
                    else result.append(c);
            }
        }
        return result.append('"').toString();
    }

    private void writeManifest(
        File path,
        List<Seed> seeds,
        List<Function> selected,
        List<Edge> edges,
        Map<Address, String> files,
        Map<Address, String> errors,
        Map<Address, String> rootSymbols
    ) throws IOException {
        File parent = path.getParentFile();
        if (!parent.isDirectory() && !parent.mkdirs()) throw new IOException("Could not create " + parent);
        try (BufferedWriter writer = new BufferedWriter(new FileWriter(path, StandardCharsets.UTF_8))) {
            writer.write("{\n  \"schemaVersion\": 1,");
            writer.write("\n  \"program\": " + json(currentProgram.getName()) + ",");
            writer.write("\n  \"language\": " + json(currentProgram.getLanguageID().toString()) + ",");
            writer.write("\n  \"compiler\": " + json(currentProgram.getCompilerSpec().getCompilerSpecID().toString()) + ",");
            writer.write("\n  \"imageBase\": " + json(currentProgram.getImageBase().toString()) + ",");
            writer.write("\n  \"roots\": [");
            for (int i = 0; i < seeds.size(); i++) {
                Seed seed = seeds.get(i);
                if (i > 0) writer.write(",");
                writer.write("\n    {\"symbol\": " + json(seed.symbol) + ", \"rva\": " + json("0x" + Long.toHexString(seed.rva)) + ", \"reason\": " + json(seed.reason) + "}");
            }
            writer.write("\n  ],\n  \"functions\": [");
            for (int i = 0; i < selected.size(); i++) {
                Function function = selected.get(i);
                if (i > 0) writer.write(",");
                Address entry = function.getEntryPoint();
                writer.write("\n    {\"entry\": " + json(entry.toString()));
                writer.write(", \"name\": " + json(function.getName(true)));
                writer.write(", \"rootSymbol\": " + json(rootSymbols.get(entry)));
                writer.write(", \"decompiledFile\": " + json(files.get(entry)));
                writer.write(", \"error\": " + json(errors.get(entry)) + "}");
            }
            writer.write("\n  ],\n  \"callEdges\": [");
            for (int i = 0; i < edges.size(); i++) {
                Edge edge = edges.get(i);
                if (i > 0) writer.write(",");
                writer.write("\n    {\"caller\": " + json(edge.caller.toString()));
                writer.write(", \"callsite\": " + json(edge.callsite.toString()));
                writer.write(", \"target\": " + json(edge.target.toString()));
                writer.write(", \"targetName\": " + json(edge.targetName));
                writer.write(", \"external\": " + edge.external + "}");
            }
            writer.write("\n  ]\n}\n");
        }
    }
}
