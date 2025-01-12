// src/types.d.ts

declare module 'wasp/entities' {
  export interface User {
    id: string;
    email: string | null;
    username: string;
    isAdmin: boolean;
    lastActiveTimestamp: Date;
    subscriptionStatus: string | null;
    subscriptionPlan: string | null;
    paymentProcessorUserId: string | null;
    lemonSqueezyCustomerPortalUrl: string | null;
    datePaid: Date | null;
    credits: number;
    sendNewsletter: boolean;
    createdAt: Date;
  }

  export interface Group {
    id: string;
    name: string;
    description: string;
    createdAt: Date;
    updatedAt: Date;
  }

  export interface GroupMember {
    id: string;
    groupId: string;
    userId: string;
    role: string;
    createdAt: Date;
    updatedAt: Date;
  }

  export interface Course {
    id: string;
    name: string;
    address: string;
    groupId: string;
    createdAt: Date;
    updatedAt: Date;
  }

  export interface TeeTime {
    id: string;
    dateTime: Date;
    playerLimit: number;
    notes: string;
    confirmedPlayersJson: string;
    waitlistPlayersJson: string;
    groupId: string;
    courseId: string;
    createdAt: Date;
    updatedAt: Date;
  }

  export interface Auth {
    id: string;
    userId: string;
    user: User;
  }

  export interface AuthIdentity {
    id: string;
    authId: string;
    providerName: string;
    providerUserId: string;
    providerData: any;
  }

  export interface DailyStats {
    id: string;
    date: Date;
    pageViews: number;
    visitors: number;
    createdAt: Date;
  }

  export interface PageViewSource {
    id: string;
    source: string;
    count: number;
    dailyStatsId: string;
  }

  export interface Task {
    id: string;
    description: string;
    isDone: boolean;
    userId: string;
    createdAt: Date;
  }

  export interface File {
    id: string;
    name: string;
    type: string;
    size: number;
    userId: string;
    createdAt: Date;
  }
}

declare module 'wasp/server' {
  export class HttpError extends Error {
    constructor(statusCode: number, message?: string);
    statusCode: number;
  }
  export const config: any;
  export const prisma: any;
}

declare module 'wasp/server/operations' {
  import { User, Group, GroupMember, Course, TeeTime } from 'wasp/entities';
  
  export type UpdateCurrentUser<InputType, OutputType> = (
    args: InputType,
    context: { entities: any; user?: AuthUser }
  ) => Promise<OutputType>;

  export type UpdateUserById<InputType, OutputType> = (
    args: InputType,
    context: { entities: any; user?: AuthUser }
  ) => Promise<OutputType>;

  export type GetPaginatedUsers<InputType, OutputType> = (
    args: InputType,
    context: { entities: any; user?: AuthUser }
  ) => Promise<OutputType>;

  export type GetDailyStats = any;
  export type GenerateGptResponse = any;
  export type CreateTask = any;
  export type DeleteTask = any;
  export type UpdateTask = any;
  export type GetGptResponses = any;
  export type GetAllTasksByUser = any;
  export type CreateFile = any;
  export type GetAllFilesByUser = any;
  export type GetDownloadFileSignedURL = any;
  export type GenerateCheckoutSession = any;
  export type GetCustomerPortalUrl = any;
}

declare module '@wasp/auth' {
  export interface AuthUser {
    id: string;
    username: string;
    email: string | null;
    isAdmin: boolean;
    lastActiveTimestamp: Date;
    subscriptionStatus: string | null;
    subscriptionPlan: string | null;
  }
  
  export const useAuth: () => {
    data: AuthUser | null;
    isLoading: boolean;
    error: Error | null;
  };
}

declare module '@wasp/queries' {
  export const useQuery: <T>(queryName: string, args?: any) => {
    data: T | undefined;
    isLoading: boolean;
    error: Error | null;
  };
}

declare module '@wasp/actions' {
  export const useAction: (actionName: string) => [(args: any) => Promise<any>, boolean];
}

declare module 'wasp/client/operations' {
  export const getDailyStats: any;
  export const generateGptResponse: any;
  export const deleteTask: any;
  export const updateTask: any;
  export const createTask: any;
  export const getAllTasksByUser: any;
  export const getAllFilesByUser: any;
  export const getDownloadFileSignedURL: any;
  export const createFile: any;
}

declare module 'wasp/server/jobs' {
  export type Job<Args = unknown> = (args: Args) => Promise<void>;
}