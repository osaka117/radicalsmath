import React, { useState, useEffect } from 'react';
import { TopicId, DifficultyLevel, Question } from '../types/math';
import { TOPICS } from '../data/questionBank';
import { getQuestion } from '../utils/questionGenerator';
import { MathRenderer } from './MathRenderer';
import { sound } from '../utils/sound';
import { CheckCircle2, XCircle, ArrowRight, RefreshCw, AlertTriangle, Lightbulb, BookOpen } from 'lucide-react';

interface PracticeModeProps {
  onOpenHandbook: () => void;
}

export const PracticeMode: React.FC<PracticeModeProps> = ({ onOpenHandbook }) => {
  const [selectedTopic, setSelectedTopic] = useState<TopicId | 'all'>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyLevel | 'all'>('all');
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [showFullSolution, setShowFullSolution] = useState<boolean>(false);
  const [historyIds, setHistoryIds] = useState<string[]>([]);
  const [sessionCount, setSessionCount] = useState<number>(0);

  // Load initial question or when filters change
  const loadNewQuestion = (topic = selectedTopic, diff = selectedDifficulty) => {
    const q = getQuestion(topic, diff, historyIds);
    setCurrentQuestion(q);
    setSelectedOptionId(null);
    setIsSubmitted(false);
    setShowFullSolution(false);
    setHistoryIds(prev => [...prev.slice(-20), q.id]);
  };

  useEffect(() => {
    loadNewQuestion();
  }, [selectedTopic, selectedDifficulty]);

  const handleSelectOption = (optionId: string) => {
    if (isSubmitted) return;
    sound.playClick();
    setSelectedOptionId(optionId);
  };

  const handleSubmitAnswer = () => {
    if (!selectedOptionId || !currentQuestion || isSubmitted) return;

    const chosen = currentQuestion.options.find(o => o.id === selectedOptionId);
    if (chosen?.isCorrect) {
      sound.playSuccess();
    } else {
      sound.playError();
    }

    setIsSubmitted(true);
    setSessionCount(prev => prev + 1);
  };

  const handleNext = () => {
    sound.playClick();
    loadNewQuestion();
  };

  const handleToggleSolution = () => {
    sound.playClick();
    setShowFullSolution(!showFullSolution);
  };

  const difficultyLabels: Record<DifficultyLevel, { name: string; desc: string }> = {
    1: { name: 'Level 1: Fundamentals', desc: 'Basic square roots & like radical addition' },
    2: { name: 'Level 2: Intermediate', desc: 'Cube roots, coefficients, basic multiplication/quotients' },
    3: { name: 'Level 3: Variables', desc: 'Variables inside radicals, rationalizing monomial denominators' },
    4: { name: 'Level 4: Advanced', desc: '4th/higher roots, binomial products, conjugate rationalization' },
    5: { name: 'Level 5: Mastery', desc: 'Odd roots of negative radicands, complex algebraic fractions' },
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      {/* Topic and Difficulty Control Decks */}
      <div 
        className="retro-box p-4 space-y-4"
        style={{ borderColor: 'var(--color-border,#78350f)' }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-2" style={{ borderColor: 'var(--color-border,#78350f)' }}>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold font-mono text-[var(--color-primary-bright,#fbbf24)]">
              [PRACTICE CONTROLS]
            </span>
            <span className="text-xs text-[var(--color-text-dim,#b45309)]">
              SELECT CURRICULUM TOPIC & DIFFICULTY
            </span>
          </div>

          <div className="text-xs font-mono text-[var(--color-text-dim,#b45309)] flex items-center gap-3">
            <span>Problems Practiced: <strong className="text-[var(--color-text,#fef3c7)]">{sessionCount}</strong></span>
            <button
              onClick={onOpenHandbook}
              className="hover:text-[var(--color-primary-bright,#fbbf24)] underline flex items-center gap-1"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Rules Cheat Sheet</span>
            </button>
          </div>
        </div>

        {/* Topic Filter Buttons */}
        <div className="space-y-1.5">
          <div className="text-xs font-mono text-[var(--color-text-dim,#b45309)] uppercase tracking-wider">
            1. Topic Filter:
          </div>
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => {
                sound.playClick();
                setSelectedTopic('all');
              }}
              className={`px-3 py-1 text-xs font-mono border transition-all ${
                selectedTopic === 'all'
                  ? 'bg-[var(--color-primary,#f59e0b)] text-black font-bold border-[var(--color-primary-bright,#fbbf24)]'
                  : 'bg-[var(--color-surface,#1c150c)] text-[var(--color-text,#fef3c7)] border-[var(--color-border,#78350f)] hover:border-[var(--color-primary,#f59e0b)]'
              }`}
            >
              All Topics (Comprehensive)
            </button>

            {TOPICS.map(topic => (
              <button
                key={topic.id}
                onClick={() => {
                  sound.playClick();
                  setSelectedTopic(topic.id);
                }}
                className={`px-3 py-1 text-xs font-mono border transition-all ${
                  selectedTopic === topic.id
                    ? 'bg-[var(--color-primary,#f59e0b)] text-black font-bold border-[var(--color-primary-bright,#fbbf24)]'
                    : 'bg-[var(--color-surface,#1c150c)] text-[var(--color-text,#fef3c7)] border-[var(--color-border,#78350f)] hover:border-[var(--color-primary,#f59e0b)]'
                }`}
              >
                {topic.name}
              </button>
            ))}
          </div>
        </div>

        {/* Difficulty Filter Buttons (Levels 1 to 5) */}
        <div className="space-y-1.5">
          <div className="text-xs font-mono text-[var(--color-text-dim,#b45309)] uppercase tracking-wider">
            2. Difficulty Level (1 to 5 — Always Unlocked):
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-1.5">
            <button
              onClick={() => {
                sound.playClick();
                setSelectedDifficulty('all');
              }}
              className={`px-2.5 py-1.5 text-xs font-mono border text-center transition-all ${
                selectedDifficulty === 'all'
                  ? 'bg-[var(--color-primary,#f59e0b)] text-black font-bold border-[var(--color-primary-bright,#fbbf24)]'
                  : 'bg-[var(--color-surface,#1c150c)] text-[var(--color-text,#fef3c7)] border-[var(--color-border,#78350f)] hover:border-[var(--color-primary,#f59e0b)]'
              }`}
            >
              <div className="font-bold">Any Level</div>
              <div className="text-[10px] opacity-75">Mixed 1-5</div>
            </button>

            {([1, 2, 3, 4, 5] as DifficultyLevel[]).map(lvl => (
              <button
                key={lvl}
                onClick={() => {
                  sound.playClick();
                  setSelectedDifficulty(lvl);
                }}
                className={`px-2 py-1.5 text-xs font-mono border text-left transition-all ${
                  selectedDifficulty === lvl
                    ? 'bg-[var(--color-primary,#f59e0b)] text-black font-bold border-[var(--color-primary-bright,#fbbf24)]'
                    : 'bg-[var(--color-surface,#1c150c)] text-[var(--color-text,#fef3c7)] border-[var(--color-border,#78350f)] hover:border-[var(--color-primary,#f59e0b)]'
                }`}
              >
                <div className="font-bold">Level {lvl}</div>
                <div className="text-[10px] opacity-80 truncate">{difficultyLabels[lvl].name.split(': ')[1]}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Question Display Card */}
      {currentQuestion && (
        <div 
          className="retro-box p-6 space-y-6 relative overflow-hidden"
          style={{ borderColor: 'var(--color-border-bright,#b45309)' }}
        >
          {/* Question Meta Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-mono border-b pb-3" style={{ borderColor: 'var(--color-border,#78350f)' }}>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-black/40 border border-[var(--color-border,#78350f)] text-[var(--color-primary-bright,#fbbf24)] font-bold">
                DIFFICULTY: LEVEL {currentQuestion.difficulty} / 5
              </span>
              <span className="text-[var(--color-text-dim,#b45309)]">
                TOPIC: {TOPICS.find(t => t.id === currentQuestion.topic)?.name}
              </span>
            </div>

            <button
              onClick={() => {
                sound.playClick();
                loadNewQuestion();
              }}
              className="text-[var(--color-text-dim,#b45309)] hover:text-[var(--color-primary-bright,#fbbf24)] flex items-center gap-1"
              title="Skip or generate another problem"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Next Random Problem</span>
            </button>
          </div>

          {/* Question Prompt & Math Expression */}
          <div className="space-y-4">
            <p className="text-base sm:text-lg font-mono text-[var(--color-text,#fef3c7)]">
              {currentQuestion.prompt}
            </p>

            <div 
              className="p-6 text-center border-2 bg-black/50 overflow-x-auto min-h-[100px] flex items-center justify-center"
              style={{ borderColor: 'var(--color-border,#78350f)' }}
            >
              <MathRenderer math={currentQuestion.expression} size="xl" className="text-[var(--color-primary-bright,#fbbf24)]" />
            </div>
          </div>

          {/* Multiple Choice Options Grid */}
          <div className="space-y-2">
            <div className="text-xs font-mono text-[var(--color-text-dim,#b45309)]">
              SELECT THE CORRECT SIMPLIFIED VALUE:
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {currentQuestion.options.map(option => {
                const isSelected = selectedOptionId === option.id;
                let optionStyle = 'border-[var(--color-border,#78350f)] bg-[var(--color-surface,#1c150c)] hover:border-[var(--color-primary,#f59e0b)]';
                let indicator = option.label;

                if (isSubmitted) {
                  if (option.isCorrect) {
                    optionStyle = 'border-[var(--color-success,#10b981)] bg-[var(--color-success,#10b981)]/10 text-[var(--color-success,#10b981)] font-bold';
                  } else if (isSelected && !option.isCorrect) {
                    optionStyle = 'border-[var(--color-error,#ef4444)] bg-[var(--color-error,#ef4444)]/10 text-[var(--color-error,#ef4444)]';
                  } else {
                    optionStyle = 'border-[var(--color-border,#78350f)] opacity-50';
                  }
                } else if (isSelected) {
                  optionStyle = 'border-[var(--color-primary-bright,#fbbf24)] bg-[var(--color-primary,#f59e0b)]/20 shadow-sm';
                }

                return (
                  <button
                    key={option.id}
                    onClick={() => handleSelectOption(option.id)}
                    disabled={isSubmitted}
                    className={`w-full p-4 border-2 text-left flex items-center gap-3 transition-all ${optionStyle} ${
                      !isSubmitted ? 'cursor-pointer active:translate-y-0.5' : 'cursor-default'
                    }`}
                  >
                    <span className="w-7 h-7 shrink-0 flex items-center justify-center font-mono font-bold border border-current text-sm">
                      {isSubmitted && option.isCorrect ? (
                        <CheckCircle2 className="w-4 h-4 text-[var(--color-success,#10b981)]" />
                      ) : isSubmitted && isSelected && !option.isCorrect ? (
                        <XCircle className="w-4 h-4 text-[var(--color-error,#ef4444)]" />
                      ) : (
                        indicator
                      )}
                    </span>

                    <div className="flex-1 overflow-x-auto py-1">
                      <MathRenderer math={option.math} size="lg" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action Row: Check Answer or Next Problem */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t" style={{ borderColor: 'var(--color-border,#78350f)' }}>
            {!isSubmitted ? (
              <button
                onClick={handleSubmitAnswer}
                disabled={!selectedOptionId}
                className="retro-btn-primary px-6 py-2.5 font-mono text-sm uppercase tracking-wider disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <span>CHECK ANSWER</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={handleNext}
                  className="retro-btn-primary px-6 py-2.5 font-mono text-sm uppercase tracking-wider flex items-center gap-2"
                >
                  <span>NEXT PROBLEM</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={handleToggleSolution}
                  className="retro-btn px-4 py-2 font-mono text-xs flex items-center gap-1.5"
                >
                  <Lightbulb className="w-3.5 h-3.5 text-[var(--color-primary-bright,#fbbf24)]" />
                  <span>{showFullSolution ? 'HIDE FULL SOLUTION' : 'REVEAL STEP-BY-STEP SOLUTION'}</span>
                </button>
              </div>
            )}

            {isSubmitted && (
              <div className="font-mono text-xs flex items-center gap-2">
                {currentQuestion.options.find(o => o.id === selectedOptionId)?.isCorrect ? (
                  <span className="text-[var(--color-success,#10b981)] font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" />
                    EXCELLENT! CORRECT ANSWER.
                  </span>
                ) : (
                  <span className="text-[var(--color-error,#ef4444)] font-bold flex items-center gap-1">
                    <XCircle className="w-4 h-4" />
                    INCORRECT. EXAMINE THE BREAKDOWN BELOW.
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Immediate Feedback Box (Shown after checking) */}
          {isSubmitted && (
            <div className="space-y-4 pt-2">
              {/* Option-Specific Explanation */}
              {selectedOptionId && (
                <div 
                  className={`p-4 border-2 font-mono text-sm ${
                    currentQuestion.options.find(o => o.id === selectedOptionId)?.isCorrect
                      ? 'border-[var(--color-success,#10b981)] bg-[var(--color-success,#10b981)]/10 text-[var(--color-text,#fef3c7)]'
                      : 'border-[var(--color-error,#ef4444)] bg-[var(--color-error,#ef4444)]/10 text-[var(--color-text,#fef3c7)]'
                  }`}
                >
                  <div className="font-bold text-xs uppercase tracking-wider mb-1 opacity-80">
                    Analysis of Option {currentQuestion.options.find(o => o.id === selectedOptionId)?.label}:
                  </div>
                  <p>{currentQuestion.options.find(o => o.id === selectedOptionId)?.explanation}</p>
                </div>
              )}

              {/* Misconception Alert if applicable */}
              {currentQuestion.misconceptionAlert && (
                <div className="p-3.5 border border-[var(--color-border-bright,#b45309)] bg-black/40 font-mono text-xs space-y-1">
                  <div className="flex items-center gap-1.5 text-[var(--color-primary-bright,#fbbf24)] font-bold">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    <span>COMMON STUDENT TRAP TO WATCH FOR:</span>
                  </div>
                  <p className="text-[var(--color-text-dim,#b45309)] pl-5">
                    {currentQuestion.misconceptionAlert}
                  </p>
                </div>
              )}

              {/* Step-by-Step Mathematical Solution (Auto-open or via reveal toggle) */}
              {(showFullSolution || !currentQuestion.options.find(o => o.id === selectedOptionId)?.isCorrect) && (
                <div className="p-5 border-2 border-[var(--color-border-bright,#b45309)] bg-black/60 font-mono space-y-4">
                  <div className="flex items-center justify-between border-b pb-2" style={{ borderColor: 'var(--color-border,#78350f)' }}>
                    <div className="flex items-center gap-2 text-sm font-bold text-[var(--color-primary-bright,#fbbf24)]">
                      <Lightbulb className="w-4 h-4" />
                      <span>STEP-BY-STEP MATHEMATICAL SOLUTION</span>
                    </div>
                    <span className="text-xs text-[var(--color-text-dim,#b45309)]">
                      RULE: {currentQuestion.ruleSummary}
                    </span>
                  </div>

                  <div className="space-y-3">
                    {currentQuestion.solutionSteps.map((step, idx) => (
                      <div key={idx} className="p-3 border border-[var(--color-border,#78350f)] bg-[var(--color-surface,#1c150c)] space-y-1.5">
                        <div className="text-xs font-bold text-[var(--color-primary,#f59e0b)] flex items-center justify-between">
                          <span>STEP {step.stepNumber}: {step.title}</span>
                        </div>
                        <div className="py-2 text-center bg-black/40 border border-[var(--color-border,#78350f)] overflow-x-auto">
                          <MathRenderer math={step.math} size="md" />
                        </div>
                        <p className="text-xs text-[var(--color-text-dim,#b45309)]">
                          {step.explanation}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Summary Box */}
                  <div className="p-3 bg-[var(--color-primary,#f59e0b)]/10 border border-[var(--color-primary,#f59e0b)] text-xs text-center">
                    <span className="text-[var(--color-primary-bright,#fbbf24)] font-bold">Final Simplified Result: </span>
                    <MathRenderer 
                      math={currentQuestion.options.find(o => o.isCorrect)?.math || ''} 
                      size="md" 
                      className="ml-2 font-bold" 
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
