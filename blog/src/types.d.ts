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
  }
  
  declare module 'wasp/server' {
    export class HttpError extends Error {
      constructor(statusCode: number, message?: string);
      statusCode: number;
    }
  }
  
  declare module 'wasp/server/operations' {
    import { User } from 'wasp/entities';
    import { AuthUser } from '@wasp/auth';
    
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
  }
  
  declare module '@wasp/auth' {
    export interface AuthUser {
      id: string;
      username: string;
      email: string | null;
      isAdmin: boolean;
      lastActiveTimestamp: Date;
      subscriptionStatus: string | null;
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