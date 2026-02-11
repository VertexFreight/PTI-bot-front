// src/components/ui/PhotoUpload.tsx

import { useRef, useCallback, useState } from 'react';
import { Camera, X, Check } from 'lucide-react';
import styles from './PhotoUpload.module.scss';

interface PhotoUploadProps {
  id: string;
  name: string;
  description: string;
  required?: boolean;
  preview?: string;
  onCapture: (id: string, file: File) => void;
  onRemove: (id: string) => void;
}

export function PhotoUpload({ id, name, description, required, preview, onCapture, onRemove }: PhotoUploadProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const openCamera = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } },
        audio: false,
      });
      setStream(mediaStream);
      setIsCameraOpen(true);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          videoRef.current.play();
        }
      }, 100);
    } catch (err) {
      console.error('Camera error:', err);
      alert('Cannot access camera');
    }
  }, []);

  const closeCamera = useCallback(() => {
    stream?.getTracks().forEach(t => t.stop());
    setStream(null);
    setIsCameraOpen(false);
  }, [stream]);

  const takePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d')?.drawImage(video, 0, 0);

    canvas.toBlob((blob) => {
      if (!blob) return;
      const file = new File([blob], `${id}-${Date.now()}.jpg`, { type: 'image/jpeg' });
      closeCamera();
      onCapture(id, file);
    }, 'image/jpeg', 0.85);
  }, [id, onCapture, closeCamera]);

  // Camera modal
  if (isCameraOpen) {
    return (
      <div className={styles.cameraModal}>
        <video ref={videoRef} className={styles.video} autoPlay playsInline muted />
        <canvas ref={canvasRef} style={{ display: 'none' }} />
        <div className={styles.cameraHeader}>{name}</div>
        <div className={styles.cameraControls}>
          <button type="button" className={styles.cancelBtn} onClick={closeCamera}><X size={24} /></button>
          <button type="button" className={styles.captureBtn} onClick={takePhoto}><Camera size={32} /></button>
          <div className={styles.spacer} />
        </div>
      </div>
    );
  }

  // Photo card
  return (
    <div
      className={`${styles.photoArea} ${preview ? styles.hasPhoto : ''}`}
      onClick={preview ? undefined : openCamera}
    >
      {preview ? (
        <>
          <img src={preview} alt={name} className={styles.preview} />
          <button type="button" className={styles.removeBtn} onClick={(e) => { e.stopPropagation(); onRemove(id); }}>
            <X size={16} />
          </button>
          <div className={styles.checkBadge}><Check size={14} /></div>
        </>
      ) : (
        <div className={styles.placeholder}>
          <Camera size={24} className={styles.icon} />
          <span className={styles.name}>{name}</span>
          <span className={styles.desc}>{description}</span>
          {required && <span className={styles.requiredBadge}>Required</span>}
        </div>
      )}
    </div>
  );
}
