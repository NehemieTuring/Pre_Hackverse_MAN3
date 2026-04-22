import { Task } from "@/lib/types";
import { Badge, Card } from "@/components/ui";
import { Clock, Calendar, AlertCircle, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface TaskCardProps {
  task: Task;
  onClick?: (id: number) => void;
}

export function TaskCard({ task, onClick }: TaskCardProps) {
  const quadrantColors = {
    Q1: "from-red-500/20 to-transparent",
    Q2: "from-blue-500/20 to-transparent",
    Q3: "from-orange-500/20 to-transparent",
    Q4: "from-slate-500/20 to-transparent",
  };

  const badgeStyles = {
    Q1: "bg-red-500/10 text-red-400 border-red-500/20",
    Q2: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    Q3: "bg-orange-500/10 text-orange-400 border-orange-500/20",
    Q4: "bg-slate-500/10 text-slate-400 border-slate-500/20",
  };

  return (
    <Card 
      className={`relative group p-6 border-white/5 hover:border-white/20 transition-all cursor-pointer`}
      onClick={() => onClick?.(task.id)}
    >
      {/* Accent Background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${quadrantColors[task.eisenhowerQuadrant]} opacity-0 group-hover:opacity-100 transition-opacity`} />

      <div className="relative z-10">
        <div className="flex justify-between items-start mb-4">
          <Badge className={badgeStyles[task.eisenhowerQuadrant]}>
            {task.eisenhowerQuadrant === 'Q1' ? 'Urgent & Important' : 
             task.eisenhowerQuadrant === 'Q2' ? 'Growth' : 
             task.eisenhowerQuadrant === 'Q3' ? 'Delegate' : 'Eliminate'}
          </Badge>
          <div className="p-2 bg-white/5 rounded-lg text-slate-500 group-hover:text-blue-400 group-hover:bg-blue-500/10 transition-all">
            <ChevronRight size={16} />
          </div>
        </div>
        
        <h3 className="text-lg font-bold text-white mb-2 group-hover:text-blue-400 transition-colors truncate">
          {task.title}
        </h3>
        
        <p className="text-sm text-slate-400 mb-6 line-clamp-2 min-h-[40px]">
          {task.description || "No description provided."}
        </p>
        
        <div className="flex items-center justify-between pt-4 border-t border-white/5">
          <div className="flex items-center space-x-4 text-[10px] uppercase font-bold tracking-widest text-slate-500">
            <div className="flex items-center">
              <Calendar size={14} className="mr-1.5 text-blue-500" />
              {format(new Date(task.dueDate), "d MMM")}
            </div>
            <div className="flex items-center">
              <Clock size={14} className="mr-1.5 text-indigo-500" />
              {task.estimatedTimeMinutes}m
            </div>
          </div>
          
          <div className="flex items-center px-2 py-1 bg-white/5 rounded-lg text-xs font-black text-blue-400 ring-1 ring-white/10">
            {task.priorityScore}
          </div>
        </div>
      </div>
    </Card>
  );
}
