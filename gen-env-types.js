#!/usr/bin/env node
const {
  readFileSync,
  writeFileSync,
  existsSync,
  lstatSync,
  write,
} = require("fs");
const pkg = require("./package.json");
const chalk = require("chalk");
const { join } = require("path");
const { parse } = require("dotenv");

const printVersion = () => console.log("v" + pkg.version);
const printHelp = (exitCode) => {
  console.log(
    chalk`{blue gen-env-types} - Generate a .d.ts and .env.example file from your .env file.

{bold USAGE}

  {blue gen-env-types} path/to/.env

{bold OPTIONS}

  -V,  --version               Show version number
  -h,  --help                  Show usage information
  -o,  --types-output          Output name/path for types file | defaults to \`env.d.ts\`
  -e,  --example-env-path      Path to save .env.example file
  -r,  --rename-example-env    Custom name for .env example output file | defaults to \`env.example\` if omitted
  `
  );

  return process.exit(exitCode);
};

function showError(msg) {
  console.log(chalk`{red Error:} ${msg}`);
  process.exit(1);
}

const parseArgs = (args) => {
  const cliConfig = {
    typesOutput: "env.d.ts",
    exampleEnvOutput: ".env.example",
  };

  while (args.length > 0) {
    const arg = args.shift();

    if (arg == null) break;

    switch (arg) {
      case "-h":
      case "--help":
        cliConfig.help = true;
        break;
      case "-V":
      case "--version":
        cliConfig.version = true;
        break;
      case "-o":
      case "--types-output":
        const typesOutput = args.shift();
        if (!typesOutput || !typesOutput.endsWith(".d.ts")) {
          showError(
            "Expected output file to end in .d.ts, bad input: " + typesOutput
          );
        }
        cliConfig.typesOutput = typesOutput;
        break;
      case "-e":
      case "--example-env-path":
        const exampleEnvPath = args.shift();
        if (!exampleEnvPath) {
          showError("Expected example env path but none found");
        }
        if (!existsSync(exampleEnvPath)) {
          showError("Example env path does not exist: ", exampleEnvPath);
        }
        cliConfig.exampleEnvPath = exampleEnvPath;
        break;
      case "-r":
      case "--rename-example-env":
        cliConfig.exampleEnvOutput = args.shift();
        break;
      default: {
        if (!existsSync(arg)) {
          showError(".env file doesn't exist at path: " + arg);
        }

        if (!lstatSync(arg).isFile()) {
          showError(`${arg} is not a file.`);
        }

        cliConfig.envPath = arg;
      }
    }
  }

  if (!cliConfig.envPath && existsSync(join(process.cwd(), ".env"))) {
    cliConfig.envPath = join(process.cwd(), ".env");
  }

  return cliConfig;
};

const cliConfig = parseArgs(process.argv.slice(2));

if (!cliConfig.envPath) {
  printHelp(1);
}
if (cliConfig.help) {
  return printHelp(0);
}
if (cliConfig.version) {
  return printVersion();
}

const envString = readFileSync(cliConfig.envPath, {
  encoding: "utf8",
});

const parsedEnvString = parse(envString);

function writeEnvTypes(path) {
  const existingModuleDeclaration =
    existsSync(path) && readFileSync(path, { encoding: "utf-8" });

  const moduleDeclaration = `declare namespace NodeJS {
  interface ProcessEnv {
    ${Object.keys(parsedEnvString)
      .map((key, i) => {
        if (!existingModuleDeclaration) {
          return `${i ? "    " : ""}${key}: string;`;
        }

        const existingPropertySignature = existingModuleDeclaration
          .split("\n")
          .find((line) => line.includes(`${key}:`));

        if (!existingPropertySignature) {
          return `${i ? "    " : ""}${key}: string;`;
        }

        return `${i ? "    " : ""}${existingPropertySignature.trim()}`;
      })
      .join("\n")}
  }
}`;

  writeFileSync(path, moduleDeclaration);

  console.log("Wrote env types to: ", path);
}

function writeExampleEnv(parsedExistingEnvString, path, isNew) {
  const out = Object.entries(parsedEnvString)
    .map(([key]) => `${key}=`)
    .join("\n");

  const withExistingEnvVariables = Object.entries(
    parsedExistingEnvString
  ).reduce((prev, [key, val]) => {
    const replacedValue = prev.replace(`${key}=`, `${key}=${val}`);

    return replacedValue;
  }, out);

  writeFileSync(path, isNew ? out : withExistingEnvVariables);

  console.log("Wrote example env to: ", path);
}

writeEnvTypes(cliConfig.typesOutput);

if (cliConfig.exampleEnvPath) {
  const outputExampleEnvPath = join(
    cliConfig.exampleEnvPath,
    cliConfig.exampleEnvOutput
  );

  if (existsSync(outputExampleEnvPath)) {
    const parsedExistingEnvString = parse(
      readFileSync(outputExampleEnvPath, { encoding: "utf-8" })
    );

    return writeExampleEnv(parsedExistingEnvString, outputExampleEnvPath);
  }

  writeExampleEnv(parsedEnvString, outputExampleEnvPath, true);
}
