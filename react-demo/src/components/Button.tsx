import React from 'react';
import { ButtonProps } from '../types/ButtonProps';

export const Button = ({
  text,
  onClick,
  disabled,
  className,
  children,
  test,
}: ButtonProps) => {
  const blabla = text || 'continuer';
  const blabla2 = 'test';
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`default-button ${className}`}>
      {blabla}
      {children}
    </button>
  );
};

// exportée, mais non utilisé
export const ButtonSimplified = ({ text, onClick, test }: ButtonProps) => (
  <button onClick={onClick}>{text}</button>
);

// ni exportée, ni utilisée
const unusedFunction = () => {
  console.warn('This function is never used');
};

// exportée, mais non utilisée
export const UnusedButton = ({ text }: ButtonProps) => {
  return <button>{text}</button>;
};
