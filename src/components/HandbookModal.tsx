import React, { useState } from 'react';
import { MathRenderer } from './MathRenderer';
import { X, BookOpen, AlertTriangle, Table } from 'lucide-react';
import { sound } from '../utils/sound';

interface HandbookModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HandbookModal: React.FC<HandbookModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'rules' | 'traps' | 'powers'>('rules');

  if (!isOpen) return null;

  const handleTabChange = (tab: 'rules' | 'traps' | 'powers') => {
    sound.playClick();
    setActiveTab(tab);
  };

  const handleClose = () => {
    sound.playClick();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-xs">
      <div 
        className="relative w-full max-w-4xl max-h-[90vh] flex flex-col retro-box overflow-hidden text-[var(--color-text,#fef3c7)]"
        style={{ backgroundColor: 'var(--color-bg, #120e06)', borderColor: 'var(--color-border-bright, #b45309)' }}
      >
        {/* Retro Header Bar */}
        <div 
          className="flex items-center justify-between px-4 py-2.5 border-b-2"
          style={{ 
            backgroundColor: 'var(--color-surface, #1c150c)', 
            borderColor: 'var(--color-border, #78350f)' 
          }}
        >
          <div className="flex items-center gap-2 font-mono text-sm sm:text-base font-bold text-[var(--color-primary-bright,#fbbf24)]">
            <BookOpen className="w-4 h-4" />
            <span>RADICALS_HANDBOOK.DOC // REFERENCE GUIDE</span>
          </div>

          <button
            onClick={handleClose}
            className="retro-btn px-2 py-0.5 text-xs font-mono flex items-center gap-1 hover:text-[var(--color-error,#ef4444)]"
            title="Close Handbook (Esc)"
          >
            <X className="w-3.5 h-3.5" />
            <span>[ESC] CLOSE</span>
          </button>
        </div>

        {/* Tab Navigation */}
        <div 
          className="flex items-center gap-1 px-4 py-2 border-b overflow-x-auto text-xs sm:text-sm font-mono"
          style={{ borderColor: 'var(--color-border, #78350f)' }}
        >
          <button
            onClick={() => handleTabChange('rules')}
            className={`px-3 py-1.5 whitespace-nowrap transition-colors border ${
              activeTab === 'rules'
                ? 'bg-[var(--color-primary,#f59e0b)] text-black font-bold border-[var(--color-primary-bright,#fbbf24)]'
                : 'text-[var(--color-text-dim,#b45309)] hover:text-[var(--color-text,#fef3c7)] border-transparent'
            }`}
          >
            1. Core Rules & Operations
          </button>

          <button
            onClick={() => handleTabChange('traps')}
            className={`px-3 py-1.5 whitespace-nowrap transition-colors border flex items-center gap-1.5 ${
              activeTab === 'traps'
                ? 'bg-[var(--color-primary,#f59e0b)] text-black font-bold border-[var(--color-primary-bright,#fbbf24)]'
                : 'text-[var(--color-text-dim,#b45309)] hover:text-[var(--color-text,#fef3c7)] border-transparent'
            }`}
          >
            <AlertTriangle className="w-3 h-3" />
            2. Common Pitfalls & Traps
          </button>

          <button
            onClick={() => handleTabChange('powers')}
            className={`px-3 py-1.5 whitespace-nowrap transition-colors border flex items-center gap-1.5 ${
              activeTab === 'powers'
                ? 'bg-[var(--color-primary,#f59e0b)] text-black font-bold border-[var(--color-primary-bright,#fbbf24)]'
                : 'text-[var(--color-text-dim,#b45309)] hover:text-[var(--color-text,#fef3c7)] border-transparent'
            }`}
          >
            <Table className="w-3 h-3" />
            3. Perfect Powers Lookup Table
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 font-mono text-sm leading-relaxed">
          {activeTab === 'rules' && (
            <div className="space-y-6">
              {/* Anatomy of a Radical */}
              <div className="p-4 border border-[var(--color-border,#78350f)] bg-[var(--color-surface,#1c150c)]">
                <h3 className="text-base font-bold text-[var(--color-primary,#f59e0b)] mb-2">
                  01. Anatomy of a Radical Expression
                </h3>
                <p className="mb-3 text-[var(--color-text-dim,#b45309)]">
                  A radical represents the principal root of a number or algebraic term:
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-around gap-4 p-3 bg-black/40 border border-[var(--color-border,#78350f)]">
                  <div className="text-center">
                    <MathRenderer math="c\sqrt[n]{a}" size="xl" />
                  </div>
                  <div className="text-xs space-y-1 text-left">
                    <div><span className="text-[var(--color-primary-bright,#fbbf24)] font-bold">c</span> = External Coefficient</div>
                    <div><span className="text-[var(--color-primary-bright,#fbbf24)] font-bold">n</span> = Index / Order of root (omitted when n = 2)</div>
                    <div><span className="text-[var(--color-primary-bright,#fbbf24)] font-bold">√</span> = Radical Surd & Vinculum (horizontal bar)</div>
                    <div><span className="text-[var(--color-primary-bright,#fbbf24)] font-bold">a</span> = Radicand (expression under the vinculum)</div>
                  </div>
                </div>
              </div>

              {/* Product and Quotient Rules */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border border-[var(--color-border,#78350f)] bg-[var(--color-surface,#1c150c)] space-y-2">
                  <h4 className="font-bold text-[var(--color-primary-bright,#fbbf24)]">
                    Product Property
                  </h4>
                  <div className="py-2 text-center bg-black/30 border border-[var(--color-border,#78350f)]">
                    <MathRenderer math="\sqrt[n]{a \cdot b} = \sqrt[n]{a} \cdot \sqrt[n]{b}" size="md" />
                  </div>
                  <p className="text-xs text-[var(--color-text-dim,#b45309)]">
                    Radicals with the SAME index can be combined under a single radical by multiplying their radicands, or factored into separate roots.
                  </p>
                  <div className="text-xs pt-1">
                    <span className="opacity-75">Example: </span>
                    <MathRenderer math="\sqrt{12} = \sqrt{4 \cdot 3} = 2\sqrt{3}" size="sm" />
                  </div>
                </div>

                <div className="p-4 border border-[var(--color-border,#78350f)] bg-[var(--color-surface,#1c150c)] space-y-2">
                  <h4 className="font-bold text-[var(--color-primary-bright,#fbbf24)]">
                    Quotient Property
                  </h4>
                  <div className="py-2 text-center bg-black/30 border border-[var(--color-border,#78350f)]">
                    <MathRenderer math="\frac{\sqrt[n]{a}}{\sqrt[n]{b}} = \sqrt[n]{\frac{a}{b}} \quad (b > 0)" size="md" />
                  </div>
                  <p className="text-xs text-[var(--color-text-dim,#b45309)]">
                    Dividing two radicals with the same index is equivalent to taking the root of their quotient.
                  </p>
                  <div className="text-xs pt-1">
                    <span className="opacity-75">Example: </span>
                    <MathRenderer math="\frac{\sqrt{48}}{\sqrt{3}} = \sqrt{\frac{48}{3}} = \sqrt{16} = 4" size="sm" />
                  </div>
                </div>
              </div>

              {/* Rationalizing Denominators */}
              <div className="p-4 border border-[var(--color-border,#78350f)] bg-[var(--color-surface,#1c150c)] space-y-3">
                <h4 className="font-bold text-[var(--color-primary-bright,#fbbf24)]">
                  Rationalizing Denominators
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="p-3 bg-black/30 border border-[var(--color-border,#78350f)] space-y-1.5">
                    <div className="font-semibold text-[var(--color-primary,#f59e0b)]">
                      Case A: Monomial Denominator
                    </div>
                    <p>Multiply numerator and denominator by the radical:</p>
                    <div className="py-1 text-center">
                      <MathRenderer math="\frac{6}{\sqrt{3}} \cdot \frac{\sqrt{3}}{\sqrt{3}} = \frac{6\sqrt{3}}{3} = 2\sqrt{3}" size="sm" />
                    </div>
                  </div>

                  <div className="p-3 bg-black/30 border border-[var(--color-border,#78350f)] space-y-1.5">
                    <div className="font-semibold text-[var(--color-primary,#f59e0b)]">
                      Case B: Binomial Denominator (Conjugate)
                    </div>
                    <p>Multiply by the conjugate pair <MathRenderer math="(\sqrt{a} - b)" size="sm" /> to create a difference of squares:</p>
                    <div className="py-1 text-center">
                      <MathRenderer math="\frac{4}{\sqrt{5}-1} \cdot \frac{\sqrt{5}+1}{\sqrt{5}+1} = \frac{4(\sqrt{5}+1)}{5-1} = \sqrt{5}+1" size="sm" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Adding and Subtracting Radicals */}
              <div className="p-4 border border-[var(--color-border,#78350f)] bg-[var(--color-surface,#1c150c)] space-y-2">
                <h4 className="font-bold text-[var(--color-primary-bright,#fbbf24)]">
                  Addition & Subtraction (Like Radicals Only)
                </h4>
                <p className="text-xs text-[var(--color-text-dim,#b45309)]">
                  Two radicals are <span className="text-[var(--color-text,#fef3c7)] font-bold">LIKE RADICALS</span> if and only if they have the EXACT SAME index and the EXACT SAME radicand. Simplify each term first:
                </p>
                <div className="p-3 bg-black/30 border border-[var(--color-border,#78350f)] text-center space-y-2">
                  <MathRenderer math="3\sqrt{8} + 5\sqrt{18} = 3(2\sqrt{2}) + 5(3\sqrt{2}) = 6\sqrt{2} + 15\sqrt{2} = 21\sqrt{2}" size="md" />
                </div>
              </div>

              {/* Negative Radicands Rule */}
              <div className="p-4 border border-[var(--color-border,#78350f)] bg-[var(--color-surface,#1c150c)] space-y-2">
                <h4 className="font-bold text-[var(--color-primary-bright,#fbbf24)]">
                  Odd vs Even Indices & Negative Radicands
                </h4>
                <ul className="text-xs space-y-1.5 list-disc list-inside text-[var(--color-text-dim,#b45309)]">
                  <li>
                    <span className="text-[var(--color-text,#fef3c7)] font-semibold">Odd Index (3, 5, 7...):</span> Negative radicands are defined in real numbers. <MathRenderer math="\sqrt[3]{-64} = -4" size="sm" /> because <MathRenderer math="(-4)^3 = -64" size="sm" />.
                  </li>
                  <li>
                    <span className="text-[var(--color-text,#fef3c7)] font-semibold">Even Index (2, 4, 6...):</span> Even roots of negative numbers are NOT real numbers (they produce imaginary numbers <MathRenderer math="i" size="sm" />).
                  </li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'traps' && (
            <div className="space-y-4">
              <div className="p-4 border-2 border-[var(--color-error,#ef4444)] bg-[var(--color-surface,#1c150c)]">
                <div className="flex items-center gap-2 text-base font-bold text-[var(--color-error,#ef4444)] mb-1">
                  <AlertTriangle className="w-5 h-5 shrink-0" />
                  <span>TRAP 1: The False Radical Addition Rule</span>
                </div>
                <div className="py-2 my-2 text-center bg-black/50 border border-[var(--color-error,#ef4444)]">
                  <span className="text-red-400 font-bold text-base mr-3">❌ FALSE:</span>
                  <MathRenderer math="\sqrt{a + b} = \sqrt{a} + \sqrt{b}" size="md" />
                </div>
                <p className="text-xs text-[var(--color-text,#fef3c7)]">
                  Proof by counterexample: Let <MathRenderer math="a=9" size="sm" /> and <MathRenderer math="b=16" size="sm" />.
                </p>
                <div className="text-xs pl-4 border-l-2 border-[var(--color-error,#ef4444)] mt-2 space-y-1 text-[var(--color-text-dim,#b45309)]">
                  <div>Left side: <MathRenderer math="\sqrt{9 + 16} = \sqrt{25} = 5" size="sm" /></div>
                  <div>Right side: <MathRenderer math="\sqrt{9} + \sqrt{16} = 3 + 4 = 7" size="sm" /></div>
                  <div className="text-[var(--color-error,#ef4444)] font-bold">5 ≠ 7! Radicals DO NOT distribute across addition or subtraction.</div>
                </div>
              </div>

              <div className="p-4 border-2 border-[var(--color-error,#ef4444)] bg-[var(--color-surface,#1c150c)]">
                <div className="flex items-center gap-2 text-base font-bold text-[var(--color-error,#ef4444)] mb-1">
                  <AlertTriangle className="w-5 h-5 shrink-0" />
                  <span>TRAP 2: Omission of Binomial Cross-Terms</span>
                </div>
                <div className="py-2 my-2 text-center bg-black/50 border border-[var(--color-error,#ef4444)]">
                  <span className="text-red-400 font-bold text-base mr-3">❌ FALSE:</span>
                  <MathRenderer math="(\sqrt{5} + 3)^2 = (\sqrt{5})^2 + 3^2 = 5 + 9 = 14" size="md" />
                </div>
                <p className="text-xs text-[var(--color-text,#fef3c7)]">
                  Squaring a binomial produces THREE terms: <MathRenderer math="(u+v)^2 = u^2 + 2uv + v^2" size="sm" />.
                </p>
                <div className="text-xs pl-4 border-l-2 border-[var(--color-success,#10b981)] mt-2 space-y-1 text-[var(--color-success,#10b981)]">
                  <div>✔ Correct: <MathRenderer math="(\sqrt{5} + 3)^2 = 5 + 2(3)\sqrt{5} + 9 = 14 + 6\sqrt{5}" size="sm" /></div>
                </div>
              </div>

              <div className="p-4 border-2 border-[var(--color-error,#ef4444)] bg-[var(--color-surface,#1c150c)]">
                <div className="flex items-center gap-2 text-base font-bold text-[var(--color-error,#ef4444)] mb-1">
                  <AlertTriangle className="w-5 h-5 shrink-0" />
                  <span>TRAP 3: Variable Exponents Division Error</span>
                </div>
                <div className="py-2 my-2 text-center bg-black/50 border border-[var(--color-error,#ef4444)]">
                  <span className="text-red-400 font-bold text-base mr-3">❌ FALSE:</span>
                  <MathRenderer math="\sqrt{x^{16}} = x^4 \quad \text{or} \quad \sqrt{x^9} = x^3" size="md" />
                </div>
                <p className="text-xs text-[var(--color-text,#fef3c7)]">
                  Do not take the square root of the exponent itself! You must <span className="underline font-bold">DIVIDE</span> the exponent by the index 2:
                </p>
                <div className="text-xs pl-4 border-l-2 border-[var(--color-success,#10b981)] mt-2 space-y-1 text-[var(--color-success,#10b981)]">
                  <div>✔ Correct: <MathRenderer math="\sqrt{x^{16}} = x^{16/2} = x^8" size="sm" /></div>
                  <div>✔ Correct: <MathRenderer math="\sqrt{x^9} = \sqrt{x^8 \cdot x} = x^4\sqrt{x}" size="sm" /></div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'powers' && (
            <div className="space-y-6">
              <p className="text-xs text-[var(--color-text-dim,#b45309)]">
                Reference these tables to quickly spot largest perfect powers when simplifying radicals:
              </p>

              {/* Squares Table */}
              <div className="border border-[var(--color-border,#78350f)] p-3 bg-[var(--color-surface,#1c150c)]">
                <div className="text-xs font-bold text-[var(--color-primary-bright,#fbbf24)] mb-2 uppercase">
                  Perfect Squares (n²)
                </div>
                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-10 gap-1.5 text-center text-xs">
                  {[
                    [1, 1], [2, 4], [3, 9], [4, 16], [5, 25],
                    [6, 36], [7, 49], [8, 64], [9, 81], [10, 100],
                    [11, 121], [12, 144], [13, 169], [14, 196], [15, 225],
                    [16, 256], [17, 289], [18, 324], [19, 361], [20, 400]
                  ].map(([base, sq]) => (
                    <div key={base} className="p-1 bg-black/40 border border-[var(--color-border,#78350f)]">
                      <div className="text-[10px] opacity-75">{base}²</div>
                      <div className="font-bold text-[var(--color-primary,#f59e0b)]">{sq}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Cubes Table */}
              <div className="border border-[var(--color-border,#78350f)] p-3 bg-[var(--color-surface,#1c150c)]">
                <div className="text-xs font-bold text-[var(--color-primary-bright,#fbbf24)] mb-2 uppercase">
                  Perfect Cubes (n³)
                </div>
                <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5 text-center text-xs">
                  {[
                    [1, 1], [2, 8], [3, 27], [4, 64], [5, 125],
                    [6, 216], [7, 343], [8, 512], [9, 729], [10, 1000]
                  ].map(([base, cb]) => (
                    <div key={base} className="p-1 bg-black/40 border border-[var(--color-border,#78350f)]">
                      <div className="text-[10px] opacity-75">{base}³</div>
                      <div className="font-bold text-[var(--color-primary,#f59e0b)]">{cb}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 4th & 5th Powers */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="border border-[var(--color-border,#78350f)] p-3 bg-[var(--color-surface,#1c150c)]">
                  <div className="text-xs font-bold text-[var(--color-primary-bright,#fbbf24)] mb-2 uppercase">
                    Perfect 4th Powers (n⁴)
                  </div>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 text-center text-xs">
                    {[
                      [1, 1], [2, 16], [3, 81], [4, 256], [5, 625], [6, 1296]
                    ].map(([base, p4]) => (
                      <div key={base} className="p-1 bg-black/40 border border-[var(--color-border,#78350f)]">
                        <div className="text-[10px] opacity-75">{base}⁴</div>
                        <div className="font-bold text-[var(--color-primary,#f59e0b)]">{p4}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border border-[var(--color-border,#78350f)] p-3 bg-[var(--color-surface,#1c150c)]">
                  <div className="text-xs font-bold text-[var(--color-primary-bright,#fbbf24)] mb-2 uppercase">
                    Perfect 5th Powers (n⁵)
                  </div>
                  <div className="grid grid-cols-4 gap-1.5 text-center text-xs">
                    {[
                      [1, 1], [2, 32], [3, 243], [4, 1024]
                    ].map(([base, p5]) => (
                      <div key={base} className="p-1 bg-black/40 border border-[var(--color-border,#78350f)]">
                        <div className="text-[10px] opacity-75">{base}⁵</div>
                        <div className="font-bold text-[var(--color-primary,#f59e0b)]">{p5}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div 
          className="flex items-center justify-between px-4 py-2 border-t-2 text-xs font-mono"
          style={{ 
            backgroundColor: 'var(--color-surface, #1c150c)', 
            borderColor: 'var(--color-border, #78350f)' 
          }}
        >
          <span className="text-[var(--color-text-dim,#b45309)]">
            PRESS [ESC] OR CLICK CLOSE BUTTON
          </span>
          <button
            onClick={handleClose}
            className="retro-btn-primary px-3 py-1 text-xs"
          >
            RETURN TO REVIEWER
          </button>
        </div>
      </div>
    </div>
  );
};
