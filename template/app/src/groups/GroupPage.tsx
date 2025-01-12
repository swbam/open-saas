import React, { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@wasp/queries'
import { useAction } from '@wasp/actions'
import { getGroupById } from '@wasp/queries/getGroupById'
import { addGroupMember, updateGroupMember, removeGroupMember } from '@wasp/actions/groups'
import { Button } from '../client/components/ui/button'
import { useAuth } from '@wasp/auth'
import toast from 'react-hot-toast'

const SUBSCRIPTION_TIERS = {
  free: { name: 'Free', groups: 1, members: 8 },
  premium: { name: 'Premium', groups: 1, members: 24 },
  pro: { name: 'Pro', groups: 5, members: 999 },
  enterprise: { name: 'Enterprise', groups: 999, members: 999 }
}

type TabType = 'members' | 'courses' | 'tee-times'

export default function GroupPage() {
  const { groupId } = useParams<{ groupId: string }>()
  const { data: user } = useAuth()
  const { data: group, isLoading, error } = useQuery(getGroupById, { groupId })
  const addMemberFn = useAction(addGroupMember)
  const updateMemberFn = useAction(updateGroupMember)
  const removeMemberFn = useAction(removeGroupMember)

  const [activeTab, setActiveTab] = useState<TabType>('members')
  const [newMemberEmail, setNewMemberEmail] = useState('')
  const [isAddingMember, setIsAddingMember] = useState(false)

  if (isLoading) return <div className="p-4">Loading group details...</div>
  if (error) return <div className="p-4 text-red-500">Error: {error.message}</div>
  if (!group) return <div className="p-4">Group not found</div>

  const userMembership = group.members.find(m => m.user.id === user?.id)
  const isAdmin = userMembership?.role === 'admin'
  const userPlan = user?.subscriptionPlan || 'free'
  const tierLimits = SUBSCRIPTION_TIERS[userPlan]
  const canAddMembers = group.members.length < tierLimits.members

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMemberEmail.trim()) return

    try {
      setIsAddingMember(true)
      await addMemberFn({
        groupId,
        email: newMemberEmail.trim()
      })
      setNewMemberEmail('')
      toast.success('Member invited successfully!')
    } catch (error: any) {
      toast.error(error.message || 'Failed to invite member')
    } finally {
      setIsAddingMember(false)
    }
  }

  const handleUpdateMemberRole = async (userId: string, newRole: 'admin' | 'member') => {
    try {
      await updateMemberFn({
        groupId,
        userId,
        role: newRole
      })
      toast.success('Member role updated successfully!')
    } catch (error: any) {
      toast.error(error.message || 'Failed to update member role')
    }
  }

  const handleRemoveMember = async (userId: string) => {
    if (!confirm('Are you sure you want to remove this member?')) return

    try {
      await removeMemberFn({
        groupId,
        userId
      })
      toast.success('Member removed successfully!')
    } catch (error: any) {
      toast.error(error.message || 'Failed to remove member')
    }
  }

  return (
    <div className="container mx-auto p-4">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{group.name}</h1>
            {group.description && (
              <p className="mt-1 text-gray-600">{group.description}</p>
            )}
          </div>
          <Link to="/groups">
            <Button variant="outline">Back to Groups</Button>
          </Link>
        </div>
      </div>

      <div className="mb-6 border-b">
        <nav className="-mb-px flex space-x-8">
          {(['members', 'courses', 'tee-times'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`
                border-b-2 px-1 pb-4 text-sm font-medium
                ${activeTab === tab
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'}
              `}
            >
              {tab === 'members' && `Members (${group.members.length})`}
              {tab === 'courses' && `Courses (${group.courses.length})`}
              {tab === 'tee-times' && 'Tee Times'}
            </button>
          ))}
        </nav>
      </div>

      {activeTab === 'members' && (
        <div>
          {isAdmin && canAddMembers && (
            <form onSubmit={handleAddMember} className="mb-6">
              <div className="flex gap-2">
                <input
                  type="email"
                  value={newMemberEmail}
                  onChange={(e) => setNewMemberEmail(e.target.value)}
                  placeholder="Enter member's email"
                  className="flex-1 rounded-md border px-3 py-2 text-sm"
                  required
                />
                <Button type="submit" disabled={isAddingMember}>
                  {isAddingMember ? 'Inviting...' : 'Invite Member'}
                </Button>
              </div>
            </form>
          )}

          {!canAddMembers && isAdmin && (
            <div className="mb-6 rounded-lg bg-yellow-50 p-4 text-sm text-yellow-700">
              You've reached the member limit for your {tierLimits.name} plan.
              <Link to="/pricing" className="ml-2 font-medium text-yellow-700 underline">
                Upgrade to add more members
              </Link>
            </div>
          )}

          <div className="divide-y rounded-lg border">
            {group.members.map((member) => (
              <div key={member.id} className="flex items-center justify-between p-4">
                <div>
                  <div className="font-medium">{member.user.email}</div>
                  <div className="text-sm text-gray-500">
                    {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                  </div>
                </div>
                {isAdmin && member.user.id !== user?.id && (
                  <div className="flex items-center gap-2">
                    <select
                      value={member.role}
                      onChange={(e) => handleUpdateMemberRole(member.user.id, e.target.value as 'admin' | 'member')}
                      className="rounded-md border px-2 py-1 text-sm"
                    >
                      <option value="member">Member</option>
                      <option value="admin">Admin</option>
                    </select>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleRemoveMember(member.user.id)}
                    >
                      Remove
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'courses' && (
        <div>
          <div className="mb-4 flex justify-between">
            <h2 className="text-lg font-semibold">Group Courses</h2>
            {isAdmin && (
              <Link to={`/groups/${groupId}/courses/new`}>
                <Button>Add Course</Button>
              </Link>
            )}
          </div>
          
          {group.courses.length === 0 ? (
            <p className="text-center text-gray-500">No courses added yet.</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {group.courses.map((course) => (
                <Link
                  key={course.id}
                  to={`/courses/${course.id}`}
                  className="block rounded-lg border p-4 transition-shadow hover:shadow-md"
                >
                  <h3 className="mb-2 text-lg font-semibold">{course.name}</h3>
                  <p className="text-sm text-gray-600">{course.address}</p>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'tee-times' && (
        <div>
          <div className="mb-4 flex justify-between">
            <h2 className="text-lg font-semibold">Tee Times</h2>
            {group.courses.length > 0 && (
              <Link to={`/groups/${groupId}/tee-times/new`}>
                <Button>Schedule Tee Time</Button>
              </Link>
            )}
          </div>

          {group.courses.length === 0 ? (
            <p className="text-center text-gray-500">
              Add a course to start scheduling tee times.
            </p>
          ) : group.teeTimes.length === 0 ? (
            <p className="text-center text-gray-500">No tee times scheduled yet.</p>
          ) : (
            <div className="space-y-4">
              {group.teeTimes.map((teeTime) => (
                <Link
                  key={teeTime.id}
                  to={`/tee-times/${teeTime.id}`}
                  className="block rounded-lg border p-4 transition-shadow hover:shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">
                        {group.courses.find(c => c.id === teeTime.courseId)?.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {new Date(teeTime.dateTime).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-sm text-gray-500">
                      {JSON.parse(teeTime.confirmedPlayersJson).length} / {teeTime.playerLimit} players
                    </div>
                  </div>
                  {teeTime.notes && (
                    <p className="mt-2 text-sm text-gray-600">{teeTime.notes}</p>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}