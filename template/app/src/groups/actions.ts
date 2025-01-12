import type {
  CreateGroupOperation,
  UpdateGroupOperation,
  DeleteGroupOperation,
  AddGroupMemberOperation,
  UpdateGroupMemberOperation,
  RemoveGroupMemberOperation,
  Context
} from '../shared/types'
import { GroupLimitValidator } from './limits'

async function checkGroupLimit(userId: string, context: Context): Promise<void> {
  const canCreate = await GroupLimitValidator.canCreateGroup(userId)
  if (!canCreate) {
    throw new Error('You have reached your group creation limit. Please upgrade your subscription to create more groups.')
  }
}

async function checkMemberLimit(groupId: string, context: Context): Promise<void> {
  const canAddMember = await GroupLimitValidator.canAddMember(groupId)
  if (!canAddMember) {
    throw new Error('This group has reached its member limit. The group admin needs to upgrade their plan to add more members.')
  }
}

export const createGroup: CreateGroupOperation = async ({ name, description }, context) => {
  if (!context.user) throw new Error('Not authorized')

  await checkGroupLimit(context.user.id, context)

  return context.entities.Group.create({
    data: {
      name,
      description,
      members: {
        create: {
          userId: context.user.id,
          role: 'admin'
        }
      }
    },
    include: {
      members: {
        include: {
          user: true
        }
      }
    }
  })
}

export const updateGroup: UpdateGroupOperation = async ({ groupId, name, description }, context) => {
  if (!context.user) throw new Error('Not authorized')

  const membership = await context.entities.GroupMember.findFirst({
    where: {
      groupId,
      userId: context.user.id,
      role: 'admin'
    }
  })

  if (!membership) throw new Error('Not authorized to update this group')

  return context.entities.Group.update({
    where: { id: groupId },
    data: {
      name,
      description
    },
    include: {
      members: {
        include: {
          user: true
        }
      }
    }
  })
}

export const deleteGroup: DeleteGroupOperation = async ({ groupId }, context) => {
  if (!context.user) throw new Error('Not authorized')

  const membership = await context.entities.GroupMember.findFirst({
    where: {
      groupId,
      userId: context.user.id,
      role: 'admin'
    }
  })

  if (!membership) throw new Error('Not authorized to delete this group')

  await context.entities.Group.delete({
    where: { id: groupId }
  })
}

export const addGroupMember: AddGroupMemberOperation = async ({ groupId, email, role = 'member' }, context) => {
  if (!context.user) throw new Error('Not authorized')

  const membership = await context.entities.GroupMember.findFirst({
    where: {
      groupId,
      userId: context.user.id,
      role: 'admin'
    }
  })

  if (!membership) throw new Error('Not authorized to add members to this group')

  await checkMemberLimit(groupId, context)

  const userToAdd = await context.entities.User.findUnique({
    where: { email }
  })

  if (!userToAdd) throw new Error('User not found')

  const existingMembership = await context.entities.GroupMember.findFirst({
    where: {
      groupId,
      userId: userToAdd.id
    }
  })

  if (existingMembership) throw new Error('User is already a member of this group')

  return context.entities.GroupMember.create({
    data: {
      groupId,
      userId: userToAdd.id,
      role
    },
    include: {
      user: true
    }
  })
}

export const updateGroupMember: UpdateGroupMemberOperation = async ({ groupId, userId, role }, context) => {
  if (!context.user) throw new Error('Not authorized')

  const adminMembership = await context.entities.GroupMember.findFirst({
    where: {
      groupId,
      userId: context.user.id,
      role: 'admin'
    }
  })

  if (!adminMembership) throw new Error('Not authorized to update member roles')

  if (userId === context.user.id) throw new Error('Cannot modify your own role')

  return context.entities.GroupMember.update({
    where: {
      userId_groupId: {
        userId,
        groupId
      }
    },
    data: { role },
    include: {
      user: true
    }
  })
}

export const removeGroupMember: RemoveGroupMemberOperation = async ({ groupId, userId }, context) => {
  if (!context.user) throw new Error('Not authorized')

  const adminMembership = await context.entities.GroupMember.findFirst({
    where: {
      groupId,
      userId: context.user.id,
      role: 'admin'
    }
  })

  if (!adminMembership) throw new Error('Not authorized to remove members')

  if (userId === context.user.id) throw new Error('Cannot remove yourself from the group')

  await context.entities.GroupMember.delete({
    where: {
      userId_groupId: {
        userId,
        groupId
      }
    }
  })
}