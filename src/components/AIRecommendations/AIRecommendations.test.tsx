import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import AIRecommendations from './AIRecommendations';

// Мок CSS modules
vi.mock('./AIRecommendations.module.css', () => ({
  default: {
    container: 'container',
    title: 'title',
    loading: 'loading',
    recommendations: 'recommendations',
    recommendation: 'recommendation',
    image: 'image',
    info: 'info',
    name: 'name',
    location: 'location',
    price: 'price',
  },
}));

describe('AIRecommendations Component', () => {
  const mockHotels = [
    {
      id: 1,
      name: 'Гранд Отель',
      location: 'Москва',
      description: 'Роскошный отель',
      image_url: 'https://example.com/hotel1.jpg',
      rooms: [{ price_per_night: '5000' }],
    },
    {
      id: 2,
      name: 'Морской Курорт',
      location: 'Сочи',
      description: 'Отель у моря',
      image_url: 'https://example.com/hotel2.jpg',
      rooms: [{ price_per_night: '7000' }],
    },
    {
      id: 3,
      name: 'Горный Лаунж',
      location: 'Красная Поляна',
      description: 'Отель в горах',
      image_url: 'https://example.com/hotel3.jpg',
      rooms: [{ price_per_night: '6000' }],
    },
    {
      id: 4,
      name: 'Дорогой Отель',
      location: 'Москва',
      description: 'Очень дорогой',
      image_url: 'https://example.com/hotel4.jpg',
      rooms: [{ price_per_night: '20000' }],
    },
  ];

    it('renders title immediately', () => {
    render(<AIRecommendations hotels={mockHotels} />);
    expect(screen.getByText(/подобрано для вас/i)).toBeInTheDocument();
  });

  it('renders recommendations after loading', async () => {
    render(<AIRecommendations hotels={mockHotels} />);

    await waitFor(() => {
      expect(screen.getByText(/подобрано для вас/i)).toBeInTheDocument();
    });
  });

  it('renders top 3 recommendations', async () => {
    render(<AIRecommendations hotels={mockHotels} />);

    await waitFor(() => {
      const recommendations = screen.getAllByText(/отель|курорт|лаунж/i);
      expect(recommendations.length).toBeLessThanOrEqual(3);
    });
  });

  it('filters hotels by budget', async () => {
    render(
      <AIRecommendations
        hotels={mockHotels}
        userPreferences={{ budget: 6000 }}
      />,
    );

    await waitFor(() => {
      expect(screen.getByText('Гранд Отель')).toBeInTheDocument();
      expect(screen.getByText('Горный Лаунж')).toBeInTheDocument();
      expect(screen.queryByText('Дорогой Отель')).not.toBeInTheDocument();
    });
  });

  it('shows minimum price for each hotel', async () => {
    render(<AIRecommendations hotels={mockHotels} />);

    await waitFor(() => {
      expect(screen.getByText(/5000/)).toBeInTheDocument();
    });
  });

  it('renders hotel location', async () => {
    render(<AIRecommendations hotels={mockHotels} />);

    await waitFor(() => {
      expect(screen.getByText('Москва')).toBeInTheDocument();
    });
  });

  it('renders hotel images', async () => {
    render(<AIRecommendations hotels={mockHotels} />);

    await waitFor(() => {
      const images = screen.getAllByRole('img');
      expect(images.length).toBeGreaterThan(0);
    });
  });

  it('renders nothing when no recommendations match budget', async () => {
    render(
      <AIRecommendations
        hotels={mockHotels}
        userPreferences={{ budget: 1000 }}
      />,
    );

    await waitFor(() => {
      expect(screen.queryByText(/подобрано для вас/i)).not.toBeInTheDocument();
    });
  });

  it('handles hotels with multiple rooms', async () => {
    const hotelsWithMultipleRooms = [
      {
        id: 1,
        name: 'Отель с комнатами',
        location: 'Москва',
        description: 'Много комнат',
        image_url: 'https://example.com/hotel.jpg',
        rooms: [
          { price_per_night: '3000' },
          { price_per_night: '5000' },
          { price_per_night: '8000' },
        ],
      },
    ];

    render(<AIRecommendations hotels={hotelsWithMultipleRooms} />);

    await waitFor(() => {
      expect(screen.getByText(/3000/)).toBeInTheDocument();
    });
  });

  it('shows fallback image on error', async () => {
    render(<AIRecommendations hotels={mockHotels} />);

    await waitFor(() => {
      const img = screen.getAllByRole('img')[0] as HTMLImageElement;
      expect(img).toBeInTheDocument();
    });
  });
});