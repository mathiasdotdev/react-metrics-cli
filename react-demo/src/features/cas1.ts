// Constante exportée et utilisée
export const helloWorld = 'hello world';

// Constante exportée et non utilisée
export const goodbye = 'goodbye';

// Constante non exportée mais utilisée
const salutation = 'bonjour';

// Constante non exportée et non utilisée
const toto = 16;

// Fonctions exportées et utilisées
export function add(a: number, b: number): number {
  return a + b;
}
export const multiply = (a: number, b: number): number => {
  return a * b;
};

// Fonction exportée mais utilisée dans un autre fichier
export function subtract(a: number, b: number): number {
  return a - b;
}

// Fonction non exportée et non utilisée (code mort)
function divide(a: number, b: number): number {
  return a / b;
}

// Classe non exportée et non utilisée (code mort)
class UnusedClass {
  doSomething(): void {
    console.log('This class is never used!');
  }
}

// Classe exportée mais non utilisée (code mort)
export class UnusedExportedClass {
  doSomething(): void {
    console.log('This class is never used!');
  }
}

// Code utilisé dans le projet
add(2, 3);
multiply(2, 3);
multiply(2, 7);
console.debug(multiply(2, 3));
const hey = salutation + ' ' + helloWorld;
console.log(hey);
console.info('test');
