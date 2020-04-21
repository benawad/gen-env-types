# gen-env-types

Generate a .d.ts and .env.example file from your .env file

## Usage

```
npx gen-env-types path/to/.env
```

## Options
```
  -V, --version               Show version number
  -h, --help                  Show usage information
  -o, --types-output          Output name/path for types file | defaults to `env.d.ts`
  -e, --example-env-path      Path to save .env.example file
```

## Example with options

```
npx gen-env-types .env -o src/types/env.d.ts -e .
```
