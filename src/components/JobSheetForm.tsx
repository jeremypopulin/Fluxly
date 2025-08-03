import React, { useState, useEffect } from 'react';
import { Job, Technician, Customer } from '@/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';

interface JobSheetFormProps {
  job?: Job;
  technicians: Technician[];
  customers: Customer[];
  onSave: (updatedJob: Job) => void;
}

const JobSheetForm: React.FC<JobSheetFormProps> = ({
  job,
  technicians,
  customers,
  onSave,
}) => {
  const [formState, setFormState] = useState<Job>(
    job ?? {
      id: '',
      jobNumber: '',
      title: '',
      description: '',
      customerId: '',
      technicianIds: [],
      start_time: '',
      end_time: '',
      status: 'assigned',
      priority: 'medium',
      location: '',
    }
  );

  useEffect(() => {
    if (job) setFormState(job);
  }, [job]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleTechnicianToggle = (techId: string) => {
    setFormState((prev) => {
      const updated = prev.technicianIds.includes(techId)
        ? prev.technicianIds.filter((id) => id !== techId)
        : [...prev.technicianIds, techId];
      return { ...prev, technicianIds: updated };
    });
  };

  const handleSave = () => {
    onSave(formState);
  };

  return (
    <div className="space-y-4">
      <div>
        <Label>Job Number</Label>
        <Input name="jobNumber" value={formState.jobNumber} onChange={handleChange} />
      </div>

      <div>
        <Label>Title</Label>
        <Input name="title" value={formState.title} onChange={handleChange} />
      </div>

      <div>
        <Label>Description</Label>
        <Textarea name="description" value={formState.description} onChange={handleChange} />
      </div>

      <div>
        <Label>Customer</Label>
        <select
          name="customerId"
          value={formState.customerId}
          onChange={(e) => setFormState((prev) => ({ ...prev, customerId: e.target.value }))}
          className="w-full border rounded px-2 py-1"
        >
          <option value="">Select Customer</option>
          {customers.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <Label>Assign Technicians</Label>
        <div className="space-y-1">
          {technicians.map((tech) => (
            <label key={tech.id} className="flex items-center space-x-2">
              <Checkbox
                checked={formState.technicianIds.includes(tech.id)}
                onCheckedChange={() => handleTechnicianToggle(tech.id)}
              />
              <span>{tech.name}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <Label>Start Time</Label>
        <Input type="datetime-local" name="start_time" value={formState.start_time ?? ''} onChange={handleChange} />
      </div>

      <div>
        <Label>End Time</Label>
        <Input type="datetime-local" name="end_time" value={formState.end_time ?? ''} onChange={handleChange} />
      </div>

      <div>
        <Label>Status</Label>
        <select
          name="status"
          value={formState.status}
          onChange={(e) => setFormState((prev) => ({ ...prev, status: e.target.value as Job['status'] }))}
          className="w-full border rounded px-2 py-1"
        >
          <option value="assigned">Assigned</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      <div>
        <Label>Priority</Label>
        <select
          name="priority"
          value={formState.priority}
          onChange={(e) => setFormState((prev) => ({ ...prev, priority: e.target.value as Job['priority'] }))}
          className="w-full border rounded px-2 py-1"
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>

      <div>
        <Label>Location</Label>
        <Input name="location" value={formState.location ?? ''} onChange={handleChange} />
      </div>

      <div className="pt-4">
        <Button onClick={handleSave}>Save Job</Button>
      </div>
    </div>
  );
};

export default JobSheetForm;
