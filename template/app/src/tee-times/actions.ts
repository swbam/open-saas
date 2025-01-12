import { type Action } from '@wasp/actions'
import { type TeeTime } from '@wasp/entities'
import { type Context } from '@wasp/middleware'
import HttpError from '@wasp/core/errors'

type CreateTeeTimeInput = Pick<
  TeeTime,
  'dateTime' | 'courseId' | 'groupId' | 'notes'
>

export const createTeeTimeFn: typeof createTeeTime = async (
  { dateTime, courseId, groupId, notes }: CreateTeeTimeInput,
  context
) => {
  if (!context.user) {
    throw new HttpError(401)
  }

  const teeTime = await context.entities.TeeTime.create({
    data: {
      dateTime,
      courseId,
      groupId,
      notes,
      playerLimit: 4,
      confirmedPlayers: [],
      group: { connect: { id: groupId } },
      course: { connect: { id: courseId } },
      user: { connect: { id: context.user.id } },
    },
  })

  return teeTime
}