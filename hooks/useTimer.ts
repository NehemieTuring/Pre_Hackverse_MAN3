import { useState, useEffect, useRef } from 'react';
import api from '@/lib/api';
import { toast } from 'sonner';

export function useTimer(taskId: number) {
  const [elapsed, setElapsed] = useState(0);
  const [status, setStatus] = useState<'STOPPED' | 'RUNNING' | 'PAUSED'>('STOPPED');
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchTimer = async () => {
    try {
      const res = await api.get(`/tasks/${taskId}/timer`);
      setElapsed(res.data.durationSeconds || 0);
      setStatus(res.data.status);
    } catch (err) {}
  };

  const startTimer = async () => {
    try {
      await api.post(`/tasks/${taskId}/timer/start`);
      setStatus('RUNNING');
      toast.success("Focus démarré !");
    } catch (err) { toast.error("Erreur lancement timer"); }
  };

  const pauseTimer = async () => {
    try {
      await api.post(`/tasks/${taskId}/timer/pause`);
      setStatus('PAUSED');
      toast.info("Timer en pause");
    } catch (err) {}
  };

  const stopTimer = async () => {
    try {
      await api.post(`/tasks/${taskId}/timer/stop`);
      setStatus('STOPPED');
      toast.success("Session terminée !");
    } catch (err) {}
  };

  useEffect(() => {
    if (status === 'RUNNING') {
      intervalRef.current = setInterval(() => {
        setElapsed(prev => prev + 1);
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [status]);

  useEffect(() => {
    fetchTimer();
    const polling = setInterval(fetchTimer, 30000);
    return () => clearInterval(polling);
  }, [taskId]);

  return { elapsed, status, startTimer, pauseTimer, stopTimer };
}
