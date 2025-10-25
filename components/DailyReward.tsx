import React from 'react';
import { motion } from 'framer-motion';
import { DailyRewardStatus } from '../types';

interface DailyRewardProps {
    status: DailyRewardStatus;
    onClaim: () => void;
}

export const DailyReward: React.FC<DailyRewardProps> = ({ status, onClaim }) => {
    const goal = 1;
    const goalMet = status.sessionsToday >= goal;

    return (
        <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-amber-100/40 dark:bg-amber-900/20 backdrop-blur-sm border border-amber-300/50 dark:border-amber-800/50 rounded-xl shadow-md p-4 w-full flex items-center justify-between"
        >
            <div className="flex items-center gap-3">
                 <div className="text-3xl">
                    {goalMet && !status.claimed ? '🏆' : '🎁'}
                </div>
                <div>
                    <h3 className="font-semibold text-amber-900 dark:text-amber-200">Phần thưởng hàng ngày</h3>
                    <p className="text-xs text-amber-700 dark:text-amber-300">
                        {goalMet ? (status.claimed ? "Bạn đã nhận phần thưởng hôm nay!" : "Bạn đã nhận được phần thưởng!") : `Trồng ${goal} cây hôm nay để mở khóa!`}
                    </p>
                </div>
            </div>
            
            {goalMet && !status.claimed && (
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onClaim}
                    className="bg-amber-400 hover:bg-amber-500 text-amber-900 font-bold text-sm py-2 px-4 rounded-lg shadow-md transition-colors"
                >
                    Nhận thưởng
                </motion.button>
            )}
        </motion.div>
    );
};