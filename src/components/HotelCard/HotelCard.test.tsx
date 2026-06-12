import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import HotelCard from './HotelCard';

// Мок react-router-dom
const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

// Мок CSS modules
vi.mock('./HotelCard.module.css', () => ({
  default: {
    card: 'card',
    image: 'image',
    content: 'content',
    title: 'title',
    room: 'room',
    price: 'price',
    description: 'description',
    footer: 'footer',
  },
}));

describe('HotelCard Component', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  const mockHotel = {
    id: 1,
    name: 'Гранд Отель',
    location: 'Москва',
    description: 'Роскошный отель',
    image_url: 'https://example.com/hotel.jpg',
    rooms: [
      { id: 1, name: 'Стандарт', price_per_night: '5000' },
      { id: 2, name: 'Люкс', price_per_night: '12000' },
    ],
  };

  it('renders hotel name', () => {
    render(<HotelCard hotel={mockHotel} />);
    expect(screen.getByText('Гранд Отель')).toBeInTheDocument();
  });

  it('renders hotel location', () => {
    render(<HotelCard hotel={mockHotel} />);
    expect(screen.getByText('Москва')).toBeInTheDocument();
  });

  it('renders hotel image', () => {
    render(<HotelCard hotel={mockHotel} />);
    const img = screen.getByAltText('Гранд Отель');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', 'https://example.com/hotel.jpg');
  });

  it('renders first room name', () => {
    render(<HotelCard hotel={mockHotel} />);
    expect(screen.getByText(/Стандарт/)).toBeInTheDocument();
  });

  it('renders minimum price', () => {
    render(<HotelCard hotel={mockHotel} />);
    expect(screen.getByText(/5000/)).toBeInTheDocument();
  });

  it('navigates to hotel detail on click', () => {
    render(<HotelCard hotel={mockHotel} />);
    const card = screen.getByText('Гранд Отель').closest('[class*="card"]');
    fireEvent.click(card!);
    expect(mockNavigate).toHaveBeenCalledWith('/hotel/1');
  });

  it('handles hotel without rooms', () => {
    const hotelWithoutRooms = { ...mockHotel, rooms: undefined };
    render(<HotelCard hotel={hotelWithoutRooms} />);
    expect(screen.getByText('Гранд Отель')).toBeInTheDocument();
    expect(screen.queryByText(/Комната/)).not.toBeInTheDocument();
  });

  it('handles hotel with empty rooms array', () => {
    const hotelWithEmptyRooms = { ...mockHotel, rooms: [] };
    render(<HotelCard hotel={hotelWithEmptyRooms} />);
    expect(screen.getByText('Гранд Отель')).toBeInTheDocument();
  });

  it('calculates minimum price correctly', () => {
    const hotelWithExpensiveRooms = {
      ...mockHotel,
      rooms: [
        { id: 1, name: 'Люкс', price_per_night: '15000' },
        { id: 2, name: 'Стандарт', price_per_night: '3000' },
        { id: 3, name: 'Комфорт', price_per_night: '7000' },
      ],
    };
    render(<HotelCard hotel={hotelWithExpensiveRooms} />);
    expect(screen.getByText(/3000/)).toBeInTheDocument();
  });

  it('shows fallback image on error', () => {
    render(<HotelCard hotel={mockHotel} />);
    const img = screen.getByAltText('Гранд Отель') as HTMLImageElement;
    fireEvent.error(img);
    expect(img.src).toContain('source.unsplash.com');
  });
});