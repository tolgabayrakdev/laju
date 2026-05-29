import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './index.css'
import { ThemeProvider } from './components/theme-provider.tsx'
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router'
import Welcome from './pages/welcome.tsx'
import SignIn from './pages/auth/sign-in.tsx'
import SignUp from './pages/auth/sign-up.tsx'
import ForgotPassword from './pages/auth/forgot-password.tsx'

const queryClient = new QueryClient()

const router = createBrowserRouter([
  { path: '/', element: <Navigate to="/sign-in" replace /> },
  { path: '/welcome', element: <Welcome /> },
  { path: '/sign-in', element: <SignIn /> },
  { path: '/sign-up', element: <SignUp /> },
  { path: '/forgot-password', element: <ForgotPassword /> },
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider storageKey="vite-ui-theme">
        <RouterProvider router={router} />
      </ThemeProvider>
    </QueryClientProvider>
  </StrictMode>,
)
