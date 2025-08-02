import React, { useState } from 'react';
import { Job, Technician } from '@/types';
import CalendarHeader from './CalendarHeader';
import MonthView from './MonthView';
import WeekView from './WeekView';
import DayView from './DayView';
import CalendarViewSelector from './CalendarViewSelector';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/lib/supabase';

interface CalendarViewProps {
  technicians: Technician[];
  jobs: Job[];
  onJobClick: (job: Job) => void;
  onNewJob: (selectedDate?: Date) => void;
  onUpdateJob: (job: Job) => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({
  technicians,
  jobs,
  onJobClick,
  onNewJob,
  onUpdateJob
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'month' | 'week' | 'day'>('month');

  const handleDayDoubleClick = (date: Date) => {
    onNewJob(date);
  };

  const handleJobDrop = async (job: Job, newDate: Date) => {
    const originalStart = new Date(job.start_time);
    const originalEnd = new Date(job.end_time);
    const duration = originalEnd.getTime() - originalStart.getTime();

    // Preserve original time of day
    newDate.setHours(originalStart.getHours(), originalStart.getMinutes());
    const newEnd = new Date(newDate.getTime() + duration);

    try {
      const { error } = await supabase.functions.invoke('update-job-date', {
        body: {
          id: job.id,
          start: newDate.toISOString(),
          end: newEnd.toISOString()
        }
      });

      if (error) {
        console.error('Failed to update job:', error);
        return;
      }

      const updatedJob: Job = {
        ...job,
        start_time: newDate.toISOString(),
        end_time: newEnd.toISOString()
      };

      onUpdateJob(updatedJob);
    } catch (err) {
      console.error('Error updating job:', err);
    }
  };

  const renderCalendarView = () => {
    const sharedProps = {
      currentDate,
      jobs,
      technicians,
      onJobClick,
      onDateChange: setCurrentDate,
      onJobUpdate: handleJobDrop
    };

    switch (view) {
      case 'month':
        return (
          <MonthView
            {...sharedProps}
            onDayDoubleClick={handleDayDoubleClick}
          />
        );
      case 'week':
        return (
          <WeekView
            {...sharedProps}
            onDayDoubleClick={handleDayDoubleClick}
          />
        );
      case 'day':
        return (
          <DayView
            {...sharedProps}
            onJobUpdate={onUpdateJob}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="px-3 sm:px-6 py-2 sm:py-4 bg-white border-b">
        <CalendarHeader
          currentDate={currentDate}
          onDateChange={setCurrentDate}
          onNewJob={() => onNewJob()}
        />
        <div className="mt-2 sm:mt-4">
          <CalendarViewSelector
            currentView={view}
            onViewChange={setView}
          />
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="min-h-full p-2 sm:p-4">
          {renderCalendarView()}
        </div>
      </ScrollArea>
    </div>
  );
};

export default CalendarView;
