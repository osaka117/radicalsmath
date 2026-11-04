import { Question, TopicId, DifficultyLevel, MathOption, SolutionStep } from '../types/math';
import { QUESTION_BANK } from '../data/questionBank';

// Helper random functions
function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function shuffle<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// Generate distractor options and assign labels A, B, C, D
function buildOptions(
  correctMath: string,
  correctExpl: string,
  distractors: { math: string; expl: string }[]
): MathOption[] {
  // Ensure distractors are unique and different from correctMath
  const uniqueDistractors: { math: string; expl: string }[] = [];
  const seen = new Set<string>([correctMath]);

  for (const d of distractors) {
    if (!seen.has(d.math)) {
      seen.add(d.math);
      uniqueDistractors.push(d);
    }
  }

  // Pick top 3 distractors
  const chosenDistractors = uniqueDistractors.slice(0, 3);
  // If fewer than 3, generate generic fallback distractors
  while (chosenDistractors.length < 3) {
    chosenDistractors.push({
      math: `\\sqrt{${randInt(10, 99)}}`,
      expl: 'Incorrect factorization.',
    });
  }

  const rawOptions = [
    { math: correctMath, isCorrect: true, expl: correctExpl },
    ...chosenDistractors.map(d => ({ math: d.math, isCorrect: false, expl: d.expl })),
  ];

  const shuffled = shuffle(rawOptions);
  const labels: ('A' | 'B' | 'C' | 'D')[] = ['A', 'B', 'C', 'D'];

  return shuffled.map((opt, idx) => ({
    id: `opt-${idx}-${Date.now()}`,
    label: labels[idx],
    math: opt.math,
    isCorrect: opt.isCorrect,
    explanation: opt.expl,
  }));
}

// -------------------------------------------------------------
// DYNAMIC GENERATORS PER TOPIC & DIFFICULTY
// -------------------------------------------------------------

function generateSimplifying(difficulty: DifficultyLevel): Question {
  const id = `gen-simp-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

  if (difficulty === 1) {
    // Basic square root: sqrt(k^2 * m)
    const k = pickRandom([2, 3, 4, 5, 6, 7]);
    const m = pickRandom([2, 3, 5, 6, 7]);
    const n = k * k * m;

    const correctMath = `${k}\\sqrt{${m}}`;
    const options = buildOptions(
      correctMath,
      `Correct! ${n} = ${k * k} * ${m}. Since \\sqrt{${k * k}} = ${k}, the answer is ${correctMath}.`,
      [
        { math: `${k * k}\\sqrt{${m}}`, expl: `Did not extract the square root of ${k * k}.` },
        { math: `${m}\\sqrt{${k}}`, expl: 'Swapped the factor under the radical.' },
        { math: `${k * 2}\\sqrt{${m}}`, expl: 'Incorrect factor root evaluation.' },
        { math: `\\sqrt{${n}}`, expl: 'Expression is not simplified.' },
      ]
    );

    const steps: SolutionStep[] = [
      {
        stepNumber: 1,
        title: 'Factor the radicand',
        math: `${n} = ${k * k} \\cdot ${m}`,
        explanation: `Identify the largest square factor: ${k * k} = ${k}^2.`,
      },
      {
        stepNumber: 2,
        title: 'Apply Product Property',
        math: `\\sqrt{${n}} = \\sqrt{${k * k}} \\cdot \\sqrt{${m}}`,
        explanation: 'Split into separate radicals.',
      },
      {
        stepNumber: 3,
        title: 'Simplify',
        math: `${correctMath}`,
        explanation: `Since \\sqrt{${k * k}} = ${k}, the simplest form is ${correctMath}.`,
      },
    ];

    return {
      id,
      topic: 'simplifying',
      difficulty: 1,
      prompt: 'Simplify the radical expression completely:',
      expression: `\\sqrt{${n}}`,
      options,
      solutionSteps: steps,
      ruleSummary: '\\sqrt{a^2 \\cdot b} = a\\sqrt{b}',
      misconceptionAlert: 'Extract the square root of the factor, not the factor itself!',
    };
  }

  if (difficulty === 2) {
    // Cube root: sqrt[3]{k^3 * m} OR with coefficient c*sqrt{k^2 * m}
    if (Math.random() > 0.5) {
      const k = pickRandom([2, 3, 4, 5]);
      const m = pickRandom([2, 3, 4]);
      const n = k * k * k * m;
      const correctMath = `${k}\\sqrt[3]{${m}}`;

      const options = buildOptions(
        correctMath,
        `Correct! ${n} = ${k * k * k} * ${m} = (${k}^3) * ${m}. Cube root yields ${correctMath}.`,
        [
          { math: `${k * k}\\sqrt[3]{${m}}`, expl: 'Treated as square root rather than cube root.' },
          { math: `${k}\\sqrt{${m}}`, expl: 'Forgot the index 3 on the radical symbol.' },
          { math: `${m}\\sqrt[3]{${k}}`, expl: 'Swapped factors.' },
        ]
      );

      return {
        id,
        topic: 'simplifying',
        difficulty: 2,
        prompt: 'Simplify the cube root expression:',
        expression: `\\sqrt[3]{${n}}`,
        options,
        solutionSteps: [
          {
            stepNumber: 1,
            title: 'Identify perfect cube factor',
            math: `${n} = ${k * k * k} \\cdot ${m} = ${k}^3 \\cdot ${m}`,
            explanation: `${k}^3 = ${k * k * k} divides ${n} evenly.`,
          },
          {
            stepNumber: 2,
            title: 'Extract cube root',
            math: `\\sqrt[3]{${k}^3 \\cdot ${m}} = ${correctMath}`,
            explanation: `\\sqrt[3]{${k}^3} = ${k}.`,
          },
        ],
        ruleSummary: '\\sqrt[3]{a^3 \\cdot b} = a\\sqrt[3]{b}',
      };
    } else {
      const c = pickRandom([2, 3, 4, 5]);
      const k = pickRandom([2, 3, 4]);
      const m = pickRandom([2, 3, 5]);
      const n = k * k * m;
      const totalCoeff = c * k;
      const correctMath = `${totalCoeff}\\sqrt{${m}}`;

      const options = buildOptions(
        correctMath,
        `Correct! \\sqrt{${n}} = ${k}\\sqrt{${m}}. Multiplying outside coefficient ${c} gives ${c} * ${k} = ${totalCoeff}.`,
        [
          { math: `${k}\\sqrt{${m}}`, expl: `Forgot to multiply by the coefficient ${c} outside.` },
          { math: `${c + k}\\sqrt{${m}}`, expl: `Added coefficient (${c} + ${k}) instead of multiplying (${c} * ${k}).` },
          { math: `${c * k * k}\\sqrt{${m}}`, expl: `Did not take square root of ${k * k}.` },
        ]
      );

      return {
        id,
        topic: 'simplifying',
        difficulty: 2,
        prompt: 'Simplify the radical with a coefficient:',
        expression: `${c}\\sqrt{${n}}`,
        options,
        solutionSteps: [
          {
            stepNumber: 1,
            title: 'Simplify the radical',
            math: `\\sqrt{${n}} = ${k}\\sqrt{${m}}`,
            explanation: `${n} = ${k * k} * ${m}.`,
          },
          {
            stepNumber: 2,
            title: 'Multiply by the coefficient',
            math: `${c} \\cdot (${k}\\sqrt{${m}}) = (${c} \\cdot ${k})\\sqrt{${m}} = ${correctMath}`,
            explanation: `Multiply ${c} by ${k}.`,
          },
        ],
        ruleSummary: 'c\\sqrt{a^2 \\cdot b} = (c \\cdot a)\\sqrt{b}',
      };
    }
  }

  if (difficulty === 3) {
    // Variables: sqrt(k^2 * m * x^(2p+1))
    const k = pickRandom([2, 3, 4, 5]);
    const m = pickRandom([2, 3, 5]);
    const p = pickRandom([1, 2, 3]);
    const n = k * k * m;
    const exp = 2 * p + 1;
    const varPower = p === 1 ? 'x' : `x^${p}`;
    const correctMath = `${k}${varPower}\\sqrt{${m}x}`;

    const options = buildOptions(
      correctMath,
      `Correct! \\sqrt{${n}} = ${k}\\sqrt{${m}} and \\sqrt{x^${exp}} = ${varPower}\\sqrt{x}.`,
      [
        { math: `${k}x^${exp}\\sqrt{${m}}`, expl: 'Did not divide the variable exponent by 2.' },
        { math: `${k * k}${varPower}\\sqrt{${m}x}`, expl: `Did not take square root of ${k * k}.` },
        { math: `${k}x\\sqrt{${m}x^${exp - 2}}`, expl: 'Incomplete simplification of variable.' },
      ]
    );

    return {
      id,
      topic: 'simplifying',
      difficulty: 3,
      prompt: 'Simplify the variable radical expression (x > 0):',
      expression: `\\sqrt{${n}x^${exp}}`,
      options,
      solutionSteps: [
        {
          stepNumber: 1,
          title: 'Separate constant and variable powers',
          math: `${n} = ${k * k} \\cdot ${m}, \\quad x^${exp} = x^${2 * p} \\cdot x`,
          explanation: `The largest even power is x^${2 * p}.`,
        },
        {
          stepNumber: 2,
          title: 'Extract square roots',
          math: `\\sqrt{${k * k}x^${2 * p} \\cdot ${m}x} = ${correctMath}`,
          explanation: `\\sqrt{${k * k}} = ${k} and \\sqrt{x^${2 * p}} = x^{${2 * p}/2} = ${varPower}.`,
        },
      ],
      ruleSummary: '\\sqrt{x^{2p + 1}} = x^p\\sqrt{x}',
      misconceptionAlert: 'When taking the root of x^n, DIVIDE exponent n by index 2, do not take the square root of n!',
    };
  }

  if (difficulty === 4) {
    // Fourth root: sqrt[4]{k^4 * m}
    const k = pickRandom([2, 3]);
    const m = pickRandom([2, 3, 5]);
    const n = Math.pow(k, 4) * m;
    const correctMath = `${k}\\sqrt[4]{${m}}`;

    const options = buildOptions(
      correctMath,
      `Correct! ${n} = ${Math.pow(k, 4)} * ${m} = (${k}^4) * ${m}. The fourth root gives ${correctMath}.`,
      [
        { math: `${k * k}\\sqrt[4]{${m}}`, expl: 'Treated as square root (took root of power incorrectly).' },
        { math: `${k}\\sqrt{${m}}`, expl: 'Lost the index 4 on the radical symbol.' },
        { math: `${Math.pow(k, 4)}\\sqrt[4]{${m}}`, expl: 'Did not extract 4th root from the factor.' },
      ]
    );

    return {
      id,
      topic: 'simplifying',
      difficulty: 4,
      prompt: 'Simplify the fourth-root radical completely:',
      expression: `\\sqrt[4]{${n}}`,
      options,
      solutionSteps: [
        {
          stepNumber: 1,
          title: 'Find 4th-power factor',
          math: `${n} = ${Math.pow(k, 4)} \\cdot ${m} = ${k}^4 \\cdot ${m}`,
          explanation: `${k}^4 = ${Math.pow(k, 4)}.`,
        },
        {
          stepNumber: 2,
          title: 'Extract 4th root',
          math: `\\sqrt[4]{${k}^4 \\cdot ${m}} = ${correctMath}`,
          explanation: `\\sqrt[4]{${k}^4} = ${k}.`,
        },
      ],
      ruleSummary: '\\sqrt[4]{a^4 \\cdot b} = a\\sqrt[4]{b}',
    };
  }

  // Difficulty 5: Odd root of negative number with variables
  const k = pickRandom([2, 3]);
  const m = pickRandom([2, 3]);
  const p = pickRandom([1, 2]);
  const n = Math.pow(k, 3) * m;
  const exp = 3 * p + 1;
  const varPower = p === 1 ? 'x' : `x^${p}`;
  const correctMath = `-${k}${varPower}\\sqrt[3]{${m}x}`;

  const options = buildOptions(
    correctMath,
    `Correct! For odd index 3, \\sqrt[3]{-1} = -1. Factoring out negative and powers gives ${correctMath}.`,
    [
      { math: `${k}${varPower}\\sqrt[3]{${m}x}`, expl: 'Forgot the negative sign.' },
      { math: `-${k * k}${varPower}\\sqrt[3]{${m}x}`, expl: 'Root extraction calculation error.' },
      { math: 'Not a real number', expl: 'Odd roots of negative numbers ARE real numbers!' },
    ]
  );

  return {
    id,
    topic: 'simplifying',
    difficulty: 5,
    prompt: 'Simplify the odd-root radical with a negative radicand (x > 0):',
    expression: `\\sqrt[3]{-${n}x^${exp}}`,
    options,
    solutionSteps: [
      {
        stepNumber: 1,
        title: 'Factor negative sign for odd root',
        math: `\\sqrt[3]{-${n}x^${exp}} = -\\sqrt[3]{${n}x^${exp}}`,
        explanation: 'Because (-1)^3 = -1, odd roots preserve negative signs.',
      },
      {
        stepNumber: 2,
        title: 'Extract cube roots',
        math: `-${k}${varPower}\\sqrt[3]{${m}x}`,
        explanation: `${n} = ${Math.pow(k, 3)} * ${m} and x^${exp} = (x^${p})^3 * x.`,
      },
    ],
    ruleSummary: '\\sqrt[3]{-A} = -\\sqrt[3]{A}',
    misconceptionAlert: 'Odd roots of negative numbers are real and defined; only even roots of negative numbers are non-real.',
  };
}

function generateMultiplication(difficulty: DifficultyLevel): Question {
  const id = `gen-mult-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

  if (difficulty === 1) {
    // Basic square root multiplication: sqrt(a) * sqrt(b)
    const a = pickRandom([2, 3, 5, 6]);
    const b = pickRandom([3, 6, 8, 10, 12]);
    const prod = a * b;

    // Simplify prod
    let largestSq = 1;
    for (let s = 10; s >= 2; s--) {
      if (prod % (s * s) === 0) {
        largestSq = s;
        break;
      }
    }
    const rem = prod / (largestSq * largestSq);
    const correctMath = rem === 1 ? `${largestSq}` : largestSq === 1 ? `\\sqrt{${prod}}` : `${largestSq}\\sqrt{${rem}}`;

    const options = buildOptions(
      correctMath,
      `Correct! \\sqrt{${a}} \\cdot \\sqrt{${b}} = \\sqrt{${prod}} = ${correctMath}.`,
      [
        { math: `\\sqrt{${a + b}}`, expl: 'Added the radicands instead of multiplying them.' },
        { math: `${a * b}`, expl: 'Forgot the square root.' },
        { math: `${largestSq * 2}\\sqrt{${rem}}`, expl: 'Incorrect factor extraction.' },
      ]
    );

    return {
      id,
      topic: 'multiplication',
      difficulty: 1,
      prompt: 'Multiply and simplify:',
      expression: `\\sqrt{${a}} \\cdot \\sqrt{${b}}`,
      options,
      solutionSteps: [
        {
          stepNumber: 1,
          title: 'Apply Product Rule',
          math: `\\sqrt{${a}} \\cdot \\sqrt{${b}} = \\sqrt{${a} \\cdot ${b}} = \\sqrt{${prod}}`,
          explanation: 'Multiply inside terms under one radical.',
        },
        {
          stepNumber: 2,
          title: 'Simplify the radical',
          math: `${correctMath}`,
          explanation: rem === 1 ? `${prod} is a perfect square.` : `Extract square factor ${largestSq * largestSq}.`,
        },
      ],
      ruleSummary: '\\sqrt{a} \\cdot \\sqrt{b} = \\sqrt{ab}',
      misconceptionAlert: '\\sqrt{a} \\cdot \\sqrt{b} \\ne \\sqrt{a + b}. You must multiply the radicands, not add them!',
    };
  }

  if (difficulty === 2) {
    // Coefficients multiplication: c1*sqrt(a) * c2*sqrt(b)
    const c1 = pickRandom([2, 3, 4]);
    const c2 = pickRandom([2, 3, 5]);
    const a = pickRandom([2, 3, 5]);
    const b = pickRandom([6, 10, 15]);
    const prod = a * b;

    let k = 1;
    for (let s = 10; s >= 2; s--) {
      if (prod % (s * s) === 0) {
        k = s;
        break;
      }
    }
    const rem = prod / (k * k);
    const finalCoeff = c1 * c2 * k;
    const correctMath = rem === 1 ? `${finalCoeff}` : `${finalCoeff}\\sqrt{${rem}}`;

    const options = buildOptions(
      correctMath,
      `Correct! Outside coefficients: ${c1} * ${c2} = ${c1 * c2}. Inside: \\sqrt{${prod}} = ${k}\\sqrt{${rem}}. Total: ${finalCoeff}\\sqrt{${rem}}.`,
      [
        { math: `${c1 * c2}\\sqrt{${prod}}`, expl: `Incomplete: \\sqrt{${prod}} still simplifies.` },
        { math: `${c1 + c2}\\sqrt{${prod}}`, expl: 'Added coefficients instead of multiplying them.' },
        { math: `${c1 * c2 * k}\\sqrt{${prod}}`, expl: 'Multiplication mistake.' },
      ]
    );

    return {
      id,
      topic: 'multiplication',
      difficulty: 2,
      prompt: 'Multiply the radical expressions with coefficients:',
      expression: `${c1}\\sqrt{${a}} \\cdot ${c2}\\sqrt{${b}}`,
      options,
      solutionSteps: [
        {
          stepNumber: 1,
          title: 'Multiply coefficients and radicands',
          math: `(${c1} \\cdot ${c2})\\sqrt{${a} \\cdot ${b}} = ${c1 * c2}\\sqrt{${prod}}`,
          explanation: 'Coefficients multiply together, radicands multiply together.',
        },
        {
          stepNumber: 2,
          title: 'Simplify resulting radical',
          math: `\\sqrt{${prod}} = ${k}\\sqrt{${rem}}`,
          explanation: `Extract \\sqrt{${k * k}} = ${k}.`,
        },
        {
          stepNumber: 3,
          title: 'Final coefficient product',
          math: `${c1 * c2} \\cdot ${k}\\sqrt{${rem}} = ${correctMath}`,
          explanation: `${c1 * c2} * ${k} = ${finalCoeff}.`,
        },
      ],
      ruleSummary: 'c_1\\sqrt{a} \\cdot c_2\\sqrt{b} = (c_1 c_2)\\sqrt{ab}',
    };
  }

  if (difficulty === 3) {
    // Variables: sqrt(a*x^3) * sqrt(b*x)
    const a = pickRandom([2, 3, 6]);
    const b = pickRandom([6, 8, 12]);
    const prod = a * b;
    let k = 1;
    for (let s = 10; s >= 2; s--) {
      if (prod % (s * s) === 0) {
        k = s;
        break;
      }
    }
    const rem = prod / (k * k);
    const correctMath = rem === 1 ? `${k}x^2` : `${k}x^2\\sqrt{${rem}}`;

    const options = buildOptions(
      correctMath,
      `Correct! \\sqrt{${a}x^3 \\cdot ${b}x} = \\sqrt{${prod}x^4} = ${correctMath}.`,
      [
        { math: `${k}x^4\\sqrt{${rem}}`, expl: 'Did not divide the exponent 4 by the index 2.' },
        { math: `${k}x\\sqrt{${rem}x}`, expl: 'Incorrect variable power extraction.' },
        { math: `${k * k}x^2\\sqrt{${rem}}`, expl: 'Forgot to take square root of the coefficient square factor.' },
      ]
    );

    return {
      id,
      topic: 'multiplication',
      difficulty: 3,
      prompt: 'Multiply and simplify expressions containing variables (x > 0):',
      expression: `\\sqrt{${a}x^3} \\cdot \\sqrt{${b}x}`,
      options,
      solutionSteps: [
        {
          stepNumber: 1,
          title: 'Multiply under radical',
          math: `\\sqrt{(${a} \\cdot ${b})(x^3 \\cdot x)} = \\sqrt{${prod}x^4}`,
          explanation: 'Add exponents: 3 + 1 = 4.',
        },
        {
          stepNumber: 2,
          title: 'Extract square roots',
          math: `${correctMath}`,
          explanation: `\\sqrt{${prod}} = ${k}\\sqrt{${rem}} and \\sqrt{x^4} = x^2.`,
        },
      ],
      ruleSummary: '\\sqrt{x^m}\\sqrt{x^n} = \\sqrt{x^{m+n}}',
    };
  }

  // Difficulty 4 or 5: Binomials
  const a = pickRandom([2, 3, 5]);
  const b = pickRandom([1, 2, 3, 4]);
  // (sqrt(a) + b)^2 = a + 2*b*sqrt(a) + b^2 = (a + b^2) + 2b*sqrt(a)
  const constTerm = a + b * b;
  const crossCoeff = 2 * b;
  const correctMath = `${constTerm} + ${crossCoeff}\\sqrt{${a}}`;

  const options = buildOptions(
    correctMath,
    `Correct! (u + v)^2 = u^2 + 2uv + v^2 = ${a} + 2(${b})\\sqrt{${a}} + ${b * b} = ${correctMath}.`,
    [
      { math: `${constTerm}`, expl: 'Omitted the middle cross term 2uv!' },
      { math: `${constTerm} + ${b}\\sqrt{${a}}`, expl: 'Forgot factor of 2 in middle term.' },
      { math: `${a + b} + ${crossCoeff}\\sqrt{${a}}`, expl: 'Did not square the constant term b.' },
    ]
  );

  return {
    id,
    topic: 'multiplication',
    difficulty: difficulty,
    prompt: 'Square the radical binomial and simplify completely:',
    expression: `(\\sqrt{${a}} + ${b})^2`,
    options,
    solutionSteps: [
      {
        stepNumber: 1,
        title: 'Apply binomial square formula',
        math: '(\\sqrt{a} + b)^2 = (\\sqrt{a})^2 + 2b\\sqrt{a} + b^2',
        explanation: 'Every binomial square generates three terms.',
      },
      {
        stepNumber: 2,
        title: 'Evaluate each term',
        math: `(\\sqrt{${a}})^2 = ${a}, \\quad 2(${b})(\\sqrt{${a}}) = ${crossCoeff}\\sqrt{${a}}, \\quad (${b})^2 = ${b * b}`,
        explanation: 'Compute squares and cross product.',
      },
      {
        stepNumber: 3,
        title: 'Combine constant integers',
        math: `${a} + ${b * b} + ${crossCoeff}\\sqrt{${a}} = ${correctMath}`,
        explanation: `${a} + ${b * b} = ${constTerm}.`,
      },
    ],
    ruleSummary: '(u + v)^2 = u^2 + 2uv + v^2',
    misconceptionAlert: '(\\sqrt{a} + b)^2 is NOT simply a + b^2. The middle term 2b\\sqrt{a} is mandatory!',
  };
}

function generateDivision(difficulty: DifficultyLevel): Question {
  const id = `gen-div-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

  if (difficulty === 1) {
    // Basic quotient: sqrt(a*b) / sqrt(b) = sqrt(a)
    const root = pickRandom([2, 3, 4, 5, 6]);
    const b = pickRandom([2, 3, 5, 7]);
    const a = root * root;
    const num = a * b;

    const correctMath = `${root}`;
    const options = buildOptions(
      correctMath,
      `Correct! \\frac{\\sqrt{${num}}}{\\sqrt{${b}}} = \\sqrt{\\frac{${num}}{${b}}} = \\sqrt{${a}} = ${root}.`,
      [
        { math: `${a}`, expl: `Forgot to take square root of ${a}.` },
        { math: `\\sqrt{${num - b}}`, expl: 'Subtracted radicands instead of dividing them.' },
        { math: `${root}\\sqrt{${b}}`, expl: 'Left denominator radical unsimplified.' },
      ]
    );

    return {
      id,
      topic: 'division',
      difficulty: 1,
      prompt: 'Divide and simplify using the Quotient Property:',
      expression: `\\frac{\\sqrt{${num}}}{\\sqrt{${b}}}`,
      options,
      solutionSteps: [
        {
          stepNumber: 1,
          title: 'Apply Quotient Rule',
          math: `\\sqrt{\\frac{${num}}{${b}}}`,
          explanation: 'Combine under one radical sign.',
        },
        {
          stepNumber: 2,
          title: 'Divide the numbers',
          math: `\\frac{${num}}{${b}} = ${a} \\implies \\sqrt{${a}}`,
          explanation: `${num} divided by ${b} is ${a}.`,
        },
        {
          stepNumber: 3,
          title: 'Extract square root',
          math: `${root}`,
          explanation: `\\sqrt{${a}} = ${root}.`,
        },
      ],
      ruleSummary: '\\frac{\\sqrt{x}}{\\sqrt{y}} = \\sqrt{\\frac{x}{y}}',
      misconceptionAlert: '\\frac{\\sqrt{x}}{\\sqrt{y}} \\ne \\sqrt{x - y}. Radicands divide!',
    };
  }

  if (difficulty === 2) {
    // Coefficients division: (c1*sqrt(a)) / (c2*sqrt(b))
    const qCoeff = pickRandom([2, 3, 4]);
    const c2 = pickRandom([2, 3, 5]);
    const c1 = qCoeff * c2;
    const root = pickRandom([2, 3, 4]);
    const b = pickRandom([2, 3, 5]);
    const a = root * root;
    const numRad = a * b;
    const totalAns = qCoeff * root;

    const correctMath = `${totalAns}`;
    const options = buildOptions(
      correctMath,
      `Correct! Outside: ${c1}/${c2} = ${qCoeff}. Inside: \\sqrt{${numRad}/${b}} = \\sqrt{${a}} = ${root}. Total: ${qCoeff} * ${root} = ${totalAns}.`,
      [
        { math: `${qCoeff}\\sqrt{${a}}`, expl: `Incomplete: \\sqrt{${a}} simplifies to ${root}.` },
        { math: `${qCoeff}`, expl: 'Forgot the radical contribution.' },
        { math: `${c1 * root}`, expl: 'Forgot to divide by the denominator coefficient.' },
      ]
    );

    return {
      id,
      topic: 'division',
      difficulty: 2,
      prompt: 'Divide the radical expression with coefficients:',
      expression: `\\frac{${c1}\\sqrt{${numRad}}}{${c2}\\sqrt{${b}}}`,
      options,
      solutionSteps: [
        {
          stepNumber: 1,
          title: 'Divide coefficients and radicals separately',
          math: `\\left(\\frac{${c1}}{${c2}}\\right) \\cdot \\sqrt{\\frac{${numRad}}{${b}}}`,
          explanation: 'Separate outside and inside divisions.',
        },
        {
          stepNumber: 2,
          title: 'Simplify each part',
          math: `${qCoeff} \\cdot \\sqrt{${a}}`,
          explanation: `${c1}/${c2} = ${qCoeff} and ${numRad}/${b} = ${a}.`,
        },
        {
          stepNumber: 3,
          title: 'Multiply final values',
          math: `${qCoeff} \\cdot ${root} = ${totalAns}`,
          explanation: 'Result is integer.',
        },
      ],
      ruleSummary: '\\frac{c_1\\sqrt{a}}{c_2\\sqrt{b}} = \\left(\\frac{c_1}{c_2}\\right)\\sqrt{\\frac{a}{b}}',
    };
  }

  // Rationalizing monomial: k / sqrt(m) where k is multiple of m
  const m = pickRandom([2, 3, 5, 7]);
  const mult = pickRandom([2, 3, 4, 5]);
  const k = mult * m;
  const correctMath = mult === 1 ? `\\sqrt{${m}}` : `${mult}\\sqrt{${m}}`;

  const options = buildOptions(
    correctMath,
    `Correct! Multiply numerator and denominator by \\sqrt{${m}}: \\frac{${k}\\sqrt{${m}}}{${m}} = ${correctMath}.`,
    [
      { math: `${k}\\sqrt{${m}}`, expl: `Forgot to divide by ${m} in denominator.` },
      { math: `\\frac{${mult}}{\\sqrt{${m}}}`, expl: 'Radical must not remain in the denominator.' },
      { math: `${mult}`, expl: `Lost the \\sqrt{${m}} factor.` },
    ]
  );

  return {
    id,
    topic: 'division',
    difficulty: difficulty,
    prompt: 'Rationalize the denominator and simplify completely:',
    expression: `\\frac{${k}}{\\sqrt{${m}}}`,
    options,
    solutionSteps: [
      {
        stepNumber: 1,
        title: 'Multiply top and bottom by denominator radical',
        math: `\\frac{${k}}{\\sqrt{${m}}} \\cdot \\frac{\\sqrt{${m}}}{\\sqrt{${m}}}`,
        explanation: 'Multiplying by 1 in radical form clears the root from the bottom.',
      },
      {
        stepNumber: 2,
        title: 'Evaluate denominator',
        math: `\\frac{${k}\\sqrt{${m}}}{${m}}`,
        explanation: `(\\sqrt{${m}})^2 = ${m}.`,
      },
      {
        stepNumber: 3,
        title: 'Reduce fraction',
        math: `${correctMath}`,
        explanation: `${k} / ${m} = ${mult}.`,
      },
    ],
    ruleSummary: '\\frac{a}{\\sqrt{b}} = \\frac{a\\sqrt{b}}{b}',
  };
}

function generateAddition(difficulty: DifficultyLevel): Question {
  const id = `gen-add-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const m = pickRandom([2, 3, 5, 6, 7]);

  if (difficulty === 1) {
    // Direct like terms: c1*sqrt(m) + c2*sqrt(m)
    const c1 = randInt(2, 9);
    const c2 = randInt(2, 9);
    const sum = c1 + c2;
    const correctMath = `${sum}\\sqrt{${m}}`;

    const options = buildOptions(
      correctMath,
      `Correct! Like radicals combine their coefficients: (${c1} + ${c2})\\sqrt{${m}} = ${correctMath}.`,
      [
        { math: `${sum}\\sqrt{${m * 2}}`, expl: `Added radicands (${m} + ${m} = ${m * 2}). Radicands do NOT add!` },
        { math: `${c1 * c2}\\sqrt{${m}}`, expl: 'Multiplied coefficients instead of adding.' },
        { math: `\\sqrt{${c1 + c2 + m}}`, expl: 'Incorrect operation.' },
      ]
    );

    return {
      id,
      topic: 'addition',
      difficulty: 1,
      prompt: 'Combine the like radical terms:',
      expression: `${c1}\\sqrt{${m}} + ${c2}\\sqrt{${m}}`,
      options,
      solutionSteps: [
        {
          stepNumber: 1,
          title: 'Factor out the common radical',
          math: `(${c1} + ${c2})\\sqrt{${m}}`,
          explanation: 'Distributive property on like radical terms.',
        },
        {
          stepNumber: 2,
          title: 'Sum the coefficients',
          math: `${correctMath}`,
          explanation: `${c1} + ${c2} = ${sum}. Radicand stays unchanged.`,
        },
      ],
      ruleSummary: 'a\\sqrt{x} + b\\sqrt{x} = (a + b)\\sqrt{x}',
      misconceptionAlert: 'Radicands never add together when combining like radicals!',
    };
  }

  // Difficulty 2+: Unsimplified like radicals: c1*sqrt(k1^2 * m) + c2*sqrt(k2^2 * m)
  const c1 = pickRandom([2, 3, 4]);
  const k1 = pickRandom([2, 3]);
  const c2 = pickRandom([2, 3, 5]);
  const k2 = pickRandom([2, 4]);

  const rad1 = k1 * k1 * m;
  const rad2 = k2 * k2 * m;

  const term1Coeff = c1 * k1;
  const term2Coeff = c2 * k2;
  const totalCoeff = term1Coeff + term2Coeff;
  const correctMath = `${totalCoeff}\\sqrt{${m}}`;

  const options = buildOptions(
    correctMath,
    `Correct! ${c1}\\sqrt{${rad1}} = ${term1Coeff}\\sqrt{${m}}, and ${c2}\\sqrt{${rad2}} = ${term2Coeff}\\sqrt{${m}}. Sum = ${correctMath}.`,
    [
      { math: `${c1 + c2}\\sqrt{${rad1 + rad2}}`, expl: 'Added coefficients and radicands directly without simplifying.' },
      { math: `${c1 * k1 + c2}\\sqrt{${m}}`, expl: 'Forgot to extract the root of the second term.' },
      { math: `${totalCoeff}\\sqrt{${m * 2}}`, expl: 'Added radicands when combining like terms.' },
    ]
  );

  return {
    id,
    topic: 'addition',
    difficulty: difficulty,
    prompt: 'Simplify each radical and combine like terms:',
    expression: `${c1}\\sqrt{${rad1}} + ${c2}\\sqrt{${rad2}}`,
    options,
    solutionSteps: [
      {
        stepNumber: 1,
        title: 'Simplify first radical term',
        math: `${c1}\\sqrt{${rad1}} = ${c1}(${k1}\\sqrt{${m}}) = ${term1Coeff}\\sqrt{${m}}`,
        explanation: `${rad1} = ${k1 * k1} * ${m}.`,
      },
      {
        stepNumber: 2,
        title: 'Simplify second radical term',
        math: `${c2}\\sqrt{${rad2}} = ${c2}(${k2}\\sqrt{${m}}) = ${term2Coeff}\\sqrt{${m}}`,
        explanation: `${rad2} = ${k2 * k2} * ${m}.`,
      },
      {
        stepNumber: 3,
        title: 'Add like radicals',
        math: `${term1Coeff}\\sqrt{${m}} + ${term2Coeff}\\sqrt{${m}} = ${correctMath}`,
        explanation: `${term1Coeff} + ${term2Coeff} = ${totalCoeff}.`,
      },
    ],
    ruleSummary: 'Simplify each term completely before checking for like radicals.',
  };
}

function generateCombined(difficulty: DifficultyLevel): Question {
  const id = `gen-comb-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

  // Distributive: sqrt(a)(sqrt(b) + sqrt(c))
  const a = pickRandom([2, 3, 5]);
  const b = pickRandom([6, 8, 10]);
  const c = pickRandom([12, 15, 20]);

  // Simplify a*b
  const p1 = a * b;
  let k1 = 1;
  for (let s = 10; s >= 2; s--) {
    if (p1 % (s * s) === 0) {
      k1 = s;
      break;
    }
  }
  const r1 = p1 / (k1 * k1);
  const t1 = r1 === 1 ? `${k1}` : k1 === 1 ? `\\sqrt{${p1}}` : `${k1}\\sqrt{${r1}}`;

  // Simplify a*c
  const p2 = a * c;
  let k2 = 1;
  for (let s = 10; s >= 2; s--) {
    if (p2 % (s * s) === 0) {
      k2 = s;
      break;
    }
  }
  const r2 = p2 / (k2 * k2);
  const t2 = r2 === 1 ? `${k2}` : k2 === 1 ? `\\sqrt{${p2}}` : `${k2}\\sqrt{${r2}}`;

  const correctMath = `${t1} + ${t2}`;

  const options = buildOptions(
    correctMath,
    `Correct! Distribute \\sqrt{${a}}: \\sqrt{${p1}} + \\sqrt{${p2}} = ${correctMath}.`,
    [
      { math: `\\sqrt{${p1 + p2}}`, expl: 'Added radicands together.' },
      { math: `\\sqrt{${p1}} + \\sqrt{${p2}}`, expl: 'Incomplete: both radicals can be simplified.' },
      { math: `${t1} + \\sqrt{${c}}`, expl: 'Forgot to distribute to the second term.' },
    ]
  );

  return {
    id,
    topic: 'combined',
    difficulty,
    prompt: 'Apply the distributive property and simplify completely:',
    expression: `\\sqrt{${a}}(\\sqrt{${b}} + \\sqrt{${c}})`,
    options,
    solutionSteps: [
      {
        stepNumber: 1,
        title: 'Distribute across the sum',
        math: `\\sqrt{${a} \\cdot ${b}} + \\sqrt{${a} \\cdot ${c}} = \\sqrt{${p1}} + \\sqrt{${p2}}`,
        explanation: 'Multiply the outer radical into both terms.',
      },
      {
        stepNumber: 2,
        title: 'Simplify each resulting radical',
        math: `\\sqrt{${p1}} = ${t1}, \\quad \\sqrt{${p2}} = ${t2}`,
        explanation: 'Extract largest square factors.',
      },
      {
        stepNumber: 3,
        title: 'Write in simplest form',
        math: `${correctMath}`,
        explanation: 'Terms are unlike radicals and cannot be combined further.',
      },
    ],
    ruleSummary: '\\sqrt{x}(\\sqrt{y} + \\sqrt{z}) = \\sqrt{xy} + \\sqrt{xz}',
  };
}

// Master function to obtain a question:
// Can filter by topic, difficulty, or pick randomly
export function getQuestion(
  topic?: TopicId | 'all',
  difficulty?: DifficultyLevel | 'all',
  excludeIds: string[] = []
): Question {
  // First, check if there's a curated question in QUESTION_BANK that matches
  const filteredBank = QUESTION_BANK.filter(q => {
    if (excludeIds.includes(q.id)) return false;
    if (topic && topic !== 'all' && q.topic !== topic) return false;
    if (difficulty && difficulty !== 'all' && q.difficulty !== difficulty) return false;
    return true;
  });

  // If a bank question matches, 70% of the time return it, or 30% dynamically generate
  if (filteredBank.length > 0 && Math.random() < 0.7) {
    return pickRandom(filteredBank);
  }

  // Otherwise, procedurally generate a guaranteed correct question
  const chosenTopic = topic && topic !== 'all' 
    ? topic 
    : pickRandom<TopicId>(['simplifying', 'multiplication', 'division', 'addition', 'combined']);
  
  const chosenDiff = difficulty && difficulty !== 'all' 
    ? difficulty 
    : (pickRandom([1, 2, 3, 4, 5]) as DifficultyLevel);

  switch (chosenTopic) {
    case 'simplifying':
      return generateSimplifying(chosenDiff);
    case 'multiplication':
      return generateMultiplication(chosenDiff);
    case 'division':
      return generateDivision(chosenDiff);
    case 'addition':
      return generateAddition(chosenDiff);
    case 'combined':
      return generateCombined(chosenDiff);
    default:
      return generateSimplifying(chosenDiff);
  }
}

// Generate a full mock test set of N questions
export function generateMockTestQuestions(
  count: number = 10,
  topics: TopicId[] = ['simplifying', 'multiplication', 'division', 'addition', 'combined'],
  difficultyRange: DifficultyLevel[] = [1, 2, 3, 4, 5]
): Question[] {
  const selected: Question[] = [];
  const usedIds: string[] = [];

  for (let i = 0; i < count; i++) {
    const topic = topics[i % topics.length];
    const diff = difficultyRange[i % difficultyRange.length];
    const q = getQuestion(topic, diff, usedIds);
    selected.push(q);
    usedIds.push(q.id);
  }

  return shuffle(selected);
}
