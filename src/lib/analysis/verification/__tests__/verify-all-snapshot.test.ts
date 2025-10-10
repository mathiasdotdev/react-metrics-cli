import { describe, expect, test } from 'bun:test';
import {
  createDeclaration,
  runVerificationSnapshot,
  runVerificationSnapshotWithFiles,
} from './helpers/verificationSnapshotHelper';
import { DeclarationType } from '$types/analysis';
import { VERIFICATION_SAMPLES } from '$tests/fixtures/code-samples';

// Import verifiers
import { verifyFunctions } from '../verifiers/verify-functions';
import { verifyClasses } from '../verifiers/verify-classes';
import { verifyConstants } from '../verifiers/verify-constants';
import { verifyProps } from '../verifiers/verify-props';
import { verifyDefinitions } from '../verifiers/verify-definitions';
import {
  verifyLocalUsage,
  verifyExternalImports,
} from '../verifiers/verify-exports';
import { verifyConsoles } from '../verifiers/verify-consoles';
import { verifyDependencies } from '../verifiers/verify-dependencies';
import { verifyDeprecated } from '../verifiers/verify-deprecated';
import type { Declaration } from '$types/analysis';

// Wrapper pour verifyExports qui combine les deux vérificateurs
const verifyExports = (
  fileContents: Map<string, string>,
  declarations: Map<string, Declaration>,
) => {
  // Les deux fonctions prennent 3 paramètres : (_content, declarations, fileContents)
  verifyLocalUsage('', declarations, fileContents);
  verifyExternalImports('', declarations, fileContents);
};

describe('Verification - All Verifiers Snapshot Tests', () => {
  test('verifyFunctions: all cases', () => {
    const testCases = {
      functionCalled: {
        declarations: [
          createDeclaration('myFunction', DeclarationType.FUNCTION),
        ],
        content: VERIFICATION_SAMPLES.functionCalled,
      },
      functionAsCallback: {
        declarations: [
          createDeclaration('handleClick', DeclarationType.FUNCTION),
        ],
        content: VERIFICATION_SAMPLES.functionAsCallback,
      },
      functionInComment: {
        declarations: [
          createDeclaration('myFunction', DeclarationType.FUNCTION),
        ],
        content: VERIFICATION_SAMPLES.functionInComment,
      },
      functionInString: {
        declarations: [
          createDeclaration('myFunction', DeclarationType.FUNCTION),
        ],
        content: VERIFICATION_SAMPLES.functionInString,
      },
      functionInJSX: {
        declarations: [
          createDeclaration(
            'handleSubmit',
            DeclarationType.FUNCTION,
            '/test/file.tsx',
          ),
        ],
        content: VERIFICATION_SAMPLES.functionInJSX,
      },
    };

    const result = runVerificationSnapshot(verifyFunctions, testCases);
    expect(result).toMatchSnapshot();
  });

  test('verifyClasses: all cases', () => {
    const testCases = {
      classInstantiated: {
        declarations: [createDeclaration('MyClass', DeclarationType.CLASS)],
        content: VERIFICATION_SAMPLES.classInstantiated,
      },
      classExtended: {
        declarations: [createDeclaration('BaseClass', DeclarationType.CLASS)],
        content: VERIFICATION_SAMPLES.classExtended,
      },
      classInInstanceof: {
        declarations: [createDeclaration('MyClass', DeclarationType.CLASS)],
        content: VERIFICATION_SAMPLES.classInInstanceof,
      },
      classAsType: {
        declarations: [createDeclaration('MyClass', DeclarationType.CLASS)],
        content: VERIFICATION_SAMPLES.classAsType,
      },
      classInComment: {
        declarations: [createDeclaration('MyClass', DeclarationType.CLASS)],
        content: '// MyClass is deprecated\nconst x = 1;',
      },
      classInString: {
        declarations: [createDeclaration('MyClass', DeclarationType.CLASS)],
        content: 'const msg = "MyClass should not be used";',
      },
      classInExportBraces: {
        declarations: [createDeclaration('MyClass', DeclarationType.CLASS)],
        content: 'export { MyClass };',
      },
      classWithImplementsComma: {
        declarations: [createDeclaration('MyClass', DeclarationType.CLASS)],
        content: 'class Test implements IFirst, MyClass { }',
      },
      classStaticAccess: {
        declarations: [createDeclaration('MyClass', DeclarationType.CLASS)],
        content: 'const x = MyClass.staticMethod();',
      },
      classInGenericWithComma: {
        declarations: [createDeclaration('MyClass', DeclarationType.CLASS)],
        content: 'const map: Map<string, MyClass> = new Map();',
      },
      classAsParameter: {
        declarations: [createDeclaration('MyClass', DeclarationType.CLASS)],
        content: 'function test(first, MyClass) { }',
      },
      classAsFirstParameter: {
        declarations: [createDeclaration('MyClass', DeclarationType.CLASS)],
        content: 'function test(MyClass, second) { }',
      },
      classAsLastParameter: {
        declarations: [createDeclaration('MyClass', DeclarationType.CLASS)],
        content: 'function test(first, second, MyClass) { }',
      },
    };

    const result = runVerificationSnapshot(verifyClasses, testCases);
    expect(result).toMatchSnapshot();
  });

  test('verifyConstants: all cases', () => {
    const testCases = {
      constantReferenced: {
        declarations: [createDeclaration('API_URL', DeclarationType.CONSTANT)],
        content: VERIFICATION_SAMPLES.constantReferenced,
      },
      constantInExpression: {
        declarations: [
          createDeclaration('MAX_COUNT', DeclarationType.CONSTANT),
        ],
        content: VERIFICATION_SAMPLES.constantInExpression,
      },
      constantInTemplateInterpolation: {
        declarations: [createDeclaration('USERNAME', DeclarationType.CONSTANT)],
        content: VERIFICATION_SAMPLES.constantInTemplateInterpolation,
      },
      constantInSpread: {
        declarations: [
          createDeclaration('BASE_PROPS', DeclarationType.CONSTANT),
        ],
        content: VERIFICATION_SAMPLES.constantInSpread,
      },
    };

    const result = runVerificationSnapshot(verifyConstants, testCases);
    expect(result).toMatchSnapshot();
  });

  test('verifyProps: all cases', () => {
    const testCases = {
      propAccessed: {
        declarations: [createDeclaration('name', DeclarationType.PROP)],
        content:
          'const name: string = "John";\nconst greeting = `Hello ${name}`;',
      },
      propInDestructuring: {
        declarations: [createDeclaration('email', DeclarationType.PROP)],
        content:
          'const email: string = "test@test.com";\nconst { email } = user;',
      },
      propInSpread: {
        declarations: [createDeclaration('title', DeclarationType.PROP)],
        content: 'const title: string = "Test";\nconst props = { ...title };',
      },
    };

    const result = runVerificationSnapshot(verifyProps, testCases);
    expect(result).toMatchSnapshot();
  });

  test('verifyDefinitions: all cases', () => {
    const testCases = {
      typeUsedInAnnotation: {
        declarations: [createDeclaration('User', DeclarationType.DEFINITION)],
        content: VERIFICATION_SAMPLES.typeUsedInAnnotation,
      },
      interfaceImplemented: {
        declarations: [
          createDeclaration('IService', DeclarationType.DEFINITION),
        ],
        content: VERIFICATION_SAMPLES.interfaceImplemented,
      },
      typeInGeneric: {
        declarations: [createDeclaration('Result', DeclarationType.DEFINITION)],
        content: VERIFICATION_SAMPLES.typeInGeneric,
      },
      typeInUnion: {
        declarations: [createDeclaration('Status', DeclarationType.DEFINITION)],
        content: VERIFICATION_SAMPLES.typeInUnion,
      },
      definitionInString: {
        declarations: [
          createDeclaration('UserType', DeclarationType.DEFINITION),
        ],
        content: 'const msg = "UserType should be used";',
      },
      definitionInComment: {
        declarations: [
          createDeclaration('UserType', DeclarationType.DEFINITION),
        ],
        content: '// UserType is deprecated',
      },
      definitionInExport: {
        declarations: [
          createDeclaration('UserType', DeclarationType.DEFINITION),
        ],
        content: 'export { UserType };',
      },
      definitionNotInExtends: {
        declarations: [
          createDeclaration('UserType', DeclarationType.DEFINITION),
        ],
        content: 'interface Other extends BaseType { }',
      },
      definitionNotInImplements: {
        declarations: [
          createDeclaration('UserType', DeclarationType.DEFINITION),
        ],
        content: 'class Test implements IBase { }',
      },
      definitionNotInAs: {
        declarations: [
          createDeclaration('UserType', DeclarationType.DEFINITION),
        ],
        content: 'const x = value as BaseType;',
      },
      definitionNotInIs: {
        declarations: [
          createDeclaration('UserType', DeclarationType.DEFINITION),
        ],
        content: 'function check(x): x is BaseType { return true; }',
      },
      definitionNotInKeyof: {
        declarations: [
          createDeclaration('UserType', DeclarationType.DEFINITION),
        ],
        content: 'type Keys = keyof BaseType;',
      },
      definitionNotInTypeof: {
        declarations: [
          createDeclaration('UserType', DeclarationType.DEFINITION),
        ],
        content: 'type T = typeof BaseType;',
      },
      definitionNotInIntersection: {
        declarations: [
          createDeclaration('UserType', DeclarationType.DEFINITION),
        ],
        content: 'type Combined = BaseType & OtherType;',
      },
      definitionInIntersection: {
        declarations: [
          createDeclaration('UserType', DeclarationType.DEFINITION),
        ],
        content: 'type Combined = BaseType & UserType;',
      },
    };

    const result = runVerificationSnapshot(verifyDefinitions, testCases);
    expect(result).toMatchSnapshot();
  });

  test('verifyExports: all cases', () => {
    const testCases = {
      exportImportedInAnotherFile: {
        declarations: [
          createDeclaration(
            'myFunction',
            DeclarationType.EXPORT,
            '/src/utils.ts',
          ),
        ],
        fileContents: new Map([
          ['/src/utils.ts', 'export function myFunction() {}'],
          ['/src/app.ts', VERIFICATION_SAMPLES.exportImported],
        ]),
      },
      exportWithMultipleImports: {
        declarations: [
          createDeclaration('myExport', DeclarationType.EXPORT, '/src/lib.ts'),
        ],
        fileContents: new Map([
          ['/src/lib.ts', 'export const myExport = true'],
          ['/src/main.ts', VERIFICATION_SAMPLES.exportWithMultipleImports],
        ]),
      },
      exportReExported: {
        declarations: [
          createDeclaration(
            'myFunction',
            DeclarationType.EXPORT,
            '/src/utils.ts',
          ),
        ],
        fileContents: new Map([
          ['/src/utils.ts', 'export function myFunction() {}'],
          ['/src/index.ts', VERIFICATION_SAMPLES.exportReExported],
        ]),
      },
      importWithoutFrom: {
        declarations: [
          createDeclaration(
            'myExport',
            DeclarationType.EXPORT,
            '/src/file1.ts',
          ),
        ],
        fileContents: new Map([
          ['/src/file1.ts', 'export const myExport = 1;'],
          ['/src/file2.ts', 'import myExport;'], // malformed import
        ]),
      },
      importWithRelativeParentPath: {
        declarations: [
          createDeclaration(
            'helper',
            DeclarationType.EXPORT,
            '/src/utils/file1.ts',
          ),
        ],
        fileContents: new Map([
          ['/src/utils/file1.ts', 'export const helper = 1;'],
          [
            '/src/components/deep/file2.ts',
            'import { helper } from "../../utils/file1";',
          ],
        ]),
      },
      importWithComplexRelativePath: {
        declarations: [
          createDeclaration(
            'util',
            DeclarationType.EXPORT,
            '/src/lib/utils/util.ts',
          ),
        ],
        fileContents: new Map([
          ['/src/lib/utils/util.ts', 'export const util = 1;'],
          [
            '/src/features/user/components/form.tsx',
            'import { util } from "../../../lib/utils/util";',
          ],
        ]),
      },
    };

    const result = runVerificationSnapshotWithFiles(verifyExports, testCases);
    expect(result).toMatchSnapshot();
  });

  test('verifyConsoles: all cases', () => {
    const testCases = {
      consoleLog: {
        declarations: [createDeclaration('console', DeclarationType.CONSOLE)],
        content: 'console.log("test")',
      },
      consoleError: {
        declarations: [createDeclaration('console', DeclarationType.CONSOLE)],
        content: 'console.error("error")',
      },
      consoleWarn: {
        declarations: [createDeclaration('console', DeclarationType.CONSOLE)],
        content: 'console.warn("warning")',
      },
    };

    const result = runVerificationSnapshot(verifyConsoles, testCases);
    expect(result).toMatchSnapshot();
  });

  test('verifyDependencies: all cases', () => {
    const testCases = {
      dependencyImported: {
        declarations: [
          createDeclaration(
            'react',
            DeclarationType.DEPENDENCY,
            '/test/package.json',
          ),
        ],
        fileContents: new Map([
          ['/test/file.tsx', VERIFICATION_SAMPLES.dependencyImported],
        ]),
      },
      dependencyRequired: {
        declarations: [
          createDeclaration(
            'express',
            DeclarationType.DEPENDENCY,
            '/test/package.json',
          ),
        ],
        fileContents: new Map([
          ['/test/server.js', VERIFICATION_SAMPLES.dependencyRequired],
        ]),
      },
      dependencyScopedImport: {
        declarations: [
          createDeclaration(
            '@types/node',
            DeclarationType.DEPENDENCY,
            '/test/package.json',
          ),
        ],
        fileContents: new Map([
          ['/test/types.ts', VERIFICATION_SAMPLES.dependencyScopedImport],
        ]),
      },
      dependencySubmodule: {
        declarations: [
          createDeclaration(
            'fs',
            DeclarationType.DEPENDENCY,
            '/test/package.json',
          ),
        ],
        fileContents: new Map([
          ['/test/utils.ts', VERIFICATION_SAMPLES.dependencySubmodule],
        ]),
      },
      sideEffectImportSingleQuote: {
        declarations: [
          createDeclaration(
            'dotenv',
            DeclarationType.DEPENDENCY,
            '/test/package.json',
          ),
        ],
        fileContents: new Map([['/test/config.ts', "import 'dotenv/config';"]]),
      },
      sideEffectImportWithSubmodule: {
        declarations: [
          createDeclaration(
            'react',
            DeclarationType.DEPENDENCY,
            '/test/package.json',
          ),
        ],
        fileContents: new Map([
          ['/test/profiler.ts', 'import "react/profiler";'],
        ]),
      },
      reExportFromPackage: {
        declarations: [
          createDeclaration(
            'react',
            DeclarationType.DEPENDENCY,
            '/test/package.json',
          ),
        ],
        fileContents: new Map([
          ['/test/index.ts', 'export { Component } from "react";'],
        ]),
      },
      reExportWithSubmodule: {
        declarations: [
          createDeclaration(
            'lodash',
            DeclarationType.DEPENDENCY,
            '/test/package.json',
          ),
        ],
        fileContents: new Map([
          ['/test/utils.ts', 'export * from "lodash/merge";'],
        ]),
      },
      dynamicImport: {
        declarations: [
          createDeclaration(
            'chalk',
            DeclarationType.DEPENDENCY,
            '/test/package.json',
          ),
        ],
        fileContents: new Map([
          ['/test/logger.ts', 'const mod = await import("chalk");'],
        ]),
      },
      requireWithSubmodule: {
        declarations: [
          createDeclaration(
            'fs',
            DeclarationType.DEPENDENCY,
            '/test/package.json',
          ),
        ],
        fileContents: new Map([
          ['/test/file.js', 'const promises = require("fs/promises");'],
        ]),
      },
    };

    const result = runVerificationSnapshotWithFiles(
      verifyDependencies,
      testCases,
    );
    expect(result).toMatchSnapshot();
  });

  test('verifyDeprecated: all cases', () => {
    const testCases = {
      deprecatedDeclaration: {
        declarations: [
          createDeclaration('oldFunction', DeclarationType.FUNCTION),
        ],
        content: '/** @deprecated */\nfunction oldFunction() {}',
      },
      nonDeprecatedDeclaration: {
        declarations: [
          createDeclaration('newFunction', DeclarationType.FUNCTION),
        ],
        content: 'function newFunction() {}',
      },
    };

    const result = runVerificationSnapshot(verifyDeprecated, testCases);
    expect(result).toMatchSnapshot();
  });
});
