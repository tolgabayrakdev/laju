import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './index.css'
import { ThemeProvider } from './components/theme-provider.tsx'
import { createBrowserRouter, RouterProvider } from 'react-router'
import SignIn from './pages/auth/sign-in.tsx'
import SignUp from './pages/auth/sign-up.tsx'
import ForgotPassword from './pages/auth/forgot-password.tsx'
import ResetPassword from './pages/auth/reset-password.tsx'
import AppLayout from './layouts/app-layout.tsx'
import AppIndex from './pages/app/app-index.tsx'
import Settings from './pages/app/settings.tsx'

const queryClient = new QueryClient()

const router = createBrowserRouter([
  { path: '/sign-in', element: <SignIn /> },
  { path: '/sign-up', element: <SignUp /> },
  { path: '/forgot-password', element: <ForgotPassword /> },
  { path: '/reset-password', element: <ResetPassword /> },
  {
    element: <AppLayout />,
    children: [
      { path: '/', element: <AppIndex /> },
      { path: '/settings', element: <Settings /> },
    ],
  },
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
