import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Grid } from './Grid';

describe('Grid', () => {
  it('renders children', () => {
    render(<Grid>Grid Content</Grid>);
    expect(screen.getByText('Grid Content')).toBeInTheDocument();
  });

  it('applies grid class', () => {
    const { container } = render(<Grid>Content</Grid>);
    expect(container.firstChild).toHaveClass('grid');
  });

  it('applies 3-cols class when cols is 3', () => {
    const { container } = render(<Grid cols={3}>Content</Grid>);
    expect(container.firstChild).toHaveClass('grid', 'grid--3-cols');
  });

  it('does not apply 3-cols class when cols is not 3', () => {
    const { container } = render(<Grid>Content</Grid>);
    expect(container.firstChild).not.toHaveClass('grid--3-cols');
  });

  it('applies custom className', () => {
    const { container } = render(<Grid className="custom">Content</Grid>);
    expect(container.firstChild).toHaveClass('grid', 'custom');
  });
});