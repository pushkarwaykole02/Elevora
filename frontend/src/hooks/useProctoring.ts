"use client";

import { RefObject, useCallback, useEffect, useRef, useState } from "react";

export type ViolationType =
  | "tab_switch"
  | "window_blur"
  | "no_face"
  | "multiple_faces"
  | "camera_off"
  | "copy_paste"
  | "excessive_movement";

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
  const lastFacePosRef = useRef<{ cx: number; cy: number; width: number } | null>(null);
  const prevFrameDataRef = useRef<Uint8ClampedArray | null>(null);
  const lastCenterRef = useRef<{ x: number; y: number } | null>(null);

  const addViolation = useCallback(
    (type: ViolationType, message: string) => {
      const now = Date.now();
      const cooldown =
        type === "no_face" ? 8000 :
        type === "excessive_movement" ? 6000 : 4000;
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
          lastFacePosRef.current = null;
          addViolation("no_face", "No face detected. Please stay visible on camera.");
        } else if (faces.length > 1) {
          setFacePresent(false);
          addViolation("multiple_faces", "Multiple people detected. Only the candidate should be visible.");
        } else {
          setFacePresent(true);
          const box = faces[0].boundingBox;
          const vw = video.videoWidth || 640;
          const vh = video.videoHeight || 480;
          const cx = (box.x + box.width / 2) / vw;
          const cy = (box.y + box.height / 2) / vh;

          // Check if face moved too far to the edges/off-center
          if (cx < 0.18 || cx > 0.82 || cy < 0.12 || cy > 0.88) {
            addViolation("excessive_movement", "Face moved off-center. Please remain centered and face the camera directly.");
          } else if (lastFacePosRef.current) {
            // Check for rapid or large movement between scans
            const dx = cx - lastFacePosRef.current.cx;
            const dy = cy - lastFacePosRef.current.cy;
            const moveDist = Math.sqrt(dx * dx + dy * dy);
            if (moveDist > 0.16) {
              addViolation("excessive_movement", "Excessive head movement detected. Please keep your face steady and look at the screen.");
            }
          }

          lastFacePosRef.current = { cx, cy, width: box.width / vw };
        }
        return;
      } catch {
        // Fall through to canvas-based heuristic
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
    let sumX = 0;
    let sumY = 0;
    let facePixels = 0;
    let changedPixels = 0;

    for (let y = 0; y < canvas.height; y++) {
      for (let x = 0; x < canvas.width; x++) {
        const i = (y * canvas.width + x) * 4;
        const px = (data[i] + data[i + 1] + data[i + 2]) / 3;
        brightness += px;

        if (px > 35 && px < 225 && y < canvas.height * 0.8) {
          sumX += x;
          sumY += y;
          facePixels++;
        }

        if (prevFrameDataRef.current) {
          const ppx = (prevFrameDataRef.current[i] + prevFrameDataRef.current[i + 1] + prevFrameDataRef.current[i + 2]) / 3;
          if (Math.abs(px - ppx) > 35) {
            changedPixels++;
          }
        }
      }
    }

    brightness /= (canvas.width * canvas.height);

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
      lastCenterRef.current = null;
      addViolation("no_face", "Face not clearly visible. Adjust lighting and position.");
    } else {
      // Check for excessive movement via frame change & center of mass shift
      const totalPixels = canvas.width * canvas.height;
      const motionFraction = changedPixels / totalPixels;

      if (prevFrameDataRef.current && motionFraction > 0.32) {
        addViolation("excessive_movement", "Excessive movement detected. Please keep your face steady and look at the screen.");
      } else if (facePixels > 200) {
        const avgX = sumX / facePixels;
        const avgY = sumY / facePixels;

        if (avgX < canvas.width * 0.18 || avgX > canvas.width * 0.82) {
          addViolation("excessive_movement", "Face moved off-center. Please remain centered and face the camera directly.");
        } else if (lastCenterRef.current) {
          const shiftX = Math.abs(avgX - lastCenterRef.current.x) / canvas.width;
          const shiftY = Math.abs(avgY - lastCenterRef.current.y) / canvas.height;
          const dist = Math.sqrt(shiftX * shiftX + shiftY * shiftY);
          if (dist > 0.16) {
            addViolation("excessive_movement", "Excessive head movement detected. Please keep your face steady and look at the screen.");
          }
        }

        lastCenterRef.current = { x: avgX, y: avgY };
      }
    }

    prevFrameDataRef.current = new Uint8ClampedArray(data);
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
    }, 2000);

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
