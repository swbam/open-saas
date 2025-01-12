import React, { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useQuery } from '@wasp/queries'
import { useAction } from '@wasp/actions'
import { getCourseById } from '@wasp/queries/getCourseById'
import { updateCourse, deleteCourse } from '@wasp/actions/courses'
import { Button } from '../client/components/ui/button'
import { useAuth } from '@wasp/auth'
import toast from 'react-hot-toast'
import { CourseWithDetails } from './types'

export default function CoursePage() {
  const { courseId } = useParams<{ courseId: string }>()
  const navigate = useNavigate()
  const { data: user } = useAuth()
  const { data: course, isLoading, error } = useQuery(getCourseById, { courseId })
  const updateCourseFn = useAction(updateCourse)
  const deleteCourseFn = useAction(deleteCourse)

  const [isEditing, setIsEditing] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [name, setName] = useState('')
  const [address, setAddress] = useState('')

  // Initialize form when course data is loaded
  React.useEffect(() => {
    if (course) {
      setName(course.name)
      setAddress(course.address)
    }
  }, [course])

  if (isLoading) return <div className="p-4">Loading course details...</div>
  if (error) return <div className="p-4 text-red-500">Error: {error.message}</div>
  if (!course) return <div className="p-4">Course not found</div>

  const isAdmin = course.group.members.some(
    member => member.user.id === user?.id && member.role === 'admin'
  )

  const handleUpdateCourse = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !address.trim()) return

    try {
      await updateCourseFn({
        courseId,
        name: name.trim(),
        address: address.trim()
      })
      setIsEditing(false)
      toast.success('Course updated successfully!')
    } catch (error: any) {
      toast.error(error.message || 'Failed to update course')
    }
  }

  const handleDeleteCourse = async () => {
    if (!confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
      return
    }

    try {
      setIsDeleting(true)
      await deleteCourseFn({ courseId })
      toast.success('Course deleted successfully!')
      navigate(`/groups/${course.group.id}`)
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete course')
      setIsDeleting(false)
    }
  }

  const upcomingTeeTimes = course.teeTimes
    .filter(teeTime => new Date(teeTime.dateTime) > new Date())
    .sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime())

  const pastTeeTimes = course.teeTimes
    .filter(teeTime => new Date(teeTime.dateTime) <= new Date())
    .sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime())

  return (
    <div className="container mx-auto p-4">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <Link
              to={`/groups/${course.group.id}`}
              className="mb-2 text-sm text-blue-500 hover:underline"
            >
              {course.group.name}
            </Link>
            {!isEditing ? (
              <>
                <h1 className="text-2xl font-bold">{course.name}</h1>
                <p className="text-gray-600">{course.address}</p>
              </>
            ) : (
              <form onSubmit={handleUpdateCourse} className="mt-2 space-y-4">
                <div>
                  <label className="block text-sm font-medium">
                    Course Name
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="mt-1 block w-full rounded-md border px-3 py-2"
                      required
                    />
                  </label>
                </div>
                <div>
                  <label className="block text-sm font-medium">
                    Address
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="mt-1 block w-full rounded-md border px-3 py-2"
                      required
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
                      setName(course.name)
                      setAddress(course.address)
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            )}
          </div>
          {isAdmin && !isEditing && (
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsEditing(true)}>
                Edit Course
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteCourse}
                disabled={isDeleting || upcomingTeeTimes.length > 0}
              >
                {isDeleting ? 'Deleting...' : 'Delete Course'}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Upcoming Tee Times */}
      <div className="mb-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Upcoming Tee Times</h2>
          <Link to={`/groups/${course.group.id}/tee-times/new?courseId=${courseId}`}>
            <Button>Schedule Tee Time</Button>
          </Link>
        </div>

        {upcomingTeeTimes.length === 0 ? (
          <p className="text-center text-gray-500">No upcoming tee times scheduled.</p>
        ) : (
          <div className="space-y-4">
            {upcomingTeeTimes.map((teeTime) => (
              <Link
                key={teeTime.id}
                to={`/tee-times/${teeTime.id}`}
                className="block rounded-lg border p-4 transition-shadow hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-lg font-semibold">
                      {new Date(teeTime.dateTime).toLocaleDateString()} at{' '}
                      {new Date(teeTime.dateTime).toLocaleTimeString()}
                    </p>
                    {teeTime.notes && (
                      <p className="mt-1 text-gray-600">{teeTime.notes}</p>
                    )}
                  </div>
                  <div className="text-sm text-gray-500">
                    {JSON.parse(teeTime.confirmedPlayersJson).length} / {teeTime.playerLimit} players
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Past Tee Times */}
      {pastTeeTimes.length > 0 && (
        <div>
          <h2 className="mb-4 text-xl font-semibold">Past Tee Times</h2>
          <div className="space-y-4">
            {pastTeeTimes.map((teeTime) => (
              <Link
                key={teeTime.id}
                to={`/tee-times/${teeTime.id}`}
                className="block rounded-lg border p-4 opacity-75 transition-shadow hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-lg font-semibold">
                      {new Date(teeTime.dateTime).toLocaleDateString()} at{' '}
                      {new Date(teeTime.dateTime).toLocaleTimeString()}
                    </p>
                    {teeTime.notes && (
                      <p className="mt-1 text-gray-600">{teeTime.notes}</p>
                    )}
                  </div>
                  <div className="text-sm text-gray-500">
                    {JSON.parse(teeTime.confirmedPlayersJson).length} / {teeTime.playerLimit} players
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}