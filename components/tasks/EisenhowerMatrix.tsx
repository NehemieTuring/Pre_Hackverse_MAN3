import { Task } from "@/lib/types";
import { TaskCard } from "./TaskCard";

interface EisenhowerMatrixProps {
  tasks: Task[];
}

export function EisenhowerMatrix({ tasks }: EisenhowerMatrixProps) {
  const quadrants = {
    Q1: { title: "DO IT NOW! 🚀", desc: "Top Priority", color: "text-red-400 bg-red-400/10 border-red-400/20" },
    Q2: { title: "PLAN IT! 📅", desc: "Important", color: "text-blue-400 bg-blue-400/10 border-blue-400/20" },
    Q3: { title: "DELEGATE! 🤝", desc: "Quick Task", color: "text-orange-400 bg-orange-400/10 border-orange-400/20" },
    Q4: { title: "MAYBE LATER? ☁️", desc: "Low Priority", color: "text-slate-400 bg-slate-400/10 border-slate-400/20" },
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-full">
      {(['Q1', 'Q2', 'Q3', 'Q4'] as const).map(q => (
        <div key={q} className="glass-card p-6 flex flex-col overflow-hidden relative group">
          <div className="flex items-center justify-between mb-6">
            <div className="flex flex-col">
              <h4 className="text-sm font-black uppercase tracking-widest text-white">{quadrants[q].title}</h4>
              <p className="text-[10px] uppercase text-slate-500 font-bold tracking-tighter">{quadrants[q].desc}</p>
            </div>
            <div className={`px-4 py-1 rounded-lg text-[10px] font-black border ${quadrants[q].color}`}>
              {tasks.filter(t => t.eisenhowerQuadrant === q).length} Tasks
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto space-y-4 pr-2 scrollbar-hide group-hover:scrollbar-default transition-all">
            {tasks.filter(t => t.eisenhowerQuadrant === q).length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full opacity-20 py-12">
                 <div className="w-12 h-12 rounded-full border-2 border-dashed border-slate-500 mb-4" />
                 <p className="text-center text-slate-500 text-xs font-bold uppercase tracking-widest">Zone Clear</p>
              </div>
            ) : (
              tasks.filter(t => t.eisenhowerQuadrant === q).map(t => (
                <TaskCard key={t.id} task={t} />
              ))
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
