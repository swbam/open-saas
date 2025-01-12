import React from 'react'
import { useQuery } from '@wasp/queries'
import { useAction } from '@wasp/actions'
import { useAuth } from '@wasp/auth'
import { getPaginatedUsers } from '@wasp/queries/getPaginatedUsers'
import { updateUserById } from '@wasp/actions/updateUserById'
import { Button } from '../client/components/ui/button'
import toast from 'react-hot-toast'

const SUBSCRIPTION_TIERS = {
  free: { name: 'Free', groups: 1, members: 8 },
  premium: { name: 'Premium', groups: 1, members: 24, price: 15 },
  pro: { name: 'Pro', groups: 5, members: 999, price: 30 },
  enterprise: { name: 'Enterprise', groups: 999, members: 999, price: 50 }
}

export default function AdminDashboardPage() {
  const { data: user } = useAuth()
  const { data: users, isLoading, error } = useQuery(getPaginatedUsers)
  const updateUserFn = useAction(updateUserById)

  if (!user?.isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
          <p className="mt-2 text-gray-600">You must be an admin to view this page.</p>
        </div>
      </div>
    )
  }

  if (isLoading) return <div className="p-4">Loading dashboard...</div>
  if (error) return <div className="p-4 text-red-500">Error: {error.message}</div>

  // Calculate statistics
  const stats = {
    totalUsers: users?.length || 0,
    activeSubscriptions: users?.filter(u => u.subscriptionStatus === 'active').length || 0,
    subscriptionsByTier: users?.reduce((acc: Record<string, number>, user) => {
      const plan = user.subscriptionPlan || 'free'
      acc[plan] = (acc[plan] || 0) + 1
      return acc
    }, {}),
    monthlyRevenue: users?.reduce((total: number, user) => {
      const plan = user.subscriptionPlan || 'free'
      return total + (SUBSCRIPTION_TIERS[plan]?.price || 0)
    }, 0)
  }

  const handleUpdateUser = async (userId: string, updates: any) => {
    try {
      await updateUserFn({ userId, ...updates })
      toast.success('User updated successfully!')
    } catch (error: any) {
      toast.error(error.message || 'Failed to update user')
    }
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="mb-8 text-2xl font-bold">Admin Dashboard</h1>

      {/* Quick Stats */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border p-4">
          <h3 className="text-sm font-medium text-gray-500">Total Users</h3>
          <p className="mt-1 text-2xl font-semibold">{stats.totalUsers}</p>
        </div>
        <div className="rounded-lg border p-4">
          <h3 className="text-sm font-medium text-gray-500">Active Subscriptions</h3>
          <p className="mt-1 text-2xl font-semibold">{stats.activeSubscriptions}</p>
        </div>
        <div className="rounded-lg border p-4">
          <h3 className="text-sm font-medium text-gray-500">Monthly Revenue</h3>
          <p className="mt-1 text-2xl font-semibold">${stats.monthlyRevenue}</p>
        </div>
        <div className="rounded-lg border p-4">
          <h3 className="text-sm font-medium text-gray-500">Avg. Revenue/User</h3>
          <p className="mt-1 text-2xl font-semibold">
            ${stats.totalUsers ? (stats.monthlyRevenue / stats.totalUsers).toFixed(2) : '0'}
          </p>
        </div>
      </div>

      {/* Subscription Distribution */}
      <div className="mb-8">
        <h2 className="mb-4 text-xl font-semibold">Subscription Distribution</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Object.entries(SUBSCRIPTION_TIERS).map(([tier, details]) => (
            <div key={tier} className="rounded-lg border p-4">
              <h3 className="font-medium">{details.name}</h3>
              <p className="mt-1 text-2xl font-semibold">
                {stats.subscriptionsByTier?.[tier] || 0}
              </p>
              <p className="mt-1 text-sm text-gray-500">
                {((stats.subscriptionsByTier?.[tier] || 0) / stats.totalUsers * 100).toFixed(1)}%
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* User Management */}
      <div>
        <h2 className="mb-4 text-xl font-semibold">User Management</h2>
        <div className="overflow-x-auto">
          <table className="w-full table-auto border-collapse">
            <thead>
              <tr className="border-b bg-gray-50 text-left text-sm font-medium text-gray-500">
                <th className="px-4 py-2">Email</th>
                <th className="px-4 py-2">Username</th>
                <th className="px-4 py-2">Plan</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Admin</th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {users?.map(user => (
                <tr key={user.id} className="text-sm">
                  <td className="px-4 py-2">{user.email}</td>
                  <td className="px-4 py-2">{user.username || '-'}</td>
                  <td className="px-4 py-2">
                    <select
                      value={user.subscriptionPlan || 'free'}
                      onChange={(e) => handleUpdateUser(user.id, { subscriptionPlan: e.target.value })}
                      className="rounded border px-2 py-1"
                    >
                      {Object.entries(SUBSCRIPTION_TIERS).map(([tier, details]) => (
                        <option key={tier} value={tier}>{details.name}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-2">
                    <select
                      value={user.subscriptionStatus || 'none'}
                      onChange={(e) => handleUpdateUser(user.id, { subscriptionStatus: e.target.value })}
                      className="rounded border px-2 py-1"
                    >
                      <option value="none">None</option>
                      <option value="active">Active</option>
                      <option value="past_due">Past Due</option>
                      <option value="canceled">Canceled</option>
                    </select>
                  </td>
                  <td className="px-4 py-2">
                    <input
                      type="checkbox"
                      checked={user.isAdmin}
                      onChange={(e) => handleUpdateUser(user.id, { isAdmin: e.target.checked })}
                      className="rounded border-gray-300"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const newUsername = prompt('Enter new username:', user.username || '')
                        if (newUsername !== null) {
                          handleUpdateUser(user.id, { username: newUsername.trim() || null })
                        }
                      }}
                    >
                      Edit
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}