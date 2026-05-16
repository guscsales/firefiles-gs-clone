import { afterEach, describe, expect, it, vi } from 'vitest';
import { createLoggerClient } from '../logger';

describe('createLoggerClient', () => {
  const spies = {
    info: vi.spyOn(console, 'info').mockImplementation(() => {}),
    error: vi.spyOn(console, 'error').mockImplementation(() => {}),
    warn: vi.spyOn(console, 'warn').mockImplementation(() => {}),
    debug: vi.spyOn(console, 'debug').mockImplementation(() => {}),
    trace: vi.spyOn(console, 'trace').mockImplementation(() => {})
  };

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('prefixes messages with the namespace', () => {
    const logger = createLoggerClient('MyService');
    logger.info('hello');
    expect(spies.info).toHaveBeenCalledWith('[INFO][MyService] hello', '');
  });

  it('includes extra data when provided', () => {
    const logger = createLoggerClient('MyService');
    const data = { userId: 42 };
    logger.info('user loaded', data);
    expect(spies.info).toHaveBeenCalledWith(
      '[INFO][MyService] user loaded',
      data
    );
  });

  it.each([
    ['info', '[INFO]', 'info' as const],
    ['warn', '[WARN]', 'warn' as const],
    ['debug', '[DEBUG]', 'debug' as const],
    ['trace', '[TRACE]', 'trace' as const]
  ])('%s() calls console.%s with the correct prefix', (method, prefix, consoleMethod) => {
    const logger = createLoggerClient('NS');
    logger[method as keyof typeof logger]('msg');
    expect(spies[consoleMethod]).toHaveBeenCalledWith(`${prefix}[NS] msg`, '');
  });

  it('error() calls console.error with [ERROR] prefix', () => {
    const logger = createLoggerClient('NS');
    logger.error('something broke');
    expect(spies.error).toHaveBeenCalledWith('[ERROR][NS] something broke', '');
  });

  it('fatal() calls console.error with [FATAL] prefix', () => {
    const logger = createLoggerClient('NS');
    logger.fatal('system down');
    expect(spies.error).toHaveBeenCalledWith('[FATAL][NS] system down', '');
  });

  it('different namespaces produce independent loggers', () => {
    const a = createLoggerClient('ServiceA');
    const b = createLoggerClient('ServiceB');
    a.info('from a');
    b.info('from b');
    expect(spies.info).toHaveBeenCalledWith('[INFO][ServiceA] from a', '');
    expect(spies.info).toHaveBeenCalledWith('[INFO][ServiceB] from b', '');
  });
});
