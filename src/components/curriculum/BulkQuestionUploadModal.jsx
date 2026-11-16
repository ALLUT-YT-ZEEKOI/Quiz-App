import React, { useState, useMemo, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import {
  X,
  FileText,
  Upload,
  Copy,
  Check,
  CheckCircle2,
  AlertTriangle,
  Trash2,
  Sparkles,
  HelpCircle,
  Download,
  Info,
  Layers,
  ArrowRight
} from 'lucide-react';

const A4_TEMPLATE_TEXT = `1. What is the minimum compressive strength of 53 grade OPC cement at 28 days?
A) 33 MPa
B) 43 MPa
C) 53 MPa
D) 63 MPa
Answer: C
Difficulty: Medium
Explanation: As per IS 12269, 53 grade cement has minimum 53 MPa compressive strength at 28 days.

2. Which Indian standard code is used for the design of general steel structures?
A) IS 800:2007
B) IS 456:2000
C) IS 1893:2016
D) IRC 6:2017
Answer: A
Difficulty: Easy
Explanation: IS 800:2007 is the code of practice for general construction in steel.

3. A slump value of 100 mm in a concrete test indicates what degree of workability?
A) Very Low
B) Low
C) Medium
D) High
Answer: C
Difficulty: Hard
Explanation: A slump of 50-100 mm corresponds to medium workability as per IS 456 Table 2.
`;

const A4_BLANK_TEMPLATE = `1. [Enter your question statement here]
A) [First option]
B) [Second option]
C) [Third option]
D) [Fourth option]
Answer: A
Difficulty: Medium
Explanation: [Optional explanation or code reference]

2. [Enter your second question here]
A) [First option]
B) [Second option]
C) [Third option]
D) [Fourth option]
Answer: B
Difficulty: Easy
Explanation: [Optional explanation]
`;

export function parseA4Questions(text) {
  if (!text || !text.trim()) return [];
  const normalized = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim();

  // Split questions on:
  // 1) Empty blank line followed by Question indicator
  // 2) Or newline followed by question numbering (1. / Q1. / Question 1:)
  let rawBlocks = normalized
    .split(/(?:\n\s*\n|\n(?=(?:Q(?:uestion)?\s*\d+[\.\:\)]|\d+[\.\)])\s+))/i)
    .map((b) => b.trim())
    .filter(Boolean);

  // Group blocks that belong to the same question if split too aggressively
  const validBlocks = [];
  let currentBlock = '';

  for (const block of rawBlocks) {
    const hasOptions = /(?:^[A-Da-d][\.\)]|^\([A-Da-d]\))/m.test(block);
    const hasAnswer = /(?:answer|ans|correct)/i.test(block);

    if (hasOptions || hasAnswer) {
      if (currentBlock) {
        validBlocks.push(currentBlock);
        currentBlock = '';
      }
      validBlocks.push(block);
    } else {
      currentBlock = currentBlock ? currentBlock + '\n' + block : block;
    }
  }
  if (currentBlock) {
    if (validBlocks.length > 0 && !/(?:^[A-Da-d][\.\)]|^\([A-Da-d]\))/m.test(currentBlock)) {
      validBlocks[validBlocks.length - 1] += '\n' + currentBlock;
    } else {
      validBlocks.push(currentBlock);
    }
  }

  const blocksToProcess = validBlocks.length > 0 ? validBlocks : rawBlocks;

  return blocksToProcess.map((block, idx) => {
    const lines = block.split('\n').map((l) => l.trim()).filter(Boolean);
    let questionLines = [];
    let options = [];
    let correctAnswer = 0;
    let difficulty = 'Medium';
    let explanation = '';
    let readingQuestion = true;

    for (let i = 0; i < lines.length; i++) {
      let line = lines[i];

      // Strip leading question indicator on first line: "1.", "Q1.", "Question 1:"
      if (i === 0) {
        line = line.replace(/^(?:Q(?:uestion)?\s*\d+[\.\:\)]|\d+[\.\)])\s+/i, '').trim();
      }

      // Check difficulty / mode / level (matches Easy, Medium, Hard, Tough, Moderate, etc.)
      const diffMatch = line.match(/^(?:difficulty|mode|level)\s*[:=\-]\s*([a-zA-Z0-9\s]+)$/i);
      if (diffMatch) {
        difficulty = diffMatch[1].trim();
        readingQuestion = false;
        continue;
      }

      // Check explanation / note / reason / solution
      const expMatch = line.match(/^(?:explanation|exp|reason|solution|note)\s*[:=\-]\s*(.+)/i);
      if (expMatch) {
        explanation = expMatch[1].trim();
        readingQuestion = false;
        continue;
      }

      // Check answer (e.g. Answer: B, Ans: 1, Correct: C, etc.)
      const ansMatch = line.match(/^(?:answer|ans|correct(?:\s*answer)?)\s*[:=\-]\s*([a-dA-D1-4])/i);
      if (ansMatch) {
        const val = ansMatch[1].toUpperCase();
        if (val === 'A' || val === '1') correctAnswer = 0;
        else if (val === 'B' || val === '2') correctAnswer = 1;
        else if (val === 'C' || val === '3') correctAnswer = 2;
        else if (val === 'D' || val === '4') correctAnswer = 3;
        readingQuestion = false;
        continue;
      }

      // Check option letter: A) / A. / (A) / a) / a. / (a)
      const optLetterMatch = line.match(/^(?:([A-Da-d])[\.\)]|\(([A-Da-d])\))\s+(.+)$/);
      if (optLetterMatch) {
        readingQuestion = false;
        options.push(optLetterMatch[3].trim());
        continue;
      }

      // Check if options are inline e.g. "A) Yes  B) No  C) Maybe  D) None"
      const inlineMatches = [
        ...line.matchAll(
          /(?:([A-Da-d])[\.\)]|\(([A-Da-d])\))\s+([^A-Da-d\n]+?)(?=(?:[A-Da-d][\.\)]|\([A-Da-d]\))|$)/g
        )
      ];
      if (inlineMatches.length >= 2) {
        readingQuestion = false;
        for (let m of inlineMatches) {
          options.push(m[3].trim());
        }
        continue;
      }

      if (readingQuestion) {
        questionLines.push(line);
      } else if (explanation) {
        explanation += ' ' + line;
      }
    }

    let question = questionLines.join(' ').trim();

    // Pad options up to 4
    const paddedOptions = [...options];
    while (paddedOptions.length < 4) {
      paddedOptions.push('');
    }

    return {
      tempId: `bulk-${idx}`,
      question,
      options: paddedOptions.slice(0, 4),
      correctAnswer: correctAnswer >= 0 && correctAnswer < 4 ? correctAnswer : 0,
      difficulty: difficulty || 'Medium',
      explanation
    };
  });
}

export const BulkQuestionUploadModal = ({
  isOpen,
  onClose,
  subjectName,
  moduleName,
  onImport
}) => {
  const { difficultyLevels = [], matchesDifficulty = () => false } = useApp();
  const [inputText, setInputText] = useState('');
  const [activeTab, setActiveTab] = useState('paste'); // 'paste' | 'preview'
  const [copiedTemplate, setCopiedTemplate] = useState(false);
  const [editableQuestions, setEditableQuestions] = useState([]);
  const fileInputRef = useRef(null);

  // When text changes, re-parse and populate editableQuestions
  const handleTextChange = (text) => {
    setInputText(text);
    const parsed = parseA4Questions(text);
    setEditableQuestions(parsed);
  };

  // Quick fill sample
  const handleFillSample = () => {
    handleTextChange(A4_TEMPLATE_TEXT);
  };

  // Copy blank template
  const handleCopyTemplate = () => {
    navigator.clipboard.writeText(A4_BLANK_TEMPLATE);
    setCopiedTemplate(true);
    setTimeout(() => setCopiedTemplate(false), 2000);
  };

  // Download template as text file
  const handleDownloadTemplate = () => {
    const blob = new Blob([A4_BLANK_TEMPLATE], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `cohesiontech_a4_quiz_template.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Handle local text file upload (.txt, .csv)
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content === 'string') {
        handleTextChange(content);
      }
    };
    reader.readAsText(file);
    // Reset file input so re-selecting works
    e.target.value = '';
  };

  // Editable question modifications in preview
  const handleUpdateDifficulty = (index, newDiff) => {
    setEditableQuestions((prev) =>
      prev.map((q, idx) => (idx === index ? { ...q, difficulty: newDiff } : q))
    );
  };

  const handleUpdateCorrectAnswer = (index, ansIdx) => {
    setEditableQuestions((prev) =>
      prev.map((q, idx) => (idx === index ? { ...q, correctAnswer: ansIdx } : q))
    );
  };

  const handleDeleteParsedQuestion = (index) => {
    setEditableQuestions((prev) => prev.filter((_, idx) => idx !== index));
  };

  // Validation metrics
  const { validQuestions, invalidQuestions } = useMemo(() => {
    const valid = [];
    const invalid = [];

    editableQuestions.forEach((q) => {
      const hasQuestion = !!q.question.trim();
      const hasAllOptions = q.options.every((opt) => !!opt.trim());
      const hasValidAnswer = q.correctAnswer >= 0 && q.correctAnswer < 4;

      if (hasQuestion && hasAllOptions && hasValidAnswer) {
        valid.push(q);
      } else {
        invalid.push({
          ...q,
          reasons: [
            !hasQuestion ? 'Missing question statement' : null,
            !hasAllOptions ? 'Requires 4 full options (A, B, C, D)' : null,
            !hasValidAnswer ? 'Answer line not detected' : null
          ].filter(Boolean)
        });
      }
    });

    return { validQuestions: valid, invalidQuestions: invalid };
  }, [editableQuestions]);

  const handleExecuteImport = () => {
    if (validQuestions.length === 0) return;
    const finalData = validQuestions.map((q) => ({
      question: q.question,
      options: q.options,
      correctAnswer: q.correctAnswer,
      difficulty: q.difficulty,
      explanation: q.explanation || ''
    }));

    onImport(finalData);
    onClose();
    setInputText('');
    setEditableQuestions([]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-navy-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-surface-darkCard rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                  Bulk Upload Questions (A4 Format)
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300">
                  {moduleName || 'Current Module'}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Copy and paste multiple questions directly from your Word, PDF, or A4 exam paper.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Bar / Template Helpers */}
        <div className="px-4 py-2.5 sm:px-6 bg-slate-100/70 dark:bg-slate-800/40 border-b border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleFillSample}
              className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold flex items-center gap-1.5 shadow-xs transition-all active:scale-95"
              title="Populate 3 sample civil engineering questions to test"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Fill Sample Questions</span>
            </button>

            <button
              onClick={handleCopyTemplate}
              className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold border border-slate-300 dark:border-slate-700 flex items-center gap-1.5 transition-all"
            >
              {copiedTemplate ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-600 font-bold">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-500" />
                  <span>Copy Blank Template</span>
                </>
              )}
            </button>

            <button
              onClick={handleDownloadTemplate}
              className="hidden sm:flex px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold border border-slate-300 dark:border-slate-700 items-center gap-1.5 transition-all"
              title="Download text file template"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Download .txt</span>
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-2.5 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-semibold border border-blue-200 dark:border-blue-800/60 flex items-center gap-1.5 transition-all"
            >
              <Upload className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>Upload File (.txt)</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".txt,.csv"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>

          {inputText && (
            <button
              onClick={() => handleTextChange('')}
              className="text-slate-400 hover:text-red-500 font-medium transition-colors"
            >
              Clear Text
            </button>
          )}
        </div>

        {/* View Switcher Tabs (Paste vs Preview) */}
        <div className="flex items-center gap-2 px-4 sm:px-6 pt-3 border-b border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setActiveTab('paste')}
            className={`pb-2.5 px-3 font-bold text-xs sm:text-sm border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'paste'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>1. Paste A4 Text</span>
          </button>

          <button
            onClick={() => setActiveTab('preview')}
            className={`pb-2.5 px-3 font-bold text-xs sm:text-sm border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'preview'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>2. Live Review & Validation</span>
            {editableQuestions.length > 0 && (
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                  validQuestions.length > 0
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                    : 'bg-slate-200 text-slate-700'
                }`}
              >
                {validQuestions.length} Ready
              </span>
            )}
          </button>
        </div>

        {/* Content Area */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
          {activeTab === 'paste' ? (
            <div className="space-y-4">
              {/* Instructions banner */}
              <div className="p-3.5 rounded-2xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200/70 dark:border-blue-900/50 flex items-start gap-3 text-xs">
                <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                <div className="space-y-1 text-slate-600 dark:text-slate-300 leading-relaxed">
                  <div className="font-bold text-slate-800 dark:text-slate-100">
                    A4 Question Paper Format Guide:
                  </div>
                  <div>
                    Each question should follow this simple layout:
                  </div>
                  <div className="font-mono bg-white dark:bg-slate-900 p-2 rounded-xl border border-blue-100 dark:border-slate-800 text-[11px] text-slate-700 dark:text-slate-300">
                    <div>1. Your question text here</div>
                    <div>A) First option</div>
                    <div>B) Second option</div>
                    <div>C) Third option</div>
                    <div>D) Fourth option</div>
                    <div className="text-emerald-600 dark:text-emerald-400 font-bold">Answer: B</div>
                    <div className="text-amber-600 dark:text-amber-400">Difficulty: Medium <span className="text-slate-400 font-normal">(Optional: Easy, Medium, or Hard)</span></div>
                    <div className="text-slate-400">Explanation: Brief notes <span className="font-normal">(Optional)</span></div>
                  </div>
                </div>
              </div>

              {/* Textarea */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <label htmlFor="a4-input" className="font-semibold text-slate-700 dark:text-slate-300">
                    Paste A4 Questions Below:
                  </label>
                  <span>
                    {editableQuestions.length} questions detected
                  </span>
                </div>
                <textarea
                  id="a4-input"
                  value={inputText}
                  onChange={(e) => handleTextChange(e.target.value)}
                  placeholder={`1. What is the minimum grade of concrete for reinforced concrete as per IS 456:2000?\nA) M15\nB) M20\nC) M25\nD) M30\nAnswer: B\nDifficulty: Easy\nExplanation: Clause 6.1 specifies M20 as minimum for RCC.\n\n2. Next question...`}
                  rows={13}
                  className="w-full font-mono text-xs p-3.5 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 leading-relaxed placeholder:text-slate-400"
                />
              </div>

              {/* Quick switch to preview */}
              {editableQuestions.length > 0 && (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-2xl border border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-emerald-800 dark:text-emerald-300 font-semibold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Parsed {editableQuestions.length} questions ({validQuestions.length} ready to import)</span>
                  </div>
                  <button
                    onClick={() => setActiveTab('preview')}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 transition-all"
                  >
                    <span>Review Questions</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* PREVIEW TAB */
            <div className="space-y-4">
              {/* Status Header */}
              <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-800 dark:text-white">
                    Parsed: {editableQuestions.length} Total
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                    ✓ {validQuestions.length} Valid
                  </span>
                  {invalidQuestions.length > 0 && (
                    <>
                      <span className="text-slate-300">•</span>
                      <span className="text-amber-600 dark:text-amber-400 font-bold">
                        ⚠️ {invalidQuestions.length} Needs Attention
                      </span>
                    </>
                  )}
                </div>

                <div className="text-[11px] text-slate-500">
                  Click on an option to change the correct answer, or adjust difficulty.
                </div>
              </div>

              {/* Questions List */}
              {editableQuestions.length === 0 ? (
                <div className="p-10 text-center text-slate-400 space-y-2">
                  <HelpCircle className="w-10 h-10 mx-auto text-slate-300" />
                  <p className="text-sm">No questions detected yet.</p>
                  <button
                    onClick={handleFillSample}
                    className="text-xs text-emerald-600 hover:underline font-bold"
                  >
                    Click here to load sample questions
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {editableQuestions.map((q, qIndex) => {
                    const isQuestionValid =
                      q.question.trim() &&
                      q.options.every((o) => !!o.trim()) &&
                      q.correctAnswer >= 0 &&
                      q.correctAnswer < 4;

                    return (
                      <div
                        key={q.tempId || qIndex}
                        className={`p-4 rounded-2xl border transition-all ${
                          isQuestionValid
                            ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xs'
                            : 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-300 dark:border-amber-800'
                        }`}
                      >
                        {/* Question Top Bar */}
                        <div className="flex items-start justify-between gap-3 mb-2.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center justify-center shrink-0">
                              Q{qIndex + 1}
                            </span>

                            {/* Difficulty Selector */}
                            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg text-[10px] font-bold">
                              {difficultyLevels.map((lvl) => {
                                const isSelected = matchesDifficulty(q.difficulty, lvl.id);
                                return (
                                  <button
                                    key={lvl.id}
                                    type="button"
                                    onClick={() => handleUpdateDifficulty(qIndex, lvl.label)}
                                    className={`px-2 py-0.5 rounded-md transition-all ${
                                      isSelected
                                        ? lvl.color === 'emerald'
                                          ? 'bg-emerald-600 text-white'
                                          : lvl.color === 'red'
                                          ? 'bg-red-600 text-white'
                                          : 'bg-amber-500 text-white'
                                        : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-200'
                                    }`}
                                  >
                                    {lvl.label}
                                  </button>
                                );
                              })}
                            </div>

                            {/* Validity Status */}
                            {isQuestionValid ? (
                              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 flex items-center gap-1">
                                <Check className="w-3 h-3" /> Ready
                              </span>
                            ) : (
                              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3" /> Incomplete Options
                              </span>
                            )}
                          </div>

                          {/* Delete Question from batch */}
                          <button
                            onClick={() => handleDeleteParsedQuestion(qIndex)}
                            className="p-1 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                            title="Remove this question"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Question Text */}
                        <p className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white mb-3 leading-relaxed">
                          {q.question || <span className="text-red-500 italic">No question statement found</span>}
                        </p>

                        {/* Options Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs mb-2">
                          {q.options.map((opt, optIdx) => {
                            const isCorrect = q.correctAnswer === optIdx;
                            const optionLetter = ['A', 'B', 'C', 'D'][optIdx];

                            return (
                              <button
                                key={optIdx}
                                type="button"
                                onClick={() => handleUpdateCorrectAnswer(qIndex, optIdx)}
                                className={`text-left p-2.5 rounded-xl border flex items-center gap-2.5 transition-all ${
                                  isCorrect
                                    ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-500 dark:border-emerald-500 text-emerald-900 dark:text-emerald-100 font-bold shadow-xs'
                                    : 'bg-slate-50/50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                                }`}
                              >
                                <span
                                  className={`w-5 h-5 rounded-md flex items-center justify-center font-bold text-[10px] shrink-0 ${
                                    isCorrect
                                      ? 'bg-emerald-600 text-white'
                                      : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                                  }`}
                                >
                                  {optionLetter}
                                </span>
                                <span className="truncate flex-1">
                                  {opt || <span className="text-red-400 italic">Empty option</span>}
                                </span>
                                {isCorrect && (
                                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono font-bold shrink-0">
                                    ✓ Correct
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>

                        {/* Explanation */}
                        {q.explanation && (
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/30 p-2 rounded-xl mt-2 border border-slate-100 dark:border-slate-800/60">
                            <span className="font-bold text-slate-700 dark:text-slate-300">Explanation: </span>
                            {q.explanation}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-slate-500">
            {validQuestions.length > 0 ? (
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                ✓ Ready to import {validQuestions.length} questions
              </span>
            ) : (
              <span>Paste questions or click 'Fill Sample Questions'</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleExecuteImport}
              disabled={validQuestions.length === 0}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs sm:text-sm font-bold flex items-center gap-2 shadow-md shadow-emerald-500/20 active:scale-95 transition-all"
            >
              <Check className="w-4 h-4" />
              <span>Import {validQuestions.length} Questions</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
