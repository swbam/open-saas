import { Course } from '@wasp/entities'
import { GetCourses, GetCourseById } from '@wasp/queries/types'
import { prisma } from '@wasp/db'

export const getCourses: GetCourses = async (args, context) => {
  if (!context.user) {
    throw new Error('Not authorized')
  }

  // Get all courses from groups the user is a member of
  const userGroups = await prisma.groupMember.findMany({
    where: {
      userId: context.user.id
    },
    select: {
      groupId: true
    }
  })

  const groupIds = userGroups.map(g => g.groupId)

  return prisma.course.findMany({
    where: {
      groupId: {
        in: groupIds
      }
    },
    include: {
      group: {
        include: {
          members: {
            include: {
              user: true
            }
          }
        }
      },
      teeTimes: {
        where: {
          dateTime: {
            gte: new Date()
          }
        },
        orderBy: {
          dateTime: 'asc'
        }
      }
    },
    orderBy: {
      name: 'asc'
    }
  })
}

export const getCourseById: GetCourseById = async ({ courseId }, context) => {
  if (!context.user) {
    throw new Error('Not authorized')
  }

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      group: {
        include: {
          members: {
            include: {
              user: true
            }
          }
        }
      },
      teeTimes: {
        orderBy: {
          dateTime: 'desc'
        }
      }
    }
  })

  if (!course) {
    throw new Error('Course not found')
  }

  // Check if user is a member of the group that owns this course
  const isMember = course.group.members.some(
    member => member.user.id === context.user?.id
  )

  if (!isMember) {
    throw new Error('Not authorized to view this course')
  }

  return course
}