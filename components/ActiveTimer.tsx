"use client";

import { useTimer } from "@/hooks/useTimer";
import { Button, Card } from "./ui";
import { Play, Pause, CheckCircle2, Zap, Trophy } from "lucide-react";

export function ActiveTimer({ taskId, taskTitle }: { taskId: number, taskTitle: string }) {
  const { elapsed, status, startTimer, pauseTimer, stopTimer } = useTimer(taskId);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="p-10 bg-gradient-to-br from-blue-600/30 to-indigo-600/30 border-blue-400/40 relative overflow-hidden">
      {/* Decorative Glow */}
      <div className="absolute top-0 left-0 w-32 h-32 bg-blue-500/20 blur-[60px] -ml-16 -mt-16" />
      
      <div className="flex flex-col lg:flex-row items-center justify-between gap-10 relative z-10">
        <div className="flex items-center space-x-8 text-center lg:text-left">
           <div className={`w-24 h-24 rounded-3xl flex items-center justify-center transition-all duration-500 ${
             status === 'RUNNING' ? 'bg-blue-500 shadow-[0_0_40px_rgba(59,130,246,0.6)] scale-110' : 'bg-white/10'
           }`}>
              {status === 'RUNNING' ? <Zap className="text-white animate-pulse" size={48} /> : <Trophy className="text-slate-500" size={48} />}
           </div>
           <div>
              <h3 className="text-3xl font-black tracking-tight text-white mb-2">{taskTitle}</h3>
              <div className="flex items-center justify-center lg:justify-start space-x-3">
                 <div className={`h-3 w-3 rounded-full ${status === 'RUNNING' ? 'bg-emerald-400 animate-ping' : 'bg-slate-500'}`} />
                 <span className="text-sm font-black uppercase tracking-widest text-slate-300">
                   {status === 'RUNNING' ? 'FOCUS TIME' : status === 'PAUSED' ? 'RESTING' : 'READY?'}
                 </span>
              </div>
           </div>
        </div>

        <div className="flex flex-col items-center lg:items-end space-y-6">
           <p className="text-[5rem] font-black tabular-nums tracking-tighter leading-none text-white text-glow">
             {formatTime(elapsed)}
           </p>
           
           <div className="flex space-x-4">
              {status !== 'RUNNING' ? (
                <Button 
                  onClick={startTimer} 
                  className="h-24 px-12 rounded-3xl text-2xl bg-emerald-500 hover:bg-emerald-600 shadow-[0_15px_30px_rgba(16,185,129,0.3)]"
                >
                  <Play fill="currentColor" size={32} className="mr-3" /> START
                </Button>
              ) : (
                <Button 
                  variant="secondary" 
                  onClick={pauseTimer} 
                  className="h-24 px-12 rounded-3xl text-2xl"
                >
                  <Pause fill="currentColor" size={32} className="mr-3" /> PAUSE
                </Button>
              )}
              
              <Button 
                variant="danger" 
                onClick={stopTimer} 
                className="h-24 px-12 rounded-3xl text-2xl shadow-[0_15px_30px_rgba(239,68,68,0.3)]"
              >
                 <CheckCircle2 size={32} className="mr-3" /> DONE
              </Button>
           </div>
        </div>
      </div>
    </Card>
  );
}
