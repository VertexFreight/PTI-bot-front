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
import type { CheckItem, FormData, PhotoData } from '../../types';

import { API_URL } from '../../constants';

import styles from './PTIForm.module.scss';

type CheckStatus = 'unchecked' | 'pass' | 'fail';

// Trailer-specific checks
const TRAILER_CHECKS: CheckItem[] = [
  { id: 'trailer_lights', label: 'Trailer Lights', description: 'Check all trailer lights', category: 'trailer', critical: true },
  { id: 'trailer_brakes', label: 'Trailer Brakes', description: 'Test trailer brakes', category: 'trailer', critical: true },
  { id: 'trailer_coupling', label: 'Coupling & Hitch', description: 'Inspect coupling', category: 'trailer', critical: true },
];

export function PTIForm() {
  const [photos, setPhotos] = useState<Record<string, PhotoData>>({});
  const [manualChecks, setManualChecks] = useState<Record<string, CheckStatus>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const [submitResult, setSubmitResult] = useState<'success' | 'error' | null>(null);

  const { sendData, haptic, user } = useTelegram();

  const {
    register,
    handleSubmit,
    control,
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
  const hasTrailer = !!trailerNumber; // Reactive flag for trailer sections

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

  const handleManualCheck = useCallback((id: string, status: CheckStatus) => {
    haptic('light');
    setManualChecks(prev => ({ ...prev, [id]: status }));
  }, [haptic]);

  // Required photos
  const requiredTractorPhotos = TRACTOR_PHOTOS.filter(p => p.required);
  const requiredCouplingPhotos = hasTrailer ? COUPLING_PHOTOS.filter(p => p.required) : [];
  const requiredTrailerPhotos = hasTrailer ? TRAILER_PHOTOS.filter(p => p.required) : [];
  const allRequiredPhotos = [...requiredTractorPhotos, ...requiredCouplingPhotos, ...requiredTrailerPhotos];

  const completedPhotos = allRequiredPhotos.filter(p => photos[p.id]).length;
  const allPhotosComplete = completedPhotos === allRequiredPhotos.length;

  // Combine manual checks including trailer
  const allChecks = hasTrailer ? [...MANUAL_CHECKS, ...TRAILER_CHECKS] : MANUAL_CHECKS;

  const criticalChecks = allChecks.filter(c => c.critical);
  const completedCriticalChecks = criticalChecks.filter(
    c => manualChecks[c.id] === 'pass' || manualChecks[c.id] === 'fail'
  ).length;
  const allChecksComplete = completedCriticalChecks === criticalChecks.length;

  const passedChecks = Object.values(manualChecks).filter(s => s === 'pass').length;
  const failedChecks = Object.values(manualChecks).filter(s => s === 'fail').length;
  const pendingChecks = criticalChecks.length - completedCriticalChecks;

  const canSubmit = allPhotosComplete && allChecksComplete;

  const checksByCategory: Record<string, CheckItem[]> = {};
  allChecks.forEach(check => {
    if (!checksByCategory[check.category]) checksByCategory[check.category] = [];
    checksByCategory[check.category].push(check);
  });

  const categoryLabels: Record<string, string> = {
    lights: '💡 Lights Test',
    brakes: '🛑 Brake Tests',
    steering: '🔧 Steering & Wheels',
    safety: '🦺 Safety Equipment',
    trailer: '🚚 Trailer Checks',
  };

  const onSubmit = async (data: FormData) => {
    if (!canSubmit) {
      haptic('error');
      return;
    }

    setIsSubmitting(true);
    setSubmitResult(null);
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

      const manualChecksPayload: Record<string, boolean> = {};
      Object.entries(manualChecks).forEach(([id, status]) => {
        if (status === 'pass') manualChecksPayload[id] = true;
        else if (status === 'fail') manualChecksPayload[id] = false;
      });

      const payload = {
        telegramId: user?.id || null,
        driverName: data.driverName || user?.first_name || 'Driver',
        vehicleUnitNumber: data.unitNumber,
        trailerUnitNumber: data.trailerNumber || null,
        odometer: data.odometer,
        photos: uploadedPhotos,
        manualChecks: manualChecksPayload,
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
      <Card title="Vehicle Information" icon={<Truck size={20} />}>
        <div className={styles.grid}>
          <Input label="Driver Name" {...register('driverName')} />
          <Input
            label="Unit Number"
            error={errors.unitNumber?.message}
            required
            {...register('unitNumber')}
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
          <Input
            label="Trailer Number"
            placeholder="Enter trailer number if available"
            error={errors.trailerNumber?.message}
            {...register('trailerNumber')}
          />
          <div className={styles.note}>
            If you have a trailer, this input is <strong>required</strong>; otherwise, leave blank.
          </div>
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

      {hasTrailer && (
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

      {/* Manual Checks */}
      <Card
        title="Manual Checks"
        subtitle={`${completedCriticalChecks}/${criticalChecks.length}`}
        icon={<CheckSquare size={20} />}
      >
        <div className={styles.checkNote}>
          Test each item and mark as <strong>OK</strong> or <strong>DEFECT</strong>
        </div>

        <div className={styles.checkSummary}>
          <div className={`${styles.summaryItem} ${styles.summaryPass}`}>
            <span className={styles.summaryCount} style={{ color: '#22c55e' }}>{passedChecks}</span>
            <span className={styles.summaryLabel}>Passed</span>
          </div>
          <div className={`${styles.summaryItem} ${styles.summaryFail}`}>
            <span className={styles.summaryCount} style={{ color: '#ef4444' }}>{failedChecks}</span>
            <span className={styles.summaryLabel}>Failed</span>
          </div>
          <div className={`${styles.summaryItem} ${styles.summaryPending}`}>
            <span className={styles.summaryCount} style={{ color: '#f59e0b' }}>{pendingChecks}</span>
            <span className={styles.summaryLabel}>Pending</span>
          </div>
        </div>

        {Object.entries(checksByCategory).map(([category, checks]) => (
          <div key={category} className={styles.checkCategory}>
            <h4 className={styles.categoryTitle}>
              {categoryLabels[category] || category}
            </h4>
            <div className={styles.checkList}>
              {checks.map((check: CheckItem) => {
                const status = manualChecks[check.id] || 'unchecked';
                return (
                  <div
                    key={check.id}
                    className={`${styles.checkItem} ${status === 'pass' ? styles.statusPass : ''} ${status === 'fail' ? styles.statusFail : ''}`}
                  >
                    <div className={styles.checkInfo}>
                      <span className={styles.checkLabel}>
                        {check.label}
                        {check.critical && <span className={styles.required}>*</span>}
                      </span>
                      <span className={styles.checkDesc}>{check.description}</span>
                    </div>
                    <div className={styles.checkButtons}>
                      <button
                        type="button"
                        className={`${styles.checkBtn} ${styles.passBtn} ${status === 'pass' ? styles.active : ''}`}
                        onClick={() => handleManualCheck(check.id, status === 'pass' ? 'unchecked' : 'pass')}
                      >
                        <span className={styles.btnIcon}>✓</span>
                        <span className={styles.btnLabel}>OK</span>
                      </button>
                      <button
                        type="button"
                        className={`${styles.checkBtn} ${styles.failBtn} ${status === 'fail' ? styles.active : ''}`}
                        onClick={() => handleManualCheck(check.id, status === 'fail' ? 'unchecked' : 'fail')}
                      >
                        <span className={styles.btnIcon}>✗</span>
                        <span className={styles.btnLabel}>Defect</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </Card>

      {/* Submit */}
      <div className={styles.submitArea}>
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
              <p>📷 {allRequiredPhotos.length - completedPhotos} photos remaining</p>
            )}
            {!allChecksComplete && (
              <p>☑️ {pendingChecks} checks remaining</p>
            )}
          </div>
        )}

        {failedChecks > 0 && (
          <div className={styles.warningMessage}>
            {failedChecks} defect{failedChecks > 1 ? 's' : ''} found - vehicle may be UNSAFE
          </div>
        )}
      </div>
    </form>
  );
}
