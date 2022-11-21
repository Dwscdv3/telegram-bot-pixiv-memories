import { expect, test } from '@jest/globals';
import { parse } from '../src/middleware/arguments';

test('Argument parser', () => {
    expect(parse('/x')).toStrictEqual([]);
    expect(parse(' /x a ')).toStrictEqual([]);
    expect(parse('/x abc  123')).toStrictEqual(['abc', '123']);
    expect(parse('/x a"bc 12"3')).toStrictEqual(['a"bc', '12"3']);
    expect(parse('/x "abc "123')).toStrictEqual(['"abc', '"123']);
    expect(parse('/x "abc d" "123  45"')).toStrictEqual(['abc d', '123  45']);
    expect(parse('/x "abc "x" 123"')).toStrictEqual(['abc "x', '123"']);
    expect(parse('/x "abc "x"123"')).toStrictEqual(['abc "x"123']);
    expect(parse('/x "abc" 123')).toStrictEqual(['abc', '123']);
    expect(parse('/x " abc 123 "')).toStrictEqual(['abc', '123']);
    expect(parse('/x " "')).toStrictEqual([]);
});
