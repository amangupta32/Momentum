import React, { useState } from 'react';
import {
  CalendarCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  ShieldAlert,
  Flame,
  Plus,
  Trash2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const WeeklyReviewView: React.FC = () => {
  const {
    tasks,
    currentUser,
    activeWorkspace,
    weeklyReviews,
    createWeeklyReview,
    setActiveTab,
  } = useApp();

  // 5 Step Guided Wizard:
  // Step 1: Review Completed Work
  // Step 2: Review Unfinished Work
  // Step 3: Identify Blockers & Friction
  // Step 4: Next Week's Priorities
  // Step 5: Reflection Journal & Final Submit

  const [step, setStep] = useState<number>(1);

  // Form states
  const [blockersNotes, setBlockersNotes] = useState('');
  const [priorityItems, setPriorityItems] = useState<string[]>([
    'Ship the beta pilot onboarding checklist',
    'Execute 5 customer interview reviews',
  ]);
  const [newPriorityInput, setNewPriorityInput] = useState('');
  const [reflectionText, setReflectionText] = useState('');

  const completedTasks = tasks.filter(
    (t) => t.workspaceId === activeWorkspace.id && t.status === 'done'
  );

  const unfinishedTasks = tasks.filter(
    (t) => t.workspaceId === activeWorkspace.id && t.status !== 'done'
  );

  const handleAddPriority = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPriorityInput.trim()) return;
    setPriorityItems([...priorityItems, newPriorityInput.trim()]);
    setNewPriorityInput('');
  };

  const handleRemovePriority = (idx: number) => {
    setPriorityItems(priorityItems.filter((_, i) => i !== idx));
  };

  const handleCompleteReview = () => {
    createWeeklyReview({
      workspaceId: activeWorkspace.id,
      userId: currentUser.id,
      weekStartDate: new Date().toISOString().split('T')[0],
      completedTaskIds: completedTasks.map((t) => t.id),
      unfinishedTaskIds: unfinishedTasks.map((t) => t.id),
      blockers: blockersNotes.trim(),
      nextWeekPriorities: priorityItems,
      reflection: reflectionText.trim(),
    });
    setStep(6); // Success summary step
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2 pb-4 border-b border-[#E8E4DA]">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#1E3A2F]/10 text-[#1E3A2F] rounded-full text-xs font-semibold">
          <CalendarCheck size={14} />
          <span>The Guided Weekly Reset</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#1C221F] font-display">
          Reflect, Realign & Recharge
        </h1>
        <p className="text-xs text-[#5C6560] max-w-lg mx-auto">
          Close out open loops, celebrate actual wins, triage stalled tasks, and set high-leverage intentions for the week ahead.
        </p>

        {/* Wizard progress steps */}
        {step <= 5 && (
          <div className="flex items-center justify-center gap-2 pt-4">
            {[1, 2, 3, 4, 5].map((s) => (
              <div
                key={s}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  s === step
                    ? 'w-8 bg-[#1E3A2F]'
                    : s < step
                    ? 'w-4 bg-emerald-600'
                    : 'w-4 bg-[#E8E4DA]'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* STEP 1: REVIEW COMPLETED WINS */}
      {step === 1 && (
        <div className="bg-white rounded-2xl border border-[#E8E4DA] p-6 shadow-2xs space-y-5 animate-fade-in">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-[#1C221F] uppercase tracking-wider flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-600" />
              <span>Step 1: Celebrate Completed Deliverables ({completedTasks.length})</span>
            </h2>
            <span className="text-xs text-[#8E9892]">1 of 5</span>
          </div>

          <p className="text-xs text-[#5C6560]">
            Review what you and your team accomplished. Momentum begins with recognizing deliberate execution.
          </p>

          <div className="space-y-2 max-h-60 overflow-y-auto">
            {completedTasks.length === 0 ? (
              <div className="p-4 text-center text-xs text-[#8E9892] bg-[#FAF8F5] rounded-xl border border-dashed border-[#E8E4DA]">
                No completed tasks recorded for this period yet.
              </div>
            ) : (
              completedTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center gap-2.5 p-2.5 rounded-xl border border-[#E8E4DA] bg-[#FAF8F5]/50 text-xs"
                >
                  <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
                  <span className="truncate font-medium text-[#1C221F]">{task.title}</span>
                </div>
              ))
            )}
          </div>

          <div className="pt-4 border-t border-[#E8E4DA] flex justify-end">
            <button
              onClick={() => setStep(2)}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#1E3A2F] text-white text-xs font-semibold rounded-xl shadow-xs hover:bg-[#162A22]"
            >
              <span>Next: Unfinished Tasks</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: REVIEW UNFINISHED WORK */}
      {step === 2 && (
        <div className="bg-white rounded-2xl border border-[#E8E4DA] p-6 shadow-2xs space-y-5 animate-fade-in">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-[#1C221F] uppercase tracking-wider flex items-center gap-2">
              <Clock size={16} className="text-amber-600" />
              <span>Step 2: Inspect Unfinished Work ({unfinishedTasks.length})</span>
            </h2>
            <span className="text-xs text-[#8E9892]">2 of 5</span>
          </div>

          <p className="text-xs text-[#5C6560]">
            Take inventory of carryover tasks. Are these still important or should they be reprioritized?
          </p>

          <div className="space-y-2 max-h-60 overflow-y-auto">
            {unfinishedTasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center justify-between p-2.5 rounded-xl border border-[#E8E4DA] hover:bg-[#FAF8F5] text-xs"
              >
                <span className="truncate font-medium text-[#1C221F]">{task.title}</span>
                <span className="text-[10px] capitalize px-2 py-0.5 rounded bg-[#F2EFE9] text-[#5C6560]">
                  {task.status.replace('_', ' ')}
                </span>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-[#E8E4DA] flex justify-between">
            <button
              onClick={() => setStep(1)}
              className="flex items-center gap-1.5 px-4 py-2 border border-[#E8E4DA] text-xs font-medium text-[#5C6560] hover:text-[#1C221F] rounded-xl"
            >
              <ArrowLeft size={14} />
              <span>Back</span>
            </button>
            <button
              onClick={() => setStep(3)}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#1E3A2F] text-white text-xs font-semibold rounded-xl shadow-xs hover:bg-[#162A22]"
            >
              <span>Next: Blocker Triage</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: BLOCKER ANALYSIS */}
      {step === 3 && (
        <div className="bg-white rounded-2xl border border-[#E8E4DA] p-6 shadow-2xs space-y-5 animate-fade-in">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-[#1C221F] uppercase tracking-wider flex items-center gap-2">
              <ShieldAlert size={16} className="text-rose-600" />
              <span>Step 3: Identify Blockers & Friction</span>
            </h2>
            <span className="text-xs text-[#8E9892]">3 of 5</span>
          </div>

          <p className="text-xs text-[#5C6560]">
            What slowed you down? What dependencies or unclear requirements caused delays?
          </p>

          <textarea
            rows={5}
            value={blockersNotes}
            onChange={(e) => setBlockersNotes(e.target.value)}
            placeholder="e.g. Waiting on third-party API keys, unexpected scope creep in payment flow..."
            className="w-full p-3 text-xs rounded-xl border border-[#E8E4DA] focus:border-[#1E3A2F] outline-none"
          />

          <div className="pt-4 border-t border-[#E8E4DA] flex justify-between">
            <button
              onClick={() => setStep(2)}
              className="flex items-center gap-1.5 px-4 py-2 border border-[#E8E4DA] text-xs font-medium text-[#5C6560] rounded-xl"
            >
              <ArrowLeft size={14} />
              <span>Back</span>
            </button>
            <button
              onClick={() => setStep(4)}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#1E3A2F] text-white text-xs font-semibold rounded-xl shadow-xs hover:bg-[#162A22]"
            >
              <span>Next: Next Week's Priorities</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: NEXT WEEK'S PRIORITIES */}
      {step === 4 && (
        <div className="bg-white rounded-2xl border border-[#E8E4DA] p-6 shadow-2xs space-y-5 animate-fade-in">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-[#1C221F] uppercase tracking-wider flex items-center gap-2">
              <Sparkles size={16} className="text-[#1E3A2F]" />
              <span>Step 4: Set 2–4 Non-Negotiable Priorities</span>
            </h2>
            <span className="text-xs text-[#8E9892]">4 of 5</span>
          </div>

          <p className="text-xs text-[#5C6560]">
            Focus is saying no. What are the few critical outcomes that will move the needle next week?
          </p>

          <div className="space-y-2">
            {priorityItems.map((p, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2.5 rounded-xl border border-[#E8E4DA] bg-[#FAF8F5] text-xs"
              >
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-[#1E3A2F]">{idx + 1}.</span>
                  <span className="font-medium text-[#1C221F]">{p}</span>
                </div>
                <button
                  onClick={() => handleRemovePriority(idx)}
                  className="text-[#8E9892] hover:text-rose-600 p-1"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>

          {/* Add priority input */}
          <form onSubmit={handleAddPriority} className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. Conduct pilot demo with team lead"
              value={newPriorityInput}
              onChange={(e) => setNewPriorityInput(e.target.value)}
              className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-[#E8E4DA] focus:border-[#1E3A2F] outline-none"
            />
            <button
              type="submit"
              className="px-3 py-1.5 text-xs font-semibold text-white bg-[#1E3A2F] rounded-xl shadow-2xs"
            >
              Add
            </button>
          </form>

          <div className="pt-4 border-t border-[#E8E4DA] flex justify-between">
            <button
              onClick={() => setStep(3)}
              className="flex items-center gap-1.5 px-4 py-2 border border-[#E8E4DA] text-xs font-medium text-[#5C6560] rounded-xl"
            >
              <ArrowLeft size={14} />
              <span>Back</span>
            </button>
            <button
              onClick={() => setStep(5)}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#1E3A2F] text-white text-xs font-semibold rounded-xl shadow-xs hover:bg-[#162A22]"
            >
              <span>Next: Reflection</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* STEP 5: REFLECTION & SUBMIT */}
      {step === 5 && (
        <div className="bg-white rounded-2xl border border-[#E8E4DA] p-6 shadow-2xs space-y-5 animate-fade-in">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-[#1C221F] uppercase tracking-wider flex items-center gap-2">
              <CalendarCheck size={16} className="text-[#1E3A2F]" />
              <span>Step 5: Reflection & Commit</span>
            </h2>
            <span className="text-xs text-[#8E9892]">5 of 5</span>
          </div>

          <p className="text-xs text-[#5C6560]">
            One honest takeaway from this past week to lock in learning.
          </p>

          <textarea
            rows={4}
            value={reflectionText}
            onChange={(e) => setReflectionText(e.target.value)}
            placeholder="What worked well? What habit or process could be 5% better next week?"
            className="w-full p-3 text-xs rounded-xl border border-[#E8E4DA] focus:border-[#1E3A2F] outline-none"
          />

          <div className="pt-4 border-t border-[#E8E4DA] flex justify-between">
            <button
              onClick={() => setStep(4)}
              className="flex items-center gap-1.5 px-4 py-2 border border-[#E8E4DA] text-xs font-medium text-[#5C6560] rounded-xl"
            >
              <ArrowLeft size={14} />
              <span>Back</span>
            </button>
            <button
              onClick={handleCompleteReview}
              className="flex items-center gap-1.5 px-5 py-2.5 bg-[#1E3A2F] hover:bg-[#162A22] text-white text-xs font-bold rounded-xl shadow-md transition-all"
            >
              <Flame size={14} className="fill-amber-400 text-amber-400" />
              <span>Complete Weekly Reset</span>
            </button>
          </div>
        </div>
      )}

      {/* STEP 6: COMPLETION SUMMARY */}
      {step === 6 && (
        <div className="bg-white rounded-2xl border border-[#E8E4DA] p-8 text-center space-y-4 shadow-sm animate-scale-in">
          <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center mx-auto">
            <Sparkles size={28} />
          </div>
          <h2 className="text-xl font-bold text-[#1C221F] font-display">
            Weekly Reset Recorded!
          </h2>
          <p className="text-xs text-[#5C6560] max-w-md mx-auto">
            Your review and next week priorities have been safely stored. Your momentum streak is active and ready for execution.
          </p>

          <div className="pt-4 flex justify-center gap-3">
            <button
              onClick={() => setStep(1)}
              className="px-4 py-2 text-xs font-medium text-[#5C6560] border border-[#E8E4DA] rounded-xl hover:bg-[#FAF8F5]"
            >
              Review Again
            </button>
            <button
              onClick={() => setActiveTab('home')}
              className="px-5 py-2 text-xs font-semibold text-white bg-[#1E3A2F] rounded-xl shadow-xs hover:bg-[#162A22]"
            >
              Back to Overview
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
