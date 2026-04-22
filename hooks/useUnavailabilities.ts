"use client";

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Unavailability } from '@/lib/types';
import { toast } from 'sonner';

export function useUnavailabilities() {
  const [unavailabilities, setUnavailabilities] = useState<Unavailability[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUnavailabilities = async () => {
    try {
      setLoading(true);
      const res = await api.get<Unavailability[]>('/unavailabilities');
      setUnavailabilities(res.data);
    } catch (err) {
      toast.error("Erreur lors du chargement des indisponibilités");
    } finally {
      setLoading(false);
    }
  };

  const createUnavailability = async (data: any) => {
    try {
      const res = await api.post<Unavailability>('/unavailabilities', data);
      setUnavailabilities(prev => [...prev, res.data]);
      toast.success("Indisponibilité ajoutée");
      return res.data;
    } catch {
      toast.error("Erreur lors de l'ajout");
    }
  };

  const deleteUnavailability = async (id: number) => {
    try {
      await api.delete(`/unavailabilities/${id}`);
      setUnavailabilities(prev => prev.filter(u => u.id !== id));
      toast.success("Retirée");
    } catch {
      toast.error("Erreur de suppression");
    }
  };

  const updateUnavailability = async (id: number, data: any) => {
    try {
      const res = await api.put<Unavailability>(`/unavailabilities/${id}`, data);
      setUnavailabilities(prev => prev.map(u => u.id === id ? res.data : u));
      toast.success("Mise à jour réussie");
      return res.data;
    } catch {
      toast.error("Erreur de mise à jour");
    }
  };

  useEffect(() => {
    fetchUnavailabilities();
  }, []);

  return { unavailabilities, loading, fetchUnavailabilities, createUnavailability, deleteUnavailability, updateUnavailability };
}
