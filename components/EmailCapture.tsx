import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { StudentProfile } from '../types';

interface EmailCaptureProps {
    // Fix: The onProfileSubmit prop should only expect name and email,
    // as the parent component is responsible for initializing other profile data.
    onProfileSubmit: (profile: Omit<StudentProfile, 'lastSeen' | 'totalTreesPlanted' | 'dailyReward'>) => void;
}

export const EmailCapture: React.FC<EmailCaptureProps> = ({ onProfileSubmit }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');

    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) {
            setError('Vui lòng nhập tên của bạn.');
            return;
        }
        if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
            setError('Vui lòng nhập một địa chỉ email hợp lệ.');
            return;
        }
        setError('');
        onProfileSubmit({
            name: name.trim(),
            email,
        });
    };
    
    const inputClasses = "w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-3 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-purple-500 focus:outline-none transition-all";

    return (
        <div className="min-h-screen font-sans p-4 md:p-8 flex items-center justify-center">
            <div className="max-w-md mx-auto w-full text-center">
                <header className="mb-8 relative">
                    <button
                        onClick={toggleTheme}
                        className="absolute top-0 right-0 p-2 rounded-full bg-slate-200/50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 hover:bg-slate-300/70 dark:hover:bg-slate-700/70 transition-colors"
                        aria-label="Toggle theme"
                    >
                        {theme === 'light' ? (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                        )}
                    </button>
                    <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-purple-500 to-green-500 leading-tight">
                        FocusFence
                    </h1>
                </header>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg p-6 md:p-8"
                >
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Cùng tìm hiểu về bạn nhé!</h2>
                    <p className="text-slate-600 dark:text-slate-400 mb-6">
                        Cá nhân hóa góc học tập và nhận lời nhắc để luôn tập trung
                    </p>
                    <form onSubmit={handleSubmit} className="space-y-4 text-left">
                        <div>
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 block">Họ và Tên</label>
                            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="ví dụ: Nguyễn Văn A" className={inputClasses} required />
                        </div>
                         <div>
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 block">Địa chỉ Email</label>
                            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email.cua.ban@truong.edu" className={inputClasses} required />
                        </div>

                        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                        
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            className="w-full text-center bg-gradient-to-r from-blue-500 via-purple-500 to-green-500 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition-all duration-300 ease-in-out focus:outline-none focus:ring-4 focus:ring-purple-300/50 !mt-6"
                        >
                            Bắt đầu học
                        </motion.button>
                    </form>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-4 text-center">
                        Chúng tôi tôn trọng quyền riêng tư của bạn. Dữ liệu của bạn được lưu trữ cục bộ và không bao giờ được chia sẻ.
                    </p>
                </motion.div>
            </div>
        </div>
    );
};