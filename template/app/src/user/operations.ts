// src/user/operations.ts

import {
  type UpdateCurrentUser,
  type UpdateUserById,
  type GetPaginatedUsers,
} from 'wasp/server/operations';
import { type User } from 'wasp/entities';
import { HttpError } from 'wasp/server';
import { type SubscriptionStatus } from '../payment/plans';

export const updateUserById: UpdateUserById<
  { id: string; data: Partial<Omit<User, 'id' | 'createdAt'>> },
  User
> = async ({ id, data }, context) => {
  if (!context.user) {
    throw new HttpError(401);
  }

  if (!context.user.isAdmin) {
    throw new HttpError(403);
  }

  const updatedUser = await context.entities.User.update({
    where: { id },
    data,
  });

  return updatedUser;
};

export const updateCurrentUser: UpdateCurrentUser<
  Partial<Omit<User, 'id' | 'isAdmin' | 'createdAt'>>,
  User
> = async (user, context) => {
  if (!context.user) {
    throw new HttpError(401);
  }

  return context.entities.User.update({
    where: {
      id: context.user.id,
    },
    data: user,
  });
};

type GetPaginatedUsersInput = {
  skip: number;
  cursor?: number;
  emailContains?: string;
  isAdmin?: boolean;
  subscriptionStatus?: SubscriptionStatus[];
};

type GetPaginatedUsersOutput = {
  users: Pick<
    User,
    | 'id'
    | 'email'
    | 'username'
    | 'lastActiveTimestamp'
    | 'subscriptionStatus'
    | 'paymentProcessorUserId'
  >[];
  totalPages: number;
};

export const getPaginatedUsers: GetPaginatedUsers<
  GetPaginatedUsersInput,
  GetPaginatedUsersOutput
> = async (args, context) => {
  if (!context.user?.isAdmin) {
    throw new HttpError(401);
  }

  const allSubscriptionStatusOptions = args.subscriptionStatus as Array<string | null>;
  const hasNotSubscribed = allSubscriptionStatusOptions?.find(
    (status) => status === null
  );
  const subscriptionStatusStrings = allSubscriptionStatusOptions?.filter(
    (status) => status !== null
  ) as string[];

  const queryResults = await context.entities.User.findMany({
    skip: args.skip,
    take: 10,
    where: {
      AND: [
        {
          email: {
            contains: args.emailContains || undefined,
            mode: 'insensitive',
          },
          isAdmin: args.isAdmin,
        },
        {
          OR: [
            {
              subscriptionStatus: {
                in: subscriptionStatusStrings,
              },
            },
            {
              subscriptionStatus: hasNotSubscribed ? null : undefined,
            },
          ],
        },
      ],
    },
    select: {
      id: true,
      email: true,
      username: true,
      lastActiveTimestamp: true,
      subscriptionStatus: true,
      paymentProcessorUserId: true,
    },
    orderBy: {
      id: 'desc',
    },
  });

  const totalUserCount = await context.entities.User.count({
    where: {
      AND: [
        {
          email: {
            contains: args.emailContains || undefined,
            mode: 'insensitive',
          },
          isAdmin: args.isAdmin,
        },
        {
          OR: [
            {
              subscriptionStatus: {
                in: subscriptionStatusStrings,
              },
            },
            {
              subscriptionStatus: hasNotSubscribed ? null : undefined,
            },
          ],
        },
      ],
    },
  });
  
  return {
    users: queryResults,
    totalPages: Math.ceil(totalUserCount / 10),
  };
};