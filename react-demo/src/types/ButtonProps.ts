import { ReactNode } from 'react';

export interface ButtonProps {
  text: string;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  children?: ReactNode;
  test?: string;
}
