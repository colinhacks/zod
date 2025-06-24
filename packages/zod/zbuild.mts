import * as fs from "node:fs";
import * as path from "node:path";
import { globby } from "globby";
import * as ts from "typescript";

interface CompilerOptions {
  configPath: string;
  compilerOptions: ts.CompilerOptions & Required<Pick<ts.CompilerOptions, "module">>;
  outputExtension: string;
  declarationExtension: string;
  // module: ts.ModuleKind;
}

// Get entry points using the same logic as esbuild.mts
async function getEntryPoints(patterns: string[]): Promise<string[]> {
  return await globby(
    [
      "index.ts",
      "v3/index.ts",
      "v4/index.ts",
      "v4/classic/index.ts",
      "v4/mini/index.ts",
      "v4-mini/index.ts",
      "v4/core/index.ts",
      "v4/locales/*.ts",
    ],
    {
      ignore: ["**/*.d.ts"],
    }
  );
}

// Rewrite .js imports/exports to .cjs in emitted files
// function rewriteExtensions(content: string, extMap: Record<string, string>): string {
//   // Rewrite import statements: from './file.js' -> from './file.cjs'
//   for (const [fromExt, toExt] of Object.entries(extMap)) {
//     content = content.replace(/from\s+['"]([^'"]*?)\.js['"]/g, "from '$1.cjs'");

//     // Rewrite export statements: export * from './file.js' -> export * from './file.cjs'
//     content = content.replace(/export\s+\*\s+from\s+['"]([^'"]*?)\.js['"]/g, "export * from '$1.cjs'");

//     // Rewrite dynamic imports: import('./file.js') -> import('./file.cjs')
//     content = content.replace(/import\s*\(\s*['"]([^'"]*?)\.js['"]\s*\)/g, "import('$1.cjs')");

//     // Rewrite require calls: require('./file.js') -> require('./file.cjs')
//     content = content.replace(/require\s*\(\s*['"]([^'"]*?)\.js['"]\s*\)/g, "require('$1.cjs')");
//   }

//   return content;
// }

// function createCompilerHost(
//   options: ts.CompilerOptions,
//   outputExtension: string,
//   declarationExtension: string
// ): ts.CompilerHost {
//   const host = ts.createCompilerHost(options);
//   const originalWriteFile = host.writeFile;

//   host.writeFile = (fileName, data, writeByteOrderMark, onError, sourceFiles) => {
//     // Transform output file extensions
//     let outputFileName = fileName;
//     const processedData = data;

//     if (fileName.endsWith(".js")) {
//       outputFileName = fileName.replace(/\.js$/, outputExtension);
//     } else if (fileName.endsWith(".d.ts")) {
//       outputFileName = fileName.replace(/\.d\.ts$/, declarationExtension);
//     }

//     console.log(`Emitting: ${outputFileName}`);

//     if (originalWriteFile) {
//       console.dir("calling originalWriteFile", { depth: null });
//       originalWriteFile(outputFileName, processedData, writeByteOrderMark, onError, sourceFiles);
//     }
//   };

//   return host;
// }

async function compileProject(config: CompilerOptions, entryPoints: string[]): Promise<void> {
  const exts = [];
  exts.push(config.outputExtension);
  exts.push(config.declarationExtension);
  console.log(`\n🧱 Building${exts.length ? " " + exts.join("/") : ""}...`);

  // Read and parse tsconfig.json
  const configPath = path.resolve(config.configPath);
  const configFile = ts.readConfigFile(configPath, ts.sys.readFile);

  if (configFile.error) {
    console.error(
      "Error reading tsconfig.json:",
      ts.formatDiagnostic(configFile.error, {
        getCurrentDirectory: () => ts.sys.getCurrentDirectory(),
        getCanonicalFileName: (fileName) => fileName,
        getNewLine: () => ts.sys.newLine,
      })
    );
    return;
  }

  // Parse the config
  const parsedConfig = ts.parseJsonConfigFileContent(configFile.config, ts.sys, path.dirname(configPath));

  if (parsedConfig.errors.length > 0) {
    console.error("Error parsing tsconfig.json:");
    for (const error of parsedConfig.errors) {
      console.error(
        ts.formatDiagnostic(error, {
          getCurrentDirectory: () => ts.sys.getCurrentDirectory(),
          getCanonicalFileName: (fileName) => fileName,
          getNewLine: () => ts.sys.newLine,
        })
      );
    }
    return;
  }

  // clean up
  delete parsedConfig.options.rootDir;
  delete parsedConfig.options.outDir;
  delete parsedConfig.options.declarationDir;
  delete parsedConfig.options.customConditions;

  // Override compiler options for this specific build
  const compilerOptions: ts.CompilerOptions = {
    ...parsedConfig.options,
    // module: config.module,
    moduleResolution: ts.ModuleResolutionKind.NodeJs, // Override for CommonJS compatibility
    declaration: true,
    emitDeclarationOnly: false,
    outDir: "./dist",
    target: ts.ScriptTarget.ES2020, // Ensure compatible target for CommonJS
    skipLibCheck: true, // Skip library checks to reduce errors
    allowJs: false,
    checkJs: false,
    noEmitOnError: false, // Continue emitting even with errors
    ...(config.compilerOptions ?? {}),
  };

  // Create compiler host
  const host = ts.createCompilerHost(compilerOptions);
  const originalWriteFile = host.writeFile;

  host.writeFile = (fileName, data, writeByteOrderMark, onError, sourceFiles) => {
    // Transform output file extensions
    let outputFileName = fileName;
    const processedData = data;

    if (fileName.endsWith(".js")) {
      outputFileName = fileName.replace(/\.js$/, config.outputExtension);
    } else if (fileName.endsWith(".d.ts")) {
      outputFileName = fileName.replace(/\.d\.ts$/, config.declarationExtension);
    }

    // console.log(`   ${outputFileName}`);

    if (originalWriteFile) {
      originalWriteFile(outputFileName, processedData, writeByteOrderMark, onError, sourceFiles);
    }
  };

  // Create the TypeScript program using entry points
  const program = ts.createProgram({
    rootNames: entryPoints,
    options: compilerOptions,
    host,
  });

  // Create a transformer factory to rewrite extensions
  const extensionRewriteTransformer: ts.TransformerFactory<ts.SourceFile> = (context) => {
    return (sourceFile) => {
      const visitor = (node: ts.Node): ts.Node => {
        // Handle import declarations
        if (ts.isImportDeclaration(node) && node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier)) {
          const originalText = node.moduleSpecifier.text;

          if (originalText.endsWith(".js")) {
            const newText = originalText.slice(0, -3) + config.outputExtension;
            // console.log(`Rewriting import from ${originalText} to ${newText}`);
            return ts.factory.updateImportDeclaration(
              node,
              node.modifiers,
              node.importClause,
              ts.factory.createStringLiteral(newText),
              node.assertClause
            );
          }
        }

        // Handle export declarations
        if (ts.isExportDeclaration(node) && node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier)) {
          const originalText = node.moduleSpecifier.text;

          if (originalText.endsWith(".js")) {
            const newText = originalText.slice(0, -3) + config.outputExtension;
            // console.log(`Rewriting export from ${originalText} to ${newText}`);
            return ts.factory.updateExportDeclaration(
              node,
              node.modifiers,
              node.isTypeOnly,
              node.exportClause,
              ts.factory.createStringLiteral(newText),
              node.assertClause
            );
          }
        }

        // Handle dynamic imports
        if (ts.isCallExpression(node) && node.expression.kind === ts.SyntaxKind.ImportKeyword) {
          const arg = node.arguments[0];
          if (ts.isStringLiteral(arg)) {
            const originalText = arg.text;

            if (originalText.endsWith(".js")) {
              const newText = originalText.slice(0, -3) + config.outputExtension;
              // console.log(`Rewriting dynamic import from ${originalText} to ${newText}`);
              return ts.factory.updateCallExpression(node, node.expression, node.typeArguments, [
                ts.factory.createStringLiteral(newText),
                ...node.arguments.slice(1),
              ]);
            }
          }
        }

        return ts.visitEachChild(node, visitor, context);
      };

      return ts.visitNode(sourceFile, visitor) as ts.SourceFile;
    };
  };

  // Emit with the transformer
  // const emitResult = program.emit(undefined, undefined, undefined, false, {
  //   before: [extensionRewriteTransformer]
  // });

  // type lakjdsf = ts.TransformerFactory;

  // for (const sourceFile of program.getSourceFiles()) {
  //   if (!sourceFile.isDeclarationFile) {
  //     // Walk the tree to search for classes
  //     rewriteExtensions(sourceFile);
  //   }
  // }

  // Check for semantic errors
  const diagnostics = ts.getPreEmitDiagnostics(program);

  if (diagnostics.length > 0) {
    const errorCount = diagnostics.filter((d) => d.category === ts.DiagnosticCategory.Error).length;
    const warningCount = diagnostics.filter((d) => d.category === ts.DiagnosticCategory.Warning).length;

    console.log(`⚠️ Found ${errorCount} errors and ${warningCount} warnings`);

    // Only show first 5 errors to avoid overwhelming output
    const firstErrors = diagnostics.filter((d) => d.category === ts.DiagnosticCategory.Error).slice(0, 5);

    if (firstErrors.length > 0) {
      console.log("First few compilation errors:");
      for (const diagnostic of firstErrors) {
        console.error(
          ts.formatDiagnostic(diagnostic, {
            getCurrentDirectory: () => ts.sys.getCurrentDirectory(),
            getCanonicalFileName: (fileName) => fileName,
            getNewLine: () => ts.sys.newLine,
          })
        );
      }

      if (errorCount > 5) {
        console.log(`... and ${errorCount - 5} more errors`);
      }
    }
  }

  // emit the files
  const emitResult = program.emit(undefined, undefined, undefined, undefined, {
    before: [extensionRewriteTransformer],
  });

  if (emitResult.emitSkipped) {
    console.error("❌ Emit was skipped due to errors");
  } else {
    // console.log(`✅ Emitted ${config.outputExtension} and ${config.declarationExtension} files`);
  }

  // Report any emit diagnostics
  if (emitResult.diagnostics.length > 0) {
    console.error("❌ Errors detected during emit:");
    for (const diagnostic of emitResult.diagnostics) {
      console.error(
        ts.formatDiagnostic(diagnostic, {
          getCurrentDirectory: () => ts.sys.getCurrentDirectory(),
          getCanonicalFileName: (fileName) => fileName,
          getNewLine: () => ts.sys.newLine,
        })
      );
    }
  }
}

async function main(): Promise<void> {
  const tsconfigPath = "./tsconfig.json";

  // Check if tsconfig.json exists
  if (!fs.existsSync(tsconfigPath)) {
    console.error(`❌ tsconfig.json not found at ${path.resolve(tsconfigPath)}`);
    process.exit(1);
  }

  console.log("🚀 Starting TypeScript compilation...");
  console.log(`📁 Reading tsconfig from ${path.resolve(tsconfigPath)}`);

  // Find package.json by scanning up the file system
  let packageJsonPath = "./package.json";
  let currentDir = process.cwd();

  while (currentDir !== path.dirname(currentDir)) {
    const candidatePath = path.join(currentDir, "package.json");
    if (fs.existsSync(candidatePath)) {
      packageJsonPath = candidatePath;
      break;
    }
    currentDir = path.dirname(currentDir);
  }

  if (!fs.existsSync(packageJsonPath)) {
    console.error("❌ package.json not found in current directory or any parent directories");
    process.exit(1);
  }

  console.log(`📦 Reading package.json from ${path.resolve(packageJsonPath)}`);

  // read package.json and extract the "tshy" exports config
  // console.log("📦 Extracting entry points from package.json exports...");
  const pkgJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));
  const pkgJsonDir = path.dirname(packageJsonPath);

  // const pkgJson = JSON.parse(fs.readFileSync("./package.json", "utf-8"));
  const CONFIG_KEY = "tshy";
  const config = pkgJson[CONFIG_KEY];
  if (!config || !config.exports) {
    console.error(`❌ No ${CONFIG_KEY}.exports found in package.json`);
    process.exit(1);
  }

  // Extract entry points from tshy exports config
  const entryPatterns: string[] = [];
  // console.dir(config.exports, { depth: null });
  console.log("{");
  for (const [exportPath, sourcePath] of Object.entries(config.exports)) {
    if (exportPath.includes("package.json")) continue;
    if (typeof sourcePath === "string") {
      if (sourcePath.includes("*")) {
        if (!sourcePath.endsWith("/*"))
          throw new Error(`Wildcard paths should not contain file extensions: ${sourcePath}`);

        console.dir({ sourcePath }, { depth: null });
        const pattern = sourcePath.slice(0, -2) + "/*.ts";
        console.dir(pattern, { depth: null });
        const wildcardFiles = await globby([pattern], {
          ignore: ["**/*.d.ts"],
          cwd: pkgJsonDir,
          deep: 1,
        });
        entryPatterns.push(...wildcardFiles);
        console.log(`  "${exportPath}": "${pattern}", // (${wildcardFiles.length} matches)`);
      } else if (sourcePath.endsWith(".ts")) {
        entryPatterns.push(sourcePath);
        console.log(`  "${exportPath}": "${sourcePath}"`);
      }
    }
  }
  console.log("}");

  console.dir(entryPatterns, { depth: null });

  console.log("📦 Entry points from package.json:");
  // for (const entry of entryPatterns) {
  //   console.log(`   ${entry}`);
  // }

  // Get entry points using the same logic as esbuild.mts
  // console.log("🔍 Finding entry points...");
  const entryPoints = await getEntryPoints(entryPatterns);
  // console.log(`📍 Entry points:`, entryPoints);
  // for (const entry of entryPoints) {
  // console.log(`   ${entry}`);
  // }

  // Build CommonJS version with .cjs and .d.cts extensions

  try {
    // console.log("🔨 Compiling CJS...");
    await compileProject(
      {
        configPath: tsconfigPath,
        outputExtension: ".cjs",
        declarationExtension: ".d.cts",
        compilerOptions: {
          module: ts.ModuleKind.CommonJS,
          moduleResolution: ts.ModuleResolutionKind.Node10,
          outDir: ".",
        },
      },
      entryPoints
    );

    // console.log("🔨 Compiling ESM...");
    await compileProject(
      {
        configPath: tsconfigPath,
        outputExtension: ".js",
        declarationExtension: ".d.ts",
        compilerOptions: {
          module: ts.ModuleKind.ESNext,
          moduleResolution: ts.ModuleResolutionKind.Bundler,
          outDir: ".",
        },
      },
      entryPoints
    );
    console.log("\n🎉 Build completed successfully!");
  } catch (error) {
    console.error("❌ Build failed:", error);
    process.exit(1);
  }
}

// Run the script
main().catch((error) => {
  console.error("❌ Script failed:", error);
  process.exit(1);
});
