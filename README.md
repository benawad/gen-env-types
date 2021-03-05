# gen-env-types

Takes your `.env` file as input

```toml
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

Now `process.env.SESSION_SECRET` will autocomplete and be type-safe.

If you want to generate a union instead of string type, add an inline comment to your `.env` file:

```toml
NODE_ENV=production # production | development

# Also works with strings!
NODE_ENV = "production" # production | development
```

```typescript
declare namespace NodeJS {
  export interface ProcessEnv {
    NODE_ENV: "production" | "development";
  }
}
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
  -r,  --rename-example-env   Custom name for .env example output file | defaults to `env.example` if omitted
```

## Examples with options

```bash
npx gen-env-types .env -o src/types/env.d.ts -e .
```

```bash
# With custom example env file name
npx gen-env-types .env -o src/types/env.d.ts -e . -r .env.test
```
