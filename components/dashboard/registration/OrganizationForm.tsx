'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { UseFormReturn, useFieldArray } from 'react-hook-form';
import {
  Building2,
  Users,
  Plus,
  Trash2,
  Check,
  Camera,
  Upload,
  RotateCcw,
  Mail,
  Phone,
} from 'lucide-react';
import {
  Card,
  Input,
  Button,
  Badge,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui';
import {
  RegistrationFormData,
  createDefaultMember,
} from '@/src/features/registration/types';

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
    <Card id="card-org-info" className="p-6 shadow-xl space-y-6">
      {/* Section Header */}
      <div className="flex items-center gap-2 text-primary font-mono font-bold text-xs sm:text-sm tracking-wider uppercase">
        <Building2 className="w-4 h-4 text-primary" />
        <span>{t('sec1TitleOrg')}</span>
      </div>

      <div className="space-y-5">
        {/* Org Name & Tax ID */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <FormField
              control={form.control}
              name="orgName"
              render={({ field }) => (
                <FormItem id="field-org-name">
                  <FormLabel>{t('orgNameLabel')}</FormLabel>
                  <FormControl>
                    <Input
                      id="input-org-name"
                      placeholder={t('orgNamePlaceholder')}
                      {...field}
                    />
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
                  <FormLabel>{t('orgTaxIdLabel')}</FormLabel>
                  <FormControl>
                    <Input
                      id="input-org-taxid"
                      placeholder={t('orgTaxIdPlaceholder')}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Coordinator / Lead Details */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <FormField
              control={form.control}
              name="orgLeadName"
              render={({ field }) => (
                <FormItem id="field-org-lead-name">
                  <FormLabel>{t('orgLeadLabel')}</FormLabel>
                  <FormControl>
                    <Input
                      id="input-org-lead-name"
                      placeholder={t('orgLeadPlaceholder')}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div>
            <FormField
              control={form.control}
              name="orgLeadEmail"
              render={({ field }) => (
                <FormItem id="field-org-lead-email">
                  <FormLabel>{t('orgLeadEmailLabel')}</FormLabel>
                  <FormControl>
                    <Input
                      id="input-org-lead-email"
                      type="email"
                      placeholder="coordinator@company.com"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div>
            <FormField
              control={form.control}
              name="orgLeadPhone"
              render={({ field }) => (
                <FormItem id="field-org-lead-phone">
                  <FormLabel>{t('orgLeadPhoneLabel')}</FormLabel>
                  <FormControl>
                    <Input
                      id="input-org-lead-phone"
                      type="tel"
                      placeholder="(555) 012-3456"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Org Headquarters Address */}
        <FormField
          control={form.control}
          name="orgAddress"
          render={({ field }) => (
            <FormItem id="field-org-address">
              <FormLabel>{t('addressLabel')}</FormLabel>
              <FormControl>
                <Input
                  id="input-org-address"
                  placeholder="Corporate Headquarters / Office Address"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Organization Members / Group Roster */}
        <div id="section-org-members-roster" className="pt-3 border-t border-border">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" />
                <h4 className="text-xs font-bold text-foreground uppercase font-mono tracking-wider">
                  {t('orgMembersTitle')}
                </h4>
                <Badge variant="info">
                  {t('totalMembersInRoster', { count: fields.length })}
                </Badge>
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {t('orgMembersDesc')}
              </p>
            </div>

            <Button
              id="btn-add-roster-member"
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddMember}
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span>{t('addMemberBtn')}</span>
            </Button>
          </div>

          {/* Members List with RHF useFieldArray */}
          {fields.length === 0 ? (
            <div className="text-center py-6 border border-dashed border-border rounded-xl text-xs text-muted-foreground font-mono">
              {t('noMembersYet')}
            </div>
          ) : (
            <div className="space-y-4 max-h-[580px] overflow-y-auto pr-1">
              {fields.map((fieldItem, idx) => {
                const memberPhoto = form.watch(`orgMembers.${idx}.photo`);
                const currentFirstName = form.watch(`orgMembers.${idx}.firstName`) || '';
                const currentLastName = form.watch(`orgMembers.${idx}.lastName`) || '';
                const currentRole = form.watch(`orgMembers.${idx}.role`) || '';
                const memberFullName = `${currentFirstName} ${currentLastName}`.trim();
                const fileInputId = `member-photo-upload-${fieldItem.id}`;

                return (
                  <div
                    key={fieldItem.id}
                    id={`member-card-${fieldItem.id}`}
                    className="bg-background border border-border rounded-2xl p-4 sm:p-5 transition-all space-y-4"
                  >
                    {/* Member Card Header */}
                    <div className="flex items-center justify-between border-b border-border/60 pb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-xl bg-muted border border-border text-primary text-xs font-mono font-bold flex items-center justify-center shrink-0">
                          #{idx + 1}
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-foreground tracking-wide">
                            {memberFullName || `Member #${idx + 1}`}
                          </h4>
                          {currentRole && (
                            <p className="text-[10px] text-primary font-mono">{currentRole}</p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {memberPhoto ? (
                          <Badge variant="success">
                            <Check className="w-2.5 h-2.5 mr-1" />
                            {t('photoCaptured')}
                          </Badge>
                        ) : null}

                        {fields.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => remove(idx)}
                            title={t('removeMemberTooltip')}
                            className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Member Content: Photo Section + Full Personal Fields */}
                    <div className="flex flex-col md:flex-row gap-4 items-start">
                      {/* 1. Member Photo Box & Actions */}
                      <div className="w-full md:w-auto flex flex-row md:flex-col items-center md:items-center gap-3 bg-muted/40 border border-border p-3 rounded-xl shrink-0">
                        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl bg-background border border-border flex flex-col items-center justify-center shrink-0 overflow-hidden relative group">
                          {memberPhoto ? (
                            <>
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={memberPhoto}
                                alt={`Member ${idx + 1} photo`}
                                className="w-full h-full object-cover"
                              />
                              <button
                                type="button"
                                onClick={() => form.setValue(`orgMembers.${idx}.photo`, null, { shouldValidate: true })}
                                className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white text-[10px] font-bold gap-1 cursor-pointer"
                              >
                                <RotateCcw className="w-3 h-3" />
                                <span>{t('retakeBtn')}</span>
                              </button>
                            </>
                          ) : (
                            <div className="flex flex-col items-center justify-center text-muted-foreground p-2 text-center">
                              <Camera className="w-5 h-5 mb-1 stroke-[1.5]" />
                              <span className="text-[9px] font-mono tracking-wider">
                                {t('noPhoto')}
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col gap-1.5 flex-1 md:w-full">
                          <Button
                            type="button"
                            variant="primary"
                            size="sm"
                            onClick={() => onOpenCamera(idx)}
                            className="w-full text-[10px] h-7"
                          >
                            <Camera className="w-3 h-3 stroke-[2.5]" />
                            <span>{t('takePhotoBtn')}</span>
                          </Button>

                          <label
                            htmlFor={fileInputId}
                            className="w-full inline-flex items-center justify-center gap-1.5 bg-muted hover:bg-muted/80 border border-border text-muted-foreground hover:text-foreground font-mono text-[9px] py-1 px-2 rounded-lg transition-all cursor-pointer text-center"
                          >
                            <Upload className="w-2.5 h-2.5" />
                            <span>{t('uploadFile')}</span>
                          </label>
                          <input
                            id={fileInputId}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                handleFileUpload(idx, file);
                              }
                            }}
                          />
                        </div>
                      </div>

                      {/* 2. Personal Fields with FormField */}
                      <div className="flex-1 w-full space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          <FormField
                            control={form.control}
                            name={`orgMembers.${idx}.firstName`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-[9px]">{t('firstNameLabel')}</FormLabel>
                                <FormControl>
                                  <Input placeholder={t('firstNamePlaceholder')} {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name={`orgMembers.${idx}.lastName`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-[9px]">{t('lastNameLabel')}</FormLabel>
                                <FormControl>
                                  <Input placeholder={t('lastNamePlaceholder')} {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          <FormField
                            control={form.control}
                            name={`orgMembers.${idx}.email`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-[9px]">{t('emailLabel')}</FormLabel>
                                <FormControl>
                                  <Input
                                    type="email"
                                    placeholder={t('emailPlaceholderField')}
                                    icon={<Mail className="w-3.5 h-3.5" />}
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name={`orgMembers.${idx}.phone`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-[9px]">{t('phoneLabel')}</FormLabel>
                                <FormControl>
                                  <Input
                                    type="tel"
                                    placeholder={t('phonePlaceholder')}
                                    icon={<Phone className="w-3.5 h-3.5" />}
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                          <FormField
                            control={form.control}
                            name={`orgMembers.${idx}.dob`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-[9px]">{t('dobLabel')}</FormLabel>
                                <FormControl>
                                  <Input type="date" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name={`orgMembers.${idx}.gender`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-[9px]">{t('genderLabel')}</FormLabel>
                                <FormControl>
                                  <select
                                    value={field.value}
                                    onChange={field.onChange}
                                    className="w-full bg-input border border-border focus:border-primary focus:ring-1 focus:ring-primary text-foreground text-xs rounded-xl px-3 py-2 outline-none transition-all cursor-pointer h-10"
                                  >
                                    <option value="Male">{t('genderMale')}</option>
                                    <option value="Female">{t('genderFemale')}</option>
                                    <option value="Non-Binary">{t('genderNonBinary')}</option>
                                    <option value="Prefer not to say">{t('genderPreferNot')}</option>
                                  </select>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name={`orgMembers.${idx}.role`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-[9px]">{t('memberRoleLabel')}</FormLabel>
                                <FormControl>
                                  <Input placeholder={t('memberRolePlaceholder')} {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          <FormField
                            control={form.control}
                            name={`orgMembers.${idx}.emergencyContact`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-[9px]">{t('emergencyPlaceholder')}</FormLabel>
                                <FormControl>
                                  <Input placeholder={t('emergencyPlaceholder')} {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name={`orgMembers.${idx}.medicalNotes`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-[9px]">{t('medicalPlaceholder')}</FormLabel>
                                <FormControl>
                                  <Input placeholder={t('medicalPlaceholder')} {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
