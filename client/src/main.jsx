import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import {createBrowserRouter, RouterProvider} from 'react-router-dom'
import { AuthProvider } from './context/AuthContext.jsx'

import ProtectedRoute from './components/ProtectedRoute.jsx'

import './index.css'

// Routes
import App from './App.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import VerifyEmail from './pages/VerifyEmail.jsx'
import Dashboard from './pages/Dashboard.jsx'
import ForgotPassword from './pages/ForgotPassword.jsx'

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />
  },
  {
    path: '/login',
    element: <Login />
  },
  {
    path: '/register',
    element: <Register />
  },
  {
    path: '/verify-email',
    element: <VerifyEmail />
  },
  {
    path: '/forgot-password',
    element: <ForgotPassword />
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: '/dashboard',
        element: <Dashboard />
      }
    ]
  }
])

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </StrictMode>,
)
