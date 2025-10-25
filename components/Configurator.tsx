import React, { useState } from 'react';
import { Tree } from './Tree';

export interface AppConfig {
    duration: number;
}

interface ConfiguratorProps {
    onStart: (config: AppConfig) => void;
}

export const Configurator: React.FC<ConfiguratorProps> = ({ onStart }) => {
    const [timerDuration, setTimerDuration] = useState<number>(25);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!timerDuration || timerDuration < 1) {
            alert('Vui lòng nhập thời gian hợp lệ, ít nhất 1 phút.');
            return;
        }

        onStart({ duration: timerDuration });
    };

    const treePreviewProgress = Math.min(1, timerDuration / 120);

    return (
        <>
            <div className="text-center">
                 <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Thiết lập phiên học của bạn</h2>
                 <p className="mt-1 text-slate-600 dark:text-slate-400">Đặt thời gian tập trung và một cái cây sẽ lớn lên khi bạn làm việc.</p>
                 <div className="my-6 flex justify-center">
                    <Tree progress={treePreviewProgress} />
                 </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
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
                                setTimerDuration(isNaN(value) || value < 0 ? 0 : Math.floor(value));
                            }}
                            className="w-48 text-center text-5xl font-bold font-mono bg-transparent border-b-2 border-slate-300 dark:border-slate-600 focus:border-purple-500 dark:focus:border-purple-400 focus:outline-none transition-colors py-2 text-green-600 dark:text-green-400"
                        />
                        <span className="text-slate-500 dark:text-slate-400 font-medium text-lg self-end pb-2">phút</span>
                    </div>
                </div>

                <div className="px-6 pb-2">
                    <button 
                        type="submit" 
                        className="w-full text-center bg-gradient-to-r from-blue-500 via-purple-500 to-green-500 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition-all duration-300 ease-in-out hover:scale-105 focus:outline-none focus:ring-4 focus:ring-purple-300/50"
                    >
                        Bắt đầu trồng cây
                    </button>
                </div>
            </form>
        </>
    )
}