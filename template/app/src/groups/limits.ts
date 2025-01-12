import { PaymentPlanId, paymentPlans } from '../payment/plans';
import { prisma } from '@wasp/server';

export class GroupLimitValidator {
  static async canCreateGroup(userId: string): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { subscription: true }
    });

    if (!user?.subscription?.planId) {
      return false;
    }

    const plan = paymentPlans[user.subscription.planId as PaymentPlanId];
    const groupCount = await prisma.group.count({
      where: { ownerId: userId }
    });

    return groupCount < plan.maxGroups;
  }

  static async canAddMember(groupId: string): Promise<boolean> {
    const group = await prisma.group.findUnique({
      where: { id: groupId },
      include: { owner: { include: { subscription: true } } }
    });

    if (!group?.owner?.subscription?.planId) {
      return false;
    }

    const plan = paymentPlans[group.owner.subscription.planId as PaymentPlanId];
    const memberCount = await prisma.groupMember.count({
      where: { groupId }
    });

    return memberCount < plan.maxPlayersPerGroup;
  }
}