import { User, Group, Course, TeeTime } from '@wasp/entities'

export type Context = {
  user?: User
  entities: {
    User: any
    Group: any
    Course: any
    TeeTime: any
  }
}

// Query Types
export type GetTeeTimesQuery = {
  args: void
  context: Context
  result: TeeTime[]
}

export type GetTeeTimeByIdQuery = {
  args: { teeTimeId: string }
  context: Context
  result: TeeTime | null
}

// Action Types
export type CreateTeeTime = {
  args: {
    groupId: string
    courseId: string
    dateTime: string
    playerLimit: number
    notes?: string
  }
  context: Context
  result: TeeTime
}

export type UpdateTeeTime = {
  args: {
    teeTimeId: string
    dateTime?: string
    playerLimit?: number
    notes?: string
  }
  context: Context
  result: TeeTime
}

export type DeleteTeeTime = {
  args: {
    teeTimeId: string
  }
  context: Context
  result: void
}

export type JoinTeeTime = {
  args: {
    teeTimeId: string
  }
  context: Context
  result: TeeTime
}

export type LeaveTeeTime = {
  args: {
    teeTimeId: string
  }
  context: Context
  result: TeeTime
}

// Extended Types
export type TeeTimeWithDetails = TeeTime & {
  course: Course
  group: Group & {
    members: {
      user: User
      role: string
    }[]
  }
}

// Helper Types
export type TeeTimePlayer = {
  id: string
  email: string
  username?: string
}

export type TeeTimeStatus = 'open' | 'full' | 'waitlist' | 'past'

export function getTeeTimeStatus(teeTime: TeeTimeWithDetails): TeeTimeStatus {
  const now = new Date()
  const teeTimeDate = new Date(teeTime.dateTime)
  
  if (teeTimeDate < now) {
    return 'past'
  }

  const confirmedPlayers = JSON.parse(teeTime.confirmedPlayersJson) as string[]
  
  if (confirmedPlayers.length >= teeTime.playerLimit) {
    return 'full'
  }

  const waitlistPlayers = JSON.parse(teeTime.waitlistPlayersJson) as string[]
  if (waitlistPlayers.length > 0) {
    return 'waitlist'
  }

  return 'open'
}

export function canJoinTeeTime(teeTime: TeeTimeWithDetails, userId: string): boolean {
  if (getTeeTimeStatus(teeTime) === 'past') {
    return false
  }

  const confirmedPlayers = JSON.parse(teeTime.confirmedPlayersJson) as string[]
  const waitlistPlayers = JSON.parse(teeTime.waitlistPlayersJson) as string[]

  return !confirmedPlayers.includes(userId) && !waitlistPlayers.includes(userId)
}

export function canLeaveTeeTime(teeTime: TeeTimeWithDetails, userId: string): boolean {
  if (getTeeTimeStatus(teeTime) === 'past') {
    return false
  }

  const confirmedPlayers = JSON.parse(teeTime.confirmedPlayersJson) as string[]
  const waitlistPlayers = JSON.parse(teeTime.waitlistPlayersJson) as string[]

  return confirmedPlayers.includes(userId) || waitlistPlayers.includes(userId)
}