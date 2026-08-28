'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations, useLocale } from 'next-intl';
import { ShieldCheck, CheckCircle2 } from 'lucide-react';
import { BuiltPlan, GymMember } from '@/lib/types';
import { Button, Form, Modal } from '@/components/ui';
import { useDashboard } from '@/lib/orchestration';
import {
  RegistrationSchema,
  RegistrationFormData,
  getDefaultRegistrationValues,
} from '@/features/registration';
import {
  RegistrationTypeToggle,
  IndividualForm,
  OrganizationForm,
  PlanSelector,
  CameraModal,
} from './registration';
import {
  transformRegistrationToGymMember,
  DURATION_OPTIONS,
} from '@/lib/registration-utils';

interface RegistrationViewProps {
  plans?: BuiltPlan[];
  onNavigateToInventory?: () => void;
  onRegisterMember?: (member: GymMember) => void;
  onSubmitData?: (data: RegistrationFormData) => Promise<void> | void;
}

export default function RegistrationView({
  plans: propPlans,
  onNavigateToInventory,
  onRegisterMember: propOnRegisterMember,
  onSubmitData,
}: RegistrationViewProps) {
  const dashboard = useDashboard();
  const plans = propPlans ?? dashboard.plans;

  const t = useTranslations('Registration');
  const locale = useLocale();
  const isMn = locale === 'mn';

  // Submission & Success UI State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [registeredMemberSummary, setRegisteredMemberSummary] = useState<{
    name: string;
    plan: string;
    duration: string;
  } | null>(null);

  // Camera Modal Target: 'individual' or member index number
  const [cameraTarget, setCameraTarget] = useState<'individual' | number | null>(null);

  // 1. Initialize React Hook Form with Zod Schema Validation
  const form = useForm<RegistrationFormData>({
    resolver: zodResolver(RegistrationSchema),
    defaultValues: getDefaultRegistrationValues(plans[0]?.id || ''),
    mode: 'onChange',
  });

  const registrationType = form.watch('registrationType');

  // 2. Handle Form Submission
  const onSubmit = async (data: RegistrationFormData) => {
    setIsSubmitting(true);
    try {
      if (onSubmitData) {
        await onSubmitData(data);
      }

      const activePlan = plans.find((p) => p.id === data.selectedPlanId);
      const planTitle = activePlan
        ? isMn && activePlan.titleMn
          ? activePlan.titleMn
          : activePlan.title
        : t('noPlanSelected');

      const durationLabel = isMn
        ? DURATION_OPTIONS.find((d) => d.multiplier === data.durationMultiplier)?.labelMn || '1 Сар'
        : DURATION_OPTIONS.find((d) => d.multiplier === data.durationMultiplier)?.labelEn || '1 Mo';

      const displayName =
        data.registrationType === 'individual'
          ? `${data.member.firstName} ${data.member.lastName}`.trim() || t('athlete')
          : data.orgName || t('organization');

      // Create domain GymMember object
      const newGymMember = transformRegistrationToGymMember(data, plans, isMn);
      if (propOnRegisterMember) {
        propOnRegisterMember(newGymMember);
      } else {
        dashboard.registerMember(newGymMember);
      }

      setRegisteredMemberSummary({
        name: displayName,
        plan: planTitle,
        duration: durationLabel,
      });

      setRegistrationSuccess(true);
    } catch (error) {
      console.error('Registration error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetForm = () => {
    setRegistrationSuccess(false);
    setRegisteredMemberSummary(null);
    form.reset(getDefaultRegistrationValues(plans[0]?.id || ''));
  };

  // Handle Photo Capture from Modal
  const handlePhotoCaptured = (photoDataUrl: string) => {
    if (cameraTarget === 'individual') {
      form.setValue('member.photo', photoDataUrl, { shouldValidate: true });
    } else if (typeof cameraTarget === 'number') {
      form.setValue(`orgMembers.${cameraTarget}.photo`, photoDataUrl, {
        shouldValidate: true,
      });
    }
    setCameraTarget(null);
  };

  return (
    <div id="registration-view-root" className="w-full text-foreground space-y-6">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start"
        >
          {/* ================= LEFT COLUMN: Personal/Org Data ================= */}
          <div className="xl:col-span-7 flex flex-col gap-6">
            <RegistrationTypeToggle form={form} />

            {registrationType === 'individual' ? (
              <IndividualForm
                form={form}
                onOpenCamera={() => setCameraTarget('individual')}
              />
            ) : (
              <OrganizationForm
                form={form}
                onOpenCamera={(idx) => setCameraTarget(idx)}
              />
            )}
          </div>

          {/* ================= RIGHT COLUMN: Plan Selector & Summary ================= */}
          <div className="xl:col-span-5 flex flex-col gap-6 sticky top-6">
            <PlanSelector
              plans={plans}
              form={form}
              onNavigateToInventory={onNavigateToInventory}
            />

            {/* Submit Registration Button */}
            <Button
              id="btn-submit-registration"
              type="submit"
              variant="primary"
              size="lg"
              loading={isSubmitting}
              disabled={!form.formState.isValid}
              className="w-full h-12 text-sm shadow-xl shadow-primary/20"
            >
              <ShieldCheck className="w-4 h-4 mr-2 stroke-[2.5]" />
              <span>{t('confirmRegisterBtn')}</span>
            </Button>
          </div>
        </form>
      </Form>

      {/* ================= MODAL: CAMERA WEBCAM CAPTURE ================= */}
      <CameraModal
        isOpen={cameraTarget !== null}
        onClose={() => setCameraTarget(null)}
        onCapture={handlePhotoCaptured}
      />

      {/* ================= MODAL: SUCCESS CONFIRMATION ================= */}
      <Modal
        id="modal-registration-success"
        isOpen={registrationSuccess}
        onClose={handleResetForm}
        title={t('successTitle')}
        maxWidth="sm"
        footer={
          <Button
            id="btn-close-success-modal"
            variant="primary"
            size="sm"
            onClick={handleResetForm}
            className="w-full"
          >
            <CheckCircle2 className="w-4 h-4 mr-1.5" />
            <span>{t('registerAnotherBtn')}</span>
          </Button>
        }
      >
        <div className="text-center py-4 space-y-4">
          <div className="w-14 h-14 rounded-full bg-emerald-500/15 border-2 border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto">
            <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
          </div>

          <div>
            <h3 className="text-base font-extrabold text-foreground">
              {registeredMemberSummary?.name}
            </h3>
            <p className="text-xs text-muted-foreground font-mono mt-1">
              {t('enrolledSuccessfully')}
            </p>
          </div>

          <div className="bg-muted/50 border border-border rounded-xl p-3.5 space-y-2 text-xs font-mono">
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('planLabel')}:</span>
              <span className="font-bold text-foreground">{registeredMemberSummary?.plan}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('durationLabel')}:</span>
              <span className="font-bold text-primary">{registeredMemberSummary?.duration}</span>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
