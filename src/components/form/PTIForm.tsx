import { useState, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Truck, Camera, Send, Loader, CheckSquare } from 'lucide-react';

import { Input, Button, Card, PhotoUpload } from '../ui';
import { ptiSchema } from '../../lib/validations';
import {
  TRACTOR_PHOTOS,
  COUPLING_PHOTOS,
  TRAILER_PHOTOS,
  MANUAL_CHECKS,
} from '../../lib/photoShots';
import { useTelegram } from '../../hooks/useTelegram';
import type { PhotoData } from '../../types';

import styles from './PTIForm.module.scss';

interface FormData {
  driverName: string;
  unitNumber: string;
  trailerNumber: string;
  odometer: number;
}

interface CheckItem {
  id: string;
  label: string;
  description: string;
  category: string;
  critical: boolean;
}

const API_URL = "https://pti-bot-839184709762.europe-west1.run.app";

const TEST_PHOTO_MAP: Record<string, string> = {
  'front': 'frontview.jpg',
  'left_side': 'leftview.jpg',
  'right_side': 'rightview.jpg',
  'rear_drive_axle': 'rareview.jpg',
  'engine': 'enginecompartment.jpg',
  'driver_wheels_brakes': 'driverbrakes.jpg',
  'passenger_wheels_brakes': 'passengerbrakes.jpg',
  'interior': 'interior.jpg',
  'dashboard': 'dashboard.jpg',
  'fifth_wheel': 'enginecompartment.jpg',
  'air_lines': 'enginecompartment.jpg',
};

const testImages = import.meta.glob('../../photos/*', {
  eager: true,
  as: 'url',
}) as Record<string, string>;

const getTestImageUrl = (filename: string): string | undefined => {
  const key = Object.keys(testImages).find(k => k.endsWith(filename));
  return key ? testImages[key] : undefined;
};

export function PTIForm() {
  const [photos, setPhotos] = useState<Record<string, PhotoData>>({});
  const [manualChecks, setManualChecks] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const [hasTrailer, setHasTrailer] = useState(false);
  const [submitResult, setSubmitResult] = useState<'success' | 'error' | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isLoadingTestData, setIsLoadingTestData] = useState(false);

  const { sendData, haptic, user } = useTelegram();

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
    watch,
  } = useForm<FormData>({
    resolver: zodResolver(ptiSchema),
    defaultValues: {
      driverName: '',
      unitNumber: '',
      trailerNumber: '',
      odometer: 0,
    },
  });

  const trailerNumber = watch('trailerNumber');

  const handleDownloadPdf = async () => {
    if (!pdfUrl) return;

    try {
      const response = await fetch(pdfUrl);
      if (!response.ok) throw new Error('Failed to download PDF');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = `PTI_Report_${Date.now()}.pdf`;
      document.body.appendChild(link);
      link.click();

      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      haptic('success');
    } catch (error) {
      console.error('Download failed:', error);
      haptic('error');
    }
  };


  const handleLoadTestData = async () => {
    setIsLoadingTestData(true);
    haptic('light');

    try {
      const allShots = [
        ...TRACTOR_PHOTOS,
        ...COUPLING_PHOTOS,
        ...TRAILER_PHOTOS,
      ];

      const newPhotos: Record<string, PhotoData> = {};

      for (const shot of allShots) {
        const filename = TEST_PHOTO_MAP[shot.id];
        if (!filename) {
          console.warn(`No test photo mapped for: ${shot.id}`);
          continue;
        }

        const imageUrl = getTestImageUrl(filename);
        if (!imageUrl) {
          console.warn(`Test image not found: ${filename}`);
          continue;
        }

        try {
          const response = await fetch(imageUrl);
          const blob = await response.blob();

          const file = new File([blob], `${shot.id}.jpg`, {
            type: 'image/jpeg',
          });

          newPhotos[shot.id] = {
            file,
            preview: imageUrl,
          };
        } catch (err) {
          console.error(`Failed to load ${shot.id}:`, err);
        }
      }

      setPhotos(newPhotos);

      const newChecks: Record<string, boolean> = {};
      MANUAL_CHECKS.forEach(check => {
        if (check.critical) {
          newChecks[check.id] = true;
        }
      });
      setManualChecks(newChecks);

      setHasTrailer(true);

      setValue('driverName', 'Test Driver');
      setValue('unitNumber', '7020');
      setValue('trailerNumber', '9001');
      setValue('odometer', 123456);

      haptic('success');
    } catch (error) {
      console.error('Failed to load test data:', error);
      haptic('error');
    } finally {
      setIsLoadingTestData(false);
    }
  };

  const handlePhotoCapture = useCallback((id: string, file: File) => {
    haptic('light');
    setPhotos(prev => ({
      ...prev,
      [id]: { file, preview: URL.createObjectURL(file) },
    }));
  }, [haptic]);

  const handlePhotoRemove = useCallback((id: string) => {
    haptic('light');
    setPhotos(prev => {
      const next = { ...prev };
      if (next[id]?.preview) URL.revokeObjectURL(next[id].preview);
      delete next[id];
      return next;
    });
  }, [haptic]);

  const handleManualCheck = useCallback((id: string, checked: boolean) => {
    haptic('light');
    setManualChecks(prev => ({ ...prev, [id]: checked }));
  }, [haptic]);

  const requiredTractorPhotos = TRACTOR_PHOTOS.filter(p => p.required);
  const requiredCouplingPhotos = hasTrailer ? COUPLING_PHOTOS.filter(p => p.required) : [];
  const requiredTrailerPhotos = hasTrailer ? TRAILER_PHOTOS.filter(p => p.required) : [];
  const allRequiredPhotos = [...requiredTractorPhotos, ...requiredCouplingPhotos, ...requiredTrailerPhotos];

  const completedPhotos = allRequiredPhotos.filter(p => photos[p.id]).length;
  const allPhotosComplete = completedPhotos === allRequiredPhotos.length;

  const criticalChecks = MANUAL_CHECKS.filter(c => c.critical);
  const completedChecks = criticalChecks.filter(c => manualChecks[c.id]).length;
  const allChecksComplete = completedChecks === criticalChecks.length;

  const canSubmit = allPhotosComplete && allChecksComplete;

  const checksByCategory: Record<string, CheckItem[]> = {};
  MANUAL_CHECKS.forEach(check => {
    if (!checksByCategory[check.category]) {
      checksByCategory[check.category] = [];
    }
    checksByCategory[check.category].push(check);
  });

  const categoryLabels: Record<string, string> = {
    lights: '💡 Lights Test',
    brakes: '🛑 Brake Tests',
    steering: '🔧 Steering & Wheels',
    safety: '🦺 Safety Equipment',
  };

  const onSubmit = async (data: FormData) => {
    if (!canSubmit) {
      haptic('error');
      return;
    }

    setIsSubmitting(true);
    setSubmitResult(null);
    setPdfUrl(null);
    haptic('light');

    try {
      const photoEntries = Object.entries(photos);
      const uploadedPhotos: Array<{ shotType: string; imageUrl: string }> = [];

      for (let i = 0; i < photoEntries.length; i++) {
        const [id, photo] = photoEntries[i];
        setUploadProgress(`📤 Uploading ${i + 1}/${photoEntries.length}...`);

        const formData = new FormData();
        formData.append('file', photo.file);

        const res = await fetch(`${API_URL}/photos`, {
          method: 'POST',
          body: formData,
        });

        if (!res.ok) throw new Error(`Upload failed: ${res.status}`);

        const json = await res.json();
        uploadedPhotos.push({ shotType: id, imageUrl: json.imageUrl });
      }

      setUploadProgress('🔍 Analyzing with AI...');

      const payload = {
        telegramId: user?.id || null,
        driverName: data.driverName || user?.first_name || 'Driver',
        vehicleUnitNumber: data.unitNumber,
        trailerUnitNumber: data.trailerNumber || null,
        odometer: data.odometer,
        photos: uploadedPhotos,
        manualChecks,
      };

      const res = await fetch(`${API_URL}/inspections`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error(`Submit failed: ${res.status}`);

      const inspection = await res.json();

      sendData({
        inspectionId: inspection.inspectionId,
        vehicleUnitNumber: data.unitNumber,
        safetyStatus: inspection.safetyStatus,
        pdfUrl: inspection.pdfUrl,
      });

      haptic('success');
      setUploadProgress('✅ Complete!');
      setSubmitResult('success');
      setPdfUrl(inspection.pdfUrl);
    } catch (err) {
      console.error('Submit error:', err);
      haptic('error');
      setUploadProgress(`❌ ${err instanceof Error ? err.message : 'Error'}`);
      setSubmitResult('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
      <Button
        type="button"
        fullWidth
        onClick={handleLoadTestData}
        disabled={isLoadingTestData}
      >
        {isLoadingTestData ? '⏳ Loading...' : '🧪 Load Test Data'}
      </Button>

      <Card title="Vehicle Information" icon={<Truck size={20} />}>
        <div className={styles.grid}>
          <Input label="Driver Name" {...register('driverName')} />

          <Input
            label="Unit Number"
            error={errors.unitNumber?.message}
            required
            {...register('unitNumber')}
          />

          <Input
            label="Trailer Number"
            {...register('trailerNumber', {
              onChange: e => setHasTrailer(!!e.target.value),
            })}
          />

          <Controller
            name="odometer"
            control={control}
            render={({ field }) => (
              <Input
                label="Odometer"
                type="number"
                error={errors.odometer?.message}
                required
                value={field.value || ''}
                onChange={e => field.onChange(Number(e.target.value) || 0)}
              />
            )}
          />
        </div>
      </Card>

      <Card
        title="Tractor Photos"
        subtitle={`${TRACTOR_PHOTOS.filter(p => photos[p.id]).length}/${TRACTOR_PHOTOS.length}`}
        icon={<Camera size={20} />}
      >
        <div className={styles.photoGrid}>
          {TRACTOR_PHOTOS.map(shot => (
            <PhotoUpload
              key={shot.id}
              id={shot.id}
              name={shot.label}
              description={shot.description}
              required={shot.required}
              preview={photos[shot.id]?.preview}
              onCapture={handlePhotoCapture}
              onRemove={handlePhotoRemove}
            />
          ))}
        </div>
      </Card>

      {(hasTrailer || trailerNumber) && (
        <>
          <Card
            title="Coupling Photos"
            subtitle={`${COUPLING_PHOTOS.filter(p => photos[p.id]).length}/${COUPLING_PHOTOS.length}`}
            icon={<Camera size={20} />}
          >
            <div className={styles.photoGrid}>
              {COUPLING_PHOTOS.map(shot => (
                <PhotoUpload
                  key={shot.id}
                  id={shot.id}
                  name={shot.label}
                  description={shot.description}
                  required={shot.required}
                  preview={photos[shot.id]?.preview}
                  onCapture={handlePhotoCapture}
                  onRemove={handlePhotoRemove}
                />
              ))}
            </div>
          </Card>

          <Card
            title="Trailer Photos"
            subtitle={`${TRAILER_PHOTOS.filter(p => photos[p.id]).length}/${TRAILER_PHOTOS.length}`}
            icon={<Camera size={20} />}
          >
            <div className={styles.photoGrid}>
              {TRAILER_PHOTOS.map(shot => (
                <PhotoUpload
                  key={shot.id}
                  id={shot.id}
                  name={shot.label}
                  description={shot.description}
                  required={shot.required}
                  preview={photos[shot.id]?.preview}
                  onCapture={handlePhotoCapture}
                  onRemove={handlePhotoRemove}
                />
              ))}
            </div>
          </Card>
        </>
      )}

      <Card
        title="Manual Checks"
        subtitle={`${completedChecks}/${criticalChecks.length} critical`}
        icon={<CheckSquare size={20} />}
      >
        <p className={styles.checkNote}>
          ⚠️ These items cannot be detected by photos. Please verify manually.
        </p>

        {Object.entries(checksByCategory).map(([category, checks]) => (
          <div key={category} className={styles.checkCategory}>
            <h4 className={styles.categoryTitle}>
              {categoryLabels[category] || category}
            </h4>
            <div className={styles.checkList}>
              {checks.map((check: CheckItem) => (
                <label key={check.id} className={styles.checkItem}>
                  <input
                    type="checkbox"
                    checked={manualChecks[check.id] || false}
                    onChange={e => handleManualCheck(check.id, e.target.checked)}
                    className={styles.checkbox}
                  />
                  <span className={styles.checkContent}>
                    <span className={styles.checkLabel}>
                      {check.label}
                      {check.critical && (
                        <span className={styles.required}>*</span>
                      )}
                    </span>
                    <span className={styles.checkDesc}>
                      {check.description}
                    </span>
                  </span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </Card>

      <div className={styles.submitArea}>
        {submitResult === 'success' && (
          <div className={styles.successMessage}>
            ✅ Inspection submitted successfully!
            {pdfUrl && (
              <button
                type="button"
                onClick={handleDownloadPdf}
                className={styles.pdfLink}
              >
                📄 Download PDF Report
              </button>

            )}
          </div>
        )}

        <Button
          type="submit"
          size="lg"
          fullWidth
          loading={isSubmitting}
          disabled={!canSubmit || submitResult === 'success'}
        >
          {isSubmitting ? (
            <>
              <Loader size={20} className={styles.spinner} />
              {uploadProgress || 'Processing...'}
            </>
          ) : submitResult === 'success' ? (
            '✅ Submitted'
          ) : (
            <>
              <Send size={20} />
              Submit Inspection
            </>
          )}
        </Button>

        {!canSubmit && !submitResult && (
          <div className={styles.remaining}>
            {!allPhotosComplete && (
              <p>
                📷 {allRequiredPhotos.length - completedPhotos} photos remaining
              </p>
            )}
            {!allChecksComplete && (
              <p>
                ☑️ {criticalChecks.length - completedChecks} manual checks remaining
              </p>
            )}
          </div>
        )}
      </div>
    </form>
  );
}