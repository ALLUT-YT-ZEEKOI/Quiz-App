import React, { useState, useEffect } from 'react';
import {
  X,
  Sliders,
  Check,
  RotateCcw,
  Sparkles,
  HelpCircle,
  Eye
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

const DIFFICULTY_PRESETS = [
  {
    name: 'Basic • Medium • Advanced (Default)',
    labels: ['Basic', 'Medium', 'Advanced']
  },
  {
    name: 'Easy • Medium • Tough',
    labels: ['Easy', 'Medium', 'Tough']
  },
  {
    name: 'Easy • Medium • Hard (Standard)',
    labels: ['Easy', 'Medium', 'Hard']
  },
  {
    name: 'Basic • Intermediate • Advanced (Academic)',
    labels: ['Basic', 'Intermediate', 'Advanced']
  },
  {
    name: 'Level 1 • Level 2 • Level 3 (Tiered)',
    labels: ['Level 1', 'Level 2', 'Level 3']
  },
  {
    name: 'Foundation • Core • Competitive (Exams)',
    labels: ['Foundation', 'Core', 'Competitive']
  }
];

export const EditDifficultyModal = ({ isOpen, onClose }) => {
  const {
    difficultyLevels,
    updateDifficultyLevels,
    resetDifficultyLevels,
    showToast
  } = useApp();

  const [easyLabel, setEasyLabel] = useState('Easy');
  const [medLabel, setMedLabel] = useState('Medium');
  const [hardLabel, setHardLabel] = useState('Hard');

  useEffect(() => {
    if (isOpen && difficultyLevels && difficultyLevels.length >= 3) {
      setEasyLabel(difficultyLevels[0]?.label || 'Easy');
      setMedLabel(difficultyLevels[1]?.label || 'Medium');
      setHardLabel(difficultyLevels[2]?.label || 'Hard');
    }
  }, [isOpen, difficultyLevels]);

  if (!isOpen) return null;

  const handleApplyPreset = (presetLabels) => {
    if (presetLabels && presetLabels.length >= 3) {
      setEasyLabel(presetLabels[0]);
      setMedLabel(presetLabels[1]);
      setHardLabel(presetLabels[2]);
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!easyLabel.trim() || !medLabel.trim() || !hardLabel.trim()) {
      showToast('All three difficulty labels must be filled', 'warning');
      return;
    }

    const updated = [
      {
        id: 'easy',
        label: easyLabel.trim(),
        color: 'emerald',
        dot: '🟢'
      },
      {
        id: 'medium',
        label: medLabel.trim(),
        color: 'amber',
        dot: '🟡'
      },
      {
        id: 'hard',
        label: hardLabel.trim(),
        color: 'red',
        dot: '🔴'
      }
    ];

    updateDifficultyLevels(updated);
    onClose();
  };

  const handleReset = () => {
    resetDifficultyLevels();
    setEasyLabel('Basic');
    setMedLabel('Medium');
    setHardLabel('Advanced');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-surface-darkCard rounded-3xl w-full max-w-lg shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-600/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                Customize Question Difficulty Labels
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Rename the three levels (e.g. Basic, Medium, Advanced) for teachers & students.
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

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-4 sm:p-6 overflow-y-auto space-y-5">
          
          {/* Quick Presets */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>1-Click Preset Options</span>
            </label>
            <div className="flex flex-wrap gap-1.5">
              {DIFFICULTY_PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => handleApplyPreset(preset.labels)}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-slate-100 dark:bg-slate-800/80 hover:bg-blue-50 dark:hover:bg-blue-950/40 text-slate-700 dark:text-slate-300 hover:text-blue-600 border border-slate-200/80 dark:border-slate-700 transition-all active:scale-95"
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>

          {/* 3 Tier Inputs */}
          <div className="space-y-3.5 bg-slate-50/70 dark:bg-slate-900/40 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800">
            {/* Level 1: Easy */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span>Tier 1 Label (Lowest Difficulty)</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={easyLabel}
                  onChange={(e) => setEasyLabel(e.target.value)}
                  placeholder="e.g. Easy, Basic, Beginner"
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-slate-800 dark:text-slate-100 font-medium"
                />
                <span className="absolute right-3 top-2.5 text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-md">
                  🟢 {easyLabel || 'Easy'}
                </span>
              </div>
            </div>

            {/* Level 2: Medium */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span>Tier 2 Label (Mid Difficulty)</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={medLabel}
                  onChange={(e) => setMedLabel(e.target.value)}
                  placeholder="e.g. Medium, Moderate, Intermediate"
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500/20 text-slate-800 dark:text-slate-100 font-medium"
                />
                <span className="absolute right-3 top-2.5 text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950 px-2 py-0.5 rounded-md">
                  🟡 {medLabel || 'Medium'}
                </span>
              </div>
            </div>

            {/* Level 3: Hard */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                <span>Tier 3 Label (Highest Difficulty)</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={hardLabel}
                  onChange={(e) => setHardLabel(e.target.value)}
                  placeholder="e.g. Tough, Hard, Advanced"
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-red-500/20 text-slate-800 dark:text-slate-100 font-medium"
                />
                <span className="absolute right-3 top-2.5 text-[10px] font-bold uppercase tracking-wider text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950 px-2 py-0.5 rounded-md">
                  🔴 {hardLabel || 'Tough'}
                </span>
              </div>
            </div>
          </div>

          {/* Live Preview Box */}
          <div className="p-3.5 rounded-2xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200/70 dark:border-blue-900/50 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-blue-900 dark:text-blue-200">
              <Eye className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>Live Student & Teacher Preview</span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400">
              Students and teachers will see these filter chips on questions and assessments:
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="px-2.5 py-1 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 shadow-2xs">
                All
              </span>
              <span className="px-2.5 py-1 rounded-xl bg-emerald-100 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 text-xs font-bold text-emerald-800 dark:text-emerald-300 shadow-2xs">
                🟢 {easyLabel || 'Easy'}
              </span>
              <span className="px-2.5 py-1 rounded-xl bg-amber-100 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 text-xs font-bold text-amber-800 dark:text-amber-300 shadow-2xs">
                🟡 {medLabel || 'Medium'}
              </span>
              <span className="px-2.5 py-1 rounded-xl bg-red-100 dark:bg-red-950 border border-red-200 dark:border-red-800 text-xs font-bold text-red-800 dark:text-red-300 shadow-2xs">
                🔴 {hardLabel || 'Tough'}
              </span>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={handleReset}
              className="px-3 py-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 text-xs font-bold flex items-center gap-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Defaults</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-blue-500/20 active:scale-95 transition-all"
              >
                <Check className="w-4 h-4" />
                <span>Save Labels</span>
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
};
