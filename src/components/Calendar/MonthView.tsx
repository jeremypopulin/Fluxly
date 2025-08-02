import React from 'react';
import { Job, Technician } from '@/types';
import { Badge } from '@/components/ui/badge';

interface MonthViewProps {
  currentDate: Date;
  jobs: Job[];
  technicians: Technician[];
  onJobClick: (job: Job) => void;
  onDateChange: (date: Date) => void;
  onDayDoubleClick: (date: Date) => void;
  onJobUpdate: (job: Job, newDate: Date) => void;
}

const MonthView: React.FC<MonthViewProps> = ({
  currentDate,
  jobs,
  technicians,
  onJobClick,
  onDateChange,
  onDayDoubleClick,
  onJobUpdate
}) => {
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    for (let i = 0; i < 42; i++) {
      const day = new Date(startDate);
      day.setDate(startDate.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const getJobsForDate = (date: Date) => {
  const dateStr = date.toDateString();
  return (jobs ?? []).filter(job =>
    new Date(job.start_time).toDateString() === dateStr
  );
};


  const handleDayDoubleClick = (day: Date) => {
    const newJobDate = new Date(day);
    newJobDate.setHours(9, 0, 0, 0);
    onDayDoubleClick(newJobDate);
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

  const days = getDaysInMonth(currentDate);
  const today = new Date();
  const currentMonth = currentDate.getMonth();

  return (
    <div className="flex flex-col h-full">
      <div className="grid grid-cols-7 border-b bg-gray-50">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="p-2 sm:p-3 text-center font-medium text-gray-600 border-r text-xs sm:text-sm">
            <span className="hidden sm:inline">{day}</span>
            <span className="sm:hidden">{day.charAt(0)}</span>
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-7 flex-1">
        {days.map((day, index) => {
          const dayJobs = getJobsForDate(day);
          const isCurrentMonth = day.getMonth() === currentMonth;
          const isToday = day.toDateString() === today.toDateString();
          
          return (
            <div
              key={index}
              className={`border-r border-b p-1 sm:p-2 min-h-[80px] sm:min-h-[120px] cursor-pointer hover:bg-gray-50 ${
                !isCurrentMonth ? 'bg-gray-50 text-gray-400' : ''
              } ${isToday ? 'bg-blue-50' : ''}`}
              onDoubleClick={() => handleDayDoubleClick(day)}
              onDrop={(e) => handleDrop(e, day)}
              onDragOver={handleDragOver}
              title="Double-click to create new job"
            >
              <div className={`text-xs sm:text-sm font-medium mb-1 ${
                isToday ? 'text-blue-600' : ''
              }`}>
                {day.getDate()}
              </div>
              <div className="space-y-1">
                {dayJobs.slice(0, 2).map(job => (
                  <Badge
                    key={job.id}
                    variant="secondary"
                    className={`block text-xs cursor-pointer hover:bg-gray-200 truncate p-1 leading-tight ${
                      job.status === 'completed' ? 'bg-blue-100 text-blue-800 border-blue-200' : ''
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onJobClick(job);
                    }}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData('application/json', JSON.stringify(job));
                    }}
                  >
                    <span className="block truncate">{job.title}</span>
                  </Badge>
                ))}
                {dayJobs.length > 2 && (
                  <div className="text-xs text-gray-500 px-1">
                    +{dayJobs.length - 2} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MonthView;