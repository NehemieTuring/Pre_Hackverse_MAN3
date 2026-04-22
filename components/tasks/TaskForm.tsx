"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { EisenhowerQuadrant } from "@/lib/types";
import { useState, useEffect } from "react";
import { Card, Button } from "@/components/ui";
import { Calendar, Clock, Info, ShieldCheck, Zap, AlertTriangle } from "lucide-react";

const schema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().optional(),
  dueDate: z.string().min(1, "Target date is mandatory"),
  importance: z.number().min(1).max(5),
  urgency: z.number().min(1).max(5),
  estimatedTimeMinutes: z.number().min(15, "Minimum 15 minutes required"),
});

type FormData = z.infer<typeof schema>;

interface TaskFormProps {
  onSubmit: (data: FormData) => void;
  loading?: boolean;
}

export function TaskForm({ onSubmit, loading }: TaskFormProps) {
  const { register, handleSubmit, watch, formState: { errors }, setValue } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { importance: 3, urgency: 3, estimatedTimeMinutes: 60 }
  });

  const [previewQuadrant, setPreviewQuadrant] = useState<EisenhowerQuadrant>('Q2');
  const importance = watch("importance");
  const urgency = watch("urgency");

  useEffect(() => {
    if (importance >= 4 && urgency >= 4) setPreviewQuadrant('Q1');
    else if (importance >= 4 && urgency < 4) setPreviewQuadrant('Q2');
    else if (importance < 4 && urgency >= 4) setPreviewQuadrant('Q3');
    else setPreviewQuadrant('Q4');
  }, [importance, urgency]);

  const quadrantInfo = {
    Q1: { label: "High Command", desc: "Critical missions, zero delay permitted.", color: "border-red-500/20 text-red-400 bg-red-400/5", icon: Zap },
    Q2: { label: "Strategic Growth", desc: "Long-term evolution assets.", color: "border-blue-500/20 text-blue-400 bg-blue-400/5", icon: ShieldCheck },
    Q3: { label: "Operational Noise", desc: "Urgent but low value. Delegate if possible.", color: "border-orange-500/20 text-orange-400 bg-orange-400/5", icon: Clock },
    Q4: { label: "Static Interference", desc: "Minimal value. Consider eliminating.", color: "border-slate-500/20 text-slate-400 bg-slate-400/5", icon: Info },
  };

  const QInfo = quadrantInfo[previewQuadrant];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-10 max-w-3xl mx-auto pb-20">
      <Card className="p-10 space-y-10 border-white/5 relative bg-white/5">
        <div className="space-y-4">
          <label className="text-xs font-black uppercase tracking-widest text-slate-500">Mission Title</label>
          <input 
            {...register("title")}
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 focus:bg-white/10 focus:border-blue-500/50 outline-none transition-all text-xl font-bold text-white placeholder-slate-600"
            placeholder="What needs to be achieved?"
          />
          {errors.title && <p className="text-red-400 text-xs font-bold pl-2">{errors.title.message}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <label className="text-xs font-black uppercase tracking-widest text-slate-500 flex items-center">
              <Calendar size={14} className="mr-2 text-blue-500" /> Target Deadline
            </label>
            <input 
              type="datetime-local"
              {...register("dueDate")}
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 focus:bg-white/10 focus:border-blue-500/50 outline-none transition-all text-white"
            />
          </div>

          <div className="space-y-4">
            <label className="text-xs font-black uppercase tracking-widest text-slate-500 flex items-center">
              <Clock size={14} className="mr-2 text-indigo-500" /> Cognitive Duration
            </label>
            <div className="relative">
              <input 
                type="number"
                {...register("estimatedTimeMinutes", { valueAsNumber: true })}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 focus:bg-white/10 focus:border-blue-500/50 outline-none transition-all text-white font-bold"
              />
              <span className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-500 text-xs font-black uppercase">MIN</span>
            </div>
          </div>
        </div>

        <div className="space-y-10 py-10 border-y border-white/5">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <label className="text-xs font-black uppercase tracking-widest text-slate-200">Impact Score: {importance}/5</label>
            </div>
            <input 
              type="range" min="1" max="5" 
              {...register("importance", { valueAsNumber: true })}
              className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
          </div>

          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <label className="text-xs font-black uppercase tracking-widest text-slate-200">Urgency Level: {urgency}/5</label>
            </div>
            <input 
              type="range" min="1" max="5" 
              {...register("urgency", { valueAsNumber: true })}
              className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
          </div>
        </div>

        <div className={`p-8 rounded-3xl border-2 transition-all duration-500 flex items-start space-x-6 relative overflow-hidden ${QInfo.color}`}>
          <div className="absolute top-0 right-0 p-2 opacity-10">
             <QInfo.icon size={100} />
          </div>
          <div className="p-4 bg-white/5 rounded-2xl">
            <QInfo.icon size={24} />
          </div>
          <div className="relative z-10 flex-1">
            <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">AI Classification: Quadrant {previewQuadrant}</p>
            <h4 className="text-xl font-black mb-2 tracking-tight">{QInfo.label}</h4>
            <p className="text-sm font-medium opacity-80">{QInfo.desc}</p>
          </div>
        </div>
      </Card>

      <Button 
        type="submit"
        loading={loading}
        className="w-full py-6 text-xl shadow-[0_20px_50px_rgba(59,130,246,0.3)] animate-pulse hover:animate-none"
      >
        Authorize Execution & Register Task
      </Button>
    </form>
  );
}
