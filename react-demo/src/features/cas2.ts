import { subtract } from './cas1';

const helloWorld = 'hello world';

function Add2Numbers(a: number, b: number): number {
  return a + b;
}

// Fonction exportée et utilisée dans un console.log
const Multiply2Numbers = (a: number, b: number): number => {
  return a * b;
};

// Fonction exportée mais non utilisée (code mort)
export function Subtract2Numbers(a: number, b: number): number {
  return subtract(a, b);
}

// Fonction non exportée et non utilisée (code mort)
function Divide2Numbers(a: number, b: number): number {
  return a / b;
}

// Classe non exportée et non utilisée (code mort)
class UnusedClass {
  doSomething(): void {
    console.error('This class is never used!');
  }
}

// Classe exportée mais non utilisée (code mort)
export class UnusedExportedClass {
  doSomething(): void {
    console.log('This class is never used!');
  }
}

Add2Numbers(2, 3);
console.log(Multiply2Numbers(2, 3));
