import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import Button from '../Button';

describe('Button Atomic UI (Diamond Snapshot)', () => {
  it('Primary variant snapshotu ile eşleşmeli', () => {
    const { asFragment } = render(<Button variant="primary">Primary Button</Button>);
    expect(asFragment()).toMatchSnapshot();
  });

  it('Secondary variant snapshotu ile eşleşmeli', () => {
    const { asFragment } = render(<Button variant="secondary">Secondary Button</Button>);
    expect(asFragment()).toMatchSnapshot();
  });

  it('Ghost variant snapshotu ile eşleşmeli', () => {
    const { asFragment } = render(<Button variant="ghost">Ghost Button</Button>);
    expect(asFragment()).toMatchSnapshot();
  });

  it('Circle mode snapshotu ile eşleşmeli', () => {
    const { asFragment } = render(<Button mode="circle" className="w-10 h-10">X</Button>);
    expect(asFragment()).toMatchSnapshot();
  });

  it('Loading state snapshotu ile eşleşmeli', () => {
    const { asFragment } = render(<Button loading>Loading</Button>);
    expect(asFragment()).toMatchSnapshot();
  });

  it('Disabled state snapshotu ile eşleşmeli', () => {
    const { asFragment } = render(<Button disabled>Disabled</Button>);
    expect(asFragment()).toMatchSnapshot();
  });
});
