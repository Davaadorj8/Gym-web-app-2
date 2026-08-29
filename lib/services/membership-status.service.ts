import { differenceInCalendarDays, parseISO } from 'date-fns';
import { GymMember } from '@/lib/types';
import { getMemberRepository } from '@/lib/repositories';

export class MembershipStatusService {
  /**
   * Returns members whose membership is active but expiring within `withinDays` days.
   */
  static async getExpiringMembers(withinDays = 7): Promise<GymMember[]> {
    const memberRepo = getMemberRepository();
    const allMembers = await memberRepo.findAll();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return allMembers.filter((member) => {
      if (member.status !== 'Active' || !member.expirationDate) return false;
      const expDate = parseISO(member.expirationDate);
      if (isNaN(expDate.getTime())) return false;
      
      const diff = differenceInCalendarDays(expDate, today);
      return diff >= 0 && diff <= withinDays;
    });
  }

  /**
   * Returns members who have passed their expiration date but might still be marked Active.
   */
  static async getExpiredMembers(): Promise<GymMember[]> {
    const memberRepo = getMemberRepository();
    const allMembers = await memberRepo.findAll();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return allMembers.filter((member) => {
      if (!member.expirationDate) return false;
      const expDate = parseISO(member.expirationDate);
      if (isNaN(expDate.getTime())) return false;
      
      return expDate < today;
    });
  }

  /**
   * Automated daily status evaluation job to sync members' status field based on expirationDate.
   */
  static async evaluateMembershipStatuses(): Promise<{ updatedToExpired: number; updatedToActive: number }> {
    const memberRepo = getMemberRepository();
    const allMembers = await memberRepo.findAll();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let updatedToExpired = 0;
    let updatedToActive = 0;

    for (const member of allMembers) {
      if (!member.expirationDate) continue;
      const expDate = parseISO(member.expirationDate);
      if (isNaN(expDate.getTime())) continue;

      if (expDate < today && member.status === 'Active') {
        await memberRepo.update(member.id, { status: 'Expired' });
        updatedToExpired++;
      } else if (expDate >= today && member.status === 'Expired') {
        await memberRepo.update(member.id, { status: 'Active' });
        updatedToActive++;
      }
    }

    return { updatedToExpired, updatedToActive };
  }
}
