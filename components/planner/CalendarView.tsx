"use client";

import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import frLocale from '@fullcalendar/core/locales/fr';
import { Task, Unavailability } from '@/lib/types';
import { useMemo } from 'react';

interface CalendarViewProps {
  tasks: Task[];
  unavailabilities: Unavailability[];
  onEventClick?: (id: string) => void;
  onEventDrop?: (id: string, start: Date, end: Date) => void;
}

export function CalendarView({ tasks, unavailabilities, onEventClick, onEventDrop }: CalendarViewProps) {
  const events = useMemo(() => {
    const taskEvents = tasks
      .filter(t => t.scheduledStart && t.scheduledEnd)
      .map(t => ({
        id: `task-${t.id}`,
        title: t.title,
        start: t.scheduledStart,
        end: t.scheduledEnd,
        backgroundColor: t.eisenhowerQuadrant === 'Q1' ? '#f87171' : 
                         t.eisenhowerQuadrant === 'Q2' ? '#60a5fa' :
                         t.eisenhowerQuadrant === 'Q3' ? '#fb923c' : '#9ca3af',
        borderColor: 'transparent',
        textColor: '#fff',
        extendedProps: { type: 'task', taskId: t.id }
      }));

    const unavailEvents = unavailabilities.map(u => ({
      id: `unavail-${u.id}`,
      title: u.title,
      start: u.startTime,
      end: u.endTime,
      display: 'background',
      backgroundColor: '#fee2e2',
      classNames: ['pattern-diagonal-lines-sm'],
      extendedProps: { type: 'unavailability' }
    }));

    return [...taskEvents, ...unavailEvents];
  }, [tasks, unavailabilities]);

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border h-full">
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
        initialView="timeGridWeek"
        locale={frLocale}
        events={events}
        editable={true}
        selectable={true}
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
        }}
        slotMinTime="07:00:00"
        slotMaxTime="23:00:00"
        allDaySlot={false}
        height="100%"
        eventClick={(info) => onEventClick?.(info.event.id)}
        eventDrop={(info) => {
          if (info.event.start && info.event.end) {
            onEventDrop?.(info.event.id, info.event.start, info.event.end);
          }
        }}
      />
      <style jsx global>{`
        .pattern-diagonal-lines-sm {
          background-image: repeating-linear-gradient(45deg, transparent, transparent 5px, rgba(239, 68, 68, 0.1) 5px, rgba(239, 68, 68, 0.1) 10px);
        }
        .fc { font-family: inherit; }
        .fc-toolbar-title { font-size: 1.25rem !important; font-weight: 600; color: #1e293b; }
        .fc-button-primary { background-color: #f1f5f9 !important; border-color: #e2e8f0 !important; color: #475569 !important; border-radius: 8px !important; text-transform: capitalize !important; }
        .fc-button-active { background-color: #3b82f6 !important; color: white !important; border-color: #3b82f6 !important; }
      `}</style>
    </div>
  );
}
