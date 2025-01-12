import { User } from '@wasp/entities'

export type GroupMember = {
  id: string
  createdAt: Date
  role: 'admin' | 'member'
  userId: string
  groupId: string
  user: User
}

export type Group = {
  id: string
  createdAt: Date
  updatedAt: Date
  name: string
  description?: string
  maxMembers: number
  members: GroupMember[]
  courses: Course[]
  teeTimes: TeeTime[]
}

export type Course = {
  id: string
  createdAt: Date
  updatedAt: Date
  name: string
  address: string
  groupId: string
  teeTimes: TeeTime[]
}

export type TeeTime = {
  id: string
  createdAt: Date
  updatedAt: Date
  dateTime: Date
  playerLimit: number
  notes?: string
  confirmedPlayersJson: string
  waitlistPlayersJson: string
  courseId: string
  groupId: string
}

export type Context = {
  user?: User
  entities: {
    User: any
    Group: any
    GroupMember: any
    Course: any
    TeeTime: any
  }
}

// Query Types
export type GetGroupsQuery = {
  args: void
  context: Context
  result: Group[]
}

export type GetGroupByIdQuery = {
  args: { groupId: string }
  context: Context
  result: Group | null
}

// Action Types
export type CreateGroupAction = {
  args: {
    name: string
    description?: string
  }
  context: Context
  result: Group
}

export type UpdateGroupAction = {
  args: {
    groupId: string
    name?: string
    description?: string
  }
  context: Context
  result: Group
}

export type DeleteGroupAction = {
  args: {
    groupId: string
  }
  context: Context
  result: void
}

export type AddGroupMemberAction = {
  args: {
    groupId: string
    email: string
    role?: 'admin' | 'member'
  }
  context: Context
  result: GroupMember
}

export type UpdateGroupMemberAction = {
  args: {
    groupId: string
    userId: string
    role: 'admin' | 'member'
  }
  context: Context
  result: GroupMember
}

export type RemoveGroupMemberAction = {
  args: {
    groupId: string
    userId: string
  }
  context: Context
  result: void
}