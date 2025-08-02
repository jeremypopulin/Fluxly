import React from 'react';
import { Job, Technician } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface DayViewProps {
  currentDate: Date;
  jobs: Job[];
  technicians: Technician[];
  onJobClick: (job: Job) => void;
  onDateChange: (date: Date) => void;
  onJobUpdate: (job: Job) => void;
}

const DayView: React.FC<DayViewProps> = ({
  currentDate,
  jobs,
  technicians,
  onJobClick,
  onDateChange,
  onJobUpdate
}) => {
  const getJobsForDate = (date: Date) => {
    if (!Array.isArray(jobs)) return [];
    const dateStr = date.toDateString();
    return jobs
      .filter(job => new Date(job.start_time).toDateString() === dateStr)
      .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());
  };

  const handlePrevDay = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() - 1);
    onDateChange(newDate);
  };

  const handleNextDay = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + 1);
    onDateChange(newDate);
  };

  const dayJobs = getJobsForDate(currentDate);
  const today = new Date();
  const isToday = currentDate.toDateString() === today.toDateString();

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-3 sm:p-4 border-b">
        <Button variant="outline" size="sm" onClick={handlePrevDay} className="p-2">
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <h2 className="text-sm sm:text-xl font-semibold text-center flex-1 mx-2">
          {currentDate.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          })}
          {isToday && <span className="text-blue-600 ml-2">(Today)</span>}
        </h2>
        <Button variant="outline" size="sm" onClick={handleNextDay} className="p-2">
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      <div className="flex-1 p-3 sm:p-4">
        {dayJobs.length === 0 ? (
          <div className="text-center text-gray-500 mt-8">
            <p>No jobs scheduled for this day</p>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {dayJobs.map(job => {
              const startTime = new Date(job.start_time);
              const endTime = new Date(job.end_time);
              const assignedTechs = Array.isArray(technicians)
                ? technicians.filter(t => job.technicianIds.includes(t.id))
                : [];

              return (
                <div
                  key={job.id}
                  className={`bg-white rounded-lg border p-3 sm:p-4 cursor-pointer hover:shadow-md transition-shadow ${
                    job.status === 'completed' ? 'bg-blue-50 border-blue-200' : ''
                  }`}
                  onClick={() => onJobClick(job)}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData('application/json', JSON.stringify(job));
                  }}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-base sm:text-lg">{job.title}</h3>
                      <p className="text-gray-600 text-sm mb-2 line-clamp-2">{job.description}</p>

                      <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 text-sm text-gray-500 gap-1 sm:gap-0">
                        <span>
                          {startTime.toLocaleTimeString('en-US', {
                            hour: 'numeric',
                            minute: '2-digit'
                          })}{' '}
                          -{' '}
                          {endTime.toLocaleTimeString('en-US', {
                            hour: 'numeric',
                            minute: '2-digit'
                          })}
                        </span>
                        {job.location && (
                          <span className="truncate">📍 {job.location}</span>
                        )}
                      </div>

                      {assignedTechs.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1 mt-2">
                          <span className="text-sm text-gray-500">Assigned:</span>
                          {assignedTechs.map(tech => (
                            <Badge key={tech.id} variant="secondary" className="text-xs">
                              {tech.name}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-row sm:flex-col items-start sm:items-end space-x-2 sm:space-x-0 sm:space-y-2">
                      <Badge
                        variant={job.status === 'completed' ? 'default' : 'secondary'}
                        className={`text-xs ${
                          job.status === 'assigned' ? 'bg-blue-100 text-blue-800' : ''
                        } ${
                          job.status === 'in-progress' ? 'bg-yellow-100 text-yellow-800' : ''
                        } ${
                          job.status === 'completed' ? 'bg-blue-100 text-blue-800' : ''
                        }`}
                      >
                        {job.status.replace('-', ' ').toUpperCase()}
                      </Badge>

                      <Badge
                        variant="outline"
                        className={`text-xs ${
                          job.priority === 'high' ? 'border-red-500 text-red-600' : ''
                        } ${
                          job.priority === 'medium' ? 'border-yellow-500 text-yellow-600' : ''
                        } ${
                          job.priority === 'low' ? 'border-green-500 text-green-600' : ''
                        }`}
                      >
                        {job.priority.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default DayView;
