import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { addHotel } from '../../api/hotels'
import styles from './AddHotelForm.module.css'

export const AddHotelForm = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    description: '',
    image_url: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)
    
    try {
      await addHotel(formData)
      setSuccess(true)
      setTimeout(() => {
        navigate('/admin/bookings')
      }, 1500)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Ошибка при добавлении отеля'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Добавление нового отеля</h1>
      <form onSubmit={handleSubmit} className={styles.form}>
        {error && <div className={styles.error}>{error}</div>}
        {success && <div className={styles.success}>✓ Отель успешно добавлен!</div>}

        <div className={styles.group}>
          <label>Название отеля *</label>
          <input 
            name="name" 
            required 
            value={formData.name} 
            onChange={handleChange}
            placeholder="Например: Гранд Отель Москва"
          />
        </div>

        <div className={styles.group}>
          <label>Локация *</label>
          <input 
            name="location" 
            required 
            value={formData.location} 
            onChange={handleChange}
            placeholder="Например: Москва, Россия"
          />
        </div>

        <div className={styles.group}>
          <label>Описание</label>
          <textarea 
            name="description" 
            rows={4} 
            value={formData.description} 
            onChange={handleChange}
            placeholder="Опишите отель..."
          />
        </div>

        <div className={styles.group}>
          <label>URL изображения</label>
          <input 
            name="image_url" 
            value={formData.image_url} 
            onChange={handleChange} 
            placeholder="https://example.com/image.jpg"
          />
          <small className={styles.hint}>
            Оставьте пустым для использования изображения по умолчанию
          </small>
        </div>

        <div className={styles.actions}>
          <button 
            type="button" 
            className={styles.btnSecondary} 
            onClick={() => navigate(-1)}
            disabled={loading}
          >
            Отмена
          </button>
          <button 
            type="submit" 
            className={styles.btnPrimary} 
            disabled={loading}
          >
            {loading ? 'Добавление...' : 'Добавить отель'}
          </button>
        </div>
      </form>
    </div>
  )
}