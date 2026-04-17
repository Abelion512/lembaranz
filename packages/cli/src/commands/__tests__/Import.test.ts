import { describe, expect, it } from 'bun:test';
import { getImportPathStatErrorMessage } from '../ImportErrors';

describe('getImportPathStatErrorMessage', () => {
  it('returns a clear message when path is not found', () => {
    const error = Object.assign(new Error('not found'), { code: 'ENOENT' });
    const result = getImportPathStatErrorMessage('/tmp/missing.md', error);

    expect(result).toContain('Path not found');
    expect(result).toContain('/tmp/missing.md');
  });

  it('returns a clear message when permission is denied (EACCES)', () => {
    const error = Object.assign(new Error('denied'), { code: 'EACCES' });
    const result = getImportPathStatErrorMessage('/root/protected.md', error);

    expect(result).toContain('Permission denied');
    expect(result).toContain('/root/protected.md');
  });

  it('returns a clear message when permission is denied (EPERM)', () => {
    const error = Object.assign(new Error('operation not permitted'), { code: 'EPERM' });
    const result = getImportPathStatErrorMessage('/root/protected.md', error);

    expect(result).toContain('Permission denied');
    expect(result).toContain('/root/protected.md');
  });
});
