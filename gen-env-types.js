const { readFileSync, writeFileSync } = require("fs");
const { join } = require("path");
const pkg = require("./package.json");
const chalk = require("chalk");

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
          throw new Error(
            "Expected output file to end in .d.ts, bad input: " + typesOutput
          );
        }
        cliConfig.typesOutput = typesOutput;
        break;
      case "-e":
      case "--example-env-path":
        const exampleEnvPath = args.shift();
        if (!exampleEnvPath) {
          throw new Error("Expected example env path but none found");
        }
        if (!fs.existsSync(exampleEnvPath)) {
          throw new Error("Example env path does not exist: ", exampleEnvPath);
        }
        cliConfig.exampleEnvPath = exampleEnvPath;
        break;
      default: {
        if (!fs.existsSync(arg)) {
          throw new Error("Path to .env file doesn't exist: " + arg);
        }
        cliConfig.envPath = arg;
      }
    }
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
    join(__dirname, path),
    `declare namespace NodeJS {
  export interface ProcessEnv {
    ${envString
      .split("\n")
      .map((x) => `${x.split("=")[0]}: string;`)
      .join("\n")}
  }
}
`
  );
}

function writeExampleEnv(envString, path) {
  writeFileSync(
    join(__dirname, path),
    `${envString
      .split("\n")
      .map((x) => `${x.split("=")[0]}=`)
      .join("\n")}`
  );
}

writeEnvTypes(envString, cliConfig.typesOutput);
if (cliConfig.exampleEnvPath) {
  writeExampleEnv(envString, cliConfig.exampleEnvPath);
}
