import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { MainLayout } from './layouts/MainLayout'
import AuthPage from './pages/Auth/AuthPage'
import { AuthLayout } from './layouts/AuthLayout'
import HotelsPage from './pages/HotelsPage/HotelsPage'
import { BookingsTable } from './pages/admin/BookingsTable'
import { AddHotelForm } from './pages/admin/AddHotelForm'
import { AddRoomForm } from './pages/admin/AddRoomForm'
import { BookingHistory } from './pages/profile/BookingHistory'
import { BookingDetails } from './pages/BookingDetails'
import { useAuth } from './hooks/useAuth'

// Компонент для защиты маршрутов (inline)
function ProtectedRoute({ children, requireManager = false }: { 
  children: React.ReactNode
  requireManager?: boolean 
}) {
  const { isAuthenticated, user } = useAuth()
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  
  // ✅ ДОБАВЛЕНО: Проверка роли менеджера
  if (requireManager && !user?.is_manager) {
    return <Navigate to="/" replace />
  }
  
  return <>{children}</>
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route index element={<HotelsPage />} />
          
          {/* BOO-35: Интерфейс управляющего (ЗАЩИЩЕНО) */}
          <Route path="/admin/bookings" element={
            <ProtectedRoute requireManager>
              <BookingsTable />
            </ProtectedRoute>
          } />
          <Route path="/admin/add-hotel" element={
            <ProtectedRoute requireManager>
              <AddHotelForm />
            </ProtectedRoute>
          } />
          <Route path="/admin/hotels/:hotelId/add-room" element={
            <ProtectedRoute requireManager>
              <AddRoomForm />
            </ProtectedRoute>
          } />
          
          {/* BOO-34: Оформление бронирования и ЛК (ЗАЩИЩЕНО) */}
          <Route path="/profile/bookings" element={
            <ProtectedRoute>
              <BookingHistory />
            </ProtectedRoute>
          } />
          <Route path="/booking/:id" element={
            <ProtectedRoute>
              <BookingDetails />
            </ProtectedRoute>
          } />
        </Route>

        <Route element={<AuthLayout />}>
          <Route path="login" element={<AuthPage initialIsLogin={true} />} />
          <Route path="register" element={<AuthPage initialIsLogin={false} />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App