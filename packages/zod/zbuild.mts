import * as fs from "node:fs";
import * as path from "node:path";
import { globby } from "globby";
import * as ts from "typescript";

interface CompilerOptions {
  configPath: string;
  compilerOptions: ts.CompilerOptions & Required<Pick<ts.CompilerOptions, "module">>;
  jsExtension?: string;
  dtsExtension?: string;
  // module: ts.ModuleKind;
}

// Get entry points using the same logic as esbuild.mts
async function getEntryPoints(patterns: string[]): Promise<string[]> {
  return await globby(patterns, {
    ignore: ["**/*.d.ts"],
  });
}

async function compileProject(config: CompilerOptions, entryPoints: string[]): Promise<void> {
  const exts = [];
  exts.push(config.jsExtension ?? ".js");
  exts.push(config.dtsExtension ?? ".d.ts");
  console.log(`🧱 Building${exts.length ? " " + exts.join("/") : ""}...`);

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

    if (config.jsExtension) {
      if (fileName.endsWith(".js")) {
        outputFileName = fileName.replace(/\.js$/, config.jsExtension);
      }
    }
    if (config.dtsExtension) {
      if (fileName.endsWith(".d.ts")) {
        outputFileName = fileName.replace(/\.d\.ts$/, config.dtsExtension);
      }
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

  const jsExt = config.jsExtension;

  // Create a transformer factory to rewrite extensions
  const extensionRewriteTransformer: ts.TransformerFactory<ts.SourceFile | ts.Bundle> = (context) => {
    return (sourceFile) => {
      const visitor = (node: ts.Node): ts.Node => {
        if (jsExt && ts.isImportDeclaration(node) && node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier)) {
          const originalText = node.moduleSpecifier.text;

          if (originalText.endsWith(".js")) {
            const newText = originalText.slice(0, -3) + jsExt;

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
        if (jsExt && ts.isExportDeclaration(node) && node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier)) {
          const originalText = node.moduleSpecifier.text;

          if (originalText.endsWith(".js")) {
            const newText = originalText.slice(0, -3) + jsExt;

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
        if (jsExt && ts.isCallExpression(node) && node.expression.kind === ts.SyntaxKind.ImportKeyword) {
          const arg = node.arguments[0];
          if (ts.isStringLiteral(arg)) {
            const originalText = arg.text;

            if (originalText.endsWith(".js")) {
              const newText = originalText.slice(0, -3) + jsExt;
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
    // before: [extensionRewriteTransformer],
    after: [extensionRewriteTransformer as ts.TransformerFactory<ts.SourceFile>],
    afterDeclarations: [extensionRewriteTransformer],
  });

  if (emitResult.emitSkipped) {
    console.error("❌ Emit was skipped due to errors");
  } else {
    // console.log(`✅ Emitted ${config.jsExtension} and ${config.dtsExtension} files`);
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

  // read package.json and extract the "zbuild" exports config
  // console.log("📦 Extracting entry points from package.json exports...");
  const pkgJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));
  const pkgJsonDir = path.dirname(packageJsonPath);

  // print project root
  console.log(`⚙️  Detected project root: ${pkgJsonDir}`);
  console.log(`📦 Reading package.json from ./${path.relative(pkgJsonDir, packageJsonPath)}`);
  const tsconfigPath = path.join(pkgJsonDir, "tsconfig.json");

  if (!fs.existsSync(tsconfigPath)) {
    // Check if tsconfig.json exists
    console.error(`❌ tsconfig.json not found at ${path.resolve(tsconfigPath)}`);
    process.exit(1);
  }

  console.log(`📁 Reading tsconfig from ./${path.relative(pkgJsonDir, tsconfigPath)}`);

  // const pkgJson = JSON.parse(fs.readFileSync("./package.json", "utf-8"));
  const CONFIG_KEY = "zbuild";
  const config = pkgJson[CONFIG_KEY] as {
    exports?: Record<string, string>;
    sourceDialects?: string[];
    // other properties can be added as needed
  };
  if (!config || !config.exports) {
    console.error(`❌ No ${CONFIG_KEY}.exports found in package.json`);
    process.exit(1);
  }

  // Extract entry points from zbuild exports config
  console.log("➡️  Finding entrypoints from package.json#zbuild:");
  const entryPatterns: string[] = [];
  // console.dir(config.exports, { depth: null });
  console.log("   {");
  for (const [exportPath, sourcePath] of Object.entries(config.exports)) {
    if (exportPath.includes("package.json")) continue;
    if (typeof sourcePath === "string") {
      if (sourcePath.includes("*")) {
        if (!sourcePath.endsWith("/*"))
          throw new Error(`Wildcard paths should not contain file extensions: ${sourcePath}`);
        const pattern = sourcePath.slice(0, -2) + "/*.ts";
        const wildcardFiles = await globby([pattern], {
          ignore: ["**/*.d.ts"],
          cwd: pkgJsonDir,
          deep: 1,
        });
        entryPatterns.push(...wildcardFiles);
        console.log(`     "${exportPath}": "${pattern}", (${wildcardFiles.length} matches)`);
      } else if (sourcePath.endsWith(".ts")) {
        entryPatterns.push(sourcePath);
        console.log(`     "${exportPath}": "${sourcePath}",`);
      }
    }
  }
  console.log("   }");

  const entryPoints = await getEntryPoints(entryPatterns);
  const isESM = pkgJson.type === "module";
  try {
    const cjsConfig = {
      jsExtension: ".cjs",
      dtsExtension: ".d.cts",
    };
    const esmConfig = {
      jsExtension: ".mjs",
      dtsExtension: ".d.mts",
    };
    const defaultConfig = {
      // jsExtension: ".js",
      // dtsExtension: ".d.ts",
    };
    // CJS
    await compileProject(
      {
        configPath: tsconfigPath,
        ...(isESM ? cjsConfig : defaultConfig),
        compilerOptions: {
          module: ts.ModuleKind.CommonJS,
          moduleResolution: ts.ModuleResolutionKind.Node10,
          outDir: ".",
        },
      },
      entryPoints
    );

    // ESM
    await compileProject(
      {
        configPath: tsconfigPath,
        ...(isESM ? defaultConfig : esmConfig),
        compilerOptions: {
          module: ts.ModuleKind.ESNext,
          moduleResolution: ts.ModuleResolutionKind.Bundler,
          outDir: ".",
        },
      },
      entryPoints
    );

    // generate package.json exports
    console.log("📦 Generating package.json exports...");

    // Generate exports based on zbuild config
    const newExports: Record<string, any> = {};

    const sourceDialects = config.sourceDialects || [];

    for (const [exportPath, sourcePath] of Object.entries(config.exports)) {
      if (exportPath.includes("package.json")) {
        newExports[exportPath] = sourcePath;
        continue;
      }

      if (typeof sourcePath === "string") {
        if (sourcePath.endsWith("/*")) {
          // Handle wildcard exports
          newExports[exportPath] = {
            "@zod/source": sourcePath,
            import: sourcePath,
            require: sourcePath,
          };
          for (const sd of sourceDialects) {
            newExports[exportPath] = {
              [sd]: sourcePath,
              ...newExports[exportPath],
            };
          }
        } else if (sourcePath.endsWith(".ts")) {
          // Handle regular TypeScript entry points
          const basePath = sourcePath.slice(0, -3); // Remove .ts extension
          const esmFile = isESM ? `${basePath}.js` : `${basePath}.mjs`;
          const cjsFile = isESM ? `${basePath}.cjs` : `${basePath}.js`;
          const dtsFile = isESM ? `${basePath}.d.cts` : `${basePath}.d.ts`;

          newExports[exportPath] = {
            import: {
              default: esmFile,
              types: dtsFile,
            },
            require: {
              default: cjsFile,
              types: dtsFile,
            },
          };

          if (exportPath === ".") {
            pkgJson.main = cjsFile;
            pkgJson.module = esmFile;
            pkgJson.types = dtsFile;
          }
          for (const sd of sourceDialects) {
            newExports[exportPath] = {
              [sd]: sourcePath,
              ...newExports[exportPath],
            };
          }
        }
      }
    }

    // Update package.json with new exports
    pkgJson.exports = newExports;
    fs.writeFileSync(packageJsonPath, JSON.stringify(pkgJson, null, 2) + "\n");

    console.log("✅ Updating package.json#exports");
    console.log("   " + JSON.stringify(newExports, null, 2).split("\n").join("\n   "));
    console.log("🎉 Build complete!");
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
