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
    it('should output browser optimized types when -b flag present', function () {        
        jest.resetModules()
        const temp = process.argv
        process.argv = [...process.argv, "-b"]
        const { writeEnvTypes } = require('./gen-env-types');
        const result = writeEnvTypes('env.d.ts');
        expect(result).toMatchInlineSnapshot(`
"declare global {
  var process: {
    env: {
      OPTIONAL_SECRET?: string;
      REQUIRED_SECRET: string;
    }
  }
}

export {}
"
`);
process.argv = temp
      });
});