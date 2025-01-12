import { useQuery } from '@wasp/queries'
import getUpcomingTeeTimes from '@wasp/queries/getUpcomingTeeTimes'
import getRecentActivity from '@wasp/queries/getRecentActivity'
import { TeeTimeWithCourseAndGroup } from '../shared/types'

export default function DashboardPage() {
  const { data: upcomingTeeTimes, isLoading: isTeeTimesLoading } = useQuery(getUpcomingTeeTimes)
  const { data: recentActivity, isLoading: isActivityLoading } = useQuery(getRecentActivity)

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Dashboard</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border bg-card p-6">
          <h3 className="text-lg font-semibold">Upcoming Tee Times</h3>
          {isTeeTimesLoading ? (
            <p className="text-muted-foreground">Loading...</p>
          ) : upcomingTeeTimes?.length ? (
            <ul className="space-y-2">
              {upcomingTeeTimes.map((teeTime: TeeTimeWithCourseAndGroup) => (
                <li key={teeTime.id} className="text-sm">
                  {new Date(teeTime.dateTime).toLocaleString()} - {teeTime.course.name}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground">No upcoming tee times</p>
          )}
        </div>
        <div className="rounded-lg border bg-card p-6">
          <h3 className="text-lg font-semibold">Recent Activity</h3>
          {isActivityLoading ? (
            <p className="text-muted-foreground">Loading...</p>
          ) : recentActivity?.length ? (
            <ul className="space-y-2">
              {recentActivity.map((activity) => (
                <li key={activity.id} className="text-sm">
                  {activity.description}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground">No recent activity</p>
          )}
        </div>
      </div>
    </div>
  )
}