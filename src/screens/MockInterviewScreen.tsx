import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  AlertCircle,
  ArrowRight,
  Briefcase,
  CheckCircle2,
  Clock,
  Keyboard,
  Mic,
  MicOff,
  Play,
  RotateCcw,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { useCareer } from '../context/CareerContext';
import { generateInterviewQuestions } from '../data/questionBank';
import { scoreInterviewAnswer } from '../utils/scoringEngine';
import {
  InterviewQuestion,
  InterviewReport,
  QuestionAnswerRecord,
  SavedJob,
} from '../types/career';
import {
  Badge,
  Button,
  Card,
  EmptyState,
  ProgressBar,
  ScreenSkeleton,
  useToast,
} from '../components/ui';

// Minimal TypeScript definitions for browser Web Speech Recognition API
interface SpeechRecognitionEventLike {
  resultIndex: number;
  results: {
    length: number;
    [index: number]: {
      isFinal: boolean;
      0: { transcript: string };
    };
  };
}

interface SpeechRecognitionInstance {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((e: SpeechRecognitionEventLike) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

function getSpeechRecognitionConstructor(): (new () => SpeechRecognitionInstance) | null {
  if (typeof window === 'undefined') return null;
  const win = window as unknown as {
    SpeechRecognition?: new () => SpeechRecognitionInstance;
    webkitSpeechRecognition?: new () => SpeechRecognitionInstance;
  };
  return win.SpeechRecognition || win.webkitSpeechRecognition || null;
}

function formatTimer(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

/**
 * Mock Interview Screen (Step 6)
 * 1. Select a Saved Job first.
 * 2. Web Speech API:
 *    - `window.speechSynthesis` speaks each interview question aloud.
 *    - `SpeechRecognition` transcribes spoken answers live.
 *    - Web Audio `AnalyserNode` drives a 24-bar live waveform around the mic.
 *    - Graceful typed-answer fallback if speech is unsupported or mic permission is denied.
 * 3. Deterministic local rule-based scoring (Length, STAR, Metrics, Keywords, Fillers).
 */
export const MockInterviewScreen: React.FC = () => {
  const {
    state,
    isHydrating,
    selectedInterviewJobId,
    setSelectedInterviewJobId,
    recordInterviewReport,
    navigate,
  } = useCareer();
  const { showToast } = useToast();

  // Session setup state
  const [chosenJobId, setChosenJobId] = useState<string>(
    selectedInterviewJobId || state.savedJobs[0]?.id || ''
  );
  const [questionCount, setQuestionCount] = useState<3 | 5>(5);
  const [sessionActive, setSessionActive] = useState(false);

  // Active interview state
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answerDraft, setAnswerDraft] = useState('');
  const [interimText, setInterimText] = useState('');
  const [recordedAnswers, setRecordedAnswers] = useState<QuestionAnswerRecord[]>([]);
  const [questionSeconds, setQuestionSeconds] = useState(0);

  // Speech & Audio state
  const speechSupported = Boolean(getSpeechRecognitionConstructor());
  const ttsSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;

  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [isSpeakingQuestion, setIsSpeakingQuestion] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [usedVoiceThisQuestion, setUsedVoiceThisQuestion] = useState(false);
  const [preferTyping, setPreferTyping] = useState(!speechSupported);
  const [micError, setMicError] = useState<string | null>(
    !speechSupported
      ? 'Live speech recognition is not supported in this browser. Typed-answer mode is ready below.'
      : null
  );
  const [waveBars, setWaveBars] = useState<number[]>(() => Array(24).fill(14));

  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Sync pre-selected job from SavedJobsScreen
  useEffect(() => {
    if (selectedInterviewJobId) {
      setChosenJobId(selectedInterviewJobId);
    } else if (!chosenJobId && state.savedJobs[0]) {
      setChosenJobId(state.savedJobs[0].id);
    }
  }, [selectedInterviewJobId, state.savedJobs, chosenJobId]);

  const stopAudioWaveform = useCallback(() => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      mediaStreamRef.current = null;
    }
    if (audioCtxRef.current) {
      audioCtxRef.current.close().catch(() => {});
      audioCtxRef.current = null;
    }
    setWaveBars(Array(24).fill(14));
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // Ignore already stopped
      }
      recognitionRef.current = null;
    }
    setIsListening(false);
    setInterimText('');
    stopAudioWaveform();
  }, [stopAudioWaveform]);

  const speakText = useCallback(
    (text: string) => {
      if (!ttsSupported || !voiceEnabled) return;
      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.98;
        utterance.pitch = 1.0;
        utterance.onstart = () => setIsSpeakingQuestion(true);
        utterance.onend = () => setIsSpeakingQuestion(false);
        utterance.onerror = () => setIsSpeakingQuestion(false);
        window.speechSynthesis.speak(utterance);
      } catch {
        setIsSpeakingQuestion(false);
      }
    },
    [ttsSupported, voiceEnabled]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopListening();
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [stopListening]);

  // Per-question timer
  useEffect(() => {
    if (!sessionActive) return;
    const interval = window.setInterval(() => {
      setQuestionSeconds((s) => s + 1);
    }, 1000);
    return () => window.clearInterval(interval);
  }, [sessionActive, currentIdx]);

  // Speak each new question when session progresses
  useEffect(() => {
    if (sessionActive && questions[currentIdx] && voiceEnabled) {
      speakText(questions[currentIdx].prompt);
    }
  }, [sessionActive, currentIdx, questions, voiceEnabled, speakText]);

  if (isHydrating) {
    return <ScreenSkeleton cards={2} />;
  }

  const chosenJob: SavedJob | undefined = state.savedJobs.find(
    (j) => j.id === chosenJobId
  );

  const startWaveformAnalyser = async () => {
    try {
      if (!navigator.mediaDevices?.getUserMedia) return;
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;

      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 64;
      source.connect(analyser);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const updateBars = () => {
        analyser.getByteFrequencyData(dataArray);
        const next = Array.from({ length: 24 }, (_, idx) => {
          const raw = dataArray[idx % dataArray.length] || 0;
          return Math.max(12, Math.min(100, Math.round((raw / 255) * 100)));
        });
        setWaveBars(next);
        animFrameRef.current = requestAnimationFrame(updateBars);
      };
      updateBars();
    } catch {
      // If getUserMedia fails, gentle rhythmic cadence while SpeechRecognition runs
      const tick = () => {
        setWaveBars(
          Array.from({ length: 24 }, (_, i) =>
            Math.round(22 + Math.sin(Date.now() / 160 + i * 0.6) * 16)
          )
        );
        animFrameRef.current = requestAnimationFrame(tick);
      };
      tick();
    }
  };

  const handleToggleMic = async () => {
    if (isListening) {
      stopListening();
      return;
    }

    const RecognitionCtor = getSpeechRecognitionConstructor();
    if (!RecognitionCtor) {
      setPreferTyping(true);
      setMicError(
        'SpeechRecognition is unavailable in this browser. Type your response below.'
      );
      return;
    }

    // Stop interviewer TTS before listening so mic does not transcribe the question
    if (ttsSupported) {
      window.speechSynthesis.cancel();
      setIsSpeakingQuestion(false);
    }

    try {
      setMicError(null);
      const recognition = new RecognitionCtor();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: SpeechRecognitionEventLike) => {
        let finalChunk = '';
        let interimChunk = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalChunk += transcript + ' ';
          } else {
            interimChunk += transcript;
          }
        }
        if (finalChunk) {
          setAnswerDraft((prev) =>
            (prev ? `${prev.trim()} ${finalChunk.trim()}` : finalChunk.trim())
          );
        }
        setInterimText(interimChunk);
      };

      recognition.onerror = (ev: { error: string }) => {
        if (ev.error === 'not-allowed' || ev.error === 'service-not-allowed') {
          setMicError(
            'Microphone access was denied. Switched automatically to typed-answer mode.'
          );
          setPreferTyping(true);
          stopListening();
        } else if (ev.error !== 'no-speech' && ev.error !== 'aborted') {
          setMicError(`Voice capture paused (${ev.error}). You can resume mic or type below.`);
          stopListening();
        }
      };

      recognition.onend = () => {
        setIsListening(false);
        setInterimText('');
        stopAudioWaveform();
      };

      recognitionRef.current = recognition;
      recognition.start();
      setIsListening(true);
      setUsedVoiceThisQuestion(true);
      await startWaveformAnalyser();
    } catch {
      setMicError('Could not start microphone capture. Please type your answer below.');
      setPreferTyping(true);
      stopListening();
    }
  };

  const handleStartSession = () => {
    if (!chosenJob) return;
    setSelectedInterviewJobId(chosenJob.id);
    const generated = generateInterviewQuestions(chosenJob, questionCount);
    setQuestions(generated);
    setCurrentIdx(0);
    setRecordedAnswers([]);
    setAnswerDraft('');
    setInterimText('');
    setQuestionSeconds(0);
    setUsedVoiceThisQuestion(false);
    setSessionActive(true);
  };

  const handleSubmitAnswer = () => {
    if (!chosenJob || !questions[currentIdx]) return;
    const combinedAnswer = `${answerDraft} ${interimText}`.trim();
    if (combinedAnswer.length < 10) {
      showToast({
        type: 'warning',
        title: 'Answer is too brief',
        description: 'Speak or type at least a full sentence before submitting.',
      });
      return;
    }

    stopListening();
    if (ttsSupported) window.speechSynthesis.cancel();

    const currentQ = questions[currentIdx];
    const breakdown = scoreInterviewAnswer(
      combinedAnswer,
      currentQ,
      chosenJob.tags
    );

    const record: QuestionAnswerRecord = {
      questionId: currentQ.id,
      questionPrompt: currentQ.prompt,
      focusArea: currentQ.focusArea,
      sampleTip: currentQ.sampleTip,
      answerText: combinedAnswer,
      durationSeconds: Math.max(5, questionSeconds),
      inputMethod: usedVoiceThisQuestion ? 'voice' : 'typed',
      breakdown,
    };

    const updatedAnswers = [...recordedAnswers, record];

    if (currentIdx + 1 < questions.length) {
      setRecordedAnswers(updatedAnswers);
      setCurrentIdx((i) => i + 1);
      setAnswerDraft('');
      setInterimText('');
      setQuestionSeconds(0);
      setUsedVoiceThisQuestion(false);
      showToast({
        type: 'info',
        title: `Question ${currentIdx + 1} scored: ${breakdown.total}/100`,
        description: `Moving to question ${currentIdx + 2} of ${questions.length}.`,
      });
    } else {
      // Finalize session & compute overall pass probability
      const avgScore = Math.round(
        updatedAnswers.reduce((sum, a) => sum + a.breakdown.total, 0) /
          updatedAnswers.length
      );
      const consistencyBonus = updatedAnswers.every((a) => a.breakdown.total >= 65)
        ? 4
        : 0;
      const passChance = Math.max(18, Math.min(97, avgScore + consistencyBonus));
      const totalDurationSeconds = updatedAnswers.reduce(
        (sum, a) => sum + a.durationSeconds,
        0
      );

      // Deduplicate top strengths and key improvements across answers
      const topStrengths = Array.from(
        new Set(updatedAnswers.flatMap((a) => a.breakdown.strengths))
      ).slice(0, 4);
      const keyImprovements = Array.from(
        new Set(updatedAnswers.flatMap((a) => a.breakdown.improvements))
      ).slice(0, 4);

      const report: InterviewReport = {
        id: `rep-${Date.now()}`,
        jobId: chosenJob.id,
        jobTitle: chosenJob.title,
        company: chosenJob.company,
        completedAt: new Date().toISOString(),
        overallScore: avgScore,
        passChance,
        totalDurationSeconds,
        topStrengths:
          topStrengths.length > 0
            ? topStrengths
            : ['Completed all interview questions with relevant context.'],
        keyImprovements:
          keyImprovements.length > 0
            ? keyImprovements
            : ['Continue refining STAR metrics to push every answer above 90%.'],
        answers: updatedAnswers,
      };

      recordInterviewReport(report);
      setSessionActive(false);
      showToast({
        type: 'success',
        title: `Interview complete · ${avgScore}% score`,
        description: 'Your STAR breakdown and pass-chance report are ready.',
      });
      navigate('report');
    }
  };

  // ==========================================================================
  // VIEW 1: CHOOSE A SAVED JOB FIRST
  // ==========================================================================
  if (!sessionActive) {
    return (
      <div className="space-y-8">
        <div>
          <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
            Step 06 · Voice & STAR Rehearsal
          </p>
          <h1 className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Mock Interview Studio
          </h1>
          <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400 max-w-2xl">
            Choose a saved job below to tailor your interview questions. Our Web Speech
            interviewer reads each prompt aloud, transcribes your spoken response, and
            scores STAR structure, metrics, keywords, and filler words locally.
          </p>
        </div>

        {state.savedJobs.length === 0 ? (
          <EmptyState
            icon={<Briefcase className="w-5 h-5" aria-hidden="true" />}
            title="Save at least one job before starting an interview"
            description="CareerPilot generates role- and company-specific interview questions from your Saved Jobs board."
            actionLabel="Browse & Save a Job"
            onAction={() => navigate('jobs')}
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Saved Job Selector */}
            <div className="lg:col-span-8 space-y-3">
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                1. Choose which saved job you are interviewing for
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {state.savedJobs.map((job) => {
                  const selected = job.id === chosenJobId;
                  return (
                    <button
                      key={job.id}
                      type="button"
                      onClick={() => setChosenJobId(job.id)}
                      className={[
                        'p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-3',
                        selected
                          ? 'bg-indigo-50/80 dark:bg-indigo-950/50 border-indigo-500 dark:border-indigo-400 shadow-xs'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700',
                      ].join(' ')}
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                            {job.company} · {job.stage}
                          </span>
                          {selected && (
                            <CheckCircle2
                              className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0"
                              aria-label="Selected"
                            />
                          )}
                        </div>
                        <h3 className="mt-1 text-sm font-bold text-slate-900 dark:text-white">
                          {job.title}
                        </h3>
                      </div>

                      <p className="text-xs text-slate-400 dark:text-slate-500 truncate">
                        {job.tags.slice(0, 4).join(' · ')}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Session Configuration Panel */}
            <Card padding="lg" className="lg:col-span-4 space-y-5">
              <div>
                <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                  2. Session Setup
                </h2>
                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                  {chosenJob
                    ? `${chosenJob.title} at ${chosenJob.company}`
                    : 'Select a saved job'}
                </p>
              </div>

              <div className="space-y-2">
                <span className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                  Number of questions
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {([3, 5] as const).map((cnt) => (
                    <button
                      key={cnt}
                      type="button"
                      onClick={() => setQuestionCount(cnt)}
                      className={[
                        'min-h-[40px] px-3 py-2 rounded-xl border text-xs font-semibold cursor-pointer transition-colors',
                        questionCount === cnt
                          ? 'bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-slate-950 dark:border-white'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300',
                      ].join(' ')}
                    >
                      {cnt} Questions {cnt === 5 ? '(Full)' : '(Quick)'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-800 space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                <p className="font-semibold text-slate-900 dark:text-white">
                  How your score is calculated (100 pts):
                </p>
                <p>· Depth & Pacing (25) · STAR Structure (25)</p>
                <p>· Quantified Metrics (20) · Job Keywords (20)</p>
                <p>· Crisp Delivery / Low Filler Words (10)</p>
              </div>

              {!speechSupported && (
                <p className="text-xs text-amber-700 dark:text-amber-300">
                  Note: Your browser does not expose Web SpeechRecognition, so typed-answer
                  fallback will activate automatically.
                </p>
              )}

              <Button
                variant="primary"
                size="lg"
                fullWidth
                disabled={!chosenJob}
                leftIcon={<Play className="w-4 h-4" aria-hidden="true" />}
                onClick={handleStartSession}
              >
                Begin Mock Interview
              </Button>
            </Card>
          </div>
        )}
      </div>
    );
  }

  // ==========================================================================
  // VIEW 2: ACTIVE INTERVIEW STUDIO
  // ==========================================================================
  const activeQuestion = questions[currentIdx];
  const liveCombined = `${answerDraft}${interimText ? ` ${interimText}` : ''}`.trim();
  const liveWordCount = liveCombined ? liveCombined.split(/\s+/).length : 0;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Session Status Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Badge variant="accent">
            Question {currentIdx + 1} of {questions.length}
          </Badge>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {chosenJob?.title} · {chosenJob?.company}
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-mono-num text-xs font-semibold text-slate-700 dark:text-slate-200">
            <Clock className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" aria-hidden="true" />
            {formatTimer(questionSeconds)}
          </span>

          {ttsSupported && (
            <button
              type="button"
              onClick={() => {
                if (voiceEnabled) {
                  window.speechSynthesis.cancel();
                  setIsSpeakingQuestion(false);
                }
                setVoiceEnabled((v) => !v);
              }}
              aria-label={voiceEnabled ? 'Mute interviewer voice' : 'Unmute interviewer voice'}
              className="min-h-[38px] px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-medium text-slate-600 dark:text-slate-300 inline-flex items-center gap-1.5 cursor-pointer"
            >
              {voiceEnabled ? (
                <>
                  <Volume2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" aria-hidden="true" />
                  <span>Voice On</span>
                </>
              ) : (
                <>
                  <VolumeX className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Muted</span>
                </>
              )}
            </button>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              stopListening();
              if (ttsSupported) window.speechSynthesis.cancel();
              setSessionActive(false);
            }}
          >
            Exit
          </Button>
        </div>
      </div>

      <ProgressBar
        value={((currentIdx + 1) / questions.length) * 100}
        size="sm"
      />

      {/* Question Prompt Card */}
      <Card padding="lg" className="space-y-4">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
            Focus: {activeQuestion.focusArea}
          </span>
          {ttsSupported && (
            <button
              type="button"
              onClick={() => speakText(activeQuestion.prompt)}
              className="text-xs font-medium text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 inline-flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" aria-hidden="true" />
              <span>{isSpeakingQuestion ? 'Speaking...' : 'Replay Question'}</span>
            </button>
          )}
        </div>

        <h2 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-white leading-relaxed">
          “{activeQuestion.prompt}”
        </h2>
      </Card>

      {/* Mic Error / Unsupported Fallback Notice */}
      {micError && (
        <div
          role="alert"
          className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex items-center justify-between gap-3 text-xs text-amber-900 dark:text-amber-200"
        >
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" aria-hidden="true" />
            <span>{micError}</span>
          </div>
        </div>
      )}

      {/* ====================================================================
          LARGE ANIMATED MICROPHONE + LIVE WAVEFORM STUDIO
          ==================================================================== */}
      <Card padding="lg" className="space-y-6">
        <div className="flex flex-col items-center text-center">
          <button
            type="button"
            onClick={handleToggleMic}
            disabled={!speechSupported}
            aria-label={isListening ? 'Stop recording answer' : 'Start recording answer'}
            aria-pressed={isListening}
            className={[
              'relative w-24 h-24 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer',
              !speechSupported
                ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                : isListening
                  ? 'bg-rose-600 text-white shadow-xl scale-105'
                  : 'bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-lg hover:scale-105',
            ].join(' ')}
          >
            {isListening && (
              <span
                aria-hidden="true"
                className="absolute inset-0 rounded-full bg-rose-500/30 animate-ping motion-reduce:animate-none"
              />
            )}
            {isListening ? (
              <MicOff className="w-9 h-9 relative z-10" aria-hidden="true" />
            ) : (
              <Mic className="w-9 h-9 relative z-10" aria-hidden="true" />
            )}
          </button>

          <p className="mt-3 text-sm font-semibold text-slate-900 dark:text-white">
            {!speechSupported
              ? 'Voice capture unavailable — type your answer below'
              : isListening
                ? 'Listening live... Click mic when finished speaking'
                : 'Tap microphone to speak your answer aloud'}
          </p>

          {/* 24-Bar Live Audio Waveform */}
          <div
            aria-hidden="true"
            className="mt-4 h-12 flex items-center justify-center gap-1 px-4"
          >
            {waveBars.map((heightPct, idx) => (
              <div
                key={idx}
                style={{
                  transform: `scaleY(${isListening ? Math.max(0.18, heightPct / 100) : 0.18})`,
                }}
                className={[
                  'w-1.5 h-10 rounded-full origin-center transition-transform duration-100 motion-reduce:transition-none',
                  isListening
                    ? 'bg-indigo-600 dark:bg-indigo-400'
                    : 'bg-slate-200 dark:bg-slate-800',
                ].join(' ')}
              />
            ))}
          </div>
        </div>

        {/* Transcript & Typed-Answer Fallback Editor */}
        <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between gap-2">
            <label
              htmlFor="interview-answer-box"
              className="text-xs font-semibold text-slate-700 dark:text-slate-300 inline-flex items-center gap-1.5"
            >
              <Keyboard className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" aria-hidden="true" />
              <span>
                {preferTyping
                  ? 'Typed Answer (Fallback Mode)'
                  : 'Live Transcript & Editable Response'}
              </span>
            </label>

            <span className="font-mono-num text-xs text-slate-500 dark:text-slate-400">
              {liveWordCount} words (aim for 65–160)
            </span>
          </div>

          <textarea
            id="interview-answer-box"
            rows={5}
            placeholder="Structure your answer using STAR: Situation -> Task -> Action -> Result, including numbers or outcomes..."
            value={answerDraft + (interimText ? ` ${interimText}` : '')}
            onChange={(e) => {
              setInterimText('');
              setAnswerDraft(e.target.value);
            }}
            className="w-full rounded-xl p-3.5 text-sm bg-slate-50/70 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:border-indigo-500 leading-relaxed"
          />

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Tip: {activeQuestion.sampleTip}
            </p>

            <Button
              variant="primary"
              size="md"
              rightIcon={<ArrowRight className="w-4 h-4" aria-hidden="true" />}
              onClick={handleSubmitAnswer}
            >
              {currentIdx + 1 === questions.length
                ? 'Finish & Generate Report'
                : 'Submit & Next Question'}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
