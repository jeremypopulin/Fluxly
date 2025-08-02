import React, { useEffect, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Job, Technician } from '@/types';
import { supabase } from '@/lib/supabase';

interface FullCalendarViewProps {
  jobs: Job[];
  technicians: Technician[];
  onJobClick: (job: Job) => void;
  onJobUpdate: (job: Job) => void;
}

const FullCalendarView: React.FC<FullCalendarViewProps> = ({
  jobs,
  technicians,
  onJobClick,
  onJobUpdate
}) => {
  const calendarRef = useRef<FullCalendar>(null);

  const events = jobs.map(job => ({
    id: job.id,
    title: job.title,
    start: job.startTime,
    end: job.endTime,
    backgroundColor: job.status === 'completed' ? '#dbeafe' : '#f3f4f6',
    borderColor: job.status === 'completed' ? '#3b82f6' : '#6b7280',
    textColor: job.status === 'completed' ? '#1e40af' : '#374151',
    extendedProps: {
      job: job
    }
  }));

  const handleEventDrop = async (info: any) => {
    let newStart = info.event.start;
    if (!(newStart instanceof Date)) {
      newStart = new Date(newStart);
    }
    
    if (isNaN(newStart.getTime())) {
      console.error('Invalid date after drop:', newStart);
      info.revert();
      return;
    }

    const originalJob = info.event.extendedProps.job;
    const duration = new Date(originalJob.endTime).getTime() - new Date(originalJob.startTime).getTime();
    const newEnd = new Date(newStart.getTime() + duration);

    const iso = newStart.toISOString();
    const endIso = newEnd.toISOString();

    try {
      const { data, error } = await supabase.functions.invoke('update-job-date', {
        body: { 
          id: originalJob.id, 
          start: iso,
          end: endIso
        }
      });

      if (error) {
        console.error('Failed to update job:', error);
        info.revert();
        return;
      }

      const updatedJob = {
        ...originalJob,
        startTime: newStart,
        endTime: newEnd
      };

      onJobUpdate(updatedJob);
    } catch (error) {
      console.error('Error updating job:', error);
      info.revert();
    }
  };

  return (
    <div className="h-full">
      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay'
        }}
        events={events}
        editable={true}
        eventStartEditable={true}
        eventDurationEditable={true}
        eventDrop={handleEventDrop}
        eventClick={(info) => {
          const job = info.event.extendedProps.job;
          onJobClick(job);
        }}
        height="100%"
        dayMaxEvents={3}
        moreLinkClick="popover"
      />
    </div>
  );
};

export default FullCalendarView;