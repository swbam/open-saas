import type { Context } from '../../shared/types'
import { prisma } from '@wasp/server'

export const logCourseHistory = async (
  courseId: string,
  groupId: string,
  players: string[],
  context: Context
) => {
  return prisma.courseHistory.create({
    data: {
      courseId,
      groupId,
      players,
      scorecards: null
    }
  })
}

export const getCourseHistory = async (
  courseId: string,
  context: Context
) => {
  return prisma.courseHistory.findMany({
    where: { courseId },
    include: {
      course: true,
      group: true
    },
    orderBy: {
      playedAt: 'desc'
    }
  })
}

export const getGroupCourseHistory = async (
  groupId: string,
  context: Context
) => {
  return prisma.courseHistory.findMany({
    where: { groupId },
    include: {
      course: true,
      group: true
    },
    orderBy: {
      playedAt: 'desc'
    }
  })
}