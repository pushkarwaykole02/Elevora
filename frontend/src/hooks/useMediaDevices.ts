"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type MediaDeviceStatus = "idle" | "requesting" | "granted" | "denied" | "error";

interface UseMediaDevicesOptions {
  video?: boolean;
  audio?: boolean;
  autoStart?: boolean;
}

export function useMediaDevices({
  video = true,
  audio = true,
  autoStart = false,
}: UseMediaDevicesOptions = {}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const animationRef = useRef<number | null>(null);

  const [status, setStatus] = useState<MediaDeviceStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [videoEnabled, setVideoEnabled] = useState(video);
  const [audioEnabled, setAudioEnabled] = useState(audio);
  const [micLevel, setMicLevel] = useState(0);

  const stopMicAnalyser = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    analyserRef.current = null;
    if (audioContextRef.current) {
      void audioContextRef.current.close();
      audioContextRef.current = null;
    }
  }, []);

  const startMicAnalyser = useCallback((stream: MediaStream) => {
    stopMicAnalyser();
    const audioTracks = stream.getAudioTracks();
    if (audioTracks.length === 0) return;

    const audioContext = new AudioContext();
    const source = audioContext.createMediaStreamSource(stream);
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    source.connect(analyser);

    audioContextRef.current = audioContext;
    analyserRef.current = analyser;

    const data = new Uint8Array(analyser.frequencyBinCount);
    const tick = () => {
      analyser.getByteFrequencyData(data);
      const avg = data.reduce((sum, v) => sum + v, 0) / data.length;
      setMicLevel(Math.min(100, Math.round((avg / 128) * 100)));
      animationRef.current = requestAnimationFrame(tick);
    };
    tick();
  }, [stopMicAnalyser]);

  const stop = useCallback(() => {
    stopMicAnalyser();
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setMicLevel(0);
    setStatus("idle");
  }, [stopMicAnalyser]);

  const start = useCallback(async () => {
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setStatus("error");
      setError("Camera and microphone are not supported in this browser.");
      return null;
    }

    setStatus("requesting");
    setError(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: video ? { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } } : false,
        audio: audio ? { echoCancellation: true, noiseSuppression: true } : false,
      });

      streamRef.current = stream;

      if (videoRef.current && video) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      if (audio) {
        startMicAnalyser(stream);
      }

      setVideoEnabled(video && stream.getVideoTracks().some((t) => t.enabled));
      setAudioEnabled(audio && stream.getAudioTracks().some((t) => t.enabled));
      setStatus("granted");
      return stream;
    } catch (err) {
      const message =
        err instanceof DOMException
          ? err.name === "NotAllowedError"
            ? "Camera and microphone access was denied. Both are required for the interview."
            : err.name === "NotFoundError"
              ? "No camera or microphone found. Please connect both devices."
              : err.message
          : "Failed to access camera or microphone.";
      setStatus(err instanceof DOMException && err.name === "NotAllowedError" ? "denied" : "error");
      setError(message);
      return null;
    }
  }, [audio, startMicAnalyser, video]);

  const toggleVideo = useCallback(() => {
    const track = streamRef.current?.getVideoTracks()[0];
    if (!track) return false;
    track.enabled = !track.enabled;
    setVideoEnabled(track.enabled);
    return track.enabled;
  }, []);

  const toggleAudio = useCallback(() => {
    const track = streamRef.current?.getAudioTracks()[0];
    if (!track) return false;
    track.enabled = !track.enabled;
    setAudioEnabled(track.enabled);
    return track.enabled;
  }, []);

  useEffect(() => {
    if (autoStart) {
      void start();
    }
    return () => stop();
  }, [autoStart, start, stop]);

  return {
    videoRef,
    streamRef,
    status,
    error,
    videoEnabled,
    audioEnabled,
    micLevel,
    start,
    stop,
    toggleVideo,
    toggleAudio,
    isReady: status === "granted",
  };
}
