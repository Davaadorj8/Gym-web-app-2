import { parseISO, format } from 'date-fns';
import { getMemberRepository, getMembershipTransactionRepository } from '@/lib/repositories';
import { GymMember, MembershipTransaction, MemberStatus } from '@/lib/types';

export interface ProratedRefundQuote {
  totalPaid: number;
  usedDays: number;
  remainingDays: number;
  dailyRate: number;
  grossRefundAmount: number;
  cancellationFee: number;
  netRefundAmount: number;
}

/**
 * Calculates the prorated refund based on the plan duration and days remaining.
 */
export function calculateProratedRefund(
  startDate: Date,
  endDate: Date,
  totalPaid: number,
  cancellationFeeRate = 0.05
): ProratedRefundQuote {
  const totalDays = Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / 86_400_000));
  const usedDays = Math.min(totalDays, Math.max(0, Math.ceil((Date.now() - startDate.getTime()) / 86_400_000)));
  const remainingDays = totalDays - usedDays;

  const dailyRate = totalPaid / totalDays;
  const grossRefundAmount = remainingDays * dailyRate;
  const cancellationFee = grossRefundAmount * cancellationFeeRate;
  const netRefundAmount = Math.max(0, grossRefundAmount - cancellationFee);

  return {
    totalPaid,
    usedDays,
    remainingDays,
    dailyRate: parseFloat(dailyRate.toFixed(2)),
    grossRefundAmount: parseFloat(grossRefundAmount.toFixed(2)),
    cancellationFee: parseFloat(cancellationFee.toFixed(2)),
    netRefundAmount: parseFloat(netRefundAmount.toFixed(2)),
  };
}

export class RefundService {
  /**
   * Processes a plan cancellation and refund, updates the member status to Cancelled or Refunded,
   * and records a historical transaction log.
   */
  static async cancelAndRefund(
    memberId: string,
    refundType: 'FULL' | 'PRORATED' | 'CREDIT' | 'MANUAL',
    options: {
      manualAmount?: number;
      staffName?: string;
      notes?: string;
    } = {}
  ): Promise<{ success: boolean; refundAmount: number; member: GymMember }> {
    const memberRepo = getMemberRepository();
    const txRepo = getMembershipTransactionRepository();

    const member = await memberRepo.findById(memberId);
    if (!member) {
      throw new Error(`Member with ID ${memberId} not found.`);
    }

    // Try to determine previous total paid by inspecting extension logs or plan pricing
    // We'll fall back to calculating an approximate plan price based on historical/plan data or duration
    let basePlanPrice = 120000; // default fallback (e.g. 120,000 MNT)
    if (member.extensionHistory && member.extensionHistory.length > 0) {
      const activeFee = member.extensionHistory[member.extensionHistory.length - 1].feePaid;
      if (activeFee) basePlanPrice = activeFee;
    }

    const start = parseISO(member.startDate);
    const end = parseISO(member.expirationDate);

    const quote = calculateProratedRefund(start, end, basePlanPrice);
    
    let refundAmount = 0;
    let targetStatus: MemberStatus = 'Cancelled';

    if (refundType === 'FULL') {
      refundAmount = basePlanPrice;
      targetStatus = 'Refunded';
    } else if (refundType === 'PRORATED') {
      refundAmount = quote.netRefundAmount;
      targetStatus = 'Refunded';
    } else if (refundType === 'CREDIT') {
      refundAmount = quote.grossRefundAmount; // Full proration credit without cancellation fee
      targetStatus = 'Cancelled';
    } else if (refundType === 'MANUAL') {
      refundAmount = options.manualAmount ?? 0;
      targetStatus = 'Refunded';
    }

    // Update member status
    const updatedMember = await memberRepo.update(memberId, {
      status: targetStatus,
    });

    if (!updatedMember) {
      throw new Error(`Failed to update member status for ${memberId}.`);
    }

    // Create a transaction log
    const txId = `tx-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const nowStr = new Date().toISOString();
    const formattedTime = format(new Date(), 'yyyy-MM-dd HH:mm');

    const transaction: MembershipTransaction = {
      id: txId,
      memberId,
      memberName: `${member.firstName} ${member.lastName}`,
      amount: refundAmount,
      type: refundType === 'CREDIT' ? 'CREDIT_ADJUSTMENT' : 'REFUND',
      timestamp: nowStr,
      timeFormatted: formattedTime,
      planTitle: member.planTitle,
      notes: options.notes || `Plan cancellation of type ${refundType}`,
      staffLogged: options.staffName || 'Admin',
    };

    await txRepo.create(transaction);

    return {
      success: true,
      refundAmount,
      member: updatedMember,
    };
  }
}
