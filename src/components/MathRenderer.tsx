import React from 'react';

interface MathRendererProps {
  math: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

// AST Nodes for mathematical expressions
type MathNode = 
  | { type: 'text'; value: string }
  | { type: 'sqrt'; index?: string; content: MathNode[] }
  | { type: 'frac'; num: MathNode[]; den: MathNode[] }
  | { type: 'sup'; base?: MathNode[]; exp: MathNode[] }
  | { type: 'symbol'; symbol: string };

function parseMathString(input: string): MathNode[] {
  const nodes: MathNode[] = [];
  let i = 0;
  const len = input.length;

  function parseGroup(openChar: string = '{', closeChar: string = '}'): string {
    if (i >= len || input[i] !== openChar) return '';
    i++; // skip open char
    let depth = 1;
    let start = i;
    while (i < len) {
      if (input[i] === openChar) depth++;
      else if (input[i] === closeChar) {
        depth--;
        if (depth === 0) {
          const res = input.slice(start, i);
          i++; // skip close char
          return res;
        }
      }
      i++;
    }
    return input.slice(start);
  }

  while (i < len) {
    // Handle LaTeX command
    if (input[i] === '\\') {
      const rest = input.slice(i);
      
      // \sqrt[index]{content} or \sqrt{content}
      if (rest.startsWith('\\sqrt')) {
        i += 5;
        let index: string | undefined = undefined;
        // Check for optional [index]
        if (i < len && input[i] === '[') {
          index = parseGroup('[', ']');
        }
        // Radicand in { ... }
        let radicandStr = '';
        if (i < len && input[i] === '{') {
          radicandStr = parseGroup('{', '}');
        } else if (i < len && /[0-9a-zA-Z]/.test(input[i])) {
          radicandStr = input[i];
          i++;
        }
        nodes.push({
          type: 'sqrt',
          index: index ? index.trim() : undefined,
          content: parseMathString(radicandStr)
        });
        continue;
      }

      // \frac{num}{den}
      if (rest.startsWith('\\frac')) {
        i += 5;
        const numStr = parseGroup('{', '}');
        const denStr = parseGroup('{', '}');
        nodes.push({
          type: 'frac',
          num: parseMathString(numStr),
          den: parseMathString(denStr)
        });
        continue;
      }

      // Special symbols
      if (rest.startsWith('\\cdot')) {
        i += 5;
        nodes.push({ type: 'symbol', symbol: '·' });
        continue;
      }
      if (rest.startsWith('\\times')) {
        i += 6;
        nodes.push({ type: 'symbol', symbol: '×' });
        continue;
      }
      if (rest.startsWith('\\ne') || rest.startsWith('\\neq')) {
        i += rest.startsWith('\\neq') ? 4 : 3;
        nodes.push({ type: 'symbol', symbol: '≠' });
        continue;
      }
      if (rest.startsWith('\\pm')) {
        i += 3;
        nodes.push({ type: 'symbol', symbol: '±' });
        continue;
      }
      if (rest.startsWith('\\le') || rest.startsWith('\\leq')) {
        i += rest.startsWith('\\leq') ? 4 : 3;
        nodes.push({ type: 'symbol', symbol: '≤' });
        continue;
      }
      if (rest.startsWith('\\ge') || rest.startsWith('\\geq')) {
        i += rest.startsWith('\\geq') ? 4 : 3;
        nodes.push({ type: 'symbol', symbol: '≥' });
        continue;
      }
      if (rest.startsWith('\\approx')) {
        i += 7;
        nodes.push({ type: 'symbol', symbol: '≈' });
        continue;
      }

      // Fallback for unknown slash command: skip slash and continue
      i++;
      continue;
    }

    // Exponents / Superscript: e.g. x^2 or x^{14}
    if (input[i] === '^') {
      i++;
      let expStr = '';
      if (i < len && input[i] === '{') {
        expStr = parseGroup('{', '}');
      } else if (i < len) {
        expStr = input[i];
        i++;
      }
      // Attach to previous node or create standalone sup
      nodes.push({
        type: 'sup',
        exp: parseMathString(expStr)
      });
      continue;
    }

    // Subscript: e.g. x_1
    if (input[i] === '_') {
      i++;
      let subStr = '';
      if (i < len && input[i] === '{') {
        subStr = parseGroup('{', '}');
      } else if (i < len) {
        subStr = input[i];
        i++;
      }
      nodes.push({
        type: 'text',
        value: subStr
      });
      continue;
    }

    // Standard characters
    let char = input[i];
    // Replace * with ·
    if (char === '*') {
      char = '·';
    }

    // Group regular text chunks together
    let textChunk = char;
    i++;
    while (i < len && input[i] !== '\\' && input[i] !== '^' && input[i] !== '_' && input[i] !== '{' && input[i] !== '}') {
      let nextChar = input[i];
      if (nextChar === '*') nextChar = '·';
      textChunk += nextChar;
      i++;
    }

    nodes.push({ type: 'text', value: textChunk });
  }

  return nodes;
}

function renderNodeList(nodes: MathNode[], keyPrefix: string = ''): React.ReactNode {
  return nodes.map((node, index) => {
    const key = `${keyPrefix}-${index}`;
    switch (node.type) {
      case 'text':
        return (
          <span key={key} className="inline-block tracking-normal">
            {node.value}
          </span>
        );

      case 'symbol':
        return (
          <span key={key} className="mx-1 font-semibold opacity-90 inline-block">
            {node.symbol}
          </span>
        );

      case 'sup':
        return (
          <sup key={key} className="text-[0.72em] font-medium leading-none align-super ml-0.5">
            {renderNodeList(node.exp, `${key}-exp`)}
          </sup>
        );

      case 'sqrt':
        return (
          <span key={key} className="inline-flex items-center align-baseline mx-0.5 relative group">
            {/* Optional index on top left of radical tick */}
            {node.index && (
              <span className="text-[0.68em] font-bold self-start -mr-1.5 -mt-1 leading-none select-none text-[var(--color-primary-bright,#fbbf24)]">
                {node.index}
              </span>
            )}
            {/* Radical Surd glyph */}
            <span 
              className="text-[1.18em] leading-none select-none font-light"
              style={{ fontFamily: 'system-ui, sans-serif', transform: 'scale(1, 1.1)' }}
            >
              √
            </span>
            {/* Vinculum (the bar across the top of the radicand) */}
            <span className="border-t-[1.75px] border-current pt-[1px] pl-1 pr-1.5 inline-flex items-center -ml-[1px]">
              {renderNodeList(node.content, `${key}-radicand`)}
            </span>
          </span>
        );

      case 'frac':
        return (
          <span key={key} className="inline-flex flex-col items-center justify-center align-middle mx-1 text-center select-text">
            {/* Numerator */}
            <span className="px-1.5 pb-0.5 text-[0.92em] inline-flex items-center justify-center border-b-[1.75px] border-current w-full">
              {renderNodeList(node.num, `${key}-num`)}
            </span>
            {/* Denominator */}
            <span className="px-1.5 pt-0.5 text-[0.92em] inline-flex items-center justify-center w-full">
              {renderNodeList(node.den, `${key}-den`)}
            </span>
          </span>
        );

      default:
        return null;
    }
  });
}

export const MathRenderer: React.FC<MathRendererProps> = ({ 
  math, 
  className = '', 
  size = 'md' 
}) => {
  if (!math) return null;

  const sizeClasses = {
    sm: 'text-sm md:text-base leading-relaxed',
    md: 'text-base md:text-lg leading-relaxed',
    lg: 'text-lg md:text-2xl leading-normal font-medium',
    xl: 'text-2xl md:text-3xl leading-normal font-semibold',
  };

  const parsedNodes = parseMathString(math);

  return (
    <span 
      className={`font-mono inline-flex items-center flex-wrap align-middle select-text ${sizeClasses[size]} ${className}`}
      style={{ fontFamily: 'var(--term-font-math)' }}
    >
      {renderNodeList(parsedNodes, 'root')}
    </span>
  );
};

export default MathRenderer;
