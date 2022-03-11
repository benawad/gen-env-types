declare global {
  namespace NodeJS {
    interface ProcessEnv {
      OPTIONAL_SECRET?: string;
      REQUIRED_SECRET: string;
    }
  }
}

export {}
