"use client";

import { Suspense, useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ThreeAiCharacter, { type InterviewerCharacterState } from "@/components/ThreeAiCharacter";
import InterviewPreInterviewGate from "@/components/InterviewPreInterviewGate";
import { useMediaDevices } from "@/hooks/useMediaDevices";
import { useProctoring } from "@/hooks/useProctoring";
import {
  buildInterviewQuestions,
  defaultFresherQuestions,
  getDifficultyLabel,
  type InterviewQuestion,
  type ResumeExtractedData,
} from "@/lib/interviewQuestions";

const INTERVIEWER = "AI Interviewer";

export default function InterviewActivePage() {
  return (
    <Suspense
      fallback={
        <div className="h-screen flex items-center justify-center">
          <p className="text-[var(--color-on-surface-variant)] font-headline">Loading interview...</p>
        </div>
      }
    >
      <InterviewActiveContent />
    </Suspense>
  );
}

function InterviewActiveContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("sessionId");

  const [elapsed, setElapsed] = useState(0);
  const [currentQ, setCurrentQ] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [role, setRole] = useState("Graduate Software Engineer");
  const [level, setLevel] = useState("junior");
  const [resumeContext, setResumeContext] = useState(false);
  const [questions, setQuestions] = useState<InterviewQuestion[]>(defaultFresherQuestions);
  const [transcriptLines, setTranscriptLines] = useState<Array<{ speaker: string; text: string }>>([
    { speaker: INTERVIEWER, text: "Welcome. I'll be conducting your interview today. Let's begin." },
  ]);
  const [isCodeChatOpen, setIsCodeChatOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [userInput, setUserInput] = useState("");
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [showViolationBanner, setShowViolationBanner] = useState(false);
  const [interviewStarted, setInterviewStarted] = useState(false);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const recognitionRef = useRef<{ stop: () => void; start: () => void } | null>(null);
  const transcriptEndRef = useRef<HTMLDivElement | null>(null);

  const {
    videoRef,
    streamRef,
    status: mediaStatus,
    error: mediaDeviceError,
    videoEnabled,
    audioEnabled,
    micLevel,
    start: startMedia,
    stop: stopMedia,
    toggleVideo,
    toggleAudio,
    isReady: mediaReady,
  } = useMediaDevices({ video: true, audio: true });

  const { violations, violationCount, facePresent, reportCameraOff } = useProctoring({
    videoRef,
    enabled: mediaReady && interviewStarted,
  });

  const activeQuestion = questions[currentQ];
  const isCodeQuestion = activeQuestion?.type === "code";

  const characterState: InterviewerCharacterState = isEvaluating
    ? "thinking"
    : isSpeaking
    ? "speaking"
    : isListening
    ? "listening"
    : "idle";

  // Timer — only after interview begins
  useEffect(() => {
    if (!interviewStarted) return;
    intervalRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [interviewStarted]);

  // Auto-scroll transcript
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [transcriptLines]);

  // Request camera/mic on landing — user confirms on pre-interview gate
  useEffect(() => {
    void startMedia();
    return () => stopMedia();
  }, [startMedia, stopMedia]);

  // Re-attach stream when video element remounts (gate → live interview)
  useEffect(() => {
    const video = videoRef.current;
    const stream = streamRef.current;
    if (video && stream) {
      video.srcObject = stream;
      void video.play().catch(() => {});
    }
  }, [interviewStarted, mediaReady, streamRef, videoRef]);

  // Block camera toggle off — report violation and re-enable
  const handleCameraToggle = () => {
    if (videoEnabled) {
      reportCameraOff();
      return;
    }
    toggleVideo();
  };

  // Auto-open code chat when AI asks a syntax/code question
  useEffect(() => {
    if (isCodeQuestion) {
      setIsCodeChatOpen(true);
      if (isListening) stopSpeechRecognition();
    } else {
      setIsCodeChatOpen(false);
    }
  }, [currentQ, isCodeQuestion]);

  // Show violation banner briefly
  useEffect(() => {
    if (violations.length > 0) {
      setShowViolationBanner(true);
      const t = setTimeout(() => setShowViolationBanner(false), 5000);
      return () => clearTimeout(t);
    }
  }, [violations]);

  const speakQuestion = useCallback((text: string) => {
    if (typeof window === "undefined" || !window.speechSynthesis || !audioEnabled) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    const voice = voices.find(
      (v) =>
        v.name.toLowerCase().includes("google us english") ||
        v.name.toLowerCase().includes("david") ||
        v.name.toLowerCase().includes("daniel")
    );
    if (voice) utterance.voice = voice;
    utterance.rate = 0.95;
    utterance.pitch = 0.9;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  }, [audioEnabled]);

  useEffect(() => {
    if (activeQuestion && !isCodeQuestion && interviewStarted) {
      const timer = setTimeout(() => speakQuestion(activeQuestion.text), 500);
      return () => clearTimeout(timer);
    }
  }, [activeQuestion, currentQ, interviewStarted, isCodeQuestion, speakQuestion]);

  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  useEffect(() => {
    if (sessionId) {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      fetch(`${backendUrl}/api/sessions/${sessionId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data?.domain) {
            const sessionLevel = data.level || "junior";
            const useResume = Boolean(data.resumeContext);
            const resumeData = (data.resumeData ?? null) as ResumeExtractedData | null;
            const geminiResumeQuestions = Array.isArray(data.resumeQuestions) && data.resumeQuestions.length > 0
              ? (data.resumeQuestions as InterviewQuestion[])
              : null;

            setRole(data.domain);
            setLevel(sessionLevel);
            setResumeContext(useResume);

            const requestedLimit = Number(data.questionCount) || 5;
            const allQuestions = buildInterviewQuestions(
              data.domain,
              sessionLevel,
              resumeData,
              useResume,
              geminiResumeQuestions,
              requestedLimit
            );
            setQuestions(allQuestions);

            const difficultyLabel = getDifficultyLabel(sessionLevel);
            const resumeNote = useResume && (geminiResumeQuestions?.length || resumeData)
              ? data.resumeQuestionsSource === "gemini"
                ? " I've reviewed your resume and prepared personalized questions for you."
                : data.resumeQuestionsSource === "template"
                  ? " I've reviewed your resume and prepared questions based on your experience."
                  : " I've reviewed your resume and will ask a few questions based on your experience."
              : useResume
                ? " Resume context is enabled but no resume data was found — core role questions only."
                : "";

            setTranscriptLines([
              {
                speaker: INTERVIEWER,
                text: `Welcome. I'll be conducting your ${data.domain} interview at ${difficultyLabel} level.${resumeNote} Let's begin.`,
              },
              { speaker: INTERVIEWER, text: allQuestions[0].text },
            ]);
          }
        })
        .catch((err) => console.error("Error fetching session context:", err));
    }
  }, [sessionId]);

  const startSpeechRecognition = () => {
    if (isCodeQuestion || !audioEnabled) return;

    const win = window as unknown as {
      SpeechRecognition?: new () => {
        continuous: boolean;
        interimResults: boolean;
        lang: string;
        onstart: (() => void) | null;
        onresult: ((event: { resultIndex: number; results: { isFinal: boolean; [i: number]: { transcript: string } }[] }) => void) | null;
        onerror: (() => void) | null;
        onend: (() => void) | null;
        start: () => void;
        stop: () => void;
      };
      webkitSpeechRecognition?: new () => InstanceType<NonNullable<(typeof win)["SpeechRecognition"]>>;
    };
    const SpeechRecognitionCtor = win.SpeechRecognition || win.webkitSpeechRecognition;

    if (!SpeechRecognitionCtor) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }

    try {
      const rec = new SpeechRecognitionCtor();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = "en-US";

      rec.onstart = () => setIsListening(true);

      rec.onresult = (event) => {
        let finalTranscript = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
          setUserInput((prev) => (prev ? `${prev} ${finalTranscript}` : finalTranscript));
        }
      };

      rec.onerror = () => setIsListening(false);
      rec.onend = () => setIsListening(false);

      recognitionRef.current = rec;
      rec.start();
    } catch (e) {
      console.error("Failed to start speech recognition:", e);
    }
  };

  const stopSpeechRecognition = () => {
    recognitionRef.current?.stop();
    setIsListening(false);
  };

  const handleToggleSpeech = () => {
    if (isCodeQuestion) return;
    if (isListening) stopSpeechRecognition();
    else startSpeechRecognition();
  };

  const handleSendResponse = (textToSend?: string) => {
    const finalResponse = textToSend || userInput.trim();
    if (!finalResponse) return;

    setUserInput("");
    if (isListening) stopSpeechRecognition();

    const nextQIdx = currentQ + 1;

    setTranscriptLines((prev) => [
      ...prev,
      { speaker: "You", text: finalResponse },
    ]);

    if (nextQIdx < questions.length) {
      setCurrentQ(nextQIdx);
      setTranscriptLines((prev) => [
        ...prev,
        { speaker: INTERVIEWER, text: questions[nextQIdx].text },
      ]);
    } else {
      setTranscriptLines((prev) => [
        ...prev,
        {
          speaker: INTERVIEWER,
          text: "Excellent! We have covered all the questions. Click 'End Session' to submit and view your AI debrief.",
        },
      ]);
    }

    setIsCodeChatOpen(false);
  };

  const formatTime = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  const handleEnd = async () => {
    setIsEvaluating(true);
    if (isListening) stopSpeechRecognition();
    stopMedia();

    const proctoringSummary = violations.map((v) => ({
      type: v.type,
      message: v.message,
      timestamp: v.timestamp,
    }));

    const payload = {
      transcript: transcriptLines,
      proctoring: {
        violationCount,
        violations: proctoringSummary,
        facePresent,
      },
    };

    if (sessionId) {
      try {
        const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
        const res = await fetch(`${backendUrl}/api/sessions/${sessionId}/complete`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("Failed to complete session");
        router.push(`/interview/feedback?sessionId=${sessionId}`);
      } catch (error) {
        console.error("Error submitting session:", error);
        router.push(`/interview/feedback?sessionId=${sessionId}`);
      } finally {
        setIsEvaluating(false);
      }
    } else {
      router.push("/interview/feedback");
    }
  };

  const handleSkipQuestion = () => {
    const nextQIdx = currentQ + 1;
    if (nextQIdx < questions.length) {
      setCurrentQ(nextQIdx);
      setTranscriptLines((prev) => [
        ...prev,
        { speaker: INTERVIEWER, text: questions[nextQIdx].text },
      ]);
    }
  };

  if (!interviewStarted) {
    return (
      <InterviewPreInterviewGate
        videoRef={videoRef}
        status={mediaStatus}
        error={mediaDeviceError}
        videoEnabled={videoEnabled}
        audioEnabled={audioEnabled}
        micLevel={micLevel}
        isReady={mediaReady}
        role={role}
        onRetry={() => void startMedia()}
        onBegin={() => setInterviewStarted(true)}
      />
    );
  }

  return (
    <div className="h-screen flex flex-col p-4 gap-3 overflow-hidden relative">
      {isEvaluating && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-md z-50 flex flex-col items-center justify-center gap-6">
          <div className="relative w-24 h-24">
            <div className="absolute inset-0 rounded-full border-4 border-[var(--color-primary)]/20" />
            <div className="absolute inset-0 rounded-full border-4 border-t-[var(--color-primary)] animate-spin" />
          </div>
          <h2 className="text-2xl font-headline font-black text-white">Analyzing Session...</h2>
          <p className="text-[var(--color-on-surface-variant)] text-sm max-w-xs text-center leading-relaxed">
            Grading your responses and reviewing proctoring integrity signals.
          </p>
        </div>
      )}

      {/* Proctoring alert banner */}
      {showViolationBanner && violations[0] && (
        <div className="bg-[var(--color-error-container)] border border-[var(--color-error)]/30 rounded-xl px-4 py-2 flex items-center gap-3 animate-pulse">
          <span className="material-symbols-outlined text-[var(--color-error)]">warning</span>
          <p className="text-sm text-[var(--color-error)] font-headline font-medium flex-1">
            {violations[0].message}
          </p>
          <span className="text-xs text-[var(--color-error)]/70">{violationCount} flagged</span>
        </div>
      )}

      {/* Top Bar */}
      <div className="flex items-center justify-between bg-[var(--color-surface-container-low)] ghost-border rounded-2xl px-6 py-3 shrink-0">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-2 text-sm font-headline font-bold text-[var(--color-primary)]">
            <span className="w-2 h-2 rounded-full bg-[var(--color-primary)] animate-pulse" />
            LIVE INTERVIEW
          </span>
          <span className="text-sm text-[var(--color-on-surface-variant)] hidden sm:inline">
            {role} · {getDifficultyLabel(level)}
          </span>
          {resumeContext && (
            <span className="text-xs px-2 py-0.5 rounded-full font-label bg-[var(--color-secondary)]/15 text-[var(--color-secondary)] hidden md:inline">
              Resume context
            </span>
          )}
          <span
            className={`text-xs px-2 py-0.5 rounded-full font-label ${
              facePresent
                ? "bg-[var(--color-primary)]/15 text-[var(--color-primary)]"
                : "bg-[var(--color-error-container)] text-[var(--color-error)]"
            }`}
          >
            {facePresent ? "Face OK" : "Face not detected"}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="font-headline font-black text-xl">{formatTime(elapsed)}</span>
          <span className="text-xs text-[var(--color-on-surface-variant)]">
            Q{currentQ + 1}/{questions.length}
          </span>
          <button
            id="end-session-btn"
            onClick={handleEnd}
            disabled={isEvaluating}
            className="px-5 py-2 rounded-xl bg-[var(--color-error-container)] text-[var(--color-error)] font-headline font-bold text-sm hover:brightness-110 transition-all disabled:opacity-50"
          >
            {isEvaluating ? "Analyzing..." : "End Session"}
          </button>
        </div>
      </div>

      {/* Main area */}
      <div className="flex-1 grid lg:grid-cols-5 gap-3 min-h-0">
        {/* Left: AI Interviewer + User Camera */}
        <div className="lg:col-span-3 flex flex-col gap-3 min-h-0">
          {/* AI Interviewer */}
          <div className="flex-1 bg-[var(--color-surface-container-low)] ghost-border rounded-2xl overflow-hidden relative flex items-center justify-center min-h-[200px]">
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-primary)]/5 to-[var(--color-secondary)]/5" />
            <div className="relative z-10 flex flex-col items-center gap-3 text-center p-4 w-full">
              <div className="w-56 h-52 flex items-center justify-center">
                <ThreeAiCharacter state={characterState} isCodeQuestion={isCodeQuestion} />
              </div>
              <div className="max-w-xl">
                <p className="text-xs font-label text-[var(--color-secondary)] mb-1 uppercase tracking-widest">
                  {INTERVIEWER} is asking
                  {isCodeQuestion && (
                    <span className="ml-2 text-[var(--color-primary)]">· Code question</span>
                  )}
                  {activeQuestion?.source === "resume" && (
                    <span className="ml-2 text-[var(--color-tertiary)]">· From your resume</span>
                  )}
                </p>
                <p className="text-[var(--color-on-surface)] text-base font-headline font-medium leading-relaxed">
                  {activeQuestion?.text}
                </p>
              </div>
              <button
                id="next-question-btn"
                onClick={handleSkipQuestion}
                className="px-4 py-1.5 rounded-xl bg-[var(--color-surface-container)] ghost-border text-xs font-headline hover:bg-[var(--color-surface-variant)] transition-colors"
              >
                Skip Question
              </button>
            </div>
          </div>

          {/* User Camera — compulsory, prominent */}
          <div className="h-44 lg:h-52 bg-[var(--color-surface-container)] ghost-border rounded-2xl relative overflow-hidden shrink-0">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
              style={{ transform: "scaleX(-1)" }}
            />
            {!mediaReady && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/70">
                <p className="text-sm text-[var(--color-on-surface-variant)]">Starting camera...</p>
              </div>
            )}
            <div className="absolute top-3 left-3 flex items-center gap-2 bg-black/60 px-2 py-1 rounded-lg text-xs font-label">
              <span className="w-2 h-2 rounded-full bg-[var(--color-primary)] animate-pulse" />
              REC · Camera Required
            </div>
            <div className="absolute bottom-3 right-3 flex items-center gap-2">
              <div className="bg-black/60 px-2 py-1 rounded-lg flex items-center gap-1">
                <span className="material-symbols-outlined text-sm text-[var(--color-primary)]">mic</span>
                <div className="w-12 h-1.5 bg-white/20 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[var(--color-primary)] transition-all duration-100"
                    style={{ width: `${micLevel}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Transcript + Answer controls */}
        <div className="lg:col-span-2 flex flex-col gap-3 min-h-0">
          {/* Transcript */}
          <div className="flex-1 bg-[var(--color-surface-container-low)] ghost-border rounded-2xl p-4 flex flex-col min-h-0">
            <h3 className="font-headline font-bold text-sm mb-3 text-[var(--color-on-surface-variant)] uppercase tracking-widest">
              Live Transcript
            </h3>
            <div className="flex-1 overflow-y-auto flex flex-col gap-3 pr-1 mb-3">
              {transcriptLines.map((line, i) => (
                <div
                  key={i}
                  className={`flex flex-col gap-1 ${line.speaker === "You" ? "items-end" : "items-start"}`}
                >
                  <span className="text-[10px] font-label text-[var(--color-on-surface-variant)]">
                    {line.speaker}
                  </span>
                  <div
                    className={`px-3 py-2 rounded-2xl text-sm max-w-[90%] leading-relaxed ${
                      line.speaker === "You"
                        ? "bg-[var(--color-primary)]/20 text-[var(--color-on-surface)]"
                        : "bg-[var(--color-surface-container)] text-[var(--color-on-surface-variant)]"
                    }`}
                  >
                    {line.text}
                  </div>
                </div>
              ))}
              <div ref={transcriptEndRef} />
            </div>

            {/* Answer panel — mic for verbal, code chat for syntax questions */}
            <div className="border-t border-[var(--color-outline-variant)]/10 pt-3">
              {isCodeChatOpen && isCodeQuestion ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs text-[var(--color-primary)] font-headline font-bold">
                    <span className="material-symbols-outlined text-sm">code</span>
                    Syntax / Code Chat Open
                  </div>
                  <textarea
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    placeholder="Write your code, SQL, or syntax answer here..."
                    rows={5}
                    className="w-full bg-[var(--color-surface-container)] ghost-border rounded-xl p-3 text-sm text-white outline-none focus:border-[var(--color-primary)] font-mono resize-none"
                  />
                  <button
                    type="button"
                    onClick={() => handleSendResponse()}
                    disabled={!userInput.trim()}
                    className="w-full py-3 bg-[var(--color-primary)] text-[var(--color-on-primary)] rounded-xl font-headline font-bold text-sm hover:brightness-110 disabled:opacity-50 transition-all"
                  >
                    Submit Code Answer
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {userInput && (
                    <div className="text-xs text-[var(--color-primary)] italic bg-[var(--color-surface-container)] p-2 rounded-xl border border-[var(--color-primary)]/10 leading-relaxed">
                      {userInput}
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={handleToggleSpeech}
                    disabled={!audioEnabled}
                    className={`w-full py-4 rounded-xl font-headline font-bold text-sm flex items-center justify-center gap-2 border transition-all ${
                      isListening
                        ? "bg-[var(--color-error-container)] text-[var(--color-error)] border-[var(--color-error)] animate-pulse"
                        : "bg-[var(--color-surface-container)] text-[var(--color-on-surface)] border-[var(--color-outline-variant)]/20 hover:bg-[var(--color-surface-variant)]"
                    } disabled:opacity-40`}
                  >
                    <span className="material-symbols-outlined text-lg">
                      {isListening ? "mic" : "mic_none"}
                    </span>
                    {isListening ? "Listening... (tap to pause)" : "Tap to Answer via Mic"}
                  </button>
                  {userInput && (
                    <button
                      type="button"
                      onClick={() => handleSendResponse()}
                      className="w-full py-3 bg-[var(--color-primary)] text-[var(--color-on-primary)] rounded-xl font-headline font-bold text-sm hover:brightness-110 transition-all"
                    >
                      Send Answer
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Controls + Proctoring log */}
          <div className="bg-[var(--color-surface-container-low)] ghost-border rounded-2xl p-3 shrink-0">
            <div className="grid grid-cols-2 gap-2 mb-2">
              <button
                id="toggle-mic-btn"
                onClick={() => toggleAudio()}
                className={`flex flex-col items-center gap-1 py-3 rounded-xl transition-all ${
                  !audioEnabled
                    ? "bg-[var(--color-error-container)] text-[var(--color-error)]"
                    : "bg-[var(--color-surface-container)] text-[var(--color-on-surface)] hover:bg-[var(--color-surface-variant)]"
                }`}
              >
                <span className="material-symbols-outlined">
                  {audioEnabled ? "mic" : "mic_off"}
                </span>
                <span className="text-xs font-label">{audioEnabled ? "Mic On" : "Mic Off"}</span>
              </button>
              <button
                id="toggle-camera-btn"
                onClick={handleCameraToggle}
                className={`flex flex-col items-center gap-1 py-3 rounded-xl transition-all ${
                  !videoEnabled
                    ? "bg-[var(--color-error-container)] text-[var(--color-error)]"
                    : "bg-[var(--color-surface-container)] text-[var(--color-on-surface)] hover:bg-[var(--color-surface-variant)]"
                }`}
              >
                <span className="material-symbols-outlined">
                  {videoEnabled ? "videocam" : "videocam_off"}
                </span>
                <span className="text-xs font-label">
                  {videoEnabled ? "Cam On (Required)" : "Cam Required!"}
                </span>
              </button>
            </div>
            {violations.length > 0 && (
              <div className="mt-1 max-h-16 overflow-y-auto">
                <p className="text-[10px] font-label text-[var(--color-error)] uppercase tracking-wider mb-1">
                  Integrity log ({violationCount})
                </p>
                {violations.slice(0, 3).map((v) => (
                  <p key={v.id} className="text-[10px] text-[var(--color-on-surface-variant)] truncate">
                    · {v.message}
                  </p>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
