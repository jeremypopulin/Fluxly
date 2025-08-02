import React, { useState, useEffect } from 'react';
import { Job, Technician, Customer } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { useAppContext } from '@/contexts/AppContext';
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from '@/contexts/AuthContext';

interface JobModalProps {
  job: Job | null;
  technicians: Technician[];
  customers: Customer[];
  isOpen: boolean;
  onClose: () => void;
  onSave: (job: Job) => void;
  onDelete?: (jobId: string) => void;
}

const JobModal: React.FC<JobModalProps> = ({
  job,
  technicians,
  customers,
  isOpen,
  onClose,
  onSave,
  onDelete
}) => {
  const { generateJobNumber } = useAppContext();
  const { isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({
    jobNumber: '',
    title: '',
    description: '',
    customerId: '',
    technicianIds: [] as string[],
    startTime: '',
    endTime: '',
    status: 'assigned' as 'assigned' | 'in-progress' | 'completed',
    priority: 'medium' as 'low' | 'medium' | 'high',
    location: '',
    quoteNumber: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (job) {
      setFormData({
        jobNumber: job.jobNumber,
        title: job.title,
        description: job.description,
        customerId: job.customerId || '',
        technicianIds: job.technicianIds || [],
        startTime: new Date(job.start_time).toISOString().slice(0, 16),
        endTime: new Date(job.end_time).toISOString().slice(0, 16),
        status: job.status,
        priority: job.priority,
        location: job.location || '',
        quoteNumber: job.quoteNumber || ''
      });
    } else {
      setFormData({
        jobNumber: generateJobNumber(),
        title: '',
        description: '',
        customerId: '',
        technicianIds: [],
        startTime: '',
        endTime: '',
        status: 'assigned',
        priority: 'medium',
        location: '',
        quoteNumber: ''
      });
    }
  }, [job, generateJobNumber]);

  const handleTechnicianToggle = (techId: string) => {
    setFormData(prev => ({
      ...prev,
      technicianIds: prev.technicianIds.includes(techId)
        ? prev.technicianIds.filter(id => id !== techId)
        : [...prev.technicianIds, techId]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      toast({
        title: 'Error',
        description: 'Authentication required',
        variant: 'destructive'
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const endTime = formData.endTime || formData.startTime;
      
      const jobData: Job = {
        id: job?.id || uuidv4(),
        jobNumber: formData.jobNumber,
        title: formData.title,
        description: formData.description,
        customerId: formData.customerId,
        technicianIds: formData.technicianIds,
        start_time: new Date(formData.startTime).toISOString(),
        end_time: new Date(endTime).toISOString(),
        status: formData.status,
        priority: formData.priority,
        location: formData.location,
        quoteNumber: formData.quoteNumber
      };
      
      await onSave(jobData);
      onClose();
    } catch (error) {
      console.error('Error saving job:', error);
      toast({
        title: 'Error',
        description: 'Failed to save job',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Calendar className="w-5 h-5" />
            <span>{job ? 'Edit Job' : 'Create New Job'}</span>
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="jobNumber">Job Number</Label>
                <Input
                  id="jobNumber"
                  value={formData.jobNumber}
                  onChange={(e) => setFormData({...formData, jobNumber: e.target.value})}
                  placeholder="Auto-generated"
                />
              </div>
              <div>
                <Label htmlFor="title">Job Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="customer">Customer</Label>
                <Select value={formData.customerId} onValueChange={(value) => setFormData({...formData, customerId: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map(customer => (
                      <SelectItem key={customer.id} value={customer.id}>{customer.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="quoteNumber">Quote Number</Label>
                <Input
                  id="quoteNumber"
                  value={formData.quoteNumber}
                  onChange={(e) => setFormData({...formData, quoteNumber: e.target.value})}
                  placeholder="Enter quote number"
                />
              </div>
            </div>
            
            <div>
              <Label>Assigned Technicians</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {technicians.map(tech => (
                  <div key={tech.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={tech.id}
                      checked={formData.technicianIds.includes(tech.id)}
                      onCheckedChange={() => handleTechnicianToggle(tech.id)}
                    />
                    <Label htmlFor={tech.id}>{tech.name}</Label>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startTime">Start Time</Label>
                <Input
                  id="startTime"
                  type="datetime-local"
                  value={formData.startTime}
                  onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="endTime">End Time (optional)</Label>
                <Input
                  id="endTime"
                  type="datetime-local"
                  value={formData.endTime}
                  onChange={(e) => setFormData({...formData, endTime: e.target.value})}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value: any) => setFormData({...formData, status: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="assigned">Assigned</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="priority">Priority</Label>
                <Select value={formData.priority} onValueChange={(value: any) => setFormData({...formData, priority: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  placeholder="Optional"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                rows={3}
              />
            </div>
          </div>
          
          <div className="flex justify-between pt-4 mt-6 border-t">
            <div>
              {job && onDelete && (
                <Button type="button" variant="destructive" onClick={() => onDelete(job.id)}>
                  Delete Job
                </Button>
              )}
            </div>
            <div className="space-x-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Saving...' : job ? 'Update Job' : 'Create Job'}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default JobModal;