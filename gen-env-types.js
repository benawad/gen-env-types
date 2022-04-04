#!/usr/bin/env node

const {
  readFileSync,
  writeFileSync,
  existsSync,
  lstatSync,
} = require("fs");
const pkg = require("./package.json");
const chalk = require("chalk");
const { join } = require("path");
const { parse } = require("./parse");

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
  -O,  --optional [vars]       Make some of the environment variables optional.
                               Accepts a list of environment variables to be made optional.
  -r,  --rename-example-env    Custom name for .env example output file | defaults to \`env.example\` if omitted
  -k,  --keep-comments         Keep comments/blank lines in .env example output file | defaults to false if omitted.
                               Not accepting the value. When specified, it will be true.
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
    keepComments: false,
    listOfOptionalVariables: []
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
      case "-O":
      case "--optional":
        const listOfOptionalVariables = args.shift();
        if (!listOfOptionalVariables) {
          showError(
            "Expected a list of optional variables, bad input: " + listOfOptionalVariables
          );
        }
        cliConfig.listOfOptionalVariables = listOfOptionalVariables;
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
          showError("Example env path does not exist: " + exampleEnvPath);
        }
        cliConfig.exampleEnvPath = exampleEnvPath;
        break;
      case "-r":
      case "--rename-example-env":
        cliConfig.exampleEnvOutput = args.shift();
        break;
      case "-k":
      case "--keep-comments":
        cliConfig.keepComments = true;
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
  printHelp(0);
}
if (cliConfig.version) {
  printVersion();
}

const envString = readFileSync(cliConfig.envPath, {
  encoding: "utf8",
});

// Parse env string with comments and blank lines
const parsedEnvString = parse(envString);
// Filter out blank lines and comments
const filteredEnvString = parsedEnvString.filter((line) => line.isEnvVar);

function writeEnvTypes(path) {
  const existingModuleDeclaration =
    existsSync(path) && readFileSync(path, { encoding: "utf-8" });

  const moduleDeclaration = `declare global {
  namespace NodeJS {
    interface ProcessEnv {
      ${filteredEnvString
    .map(({key}, i) => {
      const isKeyOptional = cliConfig.listOfOptionalVariables.length > 0 && cliConfig.listOfOptionalVariables.includes(key);
      if (!existingModuleDeclaration) {
        return `${i ? "      " : ""}${key}${isKeyOptional ? '?' : ''}: string;`;
      }

      const existingPropertySignature = existingModuleDeclaration
        .split("\n")
        .find((line) => line.includes(`${key}:`) || line.includes(`${key}?:`));

      if (!existingPropertySignature) {
        return `${i ? "      " : ""}${key}${isKeyOptional ? '?' : ''}: string;`;
      }

      return `${i ? "      " : ""}${existingPropertySignature.trim()}`;
    })
    .join("\n")}
    }
  }
}

export {}
`;

  writeFileSync(path, moduleDeclaration);

  console.log("Wrote env types to: ", path);

  return moduleDeclaration;
}

function writeExampleEnv(parsedExistingEnvString, path, isNew) {
  const out = (cliConfig.keepComments ? parsedEnvString: filteredEnvString)
    .map(({key, isEnvVar,value}) => {
      if(isEnvVar) return `${key}=`;
      // Comment or blank value
      return value;
    })
    .join("\n");

  const withExistingEnvVariables = parsedExistingEnvString.reduce((strContent, {key, value}) => {
    return strContent.replace(`${key}=`, `${key}=${value}`);
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

    writeExampleEnv(parsedExistingEnvString, outputExampleEnvPath);
  } else {
    writeExampleEnv(filteredEnvString, outputExampleEnvPath, true);
  }
}

module.exports = {
    /**
   * @description Writes environment types to a file
   * @param {string} path
   * @returns the content of the created file
   */
  writeEnvTypes
}
