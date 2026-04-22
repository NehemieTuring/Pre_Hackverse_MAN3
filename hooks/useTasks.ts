import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Task } from '@/lib/types';
import { toast } from 'sonner';

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = async (sort?: string) => {
    try {
      setLoading(true);
      const res = await api.get<Task[]>('/tasks', { params: { sort } });
      setTasks(res.data);
    } catch (err) {
      toast.error("Erreur lors du chargement des tâches");
    } finally {
      setLoading(false);
    }
  };

  const createTask = async (data: any) => {
    try {
      const res = await api.post<Task>('/tasks', data);
      setTasks(prev => [...prev, res.data]);
      toast.success("Tâche créée !");
      return res.data;
    } catch (err) {
      toast.error("Erreur lors de la création");
    }
  };

  const updateStatus = async (id: number, status: string) => {
    try {
      await api.patch(`/tasks/${id}/status`, null, { params: { status } });
      setTasks(prev => prev.map(t => t.id === id ? { ...t, status: status as any } : t));
      toast.success("Statut mis à jour");
    } catch (err) {
      toast.error("Erreur de mise à jour");
    }
  };

  const deleteTask = async (id: number) => {
    try {
      await api.delete(`/tasks/${id}`);
      setTasks(prev => prev.filter(t => t.id !== id));
      toast.success("Tâche supprimée");
    } catch {
      toast.error("Erreur lors de la suppression");
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  return { tasks, loading, fetchTasks, createTask, updateStatus };
}
