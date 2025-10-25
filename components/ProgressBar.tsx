import React from 'react';
import { motion } from 'framer-motion';

const MILESTONES = [1, 5, 10, 25, 50, 100];

interface ProgressBarProps {
    totalTrees: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ totalTrees }) => {
    const currentMilestoneIndex = MILESTONES.findIndex(m => totalTrees < m);
    const prevMilestone = currentMilestoneIndex > 0 ? MILESTONES[currentMilestoneIndex - 1] : 0;
    const nextMilestone = currentMilestoneIndex !== -1 ? MILESTONES[currentMilestoneIndex] : MILESTONES[MILESTONES.length - 1];

    let progressPercentage = 0;
    if (totalTrees >= nextMilestone && nextMilestone === MILESTONES[MILESTONES.length - 1]) {
        progressPercentage = 100;
    } else if (nextMilestone > prevMilestone) {
        progressPercentage = ((totalTrees - prevMilestone) / (nextMilestone - prevMilestone)) * 100;
    }

    return (
        <div className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-xl shadow-md p-4 w-full">
            <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Tiến độ cột mốc</h3>
                <span className="text-sm font-bold text-green-600 dark:text-green-400">{totalTrees} Cây đã trồng</span>
            </div>
            <div className="relative h-3 bg-slate-200/80 dark:bg-slate-700/80 rounded-full overflow-hidden border border-slate-300/50 dark:border-slate-600/50">
                <motion.div
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-lime-400 to-green-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercentage}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                />
                 {/* Milestone markers */}
                 {MILESTONES.map((milestone) => {
                    if (nextMilestone > prevMilestone) {
                         const position = ((milestone - prevMilestone) / (nextMilestone - prevMilestone)) * 100;
                         if (position > 0 && position <= 100) {
                             return (
                                <div key={milestone} 
                                    className={`absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full ${totalTrees >= milestone ? 'bg-white' : 'bg-slate-400 dark:bg-slate-500'}`}
                                    style={{ left: `calc(${position}% - 4px)` }}
                                    title={`Cột mốc: ${milestone} cây`}
                                />
                             )
                         }
                    }
                    return null;
                 })}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 text-right">
                Cột mốc tiếp theo: <span className="font-semibold">{nextMilestone} cây</span>
            </div>
        </div>
    );
};