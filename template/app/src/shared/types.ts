import { User, Group, GroupMember, Course, TeeTime } from '@prisma/client'

export type AuthUser = User & {
  isAdmin: boolean
}

export type GroupWithMembers = Group & {
  members: GroupMember[]
}

export type CourseWithTeeTimes = Course & {
  teeTimes: TeeTime[]
}

export type TeeTimeWithCourse = TeeTime & {
  course: Course
}

export type GroupWithCourses = Group & {
  courses: Course[]
}

export type GroupWithTeeTimes = Group & {
  teeTimes: TeeTime[]
}

export type GroupWithMembersAndCourses = Group & {
  members: GroupMember[]
  courses: Course[]
}

export type GroupWithMembersAndTeeTimes = Group & {
  members: GroupMember[]
  teeTimes: TeeTime[]
}

export type GroupWithMembersCoursesAndTeeTimes = Group & {
  members: GroupMember[]
  courses: Course[]
  teeTimes: TeeTime[]
}

export type CourseWithGroup = Course & {
  group: Group
}

export type TeeTimeWithGroup = TeeTime & {
  group: Group
}

export type TeeTimeWithCourseAndGroup = TeeTime & {
  course: Course
  group: Group
}

export type GroupMemberWithUser = GroupMember & {
  user: User
}

export type GroupMemberWithGroup = GroupMember & {
  group: Group
}

export type GroupMemberWithUserAndGroup = GroupMember & {
  user: User
  group: Group
}

export type UserWithGroups = User & {
  groups: Group[]
}

export type UserWithGroupMembers = User & {
  groupMembers: GroupMember[]
}

export type UserWithGroupsAndGroupMembers = User & {
  groups: Group[]
  groupMembers: GroupMember[]
}

export type UserWithTeeTimes = User & {
  teeTimes: TeeTime[]
}

export type UserWithCourses = User & {
  courses: Course[]
}

export type UserWithGroupsAndTeeTimes = User & {
  groups: Group[]
  teeTimes: TeeTime[]
}

export type UserWithGroupsAndCourses = User & {
  groups: Group[]
  courses: Course[]
}

export type UserWithGroupsAndGroupMembersAndTeeTimes = User & {
  groups: Group[]
  groupMembers: GroupMember[]
  teeTimes: TeeTime[]
}

export type UserWithGroupsAndGroupMembersAndCourses = User & {
  groups: Group[]
  groupMembers: GroupMember[]
  courses: Course[]
}

export type UserWithGroupsAndGroupMembersAndTeeTimesAndCourses = User & {
  groups: Group[]
  groupMembers: GroupMember[]
  teeTimes: TeeTime[]
  courses: Course[]
}