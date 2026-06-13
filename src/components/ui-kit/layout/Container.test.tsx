import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Container } from './Container';

describe('Container', () => {
  it('renders children', () => {
    render(<Container>Test Content</Container>);
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('applies container class', () => {
    const { container } = render(<Container>Content</Container>);
    expect(container.firstChild).toHaveClass('container');
  });

  it('applies custom className', () => {
    const { container } = render(<Container className="custom">Content</Container>);
    expect(container.firstChild).toHaveClass('container', 'custom');
  });

  it('passes additional props', () => {
    render(<Container data-testid="container">Content</Container>);
    expect(screen.getByTestId('container')).toBeInTheDocument();
  });
});