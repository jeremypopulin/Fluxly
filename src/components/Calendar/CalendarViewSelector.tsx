import React from 'react';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, CalendarDays } from 'lucide-react';

interface CalendarViewSelectorProps {
  currentView: 'month' | 'week' | 'day';
  onViewChange: (view: 'month' | 'week' | 'day') => void;
}

const CalendarViewSelector: React.FC<CalendarViewSelectorProps> = ({
  currentView,
  onViewChange
}) => {
  const views = [
    { value: 'month' as const, label: 'Month', icon: Calendar },
    { value: 'week' as const, label: 'Week', icon: CalendarDays },
    { value: 'day' as const, label: 'Day', icon: Clock }
  ];

  return (
    <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1 w-full sm:w-auto">
      {views.map(({ value, label, icon: Icon }) => (
        <Button
          key={value}
          variant={currentView === value ? 'default' : 'ghost'}
          size="sm"
          onClick={() => onViewChange(value)}
          className={`flex items-center space-x-1 sm:space-x-2 flex-1 sm:flex-none justify-center ${
            currentView === value 
              ? 'bg-gray-800 text-white shadow-sm hover:bg-gray-700' 
              : 'hover:bg-gray-200'
          }`}
        >
          <Icon className="w-4 h-4" />
          <span className="text-xs sm:text-sm">{label}</span>
        </Button>
      ))}
    </div>
  );
};

export default CalendarViewSelector;