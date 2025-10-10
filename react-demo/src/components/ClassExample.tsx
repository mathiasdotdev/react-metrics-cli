import React from 'react';

// exportée mais pas utilisée
export class ClassExample extends React.Component<{ message: string }> {
  render() {
    return <div>{this.props.message}</div>;
  }
}

// exportée et non utilisée
class UnusedClass {
  private value: string;

  constructor(value: string) {
    this.value = value;
  }

  getValue(): string {
    return this.value;
  }
}
