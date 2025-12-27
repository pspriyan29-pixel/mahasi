import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

describe('Example Test Suite', () => {
  it('should render a basic component', () => {
    render(<div>Hello World</div>);
    expect(screen.getByText('Hello World')).toBeInTheDocument();
  });
});

