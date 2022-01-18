module.exports = {
  /**
   * @description Parses env file data
   * @param {string | Buffer} envStr
   * @returns {{
   *   key: string,
   *   value: string,
   *   isEnvVar: boolean,
   * }[]}
   */
  parse(envStr = '') {
    const keyValuePattern = /^\s*([\w.-]+)\s*=\s*("[^"]*"|'[^']*'|[^#]*)?(\s*|\s*#.*)?$/;

    // Covert to string when buffer & split by new line.
    return envStr.toString('utf-8').split('\n').map(line => {
      const parsedLine = keyValuePattern.exec(line);
      // Ignore lines that do not match. When correctly parsed - len is always 4.
      if (parsedLine && parsedLine.length === 4) {
        const {1: envKey = null, 2: envValue = ''} = parsedLine;
        if (envKey) {
          const isDoubleQuoted = envValue.startsWith('"') && envValue.endsWith('"');
          const isSingleQuoted = envValue.startsWith("'") && envValue.endsWith("'");
          // When single or double quoted, remove quotes
          const unquotedEnvValue = isDoubleQuoted || isSingleQuoted
            ? envValue.slice(1, -1)
            : envValue;

          return {
            key: envKey,
            value: unquotedEnvValue,
            isEnvVar: true,
          };
        }
      }

      return {
        key: null,
        value: line.trim(),
        isEnvVar: false,
      };
    });
  }
}
