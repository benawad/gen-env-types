const {parse} = require('./parse');

describe('Environment file parser', function () {
  it('should parse single line payload (no end-line)', function () {
    const payload = 'key1=value1';
    const result = parse(payload);
    expect(result).toEqual([
      {key: 'key1', value: 'value1', isEnvVar: true},
    ]);
  });

  it('should parse single line payload (with end-line)', function () {
    const payload = 'key1=value1\n';
    const result = parse(payload);
    expect(result).toEqual([
      {key: 'key1', value: 'value1', isEnvVar: true},
      {key: null, value: '', isEnvVar: false},
    ]);
  });

  it('should parse single line payload (with multiple end-lines)', function () {
    const payload = 'key1=value1\n\n\n\nkey2=value2';
    const result = parse(payload);
    expect(result).toEqual([
      {key: 'key1', value: 'value1', isEnvVar: true},
      {key: null, value: '', isEnvVar: false},
      {key: null, value: '', isEnvVar: false},
      {key: null, value: '', isEnvVar: false},
      {key: 'key2', value: 'value2', isEnvVar: true},
    ]);
  });
  
  it('should parse string(lowercase) payload', function () {
    const payload = 'key1=value1\nkey2=value2';
    const result = parse(payload);
    expect(result).toEqual([
      {key: 'key1', value: 'value1', isEnvVar: true},
      {key: 'key2', value: 'value2', isEnvVar: true}
    ]);
  });

  it('should parse string(uppercase) payload', function () {
    const payload = 'KEY1=value1\nKEY2=value2';
    const result = parse(payload);
    expect(result).toEqual([
      {key: 'KEY1', value: 'value1', isEnvVar: true},
      {key: 'KEY2', value: 'value2', isEnvVar: true}
    ]);
  });

  it('should parse string(mixed case) payload', function () {
    const payload = 'KEY1=value1\nKeY2=value2\nkEy=ValuE3';
    const result = parse(payload);
    expect(result).toEqual([
      {key: 'KEY1', value: 'value1', isEnvVar: true},
      {key: 'KeY2', value: 'value2', isEnvVar: true},
      {key: 'kEy', value: 'ValuE3', isEnvVar: true},
    ]);
  });

  it('should parse string(with comment) payload', function () {
    const payload = 'KEY1=value1\n\n# Second value is for app port\nPORT=3000';
    const result = parse(payload);
    expect(result).toEqual([
      {key: 'KEY1', value: 'value1', isEnvVar: true},
      {key: null, value: '', isEnvVar: false}, // Blank line
      {key: null, value: '# Second value is for app port', isEnvVar: false}, // Comment
      {key: 'PORT', value: '3000', isEnvVar: true},
    ]);
  });

  it('should parse string(with quotes&indentation) payload', function () {
    // Template string already has end-lines and indentations from the left
    const payload = `
      ORIGINS="http://127.0.0.1:8100,http://127.0.0.1:8200"
      APP_PORT=8100
      
      # Redis config
      REDIS_URL="redis://127.0.0.1:6379"
      # or
      REDIS_HOST=  "127.0.0.1"
      REDIS_PORT=6379
      REDIS_NAMESPACE='sse'
      REDIS_USER="'Redis-User'"
      REDIS_PASS=
      
      # SSE config
      SSE_TTL=20m
      SSE_TTC=10m
      
      # Keycloak config
      KC_URL="http://127.0.0.1:8200/auth"
      KC_REALM="master"
      KC_CLIENT_ID='sse-local'
      KC_CLIENT_SECRET=
      
      # RabbitMQ config
      RABBITMQ_URL="amqp://127.0.0.1:5672"
      # or
      RABBITMQ_HOST="127.0.0.1"
      RABBITMQ_VHOST="/"
      RABBITMQ_PORT=5672
      RABBITMQ_USER=
      RABBITMQ_PW=
    `;
    const result = parse(payload);
    expect(result).toEqual([
        { key: null, value: '', isEnvVar: false },
        {
          key: 'ORIGINS',
          value: 'http://127.0.0.1:8100,http://127.0.0.1:8200',
          isEnvVar: true
        },
        { key: 'APP_PORT', value: '8100', isEnvVar: true },
        { key: null, value: '', isEnvVar: false },
        { key: null, value: '# Redis config', isEnvVar: false },
        { key: 'REDIS_URL', value: 'redis://127.0.0.1:6379', isEnvVar: true },
        { key: null, value: '# or', isEnvVar: false },
        { key: 'REDIS_HOST', value: '127.0.0.1', isEnvVar: true },
        { key: 'REDIS_PORT', value: '6379', isEnvVar: true },
        { key: 'REDIS_NAMESPACE', value: 'sse', isEnvVar: true },
         // 'Redis-User' because it only removed outer quotes
        { key: 'REDIS_USER', value: "'Redis-User'", isEnvVar: true },
        { key: 'REDIS_PASS', value: '', isEnvVar: true },
        { key: null, value: '', isEnvVar: false },
        { key: null, value: '# SSE config', isEnvVar: false },
        { key: 'SSE_TTL', value: '20m', isEnvVar: true },
        { key: 'SSE_TTC', value: '10m', isEnvVar: true },
        { key: null, value: '', isEnvVar: false },
        { key: null, value: '# Keycloak config', isEnvVar: false },
        {
          key: 'KC_URL',
          value: 'http://127.0.0.1:8200/auth',
          isEnvVar: true
        },
        { key: 'KC_REALM', value: 'master', isEnvVar: true },
        { key: 'KC_CLIENT_ID', value: 'sse-local', isEnvVar: true },
        { key: 'KC_CLIENT_SECRET', value: '', isEnvVar: true },
        { key: null, value: '', isEnvVar: false },
        { key: null, value: '# RabbitMQ config', isEnvVar: false },
        {
          key: 'RABBITMQ_URL',
          value: 'amqp://127.0.0.1:5672',
          isEnvVar: true
        },
        { key: null, value: '# or', isEnvVar: false },
        { key: 'RABBITMQ_HOST', value: '127.0.0.1', isEnvVar: true },
        { key: 'RABBITMQ_VHOST', value: '/', isEnvVar: true },
        { key: 'RABBITMQ_PORT', value: '5672', isEnvVar: true },
        { key: 'RABBITMQ_USER', value: '', isEnvVar: true },
        { key: 'RABBITMQ_PW', value: '', isEnvVar: true },
        { key: null, value: '', isEnvVar: false }
      ]
    );
  });
});
