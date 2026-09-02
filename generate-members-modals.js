const fs = require('fs');

const content = fs.readFileSync('components/dashboard/MemberDirectoryView.tsx', 'utf8');

const modalStart = content.indexOf('{/* ---------------- MODALS ---------------- */}');
const end = content.lastIndexOf('</div>');

const modalsCode = content.substring(modalStart, end);

const newComponent = `
'use client';
import React from 'react';
import { Modal, Button, Badge } from '@/components/ui';
import { GymMember, BuiltPlan } from '@/lib/types';
import { Calendar, User, Clock, AlertTriangle, Minus, Plus } from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
import { calculateExtensionFee, computeNewExpirationDate } from '@/lib/services/gymDomainService';

interface MemberModalsProps {
  t: any;
  editingMember: GymMember | null;
  setEditingMember: (m: GymMember | null) => void;
  deletingMember: GymMember | null;
  setDeletingMember: (m: GymMember | null) => void;
  cancellingMember: GymMember | null;
  setCancellingMember: (m: GymMember | null) => void;
  extensionMonths: number;
  handleStepDuration: (delta: number) => void;
  handleSaveEdit: (e: React.FormEvent) => void;
  handleConfirmDelete: () => void;
  refundType: 'PRORATED' | 'FULL' | 'MANUAL';
  setRefundType: (type: 'PRORATED' | 'FULL' | 'MANUAL') => void;
  manualAmount: string;
  setManualAmount: (amount: string) => void;
  refundNotes: string;
  setRefundNotes: (notes: string) => void;
  calculatedRefundAmount: number;
  handleConfirmCancellation: () => void;
  plans: BuiltPlan[];
}

export function MemberModals({
  t,
  editingMember, setEditingMember,
  deletingMember, setDeletingMember,
  cancellingMember, setCancellingMember,
  extensionMonths, handleStepDuration, handleSaveEdit,
  handleConfirmDelete,
  refundType, setRefundType, manualAmount, setManualAmount, refundNotes, setRefundNotes, calculatedRefundAmount, handleConfirmCancellation,
  plans
}: MemberModalsProps) {
  return (
    <>
${modalsCode}
    </>
  );
}
`;

fs.writeFileSync('components/dashboard/member-directory/MemberModals.tsx', newComponent);

// Now rewrite MemberDirectoryView.tsx to use it!
const importLine = `import { MemberModals } from './member-directory/MemberModals';\n`;
let newContent = content.replace("import { GymMember, BuiltPlan } from '@/lib/types';", "import { GymMember, BuiltPlan } from '@/lib/types';\n" + importLine);

const replacement = `
      <MemberModals
        t={t}
        editingMember={editingMember}
        setEditingMember={setEditingMember}
        deletingMember={deletingMember}
        setDeletingMember={setDeletingMember}
        cancellingMember={cancellingMember}
        setCancellingMember={setCancellingMember}
        extensionMonths={extensionMonths}
        handleStepDuration={handleStepDuration}
        handleSaveEdit={handleSaveEdit}
        handleConfirmDelete={handleConfirmDelete}
        refundType={refundType}
        setRefundType={setRefundType}
        manualAmount={manualAmount}
        setManualAmount={setManualAmount}
        refundNotes={refundNotes}
        setRefundNotes={setRefundNotes}
        calculatedRefundAmount={calculatedRefundAmount}
        handleConfirmCancellation={handleConfirmCancellation}
        plans={plans}
      />
`;

newContent = newContent.substring(0, modalStart) + replacement + newContent.substring(end);

fs.writeFileSync('components/dashboard/MemberDirectoryView.tsx', newContent);
console.log("Extracted modals successfully!");
