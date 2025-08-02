import React from 'react';
import { Job, Technician } from '@/types';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay } from 'date-fns';
import JobCard from './JobCard';
import { ScrollArea } from '@/components/ui/scroll-area';

interface WeekViewProps {
  currentDate: Date;
  jobs: Job[];
  technicians: Technician[];
  onJobClick: (job: Job) => void;
  onDateChange: (date: Date) => void;
  onDayDoubleClick?: (date: Date) => void;
  onJobUpdate: (job: Job, newDate: Date) => void;
}

const WeekView: React.FC<WeekViewProps> = ({
  currentDate,
  jobs,
  technicians,
  onJobClick,
  onDateChange,
  onDayDoubleClick,
  onJobUpdate
}) => {
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const getJobsForDate = (date: Date) => {
    if (!Array.isArray(jobs)) return []; // ✅ Prevent crash if jobs is undefined
    return jobs.filter(job => {
      const jobDate = new Date(job.start_time);
      return isSameDay(jobDate, date);
    });
  };

  const getTechnicianName = (techId: string) => {
    const tech = technicians.find(t => t.id === techId);
    return tech ? tech.name : 'Unassigned';
  };

  const handleDrop = (e: React.DragEvent, targetDate: Date) => {
    e.preventDefault();
    try {
      const jobData = JSON.parse(e.dataTransfer.getData('application/json'));
      onJobUpdate(jobData, targetDate);
    } catch (error) {
      console.error('Error updating job:', error);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  return (
    <div className="h-full flex flex-col">
      <div className="grid grid-cols-7 gap-px bg-gray-200 border-b">
        {weekDays.map((day) => (
          <div key={day.toISOString()} className="bg-white p-2 sm:p-3 text-center border-r last:border-r-0">
            <div className="text-xs sm:text-sm font-medium text-gray-500 uppercase">
              {format(day, 'EEE')}
            </div>
            <div className={`text-lg sm:text-xl font-semibold mt-1 ${
              isSameDay(day, new Date()) ? 'text-blue-600' : 'text-gray-900'
            }`}>
              {format(day, 'd')}
            </div>
          </div>
        ))}
      </div>

      <ScrollArea className="flex-1">
        <div className="grid grid-cols-7 gap-px bg-gray-200 min-h-full">
          {weekDays.map((day) => {
            const dayJobs = getJobsForDate(day);
            
            return (
              <div
                key={day.toISOString()}
                className="bg-white p-1 sm:p-2 border-r last:border-r-0 min-h-[200px] cursor-pointer hover:bg-gray-50"
                onDoubleClick={() => onDayDoubleClick && onDayDoubleClick(day)}
                onDrop={(e) => handleDrop(e, day)}
                onDragOver={handleDragOver}
              >
                <div className="space-y-1">
                  {dayJobs.map((job) => (
                    <JobCard
                      key={job.id}
                      job={job}
                      technicianName={getTechnicianName(job.technicianIds[0])}
                      onClick={() => onJobClick(job)}
                      compact={true}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
};

export default WeekView;
