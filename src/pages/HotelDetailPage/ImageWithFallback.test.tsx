import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ImageWithFallback } from './ImageWithFallback';

// Мок CSS modules
vi.mock('./HotelDetailPage.module.css', () => ({
  default: {
    fallbackImage: 'fallbackImage',
  },
}));

describe('ImageWithFallback', () => {
  it('renders image with correct src', () => {
    render(
      <ImageWithFallback 
        src="https://example.com/image.jpg" 
        alt="Test"
        className="test-class"
      />
    );
    const img = screen.getByAltText('Test');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', 'https://example.com/image.jpg');
  });

  it('shows placeholder when image fails to load', () => {
    render(
      <ImageWithFallback 
        src="https://example.com/broken.jpg" 
        alt="Test"
        className="test-class"
      />
    );
    const img = screen.getByAltText('Test');
    fireEvent.error(img);
    expect(img).toHaveAttribute('src', 'https://source.unsplash.com/400x300/?hotel');
  });

  it('applies custom className', () => {
    render(
      <ImageWithFallback 
        src="https://example.com/image.jpg" 
        alt="Test"
        className="custom-class"
      />
    );
    const img = screen.getByAltText('Test');
    expect(img).toHaveClass('custom-class');
  });

  it('renders with alt text', () => {
    render(
      <ImageWithFallback 
        src="https://example.com/image.jpg" 
        alt="Hotel Image"
        className="test-class"
      />
    );
    expect(screen.getByAltText('Hotel Image')).toBeInTheDocument();
  });

  it('keeps same className after error', () => {
    render(
      <ImageWithFallback 
        src="https://example.com/broken.jpg" 
        alt="Test"
        className="my-class"
      />
    );
    const img = screen.getByAltText('Test');
    fireEvent.error(img);
    expect(img).toHaveClass('my-class');
  });
});