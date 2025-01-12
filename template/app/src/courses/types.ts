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
export type GetCoursesQuery = {
  args: void
  context: Context
  result: Course[]
}

export type GetCourseByIdQuery = {
  args: { courseId: string }
  context: Context
  result: Course | null
}

// Action Types
export type CreateCourse = {
  args: {
    groupId: string
    name: string
    address: string
  }
  context: Context
  result: Course
}

export type UpdateCourse = {
  args: {
    courseId: string
    name: string
    address: string
  }
  context: Context
  result: Course
}

export type DeleteCourse = {
  args: {
    courseId: string
  }
  context: Context
  result: void
}

// Extended Types
export type CourseWithDetails = Course & {
  group: Group & {
    members: {
      user: User
      role: string
    }[]
  }
  teeTimes: TeeTime[]
}

export type GroupWithMembers = Group & {
  members: {
    user: User
    role: string
  }[]
}