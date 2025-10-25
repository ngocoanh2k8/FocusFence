import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tree } from './Tree';

const DAYS_OF_WEEK = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

export interface AppConfig {
    mode: 'manual' | 'scheduled';
    sites: string[];
    duration: number; // For manual
    schedule: { // For scheduled
        startTime: string;
        endTime: string;
        days: string[];
    }
}

interface ConfiguratorProps {
    onStart: (config: AppConfig) => void;
}

export const Configurator: React.FC<ConfiguratorProps> = ({ onStart }) => {
    const [mode, setMode] = useState<'manual' | 'scheduled'>('manual');
    const [timerDuration, setTimerDuration] = useState<number>(25);
    const [startTime, setStartTime] = useState('09:00');
    const [endTime, setEndTime] = useState('17:00');
    const [recurringDays, setRecurringDays] = useState<string[]>(['T2', 'T3', 'T4', 'T5', 'T6']);

    const handleDayToggle = (day: string) => {
        setRecurringDays(prev => 
            prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
        );
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (mode === 'manual' && (!timerDuration || timerDuration < 1)) {
            alert('Vui lòng nhập thời gian hợp lệ, ít nhất 1 phút.');
            return;
        }

        const config: AppConfig = {
            mode,
            sites: [], // No longer selecting sites
            duration: timerDuration,
            schedule: {
                startTime,
                endTime,
                days: recurringDays,
            }
        };
        onStart(config);
    };

    const treePreviewProgress = Math.min(1, timerDuration / 120);

    return (
        <div className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg overflow-hidden">
            <div className="p-6 text-center">
                 <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Thiết lập phiên học của bạn</h2>
                 <p className="mt-1 text-slate-600 dark:text-slate-400">Đặt thời gian tập trung và một cái cây sẽ lớn lên khi bạn làm việc.</p>
                 <div className="my-6 flex justify-center">
                    <Tree progress={treePreviewProgress} />
                 </div>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="bg-slate-50/70 dark:bg-black/20 p-6 border-t border-slate-200 dark:border-slate-700 space-y-8">
                    {/* Mode Switcher */}
                    <div className="flex bg-slate-200 dark:bg-slate-800 rounded-lg p-1 max-w-sm mx-auto">
                        <button type="button" onClick={() => setMode('manual')} className={`w-1/2 rounded-md py-2 text-sm font-medium transition-colors ${mode === 'manual' ? 'bg-white dark:bg-slate-700 text-purple-700 dark:text-purple-400 shadow' : 'text-slate-600 dark:text-slate-300 hover:bg-white/50 dark:hover:bg-slate-700/50'}`}>
                            Phiên thủ công
                        </button>
                        <button type="button" onClick={() => setMode('scheduled')} className={`w-1/2 rounded-md py-2 text-sm font-medium transition-colors ${mode === 'scheduled' ? 'bg-white dark:bg-slate-700 text-purple-700 dark:text-purple-400 shadow' : 'text-slate-600 dark:text-slate-300 hover:bg-white/50 dark:hover:bg-slate-700/50'}`}>
                            Lịch tập trung
                        </button>
                    </div>

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={mode}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                        >
                            {mode === 'manual' ? (
                                <div>
                                    <label htmlFor="duration-input" className="block text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4 text-center">Đặt thời gian phiên học</label>
                                    
                                    <div className="flex items-baseline justify-center gap-2 max-w-sm mx-auto">
                                        <input 
                                            id="duration-input"
                                            type="number" 
                                            min="1"
                                            placeholder="25"
                                            value={timerDuration > 0 ? timerDuration : ''}
                                            onChange={(e) => {
                                                const value = e.target.valueAsNumber;
                                                // Allow empty state (NaN) to be set as 0, prevent negative numbers, and ensure integer
                                                setTimerDuration(isNaN(value) || value < 0 ? 0 : Math.floor(value));
                                            }}
                                            className="w-48 text-center text-5xl font-bold font-mono bg-transparent border-b-2 border-slate-300 dark:border-slate-600 focus:border-purple-500 dark:focus:border-purple-400 focus:outline-none transition-colors py-2 text-green-600 dark:text-green-400"
                                        />
                                        <span className="text-slate-500 dark:text-slate-400 font-medium text-lg self-end pb-2">phút</span>
                                    </div>
                                </div>
                            ) : (
                                // Scheduling Section
                                <div className="space-y-6">
                                    <h3 className="block text-lg font-semibold text-slate-800 dark:text-slate-200 text-center">Thiết lập lịch trình của bạn</h3>
                                    {/* Time Range */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label htmlFor="start-time" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Thời gian bắt đầu</label>
                                            <input type="time" id="start-time" value={startTime} onChange={e => setStartTime(e.target.value)} className="w-full bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md px-3 py-2 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-purple-500" />
                                        </div>
                                        <div>
                                            <label htmlFor="end-time" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Thời gian kết thúc</label>
                                            <input type="time" id="end-time" value={endTime} onChange={e => setEndTime(e.target.value)} className="w-full bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md px-3 py-2 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-purple-500" />
                                        </div>
                                    </div>
                                    {/* Recurring Days */}
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Các ngày lặp lại</label>
                                        <div className="flex flex-wrap gap-2">
                                            {DAYS_OF_WEEK.map(day => (
                                                <label key={day} className={`flex items-center justify-center px-3 py-1.5 rounded-full border-2 cursor-pointer text-sm font-medium transition-all ${recurringDays.includes(day) ? 'bg-purple-100/50 dark:bg-purple-900/30 border-purple-500 text-purple-800 dark:text-purple-300' : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300'}`}>
                                                    <input type="checkbox" checked={recurringDays.includes(day)} onChange={() => handleDayToggle(day)} className="sr-only" />
                                                    {day}
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                    <p className="text-xs text-slate-500 text-center">Các phiên đã lên lịch sẽ tự động bắt đầu nếu ứng dụng được mở trong thời gian đã đặt.</p>
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>

                </div>
                <div className="p-6 bg-white/50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-700">
                    <motion.button 
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit" 
                        className="w-full text-center bg-gradient-to-r from-blue-500 via-purple-500 to-green-500 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition-all duration-300 ease-in-out focus:outline-none focus:ring-4 focus:ring-purple-300/50"
                    >
                        {mode === 'manual' ? 'Bắt đầu trồng cây' : 'Lưu lịch trình'}
                    </motion.button>
                </div>
            </form>
        </div>
    )
}