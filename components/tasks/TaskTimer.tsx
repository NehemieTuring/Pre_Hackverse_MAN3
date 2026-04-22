"use client";

import { useTimer } from "@/hooks/useTimer";
import { Play, Pause, Square, Timer } from "lucide-react";
import { Card } from "../ui";

export function TaskTimer({ taskId }: { taskId: number }) {
  const { elapsed, status, startTimer, pauseTimer, stopTimer } = useTimer(taskId);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="p-6 bg-slate-900 text-white overflow-hidden relative">
      <div className="absolute top-0 right-0 p-4 opacity-10">
        <Timer size={100} />
      </div>
      <div className="relative z-10 text-center space-y-6">
        <p className="text-slate-400 text-sm font-medium uppercase tracking-wider">Session de Focus</p>
        <div className="text-6xl font-mono font-bold tracking-tighter">
          {formatTime(elapsed)}
        </div>
        
        <div className="flex justify-center space-x-4">
          {status === 'RUNNING' ? (
            <button 
              onClick={pauseTimer}
              className="w-14 h-14 rounded-full bg-amber-500 hover:bg-amber-600 flex items-center justify-center transition-all shadow-lg shadow-amber-900/40"
            >
              <Pause size={24} fill="white" />
            </button>
          ) : (
            <button 
              onClick={startTimer}
              className="w-14 h-14 rounded-full bg-emerald-500 hover:bg-emerald-600 flex items-center justify-center transition-all shadow-lg shadow-emerald-900/40"
            >
              <Play size={24} className="ml-1" fill="white" />
            </button>
          )}

          <button 
            onClick={stopTimer}
            className="w-14 h-14 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center transition-all shadow-lg shadow-red-900/40"
          >
            <Square size={20} fill="white" />
          </button>
        </div>

        <p className="text-[10px] text-slate-500 italic">Synchronisé avec le serveur toutes les 30 secondes</p>
      </div>
    </Card>
  );
}
