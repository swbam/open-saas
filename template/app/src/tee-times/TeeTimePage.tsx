import React, { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery } from '@wasp/queries'
import { useAction } from '@wasp/actions'
import { getTeeTimeById } from '@wasp/queries/getTeeTimeById'
import { updateTeeTime, deleteTeeTime, joinTeeTime, leaveTeeTime } from '@wasp/actions/teeTime'
import { Button } from '../client/components/ui/button'
import { useAuth } from '@wasp/auth'
import toast from 'react-hot-toast'
import { getTeeTimeStatus, canJoinTeeTime, canLeaveTeeTime, TeeTimeWithDetails } from './types'

export default function TeeTimePage() {
  const { teeTimeId } = useParams<{ teeTimeId: string }>()
  const navigate = useNavigate()
  const { data: user } = useAuth()
  const { data: teeTime, isLoading, error } = useQuery(getTeeTimeById, { teeTimeId })
  
  const updateTeeTimeFn = useAction(updateTeeTime)
  const deleteTeeTimeFn = useAction(deleteTeeTime)
  const joinTeeTimeFn = useAction(joinTeeTime)
  const leaveTeeTimeFn = useAction(leaveTeeTime)

  const [isEditing, setIsEditing] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [dateTime, setDateTime] = useState('')
  const [playerLimit, setPlayerLimit] = useState(4)
  const [notes, setNotes] = useState('')

  // Initialize form when tee time data is loaded
  React.useEffect(() => {
    if (teeTime) {
      setDateTime(new Date(teeTime.dateTime).toISOString().slice(0, 16))
      setPlayerLimit(teeTime.playerLimit)
      setNotes(teeTime.notes || '')
    }
  }, [teeTime])

  if (isLoading) return <div className="p-4">Loading tee time details...</div>
  if (error) return <div className="p-4 text-red-500">Error: {error.message}</div>
  if (!teeTime) return <div className="p-4">Tee time not found</div>

  const isAdmin = teeTime.group.members.some(
    member => member.user.id === user?.id && member.role === 'admin'
  )

  const status = getTeeTimeStatus(teeTime)
  const confirmedPlayers = JSON.parse(teeTime.confirmedPlayersJson)
  const waitlistPlayers = JSON.parse(teeTime.waitlistPlayersJson)
  const isJoined = confirmedPlayers.includes(user?.id) || waitlistPlayers.includes(user?.id)
  const canJoin = !isJoined && canJoinTeeTime(teeTime, user?.id || '')
  const canLeave = isJoined && canLeaveTeeTime(teeTime, user?.id || '')

  const handleUpdateTeeTime = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!dateTime) return

    try {
      await updateTeeTimeFn({
        teeTimeId,
        dateTime,
        playerLimit,
        notes: notes.trim() || undefined
      })
      setIsEditing(false)
      toast.success('Tee time updated successfully!')
    } catch (error: any) {
      toast.error(error.message || 'Failed to update tee time')
    }
  }

  const handleDeleteTeeTime = async () => {
    if (!confirm('Are you sure you want to delete this tee time? This action cannot be undone.')) {
      return
    }

    try {
      setIsDeleting(true)
      await deleteTeeTimeFn({ teeTimeId })
      toast.success('Tee time deleted successfully!')
      navigate(`/groups/${teeTime.group.id}`)
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete tee time')
      setIsDeleting(false)
    }
  }

  const handleJoinTeeTime = async () => {
    try {
      await joinTeeTimeFn({ teeTimeId })
      toast.success('Successfully joined tee time!')
    } catch (error: any) {
      toast.error(error.message || 'Failed to join tee time')
    }
  }

  const handleLeaveTeeTime = async () => {
    if (!confirm('Are you sure you want to leave this tee time?')) {
      return
    }

    try {
      await leaveTeeTimeFn({ teeTimeId })
      toast.success('Successfully left tee time!')
    } catch (error: any) {
      toast.error(error.message || 'Failed to leave tee time')
    }
  }

  return (
    <div className="container mx-auto p-4">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <Link
              to={`/groups/${teeTime.group.id}`}
              className="mb-2 text-sm text-blue-500 hover:underline"
            >
              {teeTime.group.name}
            </Link>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">{teeTime.course.name}</h1>
              <span className={`rounded-full px-2 py-1 text-xs ${
                status === 'past' ? 'bg-gray-100 text-gray-600' :
                status === 'full' ? 'bg-red-100 text-red-600' :
                status === 'waitlist' ? 'bg-yellow-100 text-yellow-600' :
                'bg-green-100 text-green-600'
              }`}>
                {status === 'past' ? 'Past' :
                 status === 'full' ? 'Full' :
                 status === 'waitlist' ? 'Waitlist' :
                 'Open'}
              </span>
            </div>
          </div>

          {isAdmin && !isEditing && status !== 'past' && (
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsEditing(true)}>
                Edit Tee Time
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteTeeTime}
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete Tee Time'}
              </Button>
            </div>
          )}
        </div>

        {!isEditing ? (
          <div className="mt-4">
            <p className="text-lg">
              {new Date(teeTime.dateTime).toLocaleString()}
            </p>
            {teeTime.notes && (
              <p className="mt-2 text-gray-600">{teeTime.notes}</p>
            )}
          </div>
        ) : (
          <form onSubmit={handleUpdateTeeTime} className="mt-4 space-y-4">
            <div>
              <label className="block text-sm font-medium">
                Date and Time
                <input
                  type="datetime-local"
                  value={dateTime}
                  onChange={(e) => setDateTime(e.target.value)}
                  className="mt-1 block w-full rounded-md border px-3 py-2"
                  required
                />
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium">
                Player Limit
                <input
                  type="number"
                  value={playerLimit}
                  onChange={(e) => setPlayerLimit(parseInt(e.target.value))}
                  min={confirmedPlayers.length}
                  max={4}
                  className="mt-1 block w-full rounded-md border px-3 py-2"
                  required
                />
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium">
                Notes (Optional)
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="mt-1 block w-full rounded-md border px-3 py-2"
                  rows={3}
                />
              </label>
            </div>
            <div className="flex gap-2">
              <Button type="submit">Save Changes</Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsEditing(false)
                  setDateTime(new Date(teeTime.dateTime).toISOString().slice(0, 16))
                  setPlayerLimit(teeTime.playerLimit)
                  setNotes(teeTime.notes || '')
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        )}
      </div>

      {/* Player Management */}
      {status !== 'past' && (
        <div className="mb-6 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            {confirmedPlayers.length} of {teeTime.playerLimit} spots filled
            {waitlistPlayers.length > 0 && ` • ${waitlistPlayers.length} on waitlist`}
          </div>
          <div>
            {canJoin && (
              <Button onClick={handleJoinTeeTime}>
                {status === 'full' ? 'Join Waitlist' : 'Join Tee Time'}
              </Button>
            )}
            {canLeave && (
              <Button variant="outline" onClick={handleLeaveTeeTime}>
                Leave Tee Time
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Player Lists */}
      <div className="space-y-6">
        {/* Confirmed Players */}
        <div>
          <h2 className="mb-3 text-lg font-semibold">
            Confirmed Players ({confirmedPlayers.length})
          </h2>
          <div className="divide-y rounded-lg border">
            {teeTime.group.members
              .filter(member => confirmedPlayers.includes(member.user.id))
              .map(member => (
                <div key={member.user.id} className="flex items-center justify-between p-3">
                  <div>
                    <div className="font-medium">{member.user.email}</div>
                    {member.user.username && (
                      <div className="text-sm text-gray-500">{member.user.username}</div>
                    )}
                  </div>
                  {member.role === 'admin' && (
                    <span className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-600">
                      Admin
                    </span>
                  )}
                </div>
              ))}
          </div>
        </div>

        {/* Waitlist */}
        {waitlistPlayers.length > 0 && (
          <div>
            <h2 className="mb-3 text-lg font-semibold">
              Waitlist ({waitlistPlayers.length})
            </h2>
            <div className="divide-y rounded-lg border">
              {teeTime.group.members
                .filter(member => waitlistPlayers.includes(member.user.id))
                .map(member => (
                  <div key={member.user.id} className="flex items-center justify-between p-3">
                    <div>
                      <div className="font-medium">{member.user.email}</div>
                      {member.user.username && (
                        <div className="text-sm text-gray-500">{member.user.username}</div>
                      )}
                    </div>
                    {member.role === 'admin' && (
                      <span className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-600">
                        Admin
                      </span>
                    )}
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}