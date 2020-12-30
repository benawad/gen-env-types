#!/usr/bin/env node
const { readFileSync, writeFileSync, existsSync, lstatSync } = require("fs");
const pkg = require("./package.json");
const chalk = require("chalk");
const { join } = require("path");

const printVersion = () => console.log("v" + pkg.version);
const printHelp = (exitCode) => {
  console.log(
    chalk`{blue gen-env-types} - Generate a .d.ts and .env.example file from your .env file.

{bold USAGE}

  {blue gen-env-types} path/to/.env

{bold OPTIONS}

  -V, --version               Show version number
  -h, --help                  Show usage information
  -o, --types-output          Output name/path for types file | defaults to \`env.d.ts\`
  -e, --example-env-path      Path to save .env.example file
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

  if (!cliConfig.envPath && existsSync(join(process.cwd(), '.env'))) {
    cliConfig.envPath = join(process.cwd(), '.env');
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

function writeEnvTypes(envString, path) {
  writeFileSync(
    path,
    `declare namespace NodeJS {
  export interface ProcessEnv {
    ${envString
      .split("\n")
      .filter((line) => line.trim() && line.trim().indexOf("#") !== 0)
      .map((x, i) => `${i ? "    " : ""}${x.trim().split("=")[0]}: string;`)
      .join("\n")}
  }
}
`
  );

  console.log("Wrote env types to: ", path);
}

function writeExampleEnv(envString, path) {
  writeFileSync(
    path,
    `${envString
      .split("\n")
      .filter((line) => line.trim())
      .map((x) => {
        if (x.trim().indexOf("#") == 0) return x.trim();
        return `${x.trim().split("=")[0]}=`;
      })
      .join("\n")}`
  );

  console.log("Wrote example env to: ", path);
}

writeEnvTypes(envString, cliConfig.typesOutput);
if (cliConfig.exampleEnvPath) {
  writeExampleEnv(envString, join(cliConfig.exampleEnvPath, ".env.example"));
}
