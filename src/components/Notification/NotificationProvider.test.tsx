import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { NotificationProvider } from './NotificationProvider';
import { notificationService } from '../../services/notification/notificationService';

// Мок CSS modules
vi.mock('./NotificationContainer.module.css', () => ({
  default: {
    container: 'container',
    notification: 'notification',
    success: 'success',
    error: 'error',
    info: 'info',
    message: 'message',
    closeButton: 'closeButton',
  },
}));

describe('NotificationProvider', () => {
  beforeEach(() => {
    // Очищаем уведомления перед каждым тестом
    const listener = vi.fn();
    const unsubscribe = notificationService.subscribe(listener);
    const existingNotifications = listener.mock.calls[0][0];
    existingNotifications.forEach((n: { id: string }) => {
      notificationService.dismiss(n.id);
    });
    unsubscribe();
  });

  it('renders children', () => {
    render(
      <NotificationProvider>
        <div>Test Content</div>
      </NotificationProvider>,
    );
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('shows success notification', async () => {
    render(
      <NotificationProvider>
        <div>Content</div>
      </NotificationProvider>,
    );

    await act(async () => {
      notificationService.success('Успешно!');
    });

    expect(screen.getByText('Успешно!')).toBeInTheDocument();
  });

  it('shows error notification', async () => {
    render(
      <NotificationProvider>
        <div>Content</div>
      </NotificationProvider>,
    );

    await act(async () => {
      notificationService.error('Ошибка!');
    });

    expect(screen.getByText('Ошибка!')).toBeInTheDocument();
  });

  it('shows info notification', async () => {
    render(
      <NotificationProvider>
        <div>Content</div>
      </NotificationProvider>,
    );

    await act(async () => {
      notificationService.info('Информация');
    });

    expect(screen.getByText('Информация')).toBeInTheDocument();
  });

  it('dismisses notification on close button click', async () => {
    render(
      <NotificationProvider>
        <div>Content</div>
      </NotificationProvider>,
    );

    await act(async () => {
      notificationService.success('Тест');
    });

    expect(screen.getByText('Тест')).toBeInTheDocument();

    await act(async () => {
      const closeButton = screen.getByRole('button', { name: /закрыть уведомление/i });
      closeButton.click();
    });

    expect(screen.queryByText('Тест')).not.toBeInTheDocument();
  });

  it('renders multiple notifications', async () => {
    render(
      <NotificationProvider>
        <div>Content</div>
      </NotificationProvider>,
    );

    await act(async () => {
      notificationService.success('Первое');
      notificationService.error('Второе');
    });

    expect(screen.getByText('Первое')).toBeInTheDocument();
    expect(screen.getByText('Второе')).toBeInTheDocument();
  });

    it('has aria-live attribute for accessibility', () => {
    render(
      <NotificationProvider>
        <div>Content</div>
      </NotificationProvider>,
    );

    // Используем querySelector вместо getByRole, т.к. aria-live не всегда даёт role="status"
    const container = document.querySelector('[aria-live="polite"]');
    expect(container).toBeInTheDocument();
    expect(container).toHaveAttribute('aria-live', 'polite');
  });
});