'use client';

import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Camera, Trash2, Upload, Mail, Phone } from 'lucide-react';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  Input,
} from '@/components/ui';
import { RegistrationFormData } from '@/lib/schemas/registration';

interface OrganizationMemberRowProps {
  form: UseFormReturn<RegistrationFormData>;
  index: number;
  onRemove: (index: number) => void;
  onOpenCamera: (index: number) => void;
  onFileUpload: (index: number, file: File) => void;
  t: (key: string) => string;
}

export function OrganizationMemberRow({
  form,
  index,
  onRemove,
  onOpenCamera,
  onFileUpload,
  t,
}: OrganizationMemberRowProps) {
  const photo = form.watch(`orgMembers.${index}.photo`);

  return (
    <div className="p-4 bg-[#070D1E] border border-border/80 rounded-xl space-y-3 font-mono text-xs">
      <div className="flex items-center justify-between border-b border-border/60 pb-2">
        <span className="font-bold text-[#D4FF00]">Member #{index + 1}</span>
        {index > 0 && (
          <button
            type="button"
            onClick={() => onRemove(index)}
            className="p-1 text-rose-400 hover:text-rose-300 cursor-pointer"
            title="Remove Member"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Member Name */}
        <FormField
          control={form.control}
          name={`orgMembers.${index}.firstName`}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[10px] uppercase font-bold text-muted-foreground">
                First Name
              </FormLabel>
              <FormControl>
                <Input placeholder="First Name" {...field} className="bg-[#0B132B] text-xs h-8" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name={`orgMembers.${index}.lastName`}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[10px] uppercase font-bold text-muted-foreground">
                Last Name
              </FormLabel>
              <FormControl>
                <Input placeholder="Last Name" {...field} className="bg-[#0B132B] text-xs h-8" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Member Gender */}
        <FormField
          control={form.control}
          name={`orgMembers.${index}.gender`}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[10px] uppercase font-bold text-muted-foreground">
                Gender
              </FormLabel>
              <FormControl>
                <select
                  {...field}
                  className="w-full bg-[#0B132B] border border-border/80 text-xs text-foreground rounded-lg px-2 py-1.5 outline-none font-mono"
                >
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Email */}
        <FormField
          control={form.control}
          name={`orgMembers.${index}.email`}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1">
                <Mail className="w-3 h-3 text-primary" />
                <span>Email</span>
              </FormLabel>
              <FormControl>
                <Input placeholder="email@example.com" {...field} className="bg-[#0B132B] text-xs h-8" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Phone */}
        <FormField
          control={form.control}
          name={`orgMembers.${index}.phone`}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1">
                <Phone className="w-3 h-3 text-primary" />
                <span>Phone Number</span>
              </FormLabel>
              <FormControl>
                <Input placeholder="8811-2233" {...field} className="bg-[#0B132B] text-xs h-8" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Photo Capture */}
      <div className="flex items-center gap-3 pt-1">
        {photo ? (
          <img src={photo} alt="Member" className="w-10 h-10 rounded-lg object-cover border border-[#D4FF00]" />
        ) : (
          <div className="w-10 h-10 rounded-lg bg-[#0B132B] border border-border/80 flex items-center justify-center text-muted-foreground">
            <Camera className="w-4 h-4" />
          </div>
        )}

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onOpenCamera(index)}
            className="px-2.5 py-1 bg-[#0B132B] hover:bg-border/60 border border-border/80 rounded text-[11px] text-foreground font-mono cursor-pointer flex items-center gap-1"
          >
            <Camera className="w-3 h-3 text-[#D4FF00]" />
            <span>Capture Photo</span>
          </button>

          <label className="px-2.5 py-1 bg-[#0B132B] hover:bg-border/60 border border-border/80 rounded text-[11px] text-foreground font-mono cursor-pointer flex items-center gap-1">
            <Upload className="w-3 h-3 text-sky-400" />
            <span>Upload</span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) onFileUpload(index, file);
              }}
            />
          </label>
        </div>
      </div>
    </div>
  );
}
