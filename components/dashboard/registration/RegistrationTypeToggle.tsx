'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { UseFormReturn } from 'react-hook-form';
import { User, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { RegistrationFormData, createDefaultMember } from '@/features/registration';

interface RegistrationTypeToggleProps {
  form: UseFormReturn<RegistrationFormData>;
}

export function RegistrationTypeToggle({ form }: RegistrationTypeToggleProps) {
  const t = useTranslations('Registration');
  const registrationType = form.watch('registrationType');

  const handleToggle = (type: 'individual' | 'organization') => {
    form.setValue('registrationType', type, { shouldValidate: true });
    if (type === 'organization') {
      const curMembers = form.getValues('orgMembers' as any);
      if (!curMembers || !Array.isArray(curMembers) || curMembers.length === 0) {
        form.setValue('orgMembers' as any, [createDefaultMember('org-1')]);
      }
      if (form.getValues('orgName' as any) === undefined) form.setValue('orgName' as any, '');
      if (form.getValues('orgTaxId' as any) === undefined) form.setValue('orgTaxId' as any, '');
      if (form.getValues('orgLeadName' as any) === undefined) form.setValue('orgLeadName' as any, '');
      if (form.getValues('orgLeadEmail' as any) === undefined) form.setValue('orgLeadEmail' as any, '');
      if (form.getValues('orgLeadPhone' as any) === undefined) form.setValue('orgLeadPhone' as any, '');
      if (form.getValues('orgAddress' as any) === undefined) form.setValue('orgAddress' as any, '');
    } else {
      const curMember = form.getValues('member' as any);
      if (!curMember) {
        form.setValue('member' as any, createDefaultMember('init'));
      }
    }
  };

  return (
    <div id="registration-type-switch-container" className="mb-2">
      <div className="grid grid-cols-2 p-1 bg-background border border-border rounded-xl">
        <button
          id="tab-reg-individual"
          type="button"
          onClick={() => handleToggle('individual')}
          className={cn(
            'flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-bold font-mono transition-all cursor-pointer',
            registrationType === 'individual'
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted'
          )}
        >
          <User className="w-3.5 h-3.5" />
          <span>{t('regTypeIndividual')}</span>
        </button>
        <button
          id="tab-reg-organization"
          type="button"
          onClick={() => handleToggle('organization')}
          className={cn(
            'flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-bold font-mono transition-all cursor-pointer',
            registrationType === 'organization'
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted'
          )}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>{t('regTypeOrganization')}</span>
        </button>
      </div>
      <p className="text-[11px] text-muted-foreground mt-2 font-mono px-1">
        {registrationType === 'individual'
          ? t('regTypeDescIndividual')
          : t('regTypeDescOrganization')}
      </p>
    </div>
  );
}
