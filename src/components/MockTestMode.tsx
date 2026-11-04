import React, { useState } from 'react';
import { TopicId, DifficultyLevel, Question, TestResult } from '../types/math';
import { TOPICS } from '../data/questionBank';
import { generateMockTestQuestions } from '../utils/questionGenerator';
import { MathRenderer } from './MathRenderer';
import { sound } from '../utils/sound';
import { 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  ArrowLeft, 
  Flag, 
  RotateCcw, 
  FileText, 
  AlertCircle,
  Lightbulb,
  Check
} from 'lucide-react';

interface MockTestModeProps {
  onSwitchToPractice: () => void;
  onOpenHandbook: () => void;
}

export const MockTestMode: React.FC<MockTestModeProps> = ({ onSwitchToPractice, onOpenHandbook }) => {
  // Test Setup States
  const [testState, setTestState] = useState<'config' | 'in-progress' | 'results'>('config');
  const [questionCount, setQuestionCount] = useState<number>(10);
  const [difficultyFilter, setDifficultyFilter] = useState<'balanced' | DifficultyLevel>('balanced');
  const [selectedTopics, setSelectedTopics] = useState<TopicId[]>([
    'simplifying',
    'multiplication',
    'division',
    'addition',
    'combined',
  ]);

  // Active Test States
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({}); // questionId -> optionId
  const [flaggedQuestions, setFlaggedQuestions] = useState<Record<string, boolean>>({});
  const [showSubmitConfirm, setShowSubmitConfirm] = useState<boolean>(false);

  // Result State
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [reviewFilter, setReviewFilter] = useState<'all' | 'incorrect' | 'correct'>('all');

  // Start the test
  const handleStartTest = () => {
    sound.playSwitch();
    const diffs: DifficultyLevel[] = difficultyFilter === 'balanced' 
      ? [1, 2, 3, 4, 5] 
      : [difficultyFilter];

    const testQuestions = generateMockTestQuestions(questionCount, selectedTopics, diffs);
    setQuestions(testQuestions);
    setCurrentIndex(0);
    setUserAnswers({});
    setFlaggedQuestions({});
    setTestState('in-progress');
  };

  const handleSelectOption = (optionId: string) => {
    sound.playClick();
    const currentQ = questions[currentIndex];
    setUserAnswers(prev => ({
      ...prev,
      [currentQ.id]: optionId,
    }));
  };

  const handleToggleFlag = () => {
    sound.playClick();
    const currentQ = questions[currentIndex];
    setFlaggedQuestions(prev => ({
      ...prev,
      [currentQ.id]: !prev[currentQ.id],
    }));
  };

  const handleJumpToQuestion = (index: number) => {
    sound.playClick();
    setCurrentIndex(index);
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      sound.playClick();
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      sound.playClick();
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handlePromptSubmit = () => {
    sound.playClick();
    setShowSubmitConfirm(true);
  };

  const handleFinalSubmit = () => {
    sound.playSuccess();
    setShowSubmitConfirm(false);

    // Calculate diagnostic results
    let correctCount = 0;
    const breakdown: Record<TopicId, { total: number; correct: number }> = {
      simplifying: { total: 0, correct: 0 },
      multiplication: { total: 0, correct: 0 },
      division: { total: 0, correct: 0 },
      addition: { total: 0, correct: 0 },
      combined: { total: 0, correct: 0 },
    };

    questions.forEach(q => {
      breakdown[q.topic].total += 1;
      const userSelected = userAnswers[q.id];
      const correctOption = q.options.find(o => o.isCorrect);

      if (userSelected && correctOption && userSelected === correctOption.id) {
        correctCount += 1;
        breakdown[q.topic].correct += 1;
      }
    });

    const result: TestResult = {
      totalQuestions: questions.length,
      correctAnswers: correctCount,
      topicBreakdown: breakdown,
      userAnswers: { ...userAnswers },
      questions: [...questions],
      completedAt: new Date(),
    };

    setTestResult(result);
    setTestState('results');
  };

  const answeredCount = Object.keys(userAnswers).length;
  const unansweredCount = questions.length - answeredCount;

  // -----------------------------------------------------------
  // 1. TEST CONFIGURATION SCREEN
  // -----------------------------------------------------------
  if (testState === 'config') {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <div 
          className="retro-box p-6 space-y-6"
          style={{ borderColor: 'var(--color-border-bright,#b45309)' }}
        >
          <div className="border-b pb-3" style={{ borderColor: 'var(--color-border,#78350f)' }}>
            <h2 className="text-xl sm:text-2xl font-bold font-mono text-[var(--color-primary-bright,#fbbf24)]">
              MOCK TEST CONFIGURATION
            </h2>
            <p className="text-xs sm:text-sm font-mono text-[var(--color-text-dim,#b45309)] mt-1">
              Test your mastery of radical operations under realistic exam conditions. Receive complete step-by-step diagnostic feedback upon submission.
            </p>
          </div>

          {/* Setting 1: Question Count */}
          <div className="space-y-2">
            <label className="text-xs font-mono text-[var(--color-text-dim,#b45309)] uppercase tracking-wider block">
              1. Number of Questions:
            </label>
            <div className="flex flex-wrap gap-2">
              {[5, 10, 15, 20].map(cnt => (
                <button
                  key={cnt}
                  onClick={() => {
                    sound.playClick();
                    setQuestionCount(cnt);
                  }}
                  className={`px-4 py-2 font-mono text-sm border transition-all ${
                    questionCount === cnt
                      ? 'bg-[var(--color-primary,#f59e0b)] text-black font-bold border-[var(--color-primary-bright,#fbbf24)]'
                      : 'bg-[var(--color-surface,#1c150c)] text-[var(--color-text,#fef3c7)] border-[var(--color-border,#78350f)] hover:border-[var(--color-primary,#f59e0b)]'
                  }`}
                >
                  {cnt} Questions
                </button>
              ))}
            </div>
          </div>

          {/* Setting 2: Difficulty Scope */}
          <div className="space-y-2">
            <label className="text-xs font-mono text-[var(--color-text-dim,#b45309)] uppercase tracking-wider block">
              2. Difficulty Distribution:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 font-mono text-xs">
              <button
                onClick={() => {
                  sound.playClick();
                  setDifficultyFilter('balanced');
                }}
                className={`p-2.5 border text-left transition-all ${
                  difficultyFilter === 'balanced'
                    ? 'bg-[var(--color-primary,#f59e0b)] text-black font-bold border-[var(--color-primary-bright,#fbbf24)]'
                    : 'bg-[var(--color-surface,#1c150c)] text-[var(--color-text,#fef3c7)] border-[var(--color-border,#78350f)]'
                }`}
              >
                <div className="font-bold">Balanced Mix</div>
                <div className="text-[10px] opacity-75">Levels 1 through 5</div>
              </button>

              {([1, 2, 3, 4, 5] as DifficultyLevel[]).map(lvl => (
                <button
                  key={lvl}
                  onClick={() => {
                    sound.playClick();
                    setDifficultyFilter(lvl);
                  }}
                  className={`p-2.5 border text-left transition-all ${
                    difficultyFilter === lvl
                      ? 'bg-[var(--color-primary,#f59e0b)] text-black font-bold border-[var(--color-primary-bright,#fbbf24)]'
                      : 'bg-[var(--color-surface,#1c150c)] text-[var(--color-text,#fef3c7)] border-[var(--color-border,#78350f)]'
                  }`}
                >
                  <div className="font-bold">Level {lvl} Only</div>
                  <div className="text-[10px] opacity-75">Specific tier</div>
                </button>
              ))}
            </div>
          </div>

          {/* Setting 3: Topic Scope */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono text-[var(--color-text-dim,#b45309)] uppercase tracking-wider">
                3. Included Topics ({selectedTopics.length} of {TOPICS.length} selected):
              </label>
              <button
                onClick={() => {
                  sound.playClick();
                  setSelectedTopics(
                    selectedTopics.length === TOPICS.length
                      ? [TOPICS[0].id]
                      : TOPICS.map(t => t.id)
                  );
                }}
                className="text-[11px] font-mono underline text-[var(--color-text-dim,#b45309)] hover:text-[var(--color-primary-bright,#fbbf24)]"
              >
                {selectedTopics.length === TOPICS.length ? 'Deselect All' : 'Select All'}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {TOPICS.map(t => {
                const isChecked = selectedTopics.includes(t.id);
                return (
                  <button
                    key={t.id}
                    onClick={() => {
                      sound.playClick();
                      if (isChecked && selectedTopics.length > 1) {
                        setSelectedTopics(selectedTopics.filter(id => id !== t.id));
                      } else if (!isChecked) {
                        setSelectedTopics([...selectedTopics, t.id]);
                      }
                    }}
                    className={`p-3 border text-left flex items-start gap-2.5 transition-all ${
                      isChecked
                        ? 'border-[var(--color-primary-bright,#fbbf24)] bg-black/40 text-[var(--color-text,#fef3c7)]'
                        : 'border-[var(--color-border,#78350f)] bg-[var(--color-surface,#1c150c)] opacity-60'
                    }`}
                  >
                    <span className={`w-4 h-4 mt-0.5 border flex items-center justify-center shrink-0 ${
                      isChecked ? 'bg-[var(--color-primary,#f59e0b)] border-black text-black' : 'border-current'
                    }`}>
                      {isChecked && <Check className="w-3 h-3" />}
                    </span>
                    <div className="font-mono text-xs">
                      <div className="font-bold">{t.name}</div>
                      <div className="text-[10px] text-[var(--color-text-dim,#b45309)] line-clamp-1">{t.description}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action to Start Test */}
          <div className="pt-4 border-t flex flex-col sm:flex-row items-center justify-between gap-4" style={{ borderColor: 'var(--color-border,#78350f)' }}>
            <div className="text-xs font-mono text-[var(--color-text-dim,#b45309)] flex items-center gap-1.5">
              <span>UNLIMITED PRACTICE</span>
              <span>· NO TIMERS</span>
              <span>· FULL EXPLANATIONS POST-SUBMISSION</span>
            </div>

            <button
              onClick={handleStartTest}
              className="retro-btn-primary px-8 py-3 text-sm font-mono uppercase tracking-wider flex items-center gap-2 w-full sm:w-auto justify-center"
            >
              <span>BEGIN MOCK TEST</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // -----------------------------------------------------------
  // 2. ACTIVE TEST IN PROGRESS SCREEN
  // -----------------------------------------------------------
  if (testState === 'in-progress' && questions.length > 0) {
    const currentQ = questions[currentIndex];
    const isAnswered = !!userAnswers[currentQ.id];
    const isFlagged = !!flaggedQuestions[currentQ.id];

    return (
      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {/* Test Progress & Jump Palette */}
        <div 
          className="retro-box p-4 space-y-3"
          style={{ borderColor: 'var(--color-border,#78350f)' }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-2" style={{ borderColor: 'var(--color-border,#78350f)' }}>
            <div className="flex items-center gap-2 font-mono text-xs sm:text-sm">
              <span className="text-[var(--color-primary-bright,#fbbf24)] font-bold">
                QUESTION {currentIndex + 1} OF {questions.length}
              </span>
              <span className="text-[var(--color-text-dim,#b45309)]">
                ({answeredCount} of {questions.length} answered)
              </span>
            </div>

            <div className="flex items-center gap-2 font-mono text-xs">
              <button
                onClick={handleToggleFlag}
                className={`px-2.5 py-1 border flex items-center gap-1.5 transition-colors ${
                  isFlagged
                    ? 'border-amber-400 bg-amber-400/20 text-amber-300 font-bold'
                    : 'border-[var(--color-border,#78350f)] text-[var(--color-text-dim,#b45309)] hover:text-[var(--color-text,#fef3c7)]'
                }`}
              >
                <Flag className="w-3.5 h-3.5" />
                <span>{isFlagged ? 'FLAGGED FOR REVIEW' : 'FLAG QUESTION'}</span>
              </button>

              <button
                onClick={handlePromptSubmit}
                className="retro-btn-primary px-3 py-1 font-bold text-xs"
              >
                SUBMIT TEST
              </button>
            </div>
          </div>

          {/* Question Grid Jump Palette */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {questions.map((q, idx) => {
              const answered = !!userAnswers[q.id];
              const flagged = !!flaggedQuestions[q.id];
              const isCurrent = idx === currentIndex;

              let btnStyle = 'border-[var(--color-border,#78350f)] bg-[var(--color-surface,#1c150c)] text-[var(--color-text-dim,#b45309)]';
              if (isCurrent) {
                btnStyle = 'border-[var(--color-primary-bright,#fbbf24)] bg-[var(--color-primary,#f59e0b)] text-black font-bold';
              } else if (answered) {
                btnStyle = 'border-[var(--color-border-bright,#b45309)] bg-black/40 text-[var(--color-text,#fef3c7)] font-semibold';
              }

              return (
                <button
                  key={q.id}
                  onClick={() => handleJumpToQuestion(idx)}
                  className={`w-7 h-7 sm:w-8 sm:h-8 border text-xs font-mono relative flex items-center justify-center transition-all ${btnStyle}`}
                  title={`Question ${idx + 1}: ${answered ? 'Answered' : 'Unanswered'}${flagged ? ' (Flagged)' : ''}`}
                >
                  <span>{idx + 1}</span>
                  {flagged && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-amber-400 rounded-full" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Current Question Card */}
        <div 
          className="retro-box p-6 space-y-6"
          style={{ borderColor: 'var(--color-border-bright,#b45309)' }}
        >
          {/* Question Details Bar */}
          <div className="flex items-center justify-between text-xs font-mono border-b pb-3" style={{ borderColor: 'var(--color-border,#78350f)' }}>
            <span className="px-2 py-0.5 bg-black/40 border border-[var(--color-border,#78350f)] text-[var(--color-primary-bright,#fbbf24)] font-bold">
              DIFFICULTY: LEVEL {currentQ.difficulty} / 5
            </span>
            <span className="text-[var(--color-text-dim,#b45309)]">
              TOPIC: {TOPICS.find(t => t.id === currentQ.topic)?.name}
            </span>
          </div>

          {/* Prompt and Math Expression */}
          <div className="space-y-4">
            <p className="text-base sm:text-lg font-mono text-[var(--color-text,#fef3c7)]">
              {currentQ.prompt}
            </p>

            <div 
              className="p-6 text-center border-2 bg-black/50 overflow-x-auto min-h-[90px] flex items-center justify-center"
              style={{ borderColor: 'var(--color-border,#78350f)' }}
            >
              <MathRenderer math={currentQ.expression} size="xl" className="text-[var(--color-primary-bright,#fbbf24)]" />
            </div>
          </div>

          {/* Multiple-Choice Options */}
          <div className="space-y-2">
            <div className="text-xs font-mono text-[var(--color-text-dim,#b45309)]">
              SELECT YOUR ANSWER:
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {currentQ.options.map(option => {
                const isSelected = userAnswers[currentQ.id] === option.id;

                return (
                  <button
                    key={option.id}
                    onClick={() => handleSelectOption(option.id)}
                    className={`w-full p-4 border-2 text-left flex items-center gap-3 transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[var(--color-primary-bright,#fbbf24)] bg-[var(--color-primary,#f59e0b)]/20 shadow-sm'
                        : 'border-[var(--color-border,#78350f)] bg-[var(--color-surface,#1c150c)] hover:border-[var(--color-primary,#f59e0b)]'
                    }`}
                  >
                    <span className="w-7 h-7 shrink-0 flex items-center justify-center font-mono font-bold border border-current text-sm">
                      {option.label}
                    </span>
                    <div className="flex-1 overflow-x-auto py-1">
                      <MathRenderer math={option.math} size="lg" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-4 border-t" style={{ borderColor: 'var(--color-border,#78350f)' }}>
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="retro-btn px-4 py-2 font-mono text-xs flex items-center gap-1.5 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>PREVIOUS</span>
            </button>

            <div className="text-xs font-mono text-[var(--color-text-dim,#b45309)]">
              {isAnswered ? '● Answer recorded' : '○ Not yet answered'}
            </div>

            {currentIndex < questions.length - 1 ? (
              <button
                onClick={handleNext}
                className="retro-btn px-4 py-2 font-mono text-xs flex items-center gap-1.5"
              >
                <span>NEXT</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={handlePromptSubmit}
                className="retro-btn-primary px-5 py-2 font-mono text-xs font-bold"
              >
                FINISH & SUBMIT
              </button>
            )}
          </div>
        </div>

        {/* Confirmation Modal before Submit */}
        {showSubmitConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
            <div 
              className="retro-box p-6 max-w-md w-full space-y-4 font-mono"
              style={{ backgroundColor: 'var(--color-bg,#120e06)', borderColor: 'var(--color-border-bright,#b45309)' }}
            >
              <div className="flex items-center gap-2 text-base font-bold text-[var(--color-primary-bright,#fbbf24)]">
                <AlertCircle className="w-5 h-5 text-amber-400" />
                <span>CONFIRM TEST SUBMISSION</span>
              </div>

              <div className="text-xs space-y-2 text-[var(--color-text,#fef3c7)]">
                <p>Are you sure you want to finalize and grade this mock test?</p>
                {unansweredCount > 0 ? (
                  <div className="p-3 bg-amber-950/40 border border-amber-600 text-amber-300">
                    ⚠ Warning: You have <strong>{unansweredCount}</strong> unanswered {unansweredCount === 1 ? 'question' : 'questions'}.
                  </div>
                ) : (
                  <div className="p-3 bg-emerald-950/40 border border-emerald-600 text-emerald-300">
                    ✔ All {questions.length} questions have been answered.
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t" style={{ borderColor: 'var(--color-border,#78350f)' }}>
                <button
                  onClick={() => setShowSubmitConfirm(false)}
                  className="retro-btn px-4 py-2 text-xs"
                >
                  RETURN TO TEST
                </button>
                <button
                  onClick={handleFinalSubmit}
                  className="retro-btn-primary px-5 py-2 text-xs font-bold"
                >
                  YES, SUBMIT TEST
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // -----------------------------------------------------------
  // 3. POST-TEST RESULTS & COMPREHENSIVE SOLUTIONS REPORT
  // -----------------------------------------------------------
  if (testState === 'results' && testResult) {
    const percentage = Math.round((testResult.correctAnswers / testResult.totalQuestions) * 100);

    const filteredQuestions = testResult.questions.filter(q => {
      const userSel = testResult.userAnswers[q.id];
      const correctOpt = q.options.find(o => o.isCorrect);
      const isCorrect = userSel === correctOpt?.id;

      if (reviewFilter === 'correct') return isCorrect;
      if (reviewFilter === 'incorrect') return !isCorrect;
      return true;
    });

    return (
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        {/* Diagnostic Score Summary Card */}
        <div 
          className="retro-box p-6 sm:p-8 space-y-6"
          style={{ borderColor: 'var(--color-border-bright,#b45309)' }}
        >
          <div className="border-b pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3" style={{ borderColor: 'var(--color-border,#78350f)' }}>
            <div>
              <h2 className="text-2xl font-bold font-mono text-[var(--color-primary-bright,#fbbf24)]">
                MOCK TEST DIAGNOSTIC REPORT
              </h2>
              <div className="text-xs font-mono text-[var(--color-text-dim,#b45309)]">
                EVALUATED AT: {testResult.completedAt.toLocaleTimeString()} · COMPLETE REVIEW
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setTestState('config')}
                className="retro-btn px-4 py-2 font-mono text-xs flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>NEW MOCK TEST</span>
              </button>

              <button
                onClick={onSwitchToPractice}
                className="retro-btn-primary px-4 py-2 font-mono text-xs font-bold"
              >
                PRACTICE WEAK AREAS
              </button>
            </div>
          </div>

          {/* Big Score Block */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center font-mono">
            <div className="p-4 bg-black/40 border border-[var(--color-border,#78350f)]">
              <div className="text-xs text-[var(--color-text-dim,#b45309)]">OVERALL ACCURACY</div>
              <div className="text-3xl sm:text-4xl font-extrabold text-[var(--color-primary-bright,#fbbf24)] my-1">
                {percentage}%
              </div>
              <div className="text-xs">
                {testResult.correctAnswers} / {testResult.totalQuestions} Solved Correctly
              </div>
            </div>

            <div className="p-4 bg-black/40 border border-[var(--color-border,#78350f)]">
              <div className="text-xs text-[var(--color-text-dim,#b45309)]">UNANSWERED / MISSED</div>
              <div className="text-3xl sm:text-4xl font-extrabold text-[var(--color-error,#ef4444)] my-1">
                {testResult.totalQuestions - testResult.correctAnswers}
              </div>
              <div className="text-xs text-[var(--color-text-dim,#b45309)]">
                Items Requiring Review
              </div>
            </div>

            <div className="p-4 bg-black/40 border border-[var(--color-border,#78350f)] flex flex-col justify-center">
              <div className="text-xs text-[var(--color-text-dim,#b45309)]">DIAGNOSTIC STATUS</div>
              <div className="text-lg font-bold text-[var(--color-text,#fef3c7)] my-1">
                {percentage >= 80 ? 'HIGH MASTERY' : percentage >= 50 ? 'FOUNDATION SOLID' : 'NEEDS PRACTICE'}
              </div>
              <div className="text-xs text-[var(--color-text-dim,#b45309)]">
                Refer to topic breakdown below
              </div>
            </div>
          </div>

          {/* Breakdown by Topic */}
          <div className="space-y-3">
            <div className="text-xs font-mono font-bold text-[var(--color-primary-bright,#fbbf24)] uppercase tracking-wider">
              Accuracy by Radical Operation Topic:
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {TOPICS.map(topic => {
                const stats = testResult.topicBreakdown[topic.id];
                if (!stats || stats.total === 0) return null;
                const topicPct = Math.round((stats.correct / stats.total) * 100);

                return (
                  <div 
                    key={topic.id} 
                    className="p-3 border font-mono text-xs space-y-1 bg-[var(--color-surface,#1c150c)]"
                    style={{ borderColor: 'var(--color-border,#78350f)' }}
                  >
                    <div className="flex items-center justify-between font-bold">
                      <span className="text-[var(--color-text,#fef3c7)] truncate">{topic.name}</span>
                      <span className={topicPct >= 70 ? 'text-[var(--color-success,#10b981)]' : 'text-amber-400'}>
                        {stats.correct}/{stats.total} ({topicPct}%)
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-1.5 bg-black/50 border border-[var(--color-border,#78350f)]">
                      <div 
                        className="h-full bg-[var(--color-primary,#f59e0b)]"
                        style={{ width: `${topicPct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Detailed Solutions Section Header */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-2 font-mono" style={{ borderColor: 'var(--color-border,#78350f)' }}>
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-[var(--color-primary-bright,#fbbf24)]" />
              <h3 className="text-lg font-bold text-[var(--color-text,#fef3c7)]">
                QUESTION-BY-QUESTION SOLUTIONS BREAKDOWN
              </h3>
            </div>

            {/* Filter buttons */}
            <div className="flex items-center gap-1.5 text-xs">
              <button
                onClick={() => {
                  sound.playClick();
                  setReviewFilter('all');
                }}
                className={`px-2.5 py-1 border ${
                  reviewFilter === 'all'
                    ? 'bg-[var(--color-primary,#f59e0b)] text-black font-bold'
                    : 'border-[var(--color-border,#78350f)] text-[var(--color-text-dim,#b45309)]'
                }`}
              >
                All ({testResult.questions.length})
              </button>

              <button
                onClick={() => {
                  sound.playClick();
                  setReviewFilter('incorrect');
                }}
                className={`px-2.5 py-1 border ${
                  reviewFilter === 'incorrect'
                    ? 'bg-[var(--color-primary,#f59e0b)] text-black font-bold'
                    : 'border-[var(--color-border,#78350f)] text-[var(--color-text-dim,#b45309)]'
                }`}
              >
                Incorrect ({testResult.totalQuestions - testResult.correctAnswers})
              </button>

              <button
                onClick={() => {
                  sound.playClick();
                  setReviewFilter('correct');
                }}
                className={`px-2.5 py-1 border ${
                  reviewFilter === 'correct'
                    ? 'bg-[var(--color-primary,#f59e0b)] text-black font-bold'
                    : 'border-[var(--color-border,#78350f)] text-[var(--color-text-dim,#b45309)]'
                }`}
              >
                Correct ({testResult.correctAnswers})
              </button>
            </div>
          </div>

          {/* Question Review Cards */}
          <div className="space-y-6">
            {filteredQuestions.map((q, idx) => {
              const originalIndex = testResult.questions.findIndex(item => item.id === q.id);
              const userOptId = testResult.userAnswers[q.id];
              const userOpt = q.options.find(o => o.id === userOptId);
              const correctOpt = q.options.find(o => o.isCorrect);
              const isCorrect = userOpt?.isCorrect;

              return (
                <div 
                  key={q.id}
                  className="retro-box p-6 space-y-4 font-mono"
                  style={{ 
                    borderColor: isCorrect 
                      ? 'var(--color-border,#78350f)' 
                      : 'var(--color-error,#ef4444)' 
                  }}
                >
                  {/* Question Header */}
                  <div className="flex items-center justify-between border-b pb-2 text-xs" style={{ borderColor: 'var(--color-border,#78350f)' }}>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[var(--color-primary-bright,#fbbf24)]">
                        QUESTION #{originalIndex + 1}
                      </span>
                      <span className="text-[var(--color-text-dim,#b45309)]">
                        · {TOPICS.find(t => t.id === q.topic)?.name} · LEVEL {q.difficulty}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 font-bold">
                      {isCorrect ? (
                        <span className="text-[var(--color-success,#10b981)] flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4" />
                          CORRECT
                        </span>
                      ) : (
                        <span className="text-[var(--color-error,#ef4444)] flex items-center gap-1">
                          <XCircle className="w-4 h-4" />
                          INCORRECT
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Expression */}
                  <div className="space-y-2">
                    <p className="text-sm text-[var(--color-text,#fef3c7)]">{q.prompt}</p>
                    <div className="p-4 bg-black/50 border border-[var(--color-border,#78350f)] text-center overflow-x-auto">
                      <MathRenderer math={q.expression} size="lg" className="text-[var(--color-primary-bright,#fbbf24)]" />
                    </div>
                  </div>

                  {/* Options Comparison */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className={`p-3 border ${
                      isCorrect 
                        ? 'border-[var(--color-success,#10b981)] bg-[var(--color-success,#10b981)]/10' 
                        : 'border-[var(--color-error,#ef4444)] bg-[var(--color-error,#ef4444)]/10'
                    }`}>
                      <div className="font-bold mb-1 opacity-75">Your Choice:</div>
                      {userOpt ? (
                        <div className="flex items-center gap-2">
                          <span className="font-bold">{userOpt.label})</span>
                          <MathRenderer math={userOpt.math} size="md" />
                        </div>
                      ) : (
                        <div className="italic text-[var(--color-error,#ef4444)]">Unanswered</div>
                      )}
                    </div>

                    <div className="p-3 border border-[var(--color-success,#10b981)] bg-[var(--color-success,#10b981)]/10">
                      <div className="font-bold mb-1 text-[var(--color-success,#10b981)]">Correct Answer:</div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[var(--color-success,#10b981)]">{correctOpt?.label})</span>
                        <MathRenderer math={correctOpt?.math || ''} size="md" />
                      </div>
                    </div>
                  </div>

                  {/* Misconception explanation if wrong */}
                  {!isCorrect && userOpt && (
                    <div className="p-3 bg-red-950/20 border border-red-800 text-xs text-[var(--color-text,#fef3c7)]">
                      <span className="font-bold text-red-400">Why your choice was incorrect: </span>
                      {userOpt.explanation}
                    </div>
                  )}

                  {/* Complete Step-by-Step Solution Breakdown */}
                  <div className="p-4 border border-[var(--color-border,#78350f)] bg-black/40 space-y-3">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--color-primary-bright,#fbbf24)]">
                      <Lightbulb className="w-3.5 h-3.5" />
                      <span>STEP-BY-STEP SOLUTION ({q.ruleSummary})</span>
                    </div>

                    <div className="space-y-2">
                      {q.solutionSteps.map((step, sIdx) => (
                        <div key={sIdx} className="p-2.5 bg-[var(--color-surface,#1c150c)] border border-[var(--color-border,#78350f)] text-xs space-y-1">
                          <div className="font-bold text-[var(--color-primary,#f59e0b)]">
                            Step {step.stepNumber}: {step.title}
                          </div>
                          <div className="py-1 text-center bg-black/40 border border-[var(--color-border,#78350f)] overflow-x-auto">
                            <MathRenderer math={step.math} size="sm" />
                          </div>
                          <p className="text-[var(--color-text-dim,#b45309)]">
                            {step.explanation}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return null;
};
