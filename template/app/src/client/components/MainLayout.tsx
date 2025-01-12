import { Outlet } from 'react-router-dom'
import useAuth from '@wasp/auth/useAuth'
import { Link, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'

export default function MainLayout() {
  const { data: user } = useAuth()
  const { pathname } = useLocation()

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: 'dashboard' },
    { name: 'Groups', href: '/groups', icon: 'groups' },
    { name: 'Tee Times', href: '/tee-times', icon: 'calendar' },
    { name: 'Courses', href: '/courses', icon: 'golf_course' },
    { name: 'Profile', href: '/account', icon: 'person' }
  ]

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <div className="hidden border-r bg-muted/40 md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <Link to="/" className="flex items-center gap-2 font-semibold">
              <span className="text-xl">MGMT.golf</span>
            </Link>
          </div>
          <div className="flex-1">
            <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                    pathname === item.href ? "bg-muted text-primary" : undefined
                  )}
                >
                  <span className="text-lg">{item.name}</span>
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
          <div className="flex-1">
            <h1 className="text-lg font-semibold">
              {navigation.find((nav) => nav.href === pathname)?.name}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm">{user?.email}</span>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
