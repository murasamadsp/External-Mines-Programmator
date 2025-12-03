import { TruncatePipe } from './truncate.pipe';

describe('TruncatePipe', () => {
  let pipe: TruncatePipe;

  beforeEach(() => {
    pipe = new TruncatePipe();
  });

  it('should create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should return the same string if shorter than limit', () => {
    const result = pipe.transform('Hello', 10);
    expect(result).toBe('Hello');
  });

  it('should truncate string and add suffix', () => {
    const result = pipe.transform('Hello World', 5);
    expect(result).toBe('Hello...');
  });

  it('should use custom suffix', () => {
    const result = pipe.transform('Hello World', 5, '***');
    expect(result).toBe('Hello***');
  });

  it('should handle null/undefined values', () => {
    expect(pipe.transform(null as unknown as string)).toBeNull();
    expect(pipe.transform(undefined as unknown as string)).toBeUndefined();
  });

  it('should use default limit of 20', () => {
    const longString = 'This is a very long string that should be truncated';
    const result = pipe.transform(longString);
    expect(result.length).toBeLessThan(longString.length);
    expect(result.endsWith('...')).toBe(true);
  });
});
