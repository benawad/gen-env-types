const { writeEnvTypes } = require('./gen-env-types');

describe('Environment variable types generator', function () {
    it('should accept a list of optional variables', function () {        
        const result = writeEnvTypes('env.d.ts');
        expect(result).toMatchInlineSnapshot(`
"declare global {
  namespace NodeJS {
    interface ProcessEnv {
      OPTIONAL_SECRET?: string;
      REQUIRED_SECRET: string;
    }
  }
}

export {}
"
`);
      });
});