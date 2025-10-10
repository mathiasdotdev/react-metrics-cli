// Advanced props patterns test file

import React from 'react';

interface ButtonProps {
  text: string;
  onClick: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary';
  size?: 'small' | 'medium' | 'large';
}

// 1. Basic destructuring (existing pattern)
export const BasicButton = ({ text, onClick }: ButtonProps) => (
  <button onClick={onClick}>{text}</button>
);

// 2. Destructuring with renaming
export const RenamedButton = ({
  text: buttonText,
  onClick: handleClick,
}: ButtonProps) => <button onClick={handleClick}>{buttonText}</button>;

// 3. Props with default values
export const DefaultButton = ({
  text,
  onClick,
  disabled = false,
  variant = 'primary',
}: ButtonProps) => (
  <button onClick={onClick} disabled={disabled} className={variant}>
    {text}
  </button>
);

// 4. Spread props
export const SpreadButton = ({
  text,
  onClick,
  ...restProps
}: ButtonProps & React.HTMLAttributes<HTMLButtonElement>) => (
  <button onClick={onClick} {...restProps}>
    {text}
  </button>
);

// 5. Complex destructuring with mix of patterns
export const ComplexButton = ({
  text: label = 'Click me',
  onClick: handler,
  disabled = false,
  variant = 'primary',
  size = 'medium',
  ...otherProps
}: ButtonProps & React.HTMLAttributes<HTMLButtonElement>) => (
  <button
    onClick={handler}
    disabled={disabled}
    className={`btn-${variant} btn-${size}`}
    {...otherProps}>
    {label}
  </button>
);

// 6. Multi-line destructuring
export const MultiLineButton = ({
  text,
  onClick,
  disabled,
  variant,
  size,
}: ButtonProps) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${variant} ${size}`}>
      {text}
    </button>
  );
};

// 7. Function component with props parameter
function FunctionButton(props: ButtonProps) {
  const { text, onClick, disabled } = props;
  return (
    <button onClick={onClick} disabled={disabled}>
      {text}
    </button>
  );
}

// 8. HOC pattern (should not be detected as props)
export const withAuth = (Component: React.ComponentType) => {
  return (props: any) => <Component {...props} />;
};

export const AuthenticatedButton = withAuth(BasicButton);

// 9. React.memo usage
export const MemoizedButton = React.memo(({ text, onClick }: ButtonProps) => (
  <button onClick={onClick}>{text}</button>
));

// 10. forwardRef pattern
export const ForwardRefButton = React.forwardRef<
  HTMLButtonElement,
  ButtonProps
>(({ text, onClick, ...props }, ref) => (
  <button ref={ref} onClick={onClick} {...props}>
    {text}
  </button>
));

// Expected props to be detected:
// - text, onClick (BasicButton)
// - text, onClick (RenamedButton) - original names before renaming
// - text, onClick, disabled, variant (DefaultButton)
// - text, onClick (SpreadButton) - restProps is not a prop
// - text, onClick, disabled, variant, size (ComplexButton) - original names
// - text, onClick, disabled, variant, size (MultiLineButton)
// - text, onClick, disabled (FunctionButton destructuring)
// - text, onClick (MemoizedButton)
// - text, onClick (ForwardRefButton)

export { FunctionButton };
