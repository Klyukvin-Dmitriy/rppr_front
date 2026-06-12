import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PaymentModal } from './PaymentModal';

vi.mock('./HotelDetailPage.module.css', () => ({
  default: new Proxy({}, { get: (_t, prop) => String(prop) }),
}));

describe('PaymentModal', () => {
  const mockProps = {
    paymentData: {
      cardNumber: '1234 5678 9012 3456',
      expiryDate: '12/25',
      cvv: '123',
    },
    paymentError: null,
    paymentLoading: false,
    onClose: vi.fn(),
    onFieldChange: vi.fn(),
    onConfirm: vi.fn(),
  };

  it('renders payment modal', () => {
    render(<PaymentModal {...mockProps} />);
    expect(screen.getByText(/введите номер карты/i)).toBeInTheDocument();
  });

  it('renders card number input', () => {
    render(<PaymentModal {...mockProps} />);
    expect(screen.getByLabelText(/номер карты/i)).toBeInTheDocument();
  });

  it('renders expiry date input', () => {
    render(<PaymentModal {...mockProps} />);
    expect(screen.getByLabelText(/срок действия/i)).toBeInTheDocument();
  });

  it('renders CVV input', () => {
    render(<PaymentModal {...mockProps} />);
    expect(screen.getByLabelText(/cvv/i)).toBeInTheDocument();
  });

  it('calls onFieldChange when input changes', () => {
    render(<PaymentModal {...mockProps} />);
    const cardInput = screen.getByLabelText(/номер карты/i);
    fireEvent.change(cardInput, { target: { value: '1111 2222 3333 4444', name: 'cardNumber' } });
    expect(mockProps.onFieldChange).toHaveBeenCalled();
  });

  it('calls onConfirm when confirm button is clicked', () => {
    render(<PaymentModal {...mockProps} />);
    const buttons = screen.getAllByRole('button');
    const confirmButton = buttons.find(b => b.textContent !== '×');
    if (confirmButton) fireEvent.click(confirmButton);
    expect(mockProps.onConfirm).toHaveBeenCalled();
  });

  it('calls onClose when close button is clicked', () => {
    render(<PaymentModal {...mockProps} />);
    const closeButton = screen.getByRole('button', { name: '×' });
    fireEvent.click(closeButton);
    expect(mockProps.onClose).toHaveBeenCalled();
  });

  it('shows error message when paymentError is provided', () => {
    render(<PaymentModal {...mockProps} paymentError="Ошибка оплаты" />);
    expect(screen.getByText('Ошибка оплаты')).toBeInTheDocument();
  });

  it('disables confirm button when loading', () => {
    render(<PaymentModal {...mockProps} paymentLoading={true} />);
    const buttons = screen.getAllByRole('button');
    const confirmButton = buttons.find(b => b.textContent !== '×');
    if (confirmButton) expect(confirmButton).toBeDisabled();
  });

  it('disables close button when loading', () => {
    render(<PaymentModal {...mockProps} paymentLoading={true} />);
    const closeButton = screen.getByRole('button', { name: '×' });
    expect(closeButton).toBeDisabled();
  });
});