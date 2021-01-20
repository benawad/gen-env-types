# gen-env-types

Takes your `.env` file as input

```
SESSION_SECRET=asdjpfowqip
STRIPE_ACCESS_TOKEN=qoi120wqe
```

And generates a `.d.ts` file

```
declare namespace NodeJS {
  export interface ProcessEnv {
    SESSION_SECRET: string;
    STRIPE_ACCESS_TOKEN: string;
  }
}
```

Now `process.env.SESSION_SECRET` will autocomplete and be type-safe.

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
