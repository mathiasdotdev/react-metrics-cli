import { describe, expect, test } from 'bun:test';
import {
  isIdentifierChar,
  isInString,
  isInStringWithName,
  isComment,
  isCompleteIdentifier,
  isInInterface,
  isImportOrExport,
} from '../string-utils';
import { isValidName } from '../identifier-utils';

describe('String Utils - Snapshot Tests', () => {
  test('isIdentifierChar: should validate identifier characters', () => {
    const testCases = {
      lowercase: 'a',
      uppercase: 'Z',
      digit: '5',
      underscore: '_',
      dollar: '$',
      dash: '-',
      space: ' ',
      dot: '.',
      empty: '',
      multipleChars: 'ab',
    };

    const results: Record<string, boolean> = {};
    for (const [key, char] of Object.entries(testCases)) {
      results[key] = isIdentifierChar(char);
    }

    expect(results).toMatchSnapshot();
  });

  test('isValidName: should validate JavaScript identifier names', () => {
    const testCases = {
      validCamelCase: 'myVariable',
      validPascalCase: 'MyClass',
      validWithUnderscore: '_private',
      validWithDollar: '$jquery',
      validWithNumbers: 'var123',
      validUnderscoreOnly: '_',
      validDollarOnly: '$',
      emptyString: '',
      startsWithNumber: '123abc',
      startsWithDash: '-invalid',
      startsWithAt: '@invalid',
      startsWithDot: '.invalid',
      containsDash: 'valid-name',
      containsAt: 'name@invalid',
      containsDot: 'name.property',
      containsSpace: 'my variable',
      containsSpecialChar: 'name!invalid',
    };

    const results: Record<string, boolean> = {};
    for (const [key, name] of Object.entries(testCases)) {
      results[key] = isValidName(name);
    }

    expect(results).toMatchSnapshot();
  });

  test('isInString: should detect if position is inside string', () => {
    const testCases = {
      beforeDoubleQuotes: { line: 'const x = "Hello World";', position: 5 },
      insideDoubleQuotes: { line: 'const x = "Hello World";', position: 15 },
      afterDoubleQuotes: { line: 'const x = "Hello World";', position: 25 },
      beforeSingleQuotes: { line: "const x = 'Hello';", position: 5 },
      insideSingleQuotes: { line: "const x = 'Hello';", position: 13 },
      insideBackticks: { line: 'const msg = `Template`;', position: 15 },
      insideTemplateInterpolation: {
        line: 'const msg = `Hello ${name}`;',
        position: 22,
      },
      outside: { line: 'const x = 1;', position: 5 },
    };

    const results: Record<string, boolean> = {};
    for (const [key, testCase] of Object.entries(testCases)) {
      results[key] = isInString(testCase.line, testCase.position);
    }

    expect(results).toMatchSnapshot();
  });

  test('isInStringWithName: should detect if name is inside string', () => {
    const testCases = {
      nameInDoubleQuotes: {
        line: 'const msg = "myVariable is here";',
        name: 'myVariable',
      },
      nameOutsideString: {
        line: 'const myVariable = "value";',
        name: 'myVariable',
      },
      nameInTemplate: {
        line: 'const msg = `myVariable text`;',
        name: 'myVariable',
      },
      nameInSingleQuotes: {
        line: "const msg = 'myVariable';",
        name: 'myVariable',
      },
      nameNotPresent: { line: 'const x = "some text";', name: 'myVariable' },
    };

    const results: Record<string, boolean> = {};
    for (const [key, testCase] of Object.entries(testCases)) {
      results[key] = isInStringWithName(testCase.line, testCase.name);
    }

    expect(results).toMatchSnapshot();
  });

  test('isComment: should detect comment lines', () => {
    const testCases = {
      singleLineComment: '// This is a comment',
      blockComment: '/* This is a block comment */',
      starComment: ' * This is inside a block',
      code: 'const x = 1;',
      emptyLine: '',
      whitespace: '   ',
      codeWithInlineComment: 'const x = 1; // comment',
    };

    const results: Record<string, boolean> = {};
    for (const [key, line] of Object.entries(testCases)) {
      results[key] = isComment(line);
    }

    expect(results).toMatchSnapshot();
  });

  test('isCompleteIdentifier: should validate complete identifiers in line', () => {
    const testCases = {
      exactMatch: { line: 'const myVariable = 1;', name: 'myVariable' },
      partOfLargerWord: {
        line: 'const myVariableExtended = 1;',
        name: 'myVariable',
      },
      propertyAccess: { line: 'obj.myVariable', name: 'myVariable' },
      inFunctionCall: { line: 'myVariable()', name: 'myVariable' },
      withParentheses: { line: 'function myVariable()', name: 'myVariable' },
      notPresent: { line: 'const other = 1;', name: 'myVariable' },
    };

    const results: Record<string, boolean> = {};
    for (const [key, testCase] of Object.entries(testCases)) {
      results[key] = isCompleteIdentifier(testCase.line, testCase.name);
    }

    expect(results).toMatchSnapshot();
  });

  test('isInInterface: should detect if line is inside interface definition', () => {
    const testCases = {
      insideInterface: {
        lines: ['interface User {', '  name: string;', '  age: number;', '}'],
        lineNumber: 2,
      },
      outsideInterface: {
        lines: ['interface User {', '  name: string;', '}', 'const x = 1;'],
        lineNumber: 4,
      },
      insideType: {
        lines: ['type User = {', '  name: string;', '  age: number;', '};'],
        lineNumber: 2,
      },
      beforeInterface: {
        lines: ['const x = 1;', 'interface User {', '  name: string;', '}'],
        lineNumber: 1,
      },
    };

    const results: Record<string, boolean> = {};
    for (const [key, testCase] of Object.entries(testCases)) {
      results[key] = isInInterface(testCase.lines, testCase.lineNumber);
    }

    expect(results).toMatchSnapshot();
  });

  test('isImportOrExport: should detect import/export statements', () => {
    const testCases = {
      import: 'import React from "react";',
      namedImport: 'import { useState } from "react";',
      export: 'export const myConst = 1;',
      exportDefault: 'export default MyComponent;',
      exportFunction: 'export function myFunction() {}',
      regularCode: 'const x = 1;',
      commentWithImport: '// import something',
    };

    const results: Record<string, boolean> = {};
    for (const [key, line] of Object.entries(testCases)) {
      results[key] = isImportOrExport(line);
    }

    expect(results).toMatchSnapshot();
  });

  test('combined: complex code scenarios', () => {
    const complexScenarios = {
      interfaceWithStrings: {
        lines: [
          'interface Config {',
          '  path: string; // "default path"',
          '  name: string;',
          '}',
        ],
        line2IsInterface: isInInterface(
          [
            'interface Config {',
            '  path: string; // "default path"',
            '  name: string;',
            '}',
          ],
          2,
        ),
        pathInString: isInStringWithName(
          '  path: string; // "default path"',
          'path',
        ),
        commentDetected: isComment('  path: string; // "default path"'),
      },
      importWithComplexNames: {
        lines: [
          'import { myVariable, otherVar } from "./module";',
          'const myVariable = 1;',
          'const myVariableExtended = 2;',
        ],
        line1IsImport: isImportOrExport(
          'import { myVariable, otherVar } from "./module";',
        ),
        line2IsNotImport: isImportOrExport('const myVariable = 1;'),
        myVariableCompleteInLine2: isCompleteIdentifier(
          'const myVariable = 1;',
          'myVariable',
        ),
        myVariableInLine3: isCompleteIdentifier(
          'const myVariableExtended = 2;',
          'myVariable',
        ),
      },
      stringsAndIdentifiers: {
        code: 'const message = "Hello myVariable"; const myVariable = 1;',
        firstMyVariableInString: isInStringWithName(
          'const message = "Hello myVariable"; const myVariable = 1;',
          'myVariable',
        ),
        messageIsIdentifier: isCompleteIdentifier(
          'const message = "Hello myVariable"; const myVariable = 1;',
          'message',
        ),
      },
    };

    expect(complexScenarios).toMatchSnapshot();
  });

  test('edge cases: boundary conditions', () => {
    const edgeCases = {
      emptyString: {
        isInString: isInString('', 0),
        isComment: isComment(''),
        isImportOrExport: isImportOrExport(''),
      },
      negativePosition: {
        isInString: isInString('const x = "test";', -1),
      },
      positionBeyondLength: {
        isInString: isInString('const x = 1;', 100),
      },
      singleCharacter: {
        a: isIdentifierChar('a'),
        _: isIdentifierChar('_'),
        $: isIdentifierChar('$'),
      },
      emptyName: {
        isInStringWithName: isInStringWithName('const x = "";', ''),
        isCompleteIdentifier: isCompleteIdentifier('const x = 1;', ''),
      },
      specialCharacters: {
        dash: isIdentifierChar('-'),
        dot: isIdentifierChar('.'),
        at: isIdentifierChar('@'),
        hash: isIdentifierChar('#'),
      },
    };

    expect(edgeCases).toMatchSnapshot();
  });
});
