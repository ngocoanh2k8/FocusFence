import React, { useState, useCallback, useEffect } from 'react';
import { Configurator, AppConfig } from './components/Configurator';
import { Tree } from './components/Tree';

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
                 <div
                    className="h-full bg-gradient-to-r from-blue-400 via-purple-500 to-green-400 rounded-full"
                    style={{ width: `${progressPercentage}%`, transition: 'width 1s linear' }}
                />
            </div>
        </div>
    );
};


const App: React.FC = () => {
  const [sessionConfig, setSessionConfig] = useState<{ duration: number } | null>(null);
  const [isSessionActive, setIsSessionActive] = useState<boolean>(false);
  const [showWitheredTree, setShowWitheredTree] = useState<boolean>(false);
  const [sessionProgress, setSessionProgress] = useState(0);
  const [totalTrees, setTotalTrees] = useState(() => {
      try {
          return parseInt(localStorage.getItem('totalTreesPlanted') || '0', 10);
      } catch {
          return 0;
      }
  });
  const [isBuzzing, setIsBuzzing] = useState(false);
  
  // Save totalTrees to localStorage whenever it changes
  useEffect(() => {
    try {
        localStorage.setItem('totalTreesPlanted', totalTrees.toString());
    } catch (e) {
        console.error("Failed to save total trees to localStorage", e);
    }
  }, [totalTrees]);

  // Apply dark theme by default for a more focused feel
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  const startAlarm = useCallback(() => {
    setIsBuzzing(true);
    document.title = "🚨 BÁO ĐỘNG! QUAY LẠI TẬP TRUNG! 🚨";
  }, []);

  const stopAlarm = useCallback(() => {
    setIsBuzzing(false);
    document.title = "FocusFence";
  }, []);

  const cleanupSession = useCallback(() => {
    stopAlarm();
    if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
    }
    document.title = "FocusFence";
  }, [stopAlarm]);


  const startFocusSession = useCallback((durationMinutes: number) => {
    setSessionConfig({ duration: durationMinutes * 60 });
    setIsSessionActive(true);
    setShowWitheredTree(false);
    setSessionProgress(0);

    document.documentElement.requestFullscreen().catch(err => {
        console.error(`Could not enter fullscreen: ${err.message}`);
    });
  }, []);


  const handleConfigSubmit = useCallback((config: AppConfig) => {
    startFocusSession(config.duration);
  }, [startFocusSession]);

  const resetState = useCallback(() => {
    setIsSessionActive(false);
    setShowWitheredTree(false);
    cleanupSession();
    setTimeout(() => {
        setSessionConfig(null);
        setSessionProgress(0);
    }, 500);
  }, [cleanupSession]);

  const handleSessionComplete = useCallback(() => {
    setTotalTrees(prev => prev + 1);
    resetState();
    alert("Phiên học hoàn tất! Bạn đã trồng được một cây mới.");
  }, [resetState]);

  const handleEarlyEndSession = useCallback(() => {
    cleanupSession();
    setShowWitheredTree(true);
    // After a delay to show the withered tree, reset the view
    setTimeout(() => {
        setIsSessionActive(false);
        setShowWitheredTree(false);
        setSessionConfig(null);
        setSessionProgress(0);
    }, 4000);
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

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupSession();
    }
  }, [cleanupSession]);

  return (
    <div className={`min-h-screen font-sans p-4 md:p-8 flex flex-col items-center justify-center ${isBuzzing ? 'shake' : ''}`}>
        <header className="text-center mb-6">
            <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-purple-500 to-green-500">
                FocusFence
            </h1>
            <p className="mt-2 text-lg text-slate-600 dark:text-slate-400">
                Trồng cây bằng cách tập trung.
            </p>
        </header>

      <main className="max-w-2xl mx-auto w-full">
         <div className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg p-6 md:p-8 text-center">
            {isSessionActive ? (
                <>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                    {showWitheredTree ? 'Cây của bạn đã héo' : 'Phiên học đang diễn ra'}
                  </h2>
                  <p className="text-slate-600 dark:text-slate-400 mb-2">
                    {showWitheredTree ? 'Bạn đã rời đi trước khi phiên học kết thúc.' : 'Ở lại trang này để cây của bạn phát triển.'}
                  </p>

                  <div className="my-6 flex justify-center">
                    <Tree progress={sessionProgress} withered={showWitheredTree} />
                  </div>
                  
                  {!showWitheredTree && (
                    <>
                        <Timer initialDuration={sessionConfig!.duration} onEnd={handleSessionComplete} onProgress={setSessionProgress} />
                        <button 
                            onClick={handleEarlyEndSession}
                            className="mt-4 w-full md:w-auto text-center bg-red-500/80 hover:bg-red-500/100 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition-all duration-300 ease-in-out focus:outline-none focus:ring-4 focus:ring-red-300/50"
                        >
                            Kết thúc sớm
                        </button>
                    </>
                  )}
                </>
            ) : (
                <Configurator onStart={handleConfigSubmit} />
            )}
         </div>
         <footer className="text-center mt-8 text-slate-500 dark:text-slate-400">
            <p className="font-bold text-lg">{totalTrees} cây đã trồng</p>
         </footer>
      </main>
    </div>
  );
};

export default App;
