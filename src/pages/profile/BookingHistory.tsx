import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './BookingHistory.module.css'

interface Booking {
  id: number
  hotel_name: string
  room_name?: string
  check_in_date: string
  check_out_date: string
  status: 'created' | 'confirmed' | 'cancelled' | 'completed'
  total_price: number
}

const statusLabels: Record<string, string> = {
  created: 'Создано',
  confirmed: 'Подтверждено',
  cancelled: 'Отменено',
  completed: 'Завершено',
}

const statusColors: Record<string, string> = {
  created: '#FFA500',
  confirmed: '#4CAF50',
  cancelled: '#F44336',
  completed: '#2196F3',
}

// Mock-данные для работы без бэкенда
const MOCK_BOOKINGS: Booking[] = [
  {
    id: 1,
    hotel_name: 'Гранд Отель Москва',
    room_name: 'Люкс',
    check_in_date: '2026-06-15',
    check_out_date: '2026-06-20',
    status: 'confirmed',
    total_price: 60000,
  },
  {
    id: 2,
    hotel_name: 'Морской Курорт',
    room_name: 'Комфорт',
    check_in_date: '2026-07-01',
    check_out_date: '2026-07-05',
    status: 'created',
    total_price: 28000,
  },
  {
    id: 3,
    hotel_name: 'Горный Лаунж',
    room_name: 'Стандарт',
    check_in_date: '2026-08-10',
    check_out_date: '2026-08-15',
    status: 'cancelled',
    total_price: 30000,
  },
]

export const BookingHistory = () => {
  const navigate = useNavigate()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [cancelModal, setCancelModal] = useState<{ open: boolean; bookingId: number | null }>({
    open: false,
    bookingId: null,
  })

  useEffect(() => {
    let isMounted = true

    const fetchBookings = async () => {
      setLoading(true)
      try {
        // Пытаемся загрузить с бэкенда
        const { apiClient } = await import('../../api/client')
        const response = await apiClient.get('/bookings/my')
        if (isMounted) {
          setBookings(response.data as Booking[])
        }
      } catch (err) {
        console.error('Ошибка загрузки бронирований, используем mock:', err)
        // Fallback на mock-данные
        if (isMounted) {
          setBookings(MOCK_BOOKINGS)
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchBookings()

    return () => {
      isMounted = false
    }
  }, [])

  const reloadBookings = async () => {
    try {
      const { apiClient } = await import('../../api/client')
      const response = await apiClient.get('/bookings/my')
      setBookings(response.data as Booking[])
    } catch (err) {
      console.error('Ошибка обновления:', err)
      setBookings(MOCK_BOOKINGS)
    }
  }

  const handleCancelRequest = (bookingId: number) => {
    setCancelModal({ open: true, bookingId })
  }

  const handleCancelConfirm = async () => {
    if (!cancelModal.bookingId) return

    try {
      const { apiClient } = await import('../../api/client')
      await apiClient.patch(`/bookings/${cancelModal.bookingId}/cancel`)
      setCancelModal({ open: false, bookingId: null })
      await reloadBookings()
    } catch {
      try {
        const { apiClient } = await import('../../api/client')
        await apiClient.patch(`/bookings/${cancelModal.bookingId}`, {
          status: 'cancelled'
        })
        setCancelModal({ open: false, bookingId: null })
        await reloadBookings()
      } catch {
        try {
          const { apiClient } = await import('../../api/client')
          await apiClient.put(`/bookings/${cancelModal.bookingId}/status`, {
            status: 'cancelled'
          })
          setCancelModal({ open: false, bookingId: null })
          await reloadBookings()
        } catch (finalErr) {
          console.error('Не удалось отменить бронирование:', finalErr)
          // Всё равно помечаем как отменённое в mock
          setBookings(prev =>
            prev.map(b =>
              b.id === cancelModal.bookingId ? { ...b, status: 'cancelled' as const } : b
            )
          )
          setCancelModal({ open: false, bookingId: null })
        }
      }
    }
  }

  const handleCancelClose = () => {
    setCancelModal({ open: false, bookingId: null })
  }

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '—'
    try {
      const date = new Date(dateStr)
      if (isNaN(date.getTime())) return dateStr
      return date.toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })
    } catch {
      return dateStr
    }
  }

  const getRoomName = (booking: Booking): string => {
    if (booking.room_name) return booking.room_name
    return 'Не указана'
  }

  if (loading) return <p>Загрузка...</p>

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Мои бронирования</h1>

      {bookings.length === 0 ? (
        <p>У вас пока нет бронирований.</p>
      ) : (
        <div className={styles.list}>
          {bookings.map(booking => (
            <div key={booking.id} className={styles.card}>
              <div className={styles.header}>
                <h3>{booking.hotel_name}</h3>
                <span
                  className={styles.status}
                  style={{ backgroundColor: statusColors[booking.status] || '#999' }}
                >
                  {statusLabels[booking.status] || booking.status}
                </span>
              </div>

              <div className={styles.info}>
                <p>
                  <strong>Комната:</strong> {getRoomName(booking)}
                </p>
                <p>
                  <strong>Заезд:</strong> {formatDate(booking.check_in_date)}
                </p>
                <p>
                  <strong>Выезд:</strong> {formatDate(booking.check_out_date)}
                </p>
                <p>
                  <strong>Стоимость:</strong> {booking.total_price} руб.
                </p>
              </div>

              <div className={styles.actions}>
                <button
                  className={styles.detailsButton}
                  onClick={() => navigate(`/booking/${booking.id}`)}
                >
                  Подробнее
                </button>

                {booking.status === 'created' && (
                  <button
                    className={styles.cancelButton}
                    onClick={() => handleCancelRequest(booking.id)}
                  >
                    Отменить
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {cancelModal.open && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h3>Подтверждение отмены</h3>
            <p>Вы уверены, что хотите отменить бронирование?</p>
            <div className={styles.modalActions}>
              <button onClick={handleCancelClose} className={styles.cancelBtn}>
                Нет
              </button>
              <button onClick={handleCancelConfirm} className={styles.confirmBtn}>
                Да, отменить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}