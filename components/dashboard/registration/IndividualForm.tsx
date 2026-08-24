'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { UseFormReturn } from 'react-hook-form';
import {
  User,
  Mail,
  Phone,
  Camera,
  Upload,
  RotateCcw,
} from 'lucide-react';
import {
  Card,
  Input,
  Button,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui';
import { RegistrationFormData } from '@/src/features/registration/types';

interface IndividualFormProps {
  form: UseFormReturn<RegistrationFormData>;
  onOpenCamera: () => void;
}

export function IndividualForm({ form, onOpenCamera }: IndividualFormProps) {
  const t = useTranslations('Registration');
  const capturedPhoto = form.watch('member.photo');

  const handleFileUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        form.setValue('member.photo', result, { shouldValidate: true });
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-6">
      {/* 1. PERSONAL DETAILS CARD */}
      <Card id="card-personal-info" className="p-6 shadow-xl space-y-5">
        <div className="flex items-center gap-2 text-primary font-mono font-bold text-xs sm:text-sm tracking-wider uppercase">
          <User className="w-4 h-4 text-primary" />
          <span>{t('sec1Title')}</span>
        </div>

        <div className="space-y-4">
          {/* First & Last Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="member.firstName"
              render={({ field }) => (
                <FormItem id="field-first-name">
                  <FormLabel>{t('firstNameLabel')}</FormLabel>
                  <FormControl>
                    <Input
                      id="input-first-name"
                      placeholder={t('firstNamePlaceholder')}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="member.lastName"
              render={({ field }) => (
                <FormItem id="field-last-name">
                  <FormLabel>{t('lastNameLabel')}</FormLabel>
                  <FormControl>
                    <Input
                      id="input-last-name"
                      placeholder={t('lastNamePlaceholder')}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Email & Phone Number */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="member.email"
              render={({ field }) => (
                <FormItem id="field-email">
                  <FormLabel>{t('emailLabel')}</FormLabel>
                  <FormControl>
                    <Input
                      id="input-email"
                      type="email"
                      placeholder={t('emailPlaceholderField')}
                      icon={<Mail className="w-4 h-4 text-muted-foreground" />}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="member.phone"
              render={({ field }) => (
                <FormItem id="field-phone">
                  <FormLabel>{t('phoneLabel')}</FormLabel>
                  <FormControl>
                    <Input
                      id="input-phone"
                      type="tel"
                      placeholder={t('phonePlaceholder')}
                      icon={<Phone className="w-4 h-4 text-muted-foreground" />}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Date of Birth & Gender */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="member.dob"
              render={({ field }) => (
                <FormItem id="field-dob">
                  <FormLabel>{t('dobLabel')}</FormLabel>
                  <FormControl>
                    <Input id="input-dob" type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="member.gender"
              render={({ field }) => (
                <FormItem id="field-gender">
                  <FormLabel>{t('genderLabel')}</FormLabel>
                  <FormControl>
                    <select
                      id="select-gender"
                      value={field.value}
                      onChange={field.onChange}
                      className="w-full bg-input border border-border focus:border-primary focus:ring-1 focus:ring-primary text-foreground text-xs rounded-xl px-4 py-2.5 outline-none transition-all cursor-pointer h-10"
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
          </div>

          {/* Address */}
          <FormField
            control={form.control}
            name="member.address"
            render={({ field }) => (
              <FormItem id="field-address">
                <FormLabel>{t('addressLabel')}</FormLabel>
                <FormControl>
                  <Input
                    id="input-address"
                    placeholder={t('addressPlaceholder')}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Emergency Contact & Medical Notes */}
          <div id="field-emergency-notes" className="space-y-3">
            <FormField
              control={form.control}
              name="member.emergencyContact"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('emergencyNotesLabel')}</FormLabel>
                  <FormControl>
                    <Input
                      id="input-emergency"
                      placeholder={t('emergencyPlaceholder')}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="member.medicalNotes"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <textarea
                      id="textarea-medical"
                      rows={3}
                      placeholder={t('medicalPlaceholder')}
                      value={field.value || ''}
                      onChange={field.onChange}
                      className="w-full bg-input border border-border focus:border-primary focus:ring-1 focus:ring-primary text-foreground text-xs rounded-xl px-4 py-2.5 placeholder:text-muted-foreground/60 outline-none transition-all resize-none font-mono"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
      </Card>

      {/* 2. ATHLETE PROFILE PHOTO CARD */}
      <Card id="card-profile-photo" className="p-6 shadow-xl">
        <div className="flex items-center gap-2 text-primary font-mono font-bold text-xs sm:text-sm tracking-wider uppercase mb-5">
          <Camera className="w-4 h-4 text-primary" />
          <span>{t('profilePhotoTitle')}</span>
        </div>

        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
          {/* Photo Box */}
          <div
            id="photo-preview-box"
            className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-background border border-border flex flex-col items-center justify-center shrink-0 overflow-hidden relative group"
          >
            {capturedPhoto ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={capturedPhoto}
                  alt="Profile preview"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => form.setValue('member.photo', null, { shouldValidate: true })}
                  className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white text-xs gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> {t('retakeBtn')}
                </button>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center text-muted-foreground">
                <Camera className="w-7 h-7 mb-1 stroke-[1.5]" />
                <span className="text-[10px] font-mono tracking-wider">{t('noPhoto')}</span>
              </div>
            )}
          </div>

          {/* Photo Details & Action Buttons */}
          <div className="flex flex-col justify-center gap-2 text-center sm:text-left">
            <h3 className="text-sm font-bold text-foreground tracking-wide">
              {t('webcamTitle')}
            </h3>
            <p className="text-xs text-muted-foreground max-w-sm leading-relaxed">
              {t('webcamDesc')}
            </p>
            <div className="pt-1 flex flex-wrap items-center gap-2 justify-center sm:justify-start">
              <Button
                id="btn-take-photo"
                type="button"
                variant="primary"
                size="sm"
                onClick={onOpenCamera}
              >
                <Camera className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>{t('takePhotoBtn')}</span>
              </Button>

              <label
                htmlFor="individual-photo-upload"
                className="inline-flex items-center gap-1.5 bg-muted hover:bg-muted/80 border border-border text-muted-foreground hover:text-foreground font-mono font-bold text-xs py-2 px-3 rounded-xl transition-all cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>{t('uploadFile')}</span>
              </label>
              <input
                id="individual-photo-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    handleFileUpload(file);
                  }
                }}
              />
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
