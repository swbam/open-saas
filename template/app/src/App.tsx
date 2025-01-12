import { RouterProvider, createBrowserRouter } from 'react-router-dom'
import useAuth from '@wasp/auth/useAuth'
import MainLayout from './client/components/MainLayout'
import LandingPage from './landing-page/LandingPage'
import DashboardPage from './client/DashboardPage'
import GroupsPage from './groups/GroupsPage'
import TeeTimesPage from './tee-times/TeeTimesPage'
import CoursesPage from './courses/CoursesPage'
import AccountPage from './user/AccountPage'
import { AuthUser } from './shared/types'

export default function App() {
  const { data: user, isLoading, error } = useAuth()

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">
      Loading...
    </div>
  }

  if (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred'
    return <div className="flex justify-center items-center h-screen">
      Error loading user data: {errorMessage}
    </div>
  }

  const router = createBrowserRouter([
    {
      path: '/',
      element: <LandingPage />
    },
    {
      element: <MainLayout />,
      children: [
        {
          path: '/dashboard',
          element: <DashboardPage />
        },
        {
          path: '/groups',
          element: <GroupsPage />
        },
        {
          path: '/tee-times',
          element: <TeeTimesPage />
        },
        {
          path: '/courses',
          element: <CoursesPage />
        },
        {
          path: '/account',
          element: <AccountPage />
        }
      ]
    }
  ])

  return <RouterProvider router={router} />
}