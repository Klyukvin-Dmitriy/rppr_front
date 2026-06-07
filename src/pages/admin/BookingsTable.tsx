import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getAllHotels } from '../../api/hotels'
import styles from './BookingsTable.module.css'

interface Hotel {
  id: number
  name: string
  location: string
  description: string
  image_url: string
}

// Mock-бронирования для демонстрации
const MOCK_BOOKINGS = [
  {
    id: 1,
    user_login: 'user@example.com',
    hotel_name: 'Гранд Отель Москва',
    date_from: '2026-06-15',
    date_to: '2026-06-20',
    status: 'confirmed',
    total_price: 60000,
  },
  {
    id: 2,
    user_login: 'user2@example.com',
    hotel_name: 'Морской Курорт',
    date_from: '2026-07-01',
    date_to: '2026-07-05',
    status: 'created',
    total_price: 28000,
  },
  {
    id: 3,
    user_login: 'user3@example.com',
    hotel_name: 'Горный Лаунж',
    date_from: '2026-08-10',
    date_to: '2026-08-15',
    status: 'cancelled',
    total_price: 30000,
  },
]

const statusLabels: Record<string, string> = {
  created: 'Ожидает',
  confirmed: 'Подтверждено',
  cancelled: 'Отменено',
  completed: 'Завершено',
}

export const BookingsTable = () => {
  const [bookings, setBookings] = useState(MOCK_BOOKINGS)
  const [hotels, setHotels] = useState<Hotel[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        // Загружаем отели
        const hotelsData = await getAllHotels()
        setHotels(hotelsData)
      } catch (err) {
        console.error('Ошибка загрузки:', err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const handleStatusChange = async (id: number, newStatus: string) => {
    try {
      const { apiClient } = await import('../../api/client')
      await apiClient.put(`/admin/bookings/${id}/status`, { status: newStatus })
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status: newStatus } : b))
    } catch {
      // Обновляем локально
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status: newStatus } : b))
    }
  }

  if (loading) return <div className={styles.loading}>Загрузка...</div>

  const total = bookings.length
  const confirmed = bookings.filter(b => b.status === 'confirmed').length
  const cancelled = bookings.filter(b => b.status === 'cancelled').length
  const revenue = bookings
    .filter(b => b.status === 'confirmed')
    .reduce((sum, b) => sum + b.total_price, 0)

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '—'
    try {
      return new Date(dateStr).toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })
    } catch {
      return dateStr
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Панель управляющего</h1>
        <Link to="/admin/add-hotel" className={styles.addButton}>
          + Добавить отель
        </Link>
      </div>

      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Всего бронирований</div>
          <div className={styles.statValue}>{total}</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Подтвержденных</div>
          <div className={styles.statValue}>{confirmed}</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Отмененных</div>
          <div className={styles.statValue}>{cancelled}</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Выручка</div>
          <div className={styles.statValue}>{revenue.toLocaleString('ru-RU')} руб</div>
        </div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Список бронирований</h2>
        {bookings.length === 0 ? (
          <p className={styles.empty}>Бронирований пока нет.</p>
        ) : (
          <div className={styles.table}>
            <div className={styles.tableHeader}>
              <div>ID</div>
              <div>Пользователь</div>
              <div>Отель</div>
              <div>Заезд</div>
              <div>Выезд</div>
              <div>Цена</div>
              <div>Статус</div>
              <div>Действия</div>
            </div>
            {bookings.map(b => (
              <div key={b.id} className={styles.tableRow}>
                <div>#{b.id}</div>
                <div>{b.user_login}</div>
                <div>{b.hotel_name}</div>
                <div>{formatDate(b.date_from)}</div>
                <div>{formatDate(b.date_to)}</div>
                <div>{b.total_price.toLocaleString('ru-RU')} руб</div>
                <div>
                  <span className={`${styles.badge} ${styles[b.status]}`}>
                    {statusLabels[b.status] || b.status}
                  </span>
                </div>
                <div>
                  <select
                    className={styles.select}
                    value={b.status}
                    onChange={(e) => handleStatusChange(b.id, e.target.value)}
                  >
                    <option value="created">Ожидает</option>
                    <option value="confirmed">Подтверждено</option>
                    <option value="cancelled">Отменено</option>
                    <option value="completed">Завершено</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Управление отелями ({hotels.length})</h2>
        {hotels.length === 0 ? (
          <p className={styles.empty}>Отелей пока нет. Добавьте первый!</p>
        ) : (
          <div className={styles.hotelGrid}>
            {hotels.map(hotel => (
              <div key={hotel.id} className={styles.hotelCard}>
                <img 
                  src={hotel.image_url} 
                  alt={hotel.name}
                  className={styles.hotelImage}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.src = 'https://via.placeholder.com/400x300?text=No+Image'
                  }}
                />
                <div className={styles.hotelInfo}>
                  <h3 className={styles.hotelName}>{hotel.name}</h3>
                  <p className={styles.hotelLocation}>📍 {hotel.location}</p>
                  <p className={styles.hotelDescription}>{hotel.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}