"use client";

import { ScheduledTaskDTO } from "@/lib/types";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { AlertCircle, Calendar, CheckCircle2, X } from "lucide-react";

interface PlannerModalProps {
  plan: ScheduledTaskDTO[];
  onConfirm: () => void;
  onClose: () => void;
}

export function PlannerModal({ plan, onConfirm, onClose }: PlannerModalProps) {
  const scheduledCount = plan.filter(t => t.status === 'SCHEDULED').length;

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[80vh] flex flex-col overflow-hidden">
        <div className="p-6 border-b flex justify-between items-center bg-slate-50">
          <div>
            <h3 className="text-xl font-bold text-slate-900">Proposition de Planning</h3>
            <p className="text-sm text-slate-500">L'IA a organisé {scheduledCount} tâches pour vous.</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {plan.map((item, idx) => (
            <div key={idx} className={`p-4 rounded-2xl border ${
              item.status === 'SCHEDULED' ? 'border-blue-100 bg-blue-50/50' : 'border-red-100 bg-red-50/50'
            }`}>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h4 className="font-semibold text-slate-900">{item.title}</h4>
                  {item.status === 'SCHEDULED' ? (
                    <div className="flex items-center text-xs text-blue-600 mt-1 font-medium">
                      <Calendar size={14} className="mr-1" />
                      {format(new Date(item.scheduledStart!), "EEEE d MMMM, HH:mm", { locale: fr })}
                    </div>
                  ) : (
                    <div className="flex items-center text-xs text-red-600 mt-1 font-medium">
                      <AlertCircle size={14} className="mr-1" />
                      {item.reason}
                    </div>
                  )}
                </div>
                <div className="ml-4">
                  {item.status === 'SCHEDULED' ? (
                    <CheckCircle2 className="text-blue-500" size={24} />
                  ) : (
                    <AlertCircle className="text-red-400" size={24} />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="p-6 border-t bg-slate-50 flex space-x-3">
          <button 
            onClick={onClose}
            className="flex-1 px-6 py-3 rounded-xl border border-slate-200 font-semibold text-slate-600 hover:bg-white transition-colors"
          >
            Ajuster manuellement
          </button>
          <button 
            onClick={onConfirm}
            className="flex-1 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-lg shadow-blue-200 transition-all"
          >
            Appliquer le planning
          </button>
        </div>
      </div>
    </div>
  );
}
