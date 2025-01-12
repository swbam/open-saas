import { Course } from '@wasp/entities'
import { CreateCourse, UpdateCourse, DeleteCourse } from './types'
import { prisma } from '@wasp/db'

export const createCourse: CreateCourse = async ({ groupId, name, address }, context) => {
  if (!context.user) {
    throw new Error('Not authorized')
  }

  // Check if user is an admin of the group
  const membership = await prisma.groupMember.findFirst({
    where: {
      groupId,
      userId: context.user.id,
      role: 'admin'
    }
  })

  if (!membership) {
    throw new Error('Not authorized to create courses for this group')
  }

  return prisma.course.create({
    data: {
      name,
      address,
      group: {
        connect: {
          id: groupId
        }
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
      teeTimes: true
    }
  })
}

export const updateCourse: UpdateCourse = async ({ courseId, name, address }, context) => {
  if (!context.user) {
    throw new Error('Not authorized')
  }

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      group: {
        include: {
          members: true
        }
      }
    }
  })

  if (!course) {
    throw new Error('Course not found')
  }

  // Check if user is an admin of the group that owns this course
  const isAdmin = course.group.members.some(
    member => member.userId === context.user?.id && member.role === 'admin'
  )

  if (!isAdmin) {
    throw new Error('Not authorized to update this course')
  }

  return prisma.course.update({
    where: { id: courseId },
    data: {
      name,
      address
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
      teeTimes: true
    }
  })
}

export const deleteCourse: DeleteCourse = async ({ courseId }, context) => {
  if (!context.user) {
    throw new Error('Not authorized')
  }

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      group: {
        include: {
          members: true
        }
      },
      teeTimes: {
        where: {
          dateTime: {
            gte: new Date()
          }
        }
      }
    }
  })

  if (!course) {
    throw new Error('Course not found')
  }

  // Check if user is an admin of the group that owns this course
  const isAdmin = course.group.members.some(
    member => member.userId === context.user?.id && member.role === 'admin'
  )

  if (!isAdmin) {
    throw new Error('Not authorized to delete this course')
  }

  // Check if there are any upcoming tee times
  if (course.teeTimes.length > 0) {
    throw new Error('Cannot delete course with upcoming tee times')
  }

  await prisma.course.delete({
    where: { id: courseId }
  })
}