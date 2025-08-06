import React, { useEffect, useState } from 'react';
import { Job, Technician, Customer } from '@/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

interface JobSheetFormProps {
  job?: Job;
  technicians: Technician[];
  customers: Customer[];
  formData: any;
  setFormData: (data: any) => void;
  handleTechnicianToggle: (techId: string) => void;
  handleFilesChange: (files: File[]) => void;
  handleSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  onDelete?: () => void;
  isSubmitting: boolean;
}

const JobSheetForm: React.FC<JobSheetFormProps> = ({
  job,
  technicians,
  customers,
  formData,
  setFormData,
  handleTechnicianToggle,
  handleFilesChange,
  handleSubmit,
  onCancel,
  onDelete,
  isSubmitting,
}) => {
  // Set end time default to 1 hour after start
  useEffect(() => {
    if (formData.startTime && !formData.endTime) {
      const start = new Date(formData.startTime);
      const end = new Date(start.getTime() + 60 * 60 * 1000); // +1 hour
      setFormData((prev: any) => ({
        ...prev,
        endTime: end.toISOString().slice(0, 16),
      }));
    }
  }, [formData.startTime]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCompleted = () => {
    setFormData((prev: any) => ({
      ...prev,
      status: 'completed',
    }));
  };

  return (
    <div className="relative max-w-4xl mx-auto px-4 py-6 bg-white shadow-md rounded-lg">
      {formData.status === 'completed' && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <div className="text-blue-600 font-extrabold text-5xl opacity-20 transform rotate-12">
            COMPLETED
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 relative z-20">
        {/* Customer */}
        <div>
          <Label>Customer</Label>
          <select
            name="customerId"
            value={formData.customerId}
            onChange={handleInputChange}
            className="w-full border rounded px-3 py-2"
          >
            <option value="">Select Customer</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Title & Job Number */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label>Title</Label>
            <Input
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
            />
          </div>
          <div>
            <Label>Job Number</Label>
            <Input
              name="jobNumber"
              value={formData.jobNumber}
              onChange={handleInputChange}
              required
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <Label>Description</Label>
          <Textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows={4}
            placeholder="Enter job description..."
            className="resize-y"
          />
        </div>

        {/* Parts Used */}
        <div>
          <Label>Parts Used</Label>
          <Textarea
            name="partsUsed"
            value={formData.partsUsed ?? ''}
            onChange={handleInputChange}
            rows={3}
            placeholder="Enter parts or materials used..."
            className="resize-y"
          />
        </div>

        {/* Time & Status */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <Label>Start Time</Label>
            <Input
              type="datetime-local"
              name="startTime"
              value={formData.startTime}
              onChange={handleInputChange}
              required
            />
          </div>
          <div>
            <Label>End Time</Label>
            <Input
              type="datetime-local"
              name="endTime"
              value={formData.endTime}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <Label>Status</Label>
            <select
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              className="w-full border rounded px-2 py-2"
            >
              <option value="assigned">Assigned</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>

        {/* Location */}
        <div>
          <Label>Location</Label>
          <Input
            name="location"
            value={formData.location}
            onChange={handleInputChange}
          />
        </div>

        {/* Assigned Technicians */}
        <div>
          <Label>Assign Technicians</Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {technicians.map((tech) => (
              <label key={tech.id} className="flex items-center space-x-2">
                <Checkbox
                  checked={formData.technicianIds.includes(tech.id)}
                  onCheckedChange={() => handleTechnicianToggle(tech.id)}
                />
                <span>{tech.name}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap justify-between items-center pt-4 space-y-2 sm:space-y-0 sm:space-x-2">
          <div className="space-x-2">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save'}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            {onDelete && (
              <Button type="button" variant="destructive" onClick={onDelete}>
                Delete
              </Button>
            )}
          </div>
          <Button
            type="button"
            variant="secondary"
            className="font-bold bg-green-600 text-white"
            onClick={handleCompleted}
          >
            Mark Completed
          </Button>
        </div>
      </form>
    </div>
  );
};

export default JobSheetForm;
