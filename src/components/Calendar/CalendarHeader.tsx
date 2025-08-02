import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';

interface CalendarHeaderProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
  onNewJob: () => void;
}

const CalendarHeader: React.FC<CalendarHeaderProps> = ({
  currentDate,
  onDateChange,
  onNewJob
}) => {
  const handlePrevMonth = () => {
    const prevMonth = new Date(currentDate);
    prevMonth.setMonth(currentDate.getMonth() - 1);
    onDateChange(prevMonth);
  };

  const handleNextMonth = () => {
    const nextMonth = new Date(currentDate);
    nextMonth.setMonth(currentDate.getMonth() + 1);
    onDateChange(nextMonth);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
      <div className="flex items-center space-x-2 sm:space-x-4 w-full sm:w-auto">
        <Button variant="outline" size="sm" onClick={handlePrevMonth} className="p-2">
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <h2 className="text-base sm:text-lg font-semibold text-gray-900 flex-1 sm:flex-none text-center sm:text-left min-w-[140px] sm:min-w-[200px]">
          {formatDate(currentDate)}
        </h2>
        <Button variant="outline" size="sm" onClick={handleNextMonth} className="p-2">
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
      
      <Button onClick={onNewJob} className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto">
        <Plus className="w-4 h-4 mr-2" />
        <span className="sm:inline">New Job</span>
      </Button>
    </div>
  );
};

export default CalendarHeader;