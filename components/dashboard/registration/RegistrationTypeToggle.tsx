'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { UseFormReturn } from 'react-hook-form';
import { User, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { RegistrationFormData, createDefaultMember } from '@/lib/schemas/registration';

interface RegistrationTypeToggleProps {
  form: UseFormReturn<RegistrationFormData>;
}

export function RegistrationTypeToggle({ form }: RegistrationTypeToggleProps) {
  const t = useTranslations('Registration');
  const registrationType = form.watch('registrationType');

  const handleToggle = (type: 'individual' | 'organization') => {
    form.setValue('registrationType', type, { shouldValidate: true });
    if (type === 'organization') {
      const formValues = form.getValues();
      if (!('orgMembers' in formValues) || !Array.isArray(formValues.orgMembers) || formValues.orgMembers.length === 0) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (form.setValue as any)('orgMembers', [createDefaultMember('org-1')]);
      }
      if (!('orgName' in formValues)) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (form.setValue as any)('orgName', '');
      }
    } else {
      const formValues = form.getValues();
      if (!('member' in formValues) || !formValues.member) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (form.setValue as any)('member', createDefaultMember('init'));
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
