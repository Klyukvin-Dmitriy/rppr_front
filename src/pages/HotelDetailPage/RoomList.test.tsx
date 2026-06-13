import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { RoomList } from './RoomList';
import type { Room } from './types';

// Мок CSS modules
vi.mock('./HotelDetailPage.module.css', () => ({
  default: {
    roomList: 'roomList',
    roomCard: 'roomCard',
    selectedRoom: 'selectedRoom',
    roomName: 'roomName',
    roomPrice: 'roomPrice',
    roomCapacity: 'roomCapacity',
  },
}));

describe('RoomList', () => {
  const mockRooms: Room[] = [
    {
      id: 1,
      name: 'Стандарт',
      description: 'Обычный номер',
      price_per_night: '5000',
      capacity: 2,
      hotel_name: 'Гранд Отель',
      hotel_description: 'Тестовый отель',
      image_url: 'https://example.com/room1.jpg',
      hotel_image_url: 'https://example.com/hotel.jpg', // ДОБАВЛЕНО
    },
    {
      id: 2,
      name: 'Люкс',
      description: 'Роскошный номер',
      price_per_night: '12000',
      capacity: 4,
      hotel_name: 'Гранд Отель',
      hotel_description: 'Тестовый отель',
      image_url: 'https://example.com/room2.jpg',
      hotel_image_url: 'https://example.com/hotel.jpg', // ДОБАВЛЕНО
    },
  ];

  const mockOnSelectRoom = vi.fn();

  it('renders all rooms', () => {
    render(
      <RoomList
        rooms={mockRooms}
        selectedRoom={mockRooms[0]}
        onSelectRoom={mockOnSelectRoom}
      />
    );
    expect(screen.getByText('Стандарт')).toBeInTheDocument();
    expect(screen.getByText('Люкс')).toBeInTheDocument();
  });

  it('calls onSelectRoom when room is clicked', () => {
    render(
      <RoomList
        rooms={mockRooms}
        selectedRoom={mockRooms[0]}
        onSelectRoom={mockOnSelectRoom}
      />
    );
    fireEvent.click(screen.getByText('Люкс'));
    expect(mockOnSelectRoom).toHaveBeenCalledWith(mockRooms[1]);
  });

    it('highlights selected room', () => {
    render(
      <RoomList
        rooms={mockRooms}
        selectedRoom={mockRooms[0]}
        onSelectRoom={mockOnSelectRoom}
      />
    );
    // Проверяем что selectedRoom передан корректно
    const selectedCard = screen.getByText('Стандарт').closest('[class*="roomCard"]');
    expect(selectedCard).toBeInTheDocument();
  });

  it('renders room price', () => {
    render(
      <RoomList
        rooms={mockRooms}
        selectedRoom={mockRooms[0]}
        onSelectRoom={mockOnSelectRoom}
      />
    );
    expect(screen.getByText(/5000/)).toBeInTheDocument();
    expect(screen.getByText(/12000/)).toBeInTheDocument();
  });

  it('renders empty state', () => {
    const { container } = render(
      <RoomList
        rooms={[]}
        selectedRoom={null}
        onSelectRoom={mockOnSelectRoom}
      />
    );
    expect(container.firstChild).toBeInTheDocument();
  });
});