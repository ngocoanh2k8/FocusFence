import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Configurator, AppConfig } from './components/Configurator';
import { motion, AnimatePresence } from 'framer-motion';
import { Tree } from './components/Tree';
import { EmailCapture } from './components/EmailCapture';
import { StudentProfile, DailyRewardStatus } from './types';
import { ProgressBar } from './components/ProgressBar';
import { DailyReward } from './components/DailyReward';

const pageTransition = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.3 }
};


// A self-contained Timer component for the dashboard
const Timer: React.FC<{ initialDuration: number; onEnd: () => void; onProgress: (progress: number) => void; }> = ({ initialDuration, onEnd, onProgress }) => {
    const [timeLeft, setTimeLeft] = useState(initialDuration);

    useEffect(() => {
        if (timeLeft <= 0) {
            onEnd();
            return;
        }

        const intervalId = setInterval(() => {
            setTimeLeft(prevTime => Math.max(0, prevTime - 1));
        }, 1000);

        return () => clearInterval(intervalId);
    }, [timeLeft, onEnd]);

    useEffect(() => {
        const currentProgress = initialDuration > 0 ? (initialDuration - timeLeft) / initialDuration : 1;
        onProgress(currentProgress);
    }, [timeLeft, initialDuration, onProgress]);

    const hours = Math.floor(timeLeft / 3600);
    const minutes = Math.floor((timeLeft % 3600) / 60);
    const seconds = timeLeft % 60;

    const progressPercentage = initialDuration > 0 ? (timeLeft / initialDuration) * 100 : 0;

    return (
        <div className="w-full my-6">
            <div className="text-5xl md:text-7xl font-bold tracking-tighter text-green-500 dark:text-green-400 mb-4 font-mono">
                <span>{String(hours).padStart(2, '0')}</span>
                <span className="animate-pulse relative -top-2 md:-top-3 mx-1">:</span>
                <span>{String(minutes).padStart(2, '0')}</span>
                <span className="animate-pulse relative -top-2 md:-top-3 mx-1">:</span>
                <span>{String(seconds).padStart(2, '0')}</span>
            </div>
            
            <div className="h-4 w-full bg-slate-200/80 dark:bg-slate-700/80 rounded-full overflow-hidden border border-slate-300 dark:border-slate-600">
                 <motion.div
                    className="h-full bg-gradient-to-r from-blue-400 via-purple-500 to-green-400 rounded-full"
                    initial={{ width: '100%' }}
                    animate={{ width: `${progressPercentage}%` }}
                    transition={{ duration: 1, ease: 'linear' }}
                />
            </div>
        </div>
    );
};

const getVietnamDateString = () => {
    const vietnamTimeOpts: Intl.DateTimeFormatOptions = { timeZone: 'Asia/Ho_Chi_Minh', year: 'numeric', month: 'numeric', day: 'numeric' };
    const formatter = new Intl.DateTimeFormat('en-CA', vietnamTimeOpts); // en-CA gives YYYY-MM-DD
    return formatter.format(new Date());
};

const App: React.FC = () => {
  const [sessionConfig, setSessionConfig] = useState<{ sites: string[], duration: number } | null>(null);
  const [scheduleConfig, setScheduleConfig] = useState<AppConfig | null>(null);
  const [isSessionActive, setIsSessionActive] = useState<boolean>(false);
  const [showEarlyExitScreen, setShowEarlyExitScreen] = useState<boolean>(false);
  const [sessionProgress, setSessionProgress] = useState(0);
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
  const [studentData, setStudentData] = useState<StudentProfile | null>(null);
  const [totalTrees, setTotalTrees] = useState(0);
  const [dailyReward, setDailyReward] = useState<DailyRewardStatus | null>(null);

  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const lfoRef = useRef<OscillatorNode | null>(null);
  const lfoGainRef = useRef<GainNode | null>(null);
  
  const updateStudentData = (data: StudentProfile) => {
    try {
        localStorage.setItem('studentData', JSON.stringify(data));
    } catch (e) {
        console.error("Failed to save student data to localStorage", e);
    }
  };

  useEffect(() => {
    try {
        const storedData = localStorage.getItem('studentData');
        if (storedData) {
            const parsedData: StudentProfile = JSON.parse(storedData);
            setStudentData(parsedData);
            setTotalTrees(parsedData.totalTreesPlanted || 0);

            // Daily Reward Logic
            const todayStr = getVietnamDateString();
            const storedReward = parsedData.dailyReward;
            if (storedReward && storedReward.date === todayStr) {
                setDailyReward(storedReward);
            } else {
                const newDailyReward = { date: todayStr, sessionsToday: 0, claimed: false };
                setDailyReward(newDailyReward);
                updateStudentData({ ...parsedData, dailyReward: newDailyReward });
            }

            const now = new Date();
            const vietnamTimeOpts: Intl.DateTimeFormatOptions = { timeZone: 'Asia/Ho_Chi_Minh', year: 'numeric', month: 'numeric', day: 'numeric' };
            const formatter = new Intl.DateTimeFormat('en-CA', vietnamTimeOpts);
            const parts = formatter.formatToParts(now);
            const year = parseInt(parts.find(p => p.type === 'year')?.value ?? '0');
            const month = parseInt(parts.find(p => p.type === 'month')?.value ?? '1') - 1;
            const day = parseInt(parts.find(p => p.type === 'day')?.value ?? '1');
            const startOfTodayVietnam = Date.UTC(year, month, day) - (7 * 60 * 60 * 1000);
            const startOfYesterdayVietnam = startOfTodayVietnam - (24 * 60 * 60 * 1000);

            if (parsedData.lastSeen < startOfYesterdayVietnam) {
                setTimeout(() => {
                    alert(`Chào mừng quay trở lại, ${parsedData.name}! Chúng tôi đã nhớ bạn ngày hôm qua. Cùng quay lại học nào!`);
                }, 100);
            }

            updateStudentData({ ...parsedData, lastSeen: now.getTime() });
        }
    } catch (e) {
        console.error("Failed to parse student data from localStorage", e);
        localStorage.removeItem('studentData');
    }
  }, []);

  const handleProfileSubmit = (profile: Omit<StudentProfile, 'lastSeen' | 'totalTreesPlanted' | 'dailyReward'>) => {
    const now = new Date().getTime();
    const todayStr = getVietnamDateString();
    const newData: StudentProfile = { 
        ...profile, 
        lastSeen: now, 
        totalTreesPlanted: 0, 
        dailyReward: { date: todayStr, sessionsToday: 0, claimed: false }
    };
    setStudentData(newData);
    setTotalTrees(0);
    setDailyReward(newData.dailyReward);
    updateStudentData(newData);
  };

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

  const startAlarm = useCallback(() => {
    if (gainNodeRef.current && audioContextRef.current && audioContextRef.current.state === 'running') {
      gainNodeRef.current.gain.exponentialRampToValueAtTime(0.5, audioContextRef.current.currentTime + 0.1);
      document.title = "🚨 BÁO ĐỘNG! QUAY LẠI TẬP TRUNG! 🚨";
    }
  }, []);

  const stopAlarm = useCallback(() => {
    if (gainNodeRef.current && audioContextRef.current && audioContextRef.current.state === 'running') {
      gainNodeRef.current.gain.exponentialRampToValueAtTime(0.0001, audioContextRef.current.currentTime + 0.1);
      document.title = "FocusFence";
    }
  }, []);

  const cleanupSession = useCallback(() => {
    stopAlarm();
    if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
    }
    
    if (lfoRef.current) {
        lfoRef.current.stop();
        lfoRef.current.disconnect();
    }
    if (lfoGainRef.current) {
        lfoGainRef.current.disconnect();
    }
    if (oscillatorRef.current) {
        oscillatorRef.current.stop();
        oscillatorRef.current.disconnect();
    }
    if (gainNodeRef.current) {
        gainNodeRef.current.disconnect();
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(() => {});
    }
    
    audioContextRef.current = null;
    oscillatorRef.current = null;
    gainNodeRef.current = null;
    lfoRef.current = null;
    lfoGainRef.current = null;
    document.title = "FocusFence";
  }, [stopAlarm]);


  const startFocusSession = useCallback((sites: string[], durationMinutes: number) => {
    setSessionConfig({ sites, duration: durationMinutes * 60 });
    setIsSessionActive(true);
    setSessionProgress(0);

    document.documentElement.requestFullscreen().catch(err => {
        console.error(`Could not enter fullscreen: ${err.message}`);
    });

     try {
        const context = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = context.createOscillator();
        const gain = context.createGain();
        const lfo = context.createOscillator();
        const lfoGain = context.createGain();

        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(300, context.currentTime); 
        lfo.type = 'square';
        lfo.frequency.setValueAtTime(8, context.currentTime); 
        lfoGain.gain.setValueAtTime(100, context.currentTime); 
        gain.gain.setValueAtTime(0.0001, context.currentTime);

        lfo.connect(lfoGain);
        lfoGain.connect(oscillator.frequency);
        oscillator.connect(gain);
        gain.connect(context.destination);
        
        lfo.start();
        oscillator.start();
        
        audioContextRef.current = context;
        oscillatorRef.current = oscillator;
        gainNodeRef.current = gain;
        lfoRef.current = lfo;
        lfoGainRef.current = lfoGain;
    } catch (e) {
        console.error("Web Audio API is not supported in this browser.", e);
    }
  }, []);


  const handleConfigSubmit = useCallback((config: AppConfig) => {
    if (config.mode === 'manual') {
      startFocusSession(config.sites, config.duration);
    } else {
      setScheduleConfig(config);
      alert('Lịch học của bạn đã được lưu!');
    }
  }, [startFocusSession]);


  useEffect(() => {
    const checkSchedule = () => {
      if (!scheduleConfig || scheduleConfig.mode !== 'scheduled' || isSessionActive) {
        return;
      }

      const now = new Date();
      const vietnamTimeOpts: Intl.DateTimeFormatOptions = { timeZone: 'Asia/Ho_Chi_Minh', weekday: 'short', hour: 'numeric', minute: 'numeric', hour12: false };
      const formatter = new Intl.DateTimeFormat('en-US', vietnamTimeOpts);
      const parts = formatter.formatToParts(now);

      const currentDay = parts.find(p => p.type === 'weekday')?.value;
      const hourPart = parts.find(p => p.type === 'hour')?.value;
      const minutePart = parts.find(p => p.type === 'minute')?.value;

      if (!currentDay || !hourPart || !minutePart) {
          console.error("Could not determine Vietnam time.");
          return;
      }
      
      const hour = parseInt(hourPart);
      const minute = parseInt(minutePart);
      const currentTime = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
      
      const schedule = scheduleConfig.schedule;
      const isDayMatch = schedule.days.includes(currentDay);
      const isTimeMatch = schedule.startTime && schedule.endTime && currentTime >= schedule.startTime && currentTime < schedule.endTime;

      if (isDayMatch && isTimeMatch) {
          const [endHours, endMinutes] = schedule.endTime.split(':').map(Number);
          const endTimeInMinutes = endHours * 60 + endMinutes;
          const currentTimeInMinutes = hour * 60 + minute;
          const duration = endTimeInMinutes - currentTimeInMinutes;
          if (duration > 0) {
            startFocusSession(scheduleConfig.sites, duration);
          }
      }
    };
    
    const intervalId = setInterval(checkSchedule, 60000);
    return () => clearInterval(intervalId);

  }, [scheduleConfig, isSessionActive, startFocusSession]);


  const handleSessionComplete = useCallback(() => {
    if (!studentData || !dailyReward) return;
    setIsSessionActive(false);
    cleanupSession();
    
    const newTotalTrees = totalTrees + 1;
    setTotalTrees(newTotalTrees);

    const newDailyReward = { ...dailyReward, sessionsToday: dailyReward.sessionsToday + 1 };
    setDailyReward(newDailyReward);
    
    updateStudentData({ ...studentData, totalTreesPlanted: newTotalTrees, dailyReward: newDailyReward });

    setTimeout(() => {
        setSessionConfig(null);
        setSessionProgress(0);
    }, 500);
  }, [cleanupSession, studentData, totalTrees, dailyReward]);

  const handleClaimReward = useCallback(() => {
    if (!studentData || !dailyReward) return;
    const newDailyReward = { ...dailyReward, claimed: true };
    setDailyReward(newDailyReward);
    updateStudentData({ ...studentData, dailyReward: newDailyReward });
    alert("Đã nhận phần thưởng! Hãy tiếp tục phát huy!");
  }, [studentData, dailyReward]);

  const handleEarlyEndSession = useCallback(() => {
    setIsSessionActive(false);
    if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
    }
    setShowEarlyExitScreen(true);
    startAlarm(); 
  }, [startAlarm]);

  const handleResetFromExitScreen = useCallback(() => {
    setShowEarlyExitScreen(false);
    cleanupSession();
    setTimeout(() => {
        setSessionConfig(null);
        setSessionProgress(0);
    }, 500);
  }, [cleanupSession]);
  
  useEffect(() => {
    if (!isSessionActive) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        startAlarm();
      } else {
        stopAlarm();
      }
    };

    const handleFullscreenChange = () => {
        if (!document.fullscreenElement && isSessionActive) {
            startAlarm();
        }
    };
    
    document.addEventListener("visibilitychange", handleVisibilityChange);
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, [isSessionActive, startAlarm, stopAlarm]);

  useEffect(() => {
    return () => {
      cleanupSession();
    }
  }, [cleanupSession]);

  if (!studentData) {
    return <EmailCapture onProfileSubmit={handleProfileSubmit} />;
  }

  return (
    <div className="min-h-screen font-sans p-4 md:p-8 flex items-center justify-center">
        <AnimatePresence>
            {showEarlyExitScreen && (
                 <motion.div
                    key="early-exit-screen"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    className="fixed inset-0 bg-red-100/90 dark:bg-red-900/60 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-4 text-center"
                 >
                    <div className="max-w-md">
                        <Tree progress={sessionProgress} withered={true} />
                        <h2 className="text-4xl font-bold text-red-900 dark:text-red-200 mb-4 mt-4">Cây của bạn đã héo</h2>
                        <p className="text-xl text-red-700 dark:text-red-300 mb-8">
                            Bạn đã rời đi trước khi phiên học kết thúc. Một trí óc tập trung cần được nuôi dưỡng, cũng giống như một cái cây.
                        </p>
                         <motion.button 
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleResetFromExitScreen}
                            className="bg-white dark:bg-slate-800 text-red-800 dark:text-red-200 font-bold py-3 px-8 rounded-lg shadow-2xl transition-all duration-300 ease-in-out focus:outline-none focus:ring-4 focus:ring-red-800/20"
                        >
                            Thử trồng lại
                        </motion.button>
                    </div>
                 </motion.div>
            )}
        </AnimatePresence>

      <div className="max-w-2xl mx-auto w-full">
         <header className="text-center mb-6 relative">
            <button
                onClick={toggleTheme}
                className="absolute top-0 right-0 p-2 rounded-full bg-slate-200/50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 hover:bg-slate-300/70 dark:hover:bg-slate-700/70 transition-colors"
                aria-label="Chuyển đổi giao diện"
            >
                {theme === 'light' ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 T-8 0 4 4 0 018 0z" /></svg>
                )}
            </button>
            <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-purple-500 to-green-500">
                Chào mừng, {studentData.name}!
            </h1>
            <p className="mt-2 text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                Bảng điều khiển cá nhân của bạn để chặn phiền nhiễu và chinh phục bài vở.
            </p>
        </header>

        <main className="space-y-6">
            <div className="px-2">
                <ProgressBar totalTrees={totalTrees} />
                {dailyReward && <DailyReward status={dailyReward} onClaim={handleClaimReward} />}
            </div>

            <AnimatePresence mode="wait">
              {isSessionActive && sessionConfig ? (
                <motion.div 
                  key="dashboard"
                  initial={pageTransition.initial}
                  animate={pageTransition.animate}
                  exit={pageTransition.exit}
                  transition={pageTransition.transition}
                  className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg p-6 md:p-8 text-center"
                >
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Phiên học đang diễn ra</h2>
                  <p className="text-slate-600 dark:text-slate-400 mb-2">Ở lại trang này để cây của bạn phát triển.</p>

                  <div className="my-6 flex justify-center">
                    <Tree progress={sessionProgress} />
                  </div>

                  <Timer initialDuration={sessionConfig.duration} onEnd={handleSessionComplete} onProgress={setSessionProgress} />

                  <div className="bg-slate-100/70 dark:bg-slate-800/70 rounded-lg p-4 max-w-md mx-auto">
                    <h3 className="font-semibold text-slate-700 dark:text-slate-300 mb-3">Cam kết của bạn: Giữ tập trung</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Tránh xa phiền nhiễu để giúp cây của bạn phát triển khỏe mạnh.</p>
                  </div>

                  <motion.button 
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleEarlyEndSession}
                      className="mt-8 w-full md:w-auto text-center bg-red-500/80 hover:bg-red-500/100 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition-all duration-300 ease-in-out focus:outline-none focus:ring-4 focus:ring-red-300/50"
                  >
                      Kết thúc sớm
                  </motion.button>
                </motion.div>
              ) : (
                 <motion.div
                    key="config"
                    initial={pageTransition.initial}
                    animate={pageTransition.animate}
                    exit={pageTransition.exit}
                    transition={pageTransition.transition}
                 >
                    <Configurator 
                        onStart={handleConfigSubmit}
                    />
                 </motion.div>
              )}
            </AnimatePresence>
        </main>

        <footer className="text-center mt-12 text-slate-500 dark:text-slate-400">
        </footer>
      </div>
    </div>
  );
};

export default App;