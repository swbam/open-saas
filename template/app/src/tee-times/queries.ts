import { Query } from '@wasp/queries'
import { TeeTime } from '@wasp/entities'
import HttpError from '@wasp/core/HttpError.js'

type GetUpcomingTeeTimesInput = void
type GetUpcomingTeeTimesOutput = TeeTime[]

export const getUpcomingTeeTimes: Query<GetUpcomingTeeTimesInput, GetUpcomingTeeTimesOutput> = async (args, context) => {
  if (!context.user) {
    throw new HttpError(401)
  }

  const now = new Date()
  return context.entities.TeeTime.findMany({
    where: {
      dateTime: { gt: now },
      group: {
        members: {
          some: {
            userId: context.user.id
          }
        }
      }
    },
    include: {
      course: true,
      group: true
    },
    orderBy: {
      dateTime: 'asc'
    },
    take: 5
  })
}