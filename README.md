# gen-env-types

Takes your `.env` file as input

```sh
SESSION_SECRET=asdjpfowqip
STRIPE_ACCESS_TOKEN=qoi120wqe
```

And generates a `.d.ts` file

```typescript
declare namespace NodeJS {
  export interface ProcessEnv {
    SESSION_SECRET: string;
    STRIPE_ACCESS_TOKEN: string;
  }
}
```

Include the generated file in your `tsconfig.json` if not already:
```json
{
  "include": [
    "./env.d.ts"
  ]
}
```


Now `process.env.SESSION_SECRET` will autocomplete and be type-safe.

## Customize

`gen-env-types` respects changes made to generated files, meaning you can overwrite `.env.example` and `env.d.ts` values, this can be helpful if you want a union type:

```typescript
declare namespace NodeJS {
  export interface ProcessEnv {
    NODE_ENV: "development" | "production";
  }
}
```

Or if you want to persist `.env.example` values:

```sh
PORT=3000
```

## Usage

```bash
npx gen-env-types path/to/.env
```

## Options

```
  -V, --version               Show version number
  -h, --help                  Show usage information
  -o, --types-output          Output name/path for types file | defaults to `env.d.ts`
  -e, --example-env-path      Path to save .env.example file
  -O,  --optional [vars]      Make some of the environment variables optional.
                              Accepts a list of environment variables to be made optional.
  -r, --rename-example-env    Custom name for .env example output file | defaults to `env.example` if omitted
  -k, --keep-comments         Keep comments/blank lines in .env example output file | defaults to false if omitted.
                              Not accepting the value. When specified, it will be true.
```

## Examples with options

```bash
npx gen-env-types .env -o src/types/env.d.ts -e .
```

```bash
# With custom example env file name
npx gen-env-types .env -o src/types/env.d.ts -e . -r .env.test
```
