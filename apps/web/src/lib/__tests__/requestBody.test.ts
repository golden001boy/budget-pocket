import { readJsonBody, PayloadTooLargeError, MAX_JSON_BODY_BYTES } from '../requestBody';

function makeRequest(body: string) {
  return new Request('http://localhost/api/whatever', { method: 'POST', body });
}

describe('readJsonBody', () => {
  it('parses a well-formed body under the size limit', async () => {
    const result = await readJsonBody(makeRequest(JSON.stringify({ a: 1, b: 'two' })));
    expect(result).toEqual({ a: 1, b: 'two' });
  });

  it('rejects a body larger than the default limit with PayloadTooLargeError', async () => {
    const oversized = 'x'.repeat(MAX_JSON_BODY_BYTES + 1);
    await expect(readJsonBody(makeRequest(oversized))).rejects.toThrow(PayloadTooLargeError);
  });

  it('accepts a body exactly at the limit', async () => {
    // Wrapped in a JSON string literal so it stays valid JSON at exactly
    // MAX_JSON_BODY_BYTES bytes (the two quote characters count too).
    const padding = 'x'.repeat(MAX_JSON_BODY_BYTES - 2);
    const result = await readJsonBody(makeRequest(`"${padding}"`));
    expect(result).toBe(padding);
  });

  it('respects a custom maxBytes override instead of the module default', async () => {
    await expect(readJsonBody(makeRequest('"12345"'), 4)).rejects.toThrow(PayloadTooLargeError);
    await expect(readJsonBody(makeRequest('"1234"'), 6)).resolves.toBe('1234');
  });

  it('still throws a plain SyntaxError on malformed JSON under the size limit, same as req.json()', async () => {
    await expect(readJsonBody(makeRequest('{not valid json'))).rejects.toThrow(SyntaxError);
  });

  it('counts bytes, not characters — multi-byte UTF-8 content can exceed the limit well under the character count', async () => {
    // Each '€' is 3 bytes in UTF-8. maxBytes=10 allows at most 3 of them
    // (9 bytes) as a bare string; add a 4th to cross the line.
    const fourEuros = '"' + '€'.repeat(4) + '"'; // 2 quote bytes + 12 bytes = 14 bytes
    await expect(readJsonBody(makeRequest(fourEuros), 10)).rejects.toThrow(PayloadTooLargeError);
  });

  it('PayloadTooLargeError carries the configured limit in its message', () => {
    const error = new PayloadTooLargeError(12345);
    expect(error.name).toBe('PayloadTooLargeError');
    expect(error.message).toContain('12345');
  });
});
