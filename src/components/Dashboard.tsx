import React, { useState } from 'react';
import { Job } from '@/types';
import { useAppContext } from '@/contexts/AppContext';
import CalendarView from './Calendar/CalendarView';
import JobSheet from './JobSheet';
import JobsList from './JobsList';
import { CustomerList } from './CustomerList';
import TechnicianManagement from './TechnicianManagement';
import FileUpload from './FileUpload';
import ResendSettings from './ResendSettings';
import ChangePasswordModal from './ChangePasswordModal';
import Logo from './Logo';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LogOut, Settings, ChevronDown } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const {
    jobs,
    technicians,
    customers,
    addJob,
    updateJob,
    deleteJob,
    addCustomer,
    updateCustomer,
    importCustomers,
  } = useAppContext();

  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [isJobSheetOpen, setIsJobSheetOpen] = useState(false);
  const [currentView, setCurrentView] = useState<'calendar' | 'jobsheet'>('calendar');
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);

  const handleJobClick = (job: Job) => {
    setSelectedJob(job);
    setCurrentView('jobsheet');
    setIsJobSheetOpen(true);
  };

  const handleNewJob = (date?: Date) => {
    setSelectedJob(null);
    setSelectedDate(date);
    setCurrentView('jobsheet');
    setIsJobSheetOpen(true);
  };

  const handleSaveJob = async (job: Job) => {
    try {
      if (selectedJob && selectedJob.id) {
        await updateJob(job);
      } else {
        await addJob(job);
      }
      setCurrentView('calendar');
      setIsJobSheetOpen(false);
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to save job',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteJob = (jobId: string) => {
    deleteJob(jobId);
    setCurrentView('calendar');
    setIsJobSheetOpen(false);
  };

  const handleFilesUploaded = (files: File[]) => {
    toast({ title: 'Files Uploaded', description: `${files.length} file(s) uploaded.` });
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isAdmin = user?.role === 'admin';

  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
      <header className="bg-[#0B1F3A] shadow-sm border-b border-gray-700 flex-shrink-0">
        <div className="flex items-center justify-between px-3 sm:px-6 py-3 sm:py-4">
          <Logo size="lg" className="w-32 h-auto" />
          <div className="flex items-center space-x-4">
            <Avatar className="w-6 h-6 sm:w-8 sm:h-8">
              <AvatarFallback className="bg-blue-600 text-white text-xs sm:text-sm">
                {user?.name?.split(' ').map((n) => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div className="hidden sm:block">
              <p className="text-sm font-medium text-white">{user?.name}</p>
              <p className="text-xs text-gray-300">{user?.role}</p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="px-3 sm:px-4 py-2 border-white text-white bg-white/10 hover:bg-white/20 focus:ring-2 focus:ring-white"
                >
                  <Settings className="w-4 h-4 sm:mr-2 text-white" />
                  <span className="hidden sm:inline text-white">Account</span>
                  <ChevronDown className="w-4 h-4 ml-1 text-white" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {isAdmin && (
                  <DropdownMenuItem onClick={() => setIsChangePasswordOpen(true)}>
                    <Settings className="w-4 h-4 mr-2" />
                    Change Password
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto">
        {(currentView === 'jobsheet' || isJobSheetOpen) ? (
          <div className="h-full overflow-y-auto">
            <JobSheet
              job={selectedJob}
              selectedDate={selectedDate}
              technicians={technicians}
              customers={customers}
              onSave={handleSaveJob}
              onCancel={() => {
                setCurrentView('calendar');
                setIsJobSheetOpen(false);
              }}
              onDelete={handleDeleteJob}
            />
          </div>
        ) : (
          <Tabs defaultValue="calendar" className="h-full flex flex-col">
            <div className="px-3 sm:px-6 py-2 flex-shrink-0">
              <TabsList className={`grid w-full ${isAdmin ? 'grid-cols-6' : 'grid-cols-4'} text-xs sm:text-sm`}>
                <TabsTrigger value="calendar">Calendar</TabsTrigger>
                <TabsTrigger value="jobs">Jobs</TabsTrigger>
                <TabsTrigger value="customers">Customers</TabsTrigger>
                <TabsTrigger value="files">Files</TabsTrigger>
                {isAdmin && <TabsTrigger value="technicians">Technicians</TabsTrigger>}
                {isAdmin && <TabsTrigger value="email">Email Settings</TabsTrigger>}
              </TabsList>
            </div>
            <div className="flex-1 overflow-y-auto">
              <TabsContent value="calendar" className="h-full m-0">
                <CalendarView
                  technicians={technicians}
                  jobs={jobs}
                  onJobClick={handleJobClick}
                  onNewJob={handleNewJob}
                  onUpdateJob={updateJob}
                />
              </TabsContent>
              <TabsContent value="jobs" className="p-6 h-full overflow-y-auto">
                <JobsList
                  jobs={jobs}
                  technicians={technicians}
                  customers={customers}
                  onSave={handleSaveJob}
                  onDelete={handleDeleteJob}
                />
              </TabsContent>
              <TabsContent value="customers" className="p-6 h-full overflow-y-auto">
                <CustomerList
                  customers={customers}
                  onAddCustomer={addCustomer}
                  onEditCustomer={updateCustomer}
                  onImportCustomers={importCustomers}
                />
              </TabsContent>
              <TabsContent value="files" className="p-6 h-full overflow-y-auto">
                <FileUpload onFilesChange={handleFilesUploaded} />
              </TabsContent>
              {isAdmin && (
                <TabsContent value="technicians" className="p-6 h-full overflow-y-auto">
                  <TechnicianManagement />
                </TabsContent>
              )}
              {isAdmin && (
                <TabsContent value="email" className="p-6 h-full overflow-y-auto">
                  <ResendSettings />
                </TabsContent>
              )}
            </div>
          </Tabs>
        )}
      </main>

      <ChangePasswordModal
        isOpen={isChangePasswordOpen}
        onClose={() => setIsChangePasswordOpen(false)}
      />
    </div>
  );
};

export default Dashboard;
