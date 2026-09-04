'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { UseFormReturn, useFieldArray } from 'react-hook-form';
import { Building2, Users, Plus } from 'lucide-react';
import {
  Card,
  Input,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui';
import {
  RegistrationFormData,
  createDefaultMember,
} from '@/lib/schemas/registration';
import { OrganizationMemberRow } from './OrganizationMemberRow';

interface OrganizationFormProps {
  form: UseFormReturn<RegistrationFormData>;
  onOpenCamera: (index: number) => void;
}

export function OrganizationForm({ form, onOpenCamera }: OrganizationFormProps) {
  const t = useTranslations('Registration');

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'orgMembers',
  });

  const handleAddMember = () => {
    append(createDefaultMember(`org-${fields.length + 1}`));
  };

  const handleFileUpload = (index: number, file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        form.setValue(`orgMembers.${index}.photo`, result, { shouldValidate: true });
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <Card id="card-org-info" className="p-4 shadow-xl space-y-4 bg-[#0B132B]/80 border-border/80">
      {/* Section Header */}
      <div className="flex items-center gap-2 text-primary font-mono font-bold text-xs sm:text-sm tracking-wider uppercase border-b border-border/80 pb-3">
        <Building2 className="w-4 h-4 text-[#D4FF00]" />
        <span>{t('sec1TitleOrg') || 'Organization & Group Details'}</span>
      </div>

      <div className="space-y-4">
        {/* Org Name & Tax ID */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <FormField
              control={form.control}
              name="orgName"
              render={({ field }) => (
                <FormItem id="field-org-name">
                  <FormLabel>{t('orgNameLabel') || 'Organization / Company Name'}</FormLabel>
                  <FormControl>
                    <Input id="input-org-name" placeholder={t('orgNamePlaceholder') || 'e.g. Apex Tech LLC'} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div>
            <FormField
              control={form.control}
              name="orgTaxId"
              render={({ field }) => (
                <FormItem id="field-org-taxid">
                  <FormLabel>{t('orgTaxIdLabel') || 'Tax ID / Registration Number'}</FormLabel>
                  <FormControl>
                    <Input id="input-org-taxid" placeholder={t('orgTaxIdPlaceholder') || 'e.g. 1234567'} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Lead Contact */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="orgLeadName"
            render={({ field }) => (
              <FormItem id="field-org-lead">
                <FormLabel>Lead Coordinator Name</FormLabel>
                <FormControl>
                  <Input id="input-org-lead" placeholder="Contact Person Name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="orgLeadPhone"
            render={({ field }) => (
              <FormItem id="field-org-phone">
                <FormLabel>Contact Phone</FormLabel>
                <FormControl>
                  <Input id="input-org-phone" placeholder="8811-2233" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>

      {/* Roster Section */}
      <div className="space-y-4 pt-4 border-t border-border/80">
        <div className="flex items-center justify-between font-mono">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-foreground">
            <Users className="w-4 h-4 text-[#D4FF00]" />
            <span>Group Member Roster ({fields.length})</span>
          </div>

          <button
            type="button"
            onClick={handleAddMember}
            className="bg-[#D4FF00] hover:bg-[#c3eb00] text-black font-extrabold text-xs px-3 py-1.5 rounded-lg cursor-pointer transition-all flex items-center gap-1 font-mono"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Member</span>
          </button>
        </div>

        <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
          {fields.map((field, index) => (
            <OrganizationMemberRow
              key={field.id}
              form={form}
              index={index}
              onRemove={remove}
              onOpenCamera={onOpenCamera}
              onFileUpload={handleFileUpload}
              t={t}
            />
          ))}
        </div>
      </div>
    </Card>
  );
}
