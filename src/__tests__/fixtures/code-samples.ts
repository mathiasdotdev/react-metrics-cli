/**
 * Échantillons de code réutilisables pour les tests
 */

export const FUNCTION_SAMPLES = {
  classicFunction:
    'function divide(a: number, b: number): number {\n  return a / b;\n}',
  arrowFunction: 'const unusedFunction = () => {\n  console.log("test");\n};',
  arrowFunctionWithParams:
    'const multiply = (a: number, b: number): number => {\n  return a * b;\n};',
  exportedFunction:
    'export function add(a: number, b: number): number {\n  return a + b;\n}',
  exportedArrowFunction:
    'export const ButtonSimplified = ({ text, onClick }: Props) => (\n  <button />\n);',
  asyncFunction:
    'async function fetchData() {\n  return await fetch("/api");\n}',
  functionInComment:
    '// function commentedFunction() {\n//   return true;\n// }',
  functionInString: 'const str = "function fakeFunction() { return true; }";',
  multipleFunctions:
    'function first() { return 1; }\n\nconst second = () => { return 2; }\n\nfunction third() { return 3; }',
  functionWithUnderscore: 'function _privateFunction() {\n  return true;\n}',
  functionWithDollarSign: 'const $jqueryFunction = () => {\n  return true;\n};',
  deprecatedFunction:
    '/**\n * @deprecated Use newFunction instead\n */\nfunction oldFunction() {\n  return true;\n}',
  deprecatedArrowFunction:
    '// @deprecated\nconst legacyHandler = () => {\n  console.log("old");\n};',
};

export const CLASS_SAMPLES = {
  basicClass: 'class MyClass {\n  constructor() {}\n}',
  classWithExtends: 'class ChildClass extends ParentClass {\n}',
  classWithImplements: 'class MyClass implements IMyInterface {\n}',
  exportedClass: 'export class ExportedClass {\n}',
  defaultExportedClass: 'export default class DefaultClass {\n}',
  classInComment: '// class CommentedClass {\n/* class BlockCommentClass { */',
  classInString:
    'const str = "class FakeClass {}"\nconst template = `class AnotherFake {}`',
  abstractClass: 'abstract class AbstractClass {\n}',
  genericClass: 'class GenericClass<T> {\n}',
  classWithMultipleImplements: 'class MyClass implements IFirst, ISecond {\n}',
  reactComponentClass: 'class MyComponent extends React.Component {\n}',
  deprecatedClass:
    '/**\n * @deprecated Use NewClass instead\n */\nclass OldClass {\n}',
};

export const CONSTANT_SAMPLES = {
  constDeclaration: 'const myConstant = "test"',
  letDeclaration: 'let myVariable = 42',
  varDeclaration: 'var oldStyleVar = true',
  exportedConstant: 'export const EXPORTED_CONSTANT = 100',
  constInComment: '// const commentedConstant = "test"',
  destructured: 'const { name, age } = user',
  arrayDestructured: 'const [first, second] = array',
  constWithUnderscore: 'const _privateConstant = "private"',
  constWithDollarSign: 'const $jqueryStyle = "value"',
  multipleConstants:
    'const first = 1\nconst second = 2\nlet third = 3\nvar fourth = 4',
  uppercaseConstant: 'const MAX_SIZE = 100',
  deprecatedConstant:
    "/**\n * @deprecated Use NEW_CONSTANT instead\n */\nconst OLD_CONSTANT = 'value'",
};

export const PROP_SAMPLES = {
  propInType: 'type User = {\n  name: string;\n  age: number;\n}',
  propInInterface: 'interface IUser {\n  name: string;\n  email: string;\n}',
  multipleProp:
    'type Config = {\n  host: string;\n  port: number;\n  ssl: boolean;\n}',
  objectLiteral: 'const config = {\n  key: "value",\n  timeout: 3000\n}',
  inlineProperty: 'const user = { name: "John", age: 30 }',
  typedConstant: 'const API_URL: string = "https://api.example.com"',
  deprecatedProp: '// @deprecated\nconst oldValue: string = "legacy"',
};

export const DEFINITION_SAMPLES = {
  typeDeclaration: 'type MyType = string | number',
  interfaceDeclaration: 'interface IUser {\n  name: string;\n}',
  exportedType: 'export type Status = "active" | "inactive"',
  exportedInterface: 'export interface IConfig {\n  debug: boolean;\n}',
  typeInComment: '// type CommentedType = never',
  genericType: 'type Result<T> = { data: T; error?: string }',
  genericInterface: 'interface IResponse<T> {\n  data: T;\n}',
  interfaceWithExtends:
    'interface IChild extends IParent {\n  extra: string;\n}',
  typeWithUnion: 'type Status = "pending" | "success" | "error"',
  typeWithIntersection: 'type Combined = TypeA & TypeB',
  conditionalType: 'type IsString<T> = T extends string ? true : false',
  mappedType: 'type Readonly<T> = { readonly [P in keyof T]: T[P] }',
  deprecatedType:
    '/**\n * @deprecated Use NewType instead\n */\ntype OldType = string',
};

export const EXPORT_SAMPLES = {
  namedExport: 'export { myFunction }',
  multipleNamedExports: 'export { fn1, fn2, fn3 }',
  exportDefault: 'export default MyComponent',
  exportFunction: 'export function calculate() {}',
  exportConst: 'export const API_KEY = "secret"',
  exportClass: 'export class Service {}',
  exportArrowFunction: 'export const handler = () => {}',
  exportWithAlias: 'export { myFunction as myFunc }',
  exportInComment: '// export const commented = true',
  exportAsyncFunction: 'export async function fetchData() {}',
  exportReactComponent: 'export const Button = () => <button />',
  exportWithTypeAnnotation: 'export const value: number = 42',
  exportDefaultClass: 'export default class MyClass {}',
  exportDefaultFunction: 'export default function main() {}',
  exportDestructuring: 'export const { a, b } = obj',
  deprecatedExport: '// @deprecated\nexport const OLD_API = "legacy"',
};

export const CONSOLE_SAMPLES = {
  consoleLog: 'console.log("Hello")',
  consoleWarn: 'console.warn("Warning")',
  consoleError: 'console.error("Error")',
  consoleDebug: 'console.debug("Debug")',
  consoleInfo: 'console.info("Info")',
  consoleInComment: '// console.log("commented")',
  consoleInString: 'const str = "console.log(value)"',
  multipleConsoleCalls:
    'console.log("First")\nconsole.error("Second")\nconsole.warn("Third")',
  consoleWithComplexArgs:
    'console.log("User:", user, "logged in at", new Date())',
  consoleInConditional: 'if (debug) {\n  console.log("Debug mode");\n}',
  consoleInTryCatch: 'try {\n  // code\n} catch (e) {\n  console.error(e);\n}',
  consoleInArrowFunction: 'const log = () => console.log("test")',
  consoleWithMethodChaining: 'console.log("Result:", getData().filter(x => x))',
};

export const DEPENDENCY_SAMPLES = {
  simpleDependencies:
    '{\n  "dependencies": {\n    "react": "^18.0.0",\n    "axios": "^1.0.0"\n  }\n}',
  devDependencies:
    '{\n  "devDependencies": {\n    "typescript": "^5.0.0",\n    "vitest": "^1.0.0"\n  }\n}',
  bothDependencies:
    '{\n  "dependencies": {\n    "express": "^4.18.0"\n  },\n  "devDependencies": {\n    "nodemon": "^3.0.0"\n  }\n}',
  noDependencies: '{\n  "name": "my-package",\n  "version": "1.0.0"\n}',
  scopedPackages:
    '{\n  "dependencies": {\n    "@types/node": "^20.0.0",\n    "@angular/core": "^17.0.0"\n  }\n}',
  invalidJson: '{\n  "dependencies": {\n    "react": "^18.0.0",\n  }\n}',
  manyDependencies:
    '{\n  "dependencies": {\n    "dep1": "1.0.0",\n    "dep2": "2.0.0",\n    "dep3": "3.0.0",\n    "dep4": "4.0.0",\n    "dep5": "5.0.0"\n  }\n}',
};

export const DEPRECATED_SAMPLES = {
  deprecatedFunction:
    '/**\n * @deprecated Use newFunction instead\n */\nfunction oldFunction() {}',
  deprecatedArrowFunction: '// @deprecated\nconst legacyHandler = () => {}',
  deprecatedClass:
    '/**\n * @deprecated Use NewClass instead\n */\nclass OldClass {}',
  deprecatedConstant: '// @deprecated\nconst OLD_VALUE = 42',
  deprecatedInterface:
    '/**\n * @deprecated Use INewInterface\n */\ninterface IOldInterface {}',
  deprecatedType: '// @deprecated\ntype OldType = string',
  deprecatedProp:
    'interface IUser {\n  /** @deprecated */\n  oldField: string;\n}',
  nonDeprecated: '/**\n * A normal function\n */\nfunction normalFunction() {}',
  multipleDeprecated:
    '// @deprecated\nconst old1 = 1\n\n/**\n * @deprecated\n */\nfunction old2() {}',
  deprecatedExport: '/**\n * @deprecated\n */\nexport const OLD_API = "v1"',
};

export const VERIFICATION_SAMPLES = {
  functionCalled: 'function myFunction() {}\nconst result = myFunction();',
  functionAsCallback:
    'function handleClick() {}\nelement.addEventListener("click", handleClick);',
  functionInComment: 'function myFunction() {}\n// TODO: call myFunction here',
  functionInString:
    'function myFunction() {}\nconst message = "myFunction is a function";',
  functionInJSX:
    'function handleSubmit() {}\n<button onClick={handleSubmit}>Submit</button>',

  classInstantiated: 'class MyClass {}\nconst instance = new MyClass();',
  classExtended: 'class BaseClass {}\nclass ChildClass extends BaseClass {}',
  classInInstanceof: 'class MyClass {}\nif (obj instanceof MyClass) {}',
  classAsType: 'class MyClass {}\nconst handler = (obj: MyClass) => {}',

  constantReferenced: 'const API_URL = "https://api.com";\nfetch(API_URL);',
  constantInExpression: 'const MAX_COUNT = 100;\nif (count > MAX_COUNT) {}',
  constantInTemplateInterpolation:
    'const USERNAME = "john";\nconst message = `Hello ${USERNAME}`;',
  constantInSpread:
    'const BASE_PROPS = { x: 1 };\nconst props = { ...BASE_PROPS, y: 2 };',

  typeUsedInAnnotation:
    'type User = { name: string };\nconst user: User = { name: "John" };',
  interfaceImplemented:
    'interface IService {}\nclass Service implements IService {}',
  typeInGeneric:
    'type Result = { data: any };\nconst results: Array<Result> = [];',
  typeInUnion: 'type Status = "ok";\ntype Response = Status | "error";',

  exportImported: 'import { myFunction } from "./utils"',
  exportWithMultipleImports: 'import { fn1, fn2, myExport } from "./lib"',
  exportReExported: 'export { myFunction } from "./utils"',

  dependencyImported: 'import React from "react"',
  dependencyRequired: 'const express = require("express")',
  dependencyScopedImport: 'import type { Server } from "@types/node"',
  dependencySubmodule: 'import { readFile } from "fs/promises"',
};
