import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RecommendedRooms } from './RecommendedRooms';

vi.mock('./HotelDetailPage.module.css', () => ({
  default: new Proxy({}, { get: (_t, prop) => String(prop) }),
}));

vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
}));

describe('RecommendedRooms', () => {
  const mockRecommendations = [
    { id: 1, name: 'Рекомендуемый 1', price_per_night: 6000 },
    { id: 2, name: 'Рекомендуемый 2', price_per_night: 8000 },
  ];

  it('renders recommendations section title', () => {
    render(<RecommendedRooms recommendations={mockRecommendations as never} />);
    expect(screen.getByText(/рекомендации на основе/i)).toBeInTheDocument();
  });

  it('renders all recommended rooms', () => {
    render(<RecommendedRooms recommendations={mockRecommendations as never} />);
    expect(screen.getByText('Рекомендуемый 1')).toBeInTheDocument();
    expect(screen.getByText('Рекомендуемый 2')).toBeInTheDocument();
  });

  it('renders room prices', () => {
    render(<RecommendedRooms recommendations={mockRecommendations as never} />);
    expect(screen.getByText(/6000/)).toBeInTheDocument();
    expect(screen.getByText(/8000/)).toBeInTheDocument();
  });

  it('renders section even with empty recommendations', () => {
    render(<RecommendedRooms recommendations={[]} />);
    expect(screen.getByText(/рекомендации на основе/i)).toBeInTheDocument();
  });
});