// packages/shared has no test runner of its own (no `test` script, no
// jest devDependency) -- same convention already established by
// authSchemas.test.ts: shared code is tested from here, via apps/web's
// Jest setup, rather than left untested because its own package can't run
// a suite.
import { formatCurrency, convertToXOF, CURRENCIES } from '@budget-pocket/shared';

describe('formatCurrency', () => {
  it('formats XOF with no decimal places and the FCFA symbol', () => {
    const result = formatCurrency(150000, 'XOF');

    // Not asserting on the exact thousands-separator character (it's a
    // narrow no-break space from Intl, whose exact codepoint can vary by
    // ICU data) -- checking content instead of exact bytes.
    expect(result.replace(/\s/g, ' ')).toBe('150 000 FCFA');
  });

  it('defaults to XOF when no currency is given', () => {
    expect(formatCurrency(1000)).toBe(formatCurrency(1000, 'XOF'));
  });

  it('formats EUR/USD/GBP with 2 decimal places and the right currency symbol', () => {
    expect(formatCurrency(1234.5, 'EUR')).toContain('€');
    expect(formatCurrency(1234.5, 'EUR')).toMatch(/1.?234,50/);

    expect(formatCurrency(1234.5, 'USD')).toBe('$1,234.50');

    expect(formatCurrency(1234.5, 'GBP')).toContain('£');
    expect(formatCurrency(1234.5, 'GBP')).toMatch(/1,234\.50/);
  });

  it('rounds XOF to a whole number rather than showing decimals', () => {
    expect(formatCurrency(999.9, 'XOF')).not.toContain(',');
    expect(formatCurrency(999.9, 'XOF').replace(/\s/g, ' ')).toBe('1 000 FCFA');
  });
});

describe('convertToXOF', () => {
  it('returns the amount unchanged for XOF itself (rate 1)', () => {
    expect(convertToXOF(5000, 'XOF')).toBe(5000);
  });

  it("converts using each currency's documented rate", () => {
    expect(convertToXOF(1, 'EUR')).toBe(CURRENCIES.EUR.toXOF);
    expect(convertToXOF(10, 'USD')).toBe(10 * CURRENCIES.USD.toXOF);
    expect(convertToXOF(2, 'GBP')).toBe(2 * CURRENCIES.GBP.toXOF);
  });

  it('scales linearly with the amount', () => {
    expect(convertToXOF(20, 'USD')).toBe(2 * convertToXOF(10, 'USD'));
  });
});
