'use client';

import { motion } from 'framer-motion';
import { Target, Calendar, CheckCircle2, Sparkles } from 'lucide-react';

interface GoalProgressCardProps {
  goal: {
    id: string;
    title: string;
    description?: string;
    targetAmount: number;
    currentAmount: number;
    currency: string;
    deadline?: string;
    status: string;
  };
}

export default function GoalProgressCard({ goal }: GoalProgressCardProps) {
  const current = Number(goal.currentAmount);
  const target = Number(goal.targetAmount);
  const percent = Math.min(Math.round((current / target) * 100), 100);
  const isCompleted = current >= target || goal.status === 'COMPLETED';

  // Format date helper
  const getDaysLeft = () => {
    if (!goal.deadline) return null;
    const deadlineDate = new Date(goal.deadline);
    const today = new Date();
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const daysLeft = getDaysLeft();

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-zinc-900 border border-black/5 dark:border-white/5 rounded-3xl p-6 md:p-8 card-shadow relative overflow-hidden mb-8"
    >
      {/* Background Subtle Gradient Glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[10px] font-bold text-amber-600 bg-amber-50 dark:bg-amber-950/30 dark:text-amber-400 px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5">
              <Target size={12} /> Creator Goal
            </span>
            {isCompleted && (
              <span className="text-[10px] font-bold text-green-600 bg-green-50 dark:bg-green-950/30 dark:text-green-400 px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
                <CheckCircle2 size={12} /> Achieved!
              </span>
            )}
          </div>
          <h3 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">{goal.title}</h3>
        </div>

        {isCompleted && (
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="text-amber-500"
          >
            <Sparkles size={24} />
          </motion.div>
        )}
      </div>

      {goal.description && (
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 font-medium leading-relaxed">
          {goal.description}
        </p>
      )}

      {/* Progress Stats */}
      <div className="flex justify-between items-baseline mb-3">
        <div className="text-sm font-semibold opacity-70">
          Raised <span className="text-lg font-bold text-gray-900 dark:text-white">{goal.currency} {current.toLocaleString()}</span>
        </div>
        <div className="text-sm font-semibold opacity-70">
          Target: <span className="font-bold text-gray-900 dark:text-white">{goal.currency} {target.toLocaleString()}</span>
        </div>
      </div>

      {/* Animated Progress Bar */}
      <div className="w-full h-4 bg-gray-100 dark:bg-zinc-800 rounded-full overflow-hidden mb-4 relative">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="h-full bg-gradient-to-r from-amber-500 to-amber-600 rounded-full"
        />
      </div>

      <div className="flex justify-between items-center text-xs font-semibold text-gray-500 dark:text-gray-400">
        <span>{percent}% Completed</span>
        {daysLeft !== null && (
          <span className="flex items-center gap-1">
            <Calendar size={12} /> {daysLeft} {daysLeft === 1 ? 'day' : 'days'} remaining
          </span>
        )}
      </div>

      {/* Celebration Overlay Effect when completed */}
      {isCompleted && (
        <div className="absolute inset-0 pointer-events-none border-2 border-green-500/20 rounded-3xl animate-pulse" />
      )}
    </motion.div>
  );
}
