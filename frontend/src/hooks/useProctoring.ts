"use client";

import { RefObject, useCallback, useEffect, useRef, useState } from "react";

export type ViolationType =
  | "tab_switch"
  | "window_blur"
  | "no_face"
  | "multiple_faces"
  | "camera_off"
  | "copy_paste";

export interface ProctoringViolation {
  id: string;
  type: ViolationType;
  message: string;
  timestamp: number;
}

interface UseProctoringOptions {
  videoRef: RefObject<HTMLVideoElement | null>;
  enabled?: boolean;
  onViolation?: (violation: ProctoringViolation) => void;
}

declare global {
  interface Window {
    FaceDetector?: new (options?: { fastMode?: boolean }) => {
      detect: (source: CanvasImageSource) => Promise<Array<{ boundingBox: DOMRectReadOnly }>>;
    };
  }
}

export function useProctoring({ videoRef, enabled = true, onViolation }: UseProctoringOptions) {
  const [violations, setViolations] = useState<ProctoringViolation[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [facePresent, setFacePresent] = useState(true);
  const faceDetectorRef = useRef<InstanceType<NonNullable<typeof window.FaceDetector>> | null>(null);
  const scanIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastViolationRef = useRef<Record<ViolationType, number>>({} as Record<ViolationType, number>);

  const addViolation = useCallback(
    (type: ViolationType, message: string) => {
      const now = Date.now();
      const cooldown = type === "no_face" ? 8000 : 4000;
      if (now - (lastViolationRef.current[type] ?? 0) < cooldown) return;

      lastViolationRef.current[type] = now;
      const violation: ProctoringViolation = {
        id: `${type}-${now}`,
        type,
        message,
        timestamp: now,
      };
      setViolations((prev) => [violation, ...prev].slice(0, 20));
      onViolation?.(violation);
    },
    [onViolation]
  );

  const scanFace = useCallback(async () => {
    const video = videoRef.current;
    if (!video || video.readyState < 2 || !enabled) return;

    if (window.FaceDetector) {
      try {
        if (!faceDetectorRef.current) {
          faceDetectorRef.current = new window.FaceDetector({ fastMode: true });
        }
        const faces = await faceDetectorRef.current.detect(video);
        if (faces.length === 0) {
          setFacePresent(false);
          addViolation("no_face", "No face detected. Please stay visible on camera.");
        } else if (faces.length > 1) {
          setFacePresent(false);
          addViolation("multiple_faces", "Multiple people detected. Only the candidate should be visible.");
        } else {
          setFacePresent(true);
        }
        return;
      } catch {
        // Fall through to brightness heuristic
      }
    }

    const canvas = document.createElement("canvas");
    canvas.width = 160;
    canvas.height = 120;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);

    let brightness = 0;
    for (let i = 0; i < data.length; i += 4) {
      brightness += (data[i] + data[i + 1] + data[i + 2]) / 3;
    }
    brightness /= data.length / 4;

    const variance = (() => {
      let sum = 0;
      for (let i = 0; i < data.length; i += 4) {
        const px = (data[i] + data[i + 1] + data[i + 2]) / 3;
        sum += Math.abs(px - brightness);
      }
      return sum / (data.length / 4);
    })();

    const hasFace = brightness > 25 && variance > 8;
    setFacePresent(hasFace);
    if (!hasFace) {
      addViolation("no_face", "Face not clearly visible. Adjust lighting and position.");
    }
  }, [addViolation, enabled, videoRef]);

  useEffect(() => {
    if (!enabled) {
      setIsMonitoring(false);
      return;
    }

    setIsMonitoring(true);

    const onVisibilityChange = () => {
      if (document.hidden) {
        addViolation("tab_switch", "Tab switch detected. Stay on the interview window.");
      }
    };

    const onBlur = () => {
      addViolation("window_blur", "Window focus lost. Return to the interview immediately.");
    };

    const onCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      addViolation("copy_paste", "Copy action blocked during proctored interview.");
    };

    const onPaste = (e: ClipboardEvent) => {
      e.preventDefault();
      addViolation("copy_paste", "Paste action blocked during proctored interview.");
    };

    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("blur", onBlur);
    document.addEventListener("copy", onCopy);
    document.addEventListener("paste", onPaste);

    scanIntervalRef.current = setInterval(() => {
      void scanFace();
    }, 3000);

    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("blur", onBlur);
      document.removeEventListener("copy", onCopy);
      document.removeEventListener("paste", onPaste);
      if (scanIntervalRef.current) clearInterval(scanIntervalRef.current);
      setIsMonitoring(false);
    };
  }, [addViolation, enabled, scanFace]);

  const reportCameraOff = useCallback(() => {
    addViolation("camera_off", "Camera was turned off. Camera is mandatory for this interview.");
  }, [addViolation]);

  const clearViolations = useCallback(() => setViolations([]), []);

  return {
    violations,
    violationCount: violations.length,
    isMonitoring,
    facePresent,
    reportCameraOff,
    clearViolations,
  };
}
