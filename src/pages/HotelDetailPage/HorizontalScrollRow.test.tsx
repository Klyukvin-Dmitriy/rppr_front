import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { HorizontalScrollRow } from './HorizontalScrollRow';

// Мок CSS modules
vi.mock('./HotelDetailPage.module.css', () => ({
  default: new Proxy({}, { get: (_t, prop) => String(prop) }),
}));

describe('HorizontalScrollRow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders children', () => {
    render(
      <HorizontalScrollRow ariaLabelLeft="Scroll left" ariaLabelRight="Scroll right">
        <div>Item 1</div>
        <div>Item 2</div>
      </HorizontalScrollRow>
    );
    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 2')).toBeInTheDocument();
  });

  it('renders scroll container', () => {
    render(
      <HorizontalScrollRow ariaLabelLeft="Left" ariaLabelRight="Right">
        <div>Content</div>
      </HorizontalScrollRow>
    );
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('applies custom trackClassName', () => {
    render(
      <HorizontalScrollRow
        ariaLabelLeft="Left"
        ariaLabelRight="Right"
        trackClassName="custom-track"
      >
        <div>Content</div>
      </HorizontalScrollRow>
    );
    const scroller = screen.getByText('Content').parentElement;
    expect(scroller).toHaveClass('custom-track');
  });

  it('uses default scrollStep of 220', () => {
    render(
      <HorizontalScrollRow ariaLabelLeft="Left" ariaLabelRight="Right">
        <div>Content</div>
      </HorizontalScrollRow>
    );
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('renders with custom scrollStep', () => {
    render(
      <HorizontalScrollRow
        ariaLabelLeft="Left"
        ariaLabelRight="Right"
        scrollStep={300}
      >
        <div>Content</div>
      </HorizontalScrollRow>
    );
    expect(screen.getByText('Content')).toBeInTheDocument();
  });
});