import { describe, expect, test } from 'bun:test';
import {
  shouldIgnoreLine,
  shouldIgnoreDeclaration,
  shouldIgnoreDeclarationWithContext,
  shouldIgnoreFile,
  isDeprecatedDeclaration,
} from '../annotation-analyzer';

describe('Annotation Analyzer - Snapshot Tests', () => {
  test('shouldIgnoreLine: should detect react-metrics-ignore-ligne annotation', () => {
    const testCases = {
      singleLineComment: '// react-metrics-ignore-ligne',
      singleLineWithSpaces: '//    react-metrics-ignore-ligne    ',
      blockComment: '/* react-metrics-ignore-ligne */',
      blockCommentWithSpaces: '/*   react-metrics-ignore-ligne   */',
      inlineAfterCode: 'const x = 1; // react-metrics-ignore-ligne',
      blockAfterCode: 'const x = 1; /* react-metrics-ignore-ligne */',
      noAnnotation: 'const x = 1; // regular comment',
      typoAnnotation: '// react-metrics-ignore-line', // typo
    };

    const results: Record<string, boolean> = {};
    for (const [key, line] of Object.entries(testCases)) {
      results[key] = shouldIgnoreLine(line);
    }

    expect(results).toMatchSnapshot();
  });

  test('shouldIgnoreDeclaration: should check current and previous line', () => {
    const scenarios = {
      annotationOnCurrentLine: {
        lines: [
          'function myFunction() { // react-metrics-ignore-ligne',
          '  return true;',
          '}',
        ],
        lineNumber: 1,
      },
      annotationOnPreviousLine: {
        lines: [
          '// react-metrics-ignore-ligne',
          'function myFunction() {',
          '  return true;',
        ],
        lineNumber: 2,
      },
      noAnnotation: {
        lines: [
          '// regular comment',
          'function myFunction() {',
          '  return true;',
        ],
        lineNumber: 2,
      },
      annotationTooFarAbove: {
        lines: [
          '// react-metrics-ignore-ligne',
          '',
          'function otherFunction() {}',
          'function myFunction() {',
        ],
        lineNumber: 4,
      },
    };

    const results: Record<string, boolean> = {};
    for (const [key, scenario] of Object.entries(scenarios)) {
      results[key] = shouldIgnoreDeclaration(
        scenario.lines,
        scenario.lineNumber,
      );
    }

    expect(results).toMatchSnapshot();
  });

  test('shouldIgnoreDeclarationWithContext: should check multiple lines above', () => {
    const scenarios = {
      annotationInContext3Lines: {
        lines: [
          '/**',
          ' * Some JSDoc',
          ' * react-metrics-ignore-ligne',
          ' */',
          'function myFunction() {',
        ],
        lineNumber: 5,
        contextLines: 3,
      },
      annotationBeyondContext: {
        lines: [
          '// react-metrics-ignore-ligne',
          '',
          '',
          '',
          '',
          'function myFunction() {',
        ],
        lineNumber: 6,
        contextLines: 3,
      },
      annotationWithinContext5Lines: {
        lines: [
          '// react-metrics-ignore-ligne',
          '// comment 1',
          '// comment 2',
          '// comment 3',
          'function myFunction() {',
        ],
        lineNumber: 5,
        contextLines: 5,
      },
      codeBreaksContext: {
        lines: [
          '// react-metrics-ignore-ligne',
          'const x = 1;',
          '// comment',
          'function myFunction() {',
        ],
        lineNumber: 4,
        contextLines: 5,
      },
    };

    const results: Record<string, boolean> = {};
    for (const [key, scenario] of Object.entries(scenarios)) {
      results[key] = shouldIgnoreDeclarationWithContext(
        scenario.lines,
        scenario.lineNumber,
        scenario.contextLines,
      );
    }

    expect(results).toMatchSnapshot();
  });

  test('shouldIgnoreFile: should detect react-metrics-ignore-file annotation', () => {
    const scenarios = {
      singleLineAtTop: {
        lines: [
          '// react-metrics-ignore-file',
          '',
          'import React from "react";',
          'function MyComponent() {}',
        ],
      },
      blockCommentAtTop: {
        lines: [
          '/**',
          ' * react-metrics-ignore-file',
          ' */',
          'import React from "react";',
        ],
      },
      afterEmptyLines: {
        lines: ['', '', '// react-metrics-ignore-file', '', 'const x = 1;'],
      },
      afterCode: {
        lines: ['const x = 1;', '// react-metrics-ignore-file', 'const y = 2;'],
      },
      noAnnotation: {
        lines: [
          '// regular comment',
          'import React from "react";',
          'function MyComponent() {}',
        ],
      },
      inBlockComment: {
        lines: [
          '/*',
          ' * File header',
          ' * react-metrics-ignore-file',
          ' */',
          'const x = 1;',
        ],
      },
    };

    const results: Record<string, boolean> = {};
    for (const [key, scenario] of Object.entries(scenarios)) {
      results[key] = shouldIgnoreFile(scenario.lines);
    }

    expect(results).toMatchSnapshot();
  });

  test('isDeprecatedDeclaration: should detect @deprecated annotation', () => {
    const scenarios = {
      jsdocDeprecated: {
        lines: [
          '/**',
          ' * @deprecated Use newFunction instead',
          ' */',
          'function oldFunction() {}',
        ],
        lineNumber: 4,
      },
      singleLineDeprecated: {
        lines: ['// @deprecated', 'const OLD_CONSTANT = 42;'],
        lineNumber: 2,
      },
      deprecatedWithReason: {
        lines: [
          '/**',
          ' * Old implementation',
          ' * @deprecated This is deprecated, use X instead',
          ' * @returns value',
          ' */',
          'function calculate() {}',
        ],
        lineNumber: 6,
      },
      noDeprecated: {
        lines: [
          '/**',
          ' * Regular JSDoc',
          ' * @param x input',
          ' * @returns result',
          ' */',
          'function myFunction(x) {}',
        ],
        lineNumber: 6,
      },
      deprecatedTooFarAbove: {
        lines: [
          '// @deprecated',
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          'function myFunction() {}',
        ],
        lineNumber: 13,
      },
      deprecatedWithinContext: {
        lines: [
          '// Some comment',
          '// Another comment',
          '// @deprecated Use new API',
          '// More comments',
          'const API_ENDPOINT = "/old";',
        ],
        lineNumber: 5,
      },
      codeBreaksDeprecatedContext: {
        lines: [
          '// @deprecated',
          'const x = 1;',
          '',
          'function myFunction() {}',
        ],
        lineNumber: 4,
      },
    };

    const results: Record<string, boolean> = {};
    for (const [key, scenario] of Object.entries(scenarios)) {
      results[key] = isDeprecatedDeclaration(
        scenario.lines,
        scenario.lineNumber,
      );
    }

    expect(results).toMatchSnapshot();
  });

  test('combined scenarios: real-world code examples', () => {
    const realWorldExamples = {
      componentWithIgnore: {
        code: [
          '// react-metrics-ignore-file',
          'import React from "react";',
          '',
          'export function MyComponent() {',
          '  return <div>Hello</div>;',
          '}',
        ],
        shouldIgnoreFile: shouldIgnoreFile([
          '// react-metrics-ignore-file',
          'import React from "react";',
          '',
          'export function MyComponent() {',
          '  return <div>Hello</div>;',
          '}',
        ]),
      },
      deprecatedFunction: {
        code: [
          '/**',
          ' * Legacy authentication function',
          ' * @deprecated Use authenticateV2 instead',
          ' */',
          'export function authenticate() {}',
        ],
        isDeprecated: isDeprecatedDeclaration(
          [
            '/**',
            ' * Legacy authentication function',
            ' * @deprecated Use authenticateV2 instead',
            ' */',
            'export function authenticate() {}',
          ],
          5,
        ),
      },
      ignoredVariable: {
        code: [
          'const USED_CONSTANT = 1;',
          '',
          '// react-metrics-ignore-ligne',
          'const IGNORED_CONSTANT = 2;',
          '',
          'const ANOTHER_USED = 3;',
        ],
        line3Ignored: shouldIgnoreDeclaration(
          [
            'const USED_CONSTANT = 1;',
            '',
            '// react-metrics-ignore-ligne',
            'const IGNORED_CONSTANT = 2;',
            '',
            'const ANOTHER_USED = 3;',
          ],
          4,
        ),
        line6NotIgnored: shouldIgnoreDeclaration(
          [
            'const USED_CONSTANT = 1;',
            '',
            '// react-metrics-ignore-ligne',
            'const IGNORED_CONSTANT = 2;',
            '',
            'const ANOTHER_USED = 3;',
          ],
          6,
        ),
      },
      jsdocWithMultipleAnnotations: {
        code: [
          '/**',
          ' * Complex function',
          ' * @param {string} input',
          ' * @deprecated',
          ' * @returns {string}',
          ' */',
          'function process(input) {}',
        ],
        hasDeprecated: isDeprecatedDeclaration(
          [
            '/**',
            ' * Complex function',
            ' * @param {string} input',
            ' * @deprecated',
            ' * @returns {string}',
            ' */',
            'function process(input) {}',
          ],
          7,
        ),
        hasIgnore: shouldIgnoreLine('/**'),
      },
    };

    expect(realWorldExamples).toMatchSnapshot();
  });

  test('edge cases: boundary conditions', () => {
    const edgeCases = {
      emptyFile: {
        shouldIgnoreFile: shouldIgnoreFile([]),
        isDeprecated: isDeprecatedDeclaration([], 1),
        shouldIgnore: shouldIgnoreDeclaration([], 1),
      },
      singleLine: {
        shouldIgnoreFile: shouldIgnoreFile(['// react-metrics-ignore-file']),
        isDeprecated: isDeprecatedDeclaration(['// @deprecated'], 1),
      },
      lineNumberZero: {
        shouldIgnore: shouldIgnoreDeclaration(['const x = 1;'], 0),
        isDeprecated: isDeprecatedDeclaration(['const x = 1;'], 0),
      },
      lineNumberBeyondArray: {
        shouldIgnore: shouldIgnoreDeclaration(['const x = 1;'], 100),
        isDeprecated: isDeprecatedDeclaration(['const x = 1;'], 100),
      },
      onlyWhitespaceLines: {
        shouldIgnoreFile: shouldIgnoreFile(['', '  ', '\t', '']),
        lines: ['', '  ', '\t', ''],
      },
      annotationVariations: {
        withExtraSpaces: shouldIgnoreLine(
          '//     react-metrics-ignore-ligne     ',
        ),
        withTabs: shouldIgnoreLine('//\t\treact-metrics-ignore-ligne\t\t'),
        inBlockWithText: shouldIgnoreLine(
          '/* Some text react-metrics-ignore-ligne more text */',
        ),
        inSingleLineWithText: shouldIgnoreLine(
          '// TODO: react-metrics-ignore-ligne for now',
        ),
      },
    };

    expect(edgeCases).toMatchSnapshot();
  });
});
