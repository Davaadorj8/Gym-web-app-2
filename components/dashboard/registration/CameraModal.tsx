'use client';

import React, { useRef, useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Camera } from 'lucide-react';
import { Button, Modal } from '@/components/ui';

interface CameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (dataUrl: string) => void;
  title?: string;
}

export function CameraModal({
  isOpen,
  onClose,
  onCapture,
  title,
}: CameraModalProps) {
  const t = useTranslations('Registration');
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const stopCamera = React.useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }, []);

  useEffect(() => {
    let active = true;

    async function startCamera() {
      if (!isOpen) return;
      setCameraError(null);

      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { width: 400, height: 400, facingMode: 'user' },
          });

          if (!active) {
            stream.getTracks().forEach((track) => track.stop());
            return;
          }

          streamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        } else {
          setCameraError(t('webcamNotSupported'));
        }
      } catch {
        if (active) {
          setCameraError(t('cameraAccessError'));
        }
      }
    }

    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      active = false;
      stopCamera();
    };
  }, [isOpen, t, stopCamera]);

  const handleCapture = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = 300;
      canvas.height = 300;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, 300, 300);
        const dataUrl = canvas.toDataURL('image/jpeg');
        onCapture(dataUrl);
      }
    }
    stopCamera();
    onClose();
  };

  const handleClose = () => {
    stopCamera();
    onClose();
  };

  return (
    <Modal
      id="modal-camera-capture"
      isOpen={isOpen}
      onClose={handleClose}
      title={title || t('webcamModalTitle')}
      maxWidth="sm"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={handleClose}>
            {t('cancelBtn')}
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleCapture}
            disabled={!!cameraError}
          >
            <Camera className="w-4 h-4 stroke-[2.5]" />
            <span>{t('captureBtn')}</span>
          </Button>
        </>
      }
    >
      <div className="w-full aspect-square bg-background rounded-2xl overflow-hidden relative flex items-center justify-center border border-border">
        {cameraError ? (
          <div className="p-4 text-center text-xs text-destructive font-mono">
            {cameraError}
          </div>
        ) : (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
        )}
      </div>
    </Modal>
  );
}
