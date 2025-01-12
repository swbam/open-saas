import type { GetGroupsQuery, GetGroupByIdQuery, GroupWithDetails, Context } from '../shared/types'
import type { GroupMember } from '@prisma/client'

export const getGroups: GetGroupsQuery = async (_args: void, context: Context) => {
  if (!context.user) {
    throw new Error('Not authorized')
  }

  const userGroups = await context.entities.GroupMember.findMany({
    where: {
      userId: context.user.id
    },
    include: {
      group: {
        include: {
          members: {
            include: {
              user: true
            }
          },
          courses: true,
          teeTimes: {
            where: {
              dateTime: {
                gte: new Date()
              }
            },
            orderBy: {
              dateTime: 'asc'
            },
            take: 5
          }
        }
      }
    }
  })

  return userGroups.map((membership: GroupMember & { group: GroupWithDetails }) => membership.group)
}

export const getGroupById: GetGroupByIdQuery = async (
  { groupId }: { groupId: string }, 
  context: Context
) => {
  if (!context.user) {
    throw new Error('Not authorized')
  }

  const membership = await context.entities.GroupMember.findFirst({
    where: {
      groupId,
      userId: context.user.id
    }
  })

  if (!membership) {
    throw new Error('Not a member of this group')
  }

  const group = await context.entities.Group.findUnique({
    where: { id: groupId },
    include: {
      members: {
        include: {
          user: true
        }
      },
      courses: true,
      teeTimes: {
        orderBy: {
          dateTime: 'desc'
        }
      }
    }
  })

  if (!group) {
    throw new Error('Group not found')
  }

  return group as GroupWithDetails
}