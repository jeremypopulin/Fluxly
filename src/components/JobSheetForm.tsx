import React from 'react';
import { Job, Technician, Customer } from '@/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Trash2, Save, XCircle, CheckCircle } from 'lucide-react';

interface JobSheetFormProps {
  job?: Job;
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  technicians: Technician[];
  customers: Customer[];
  handleTechnicianToggle: (techId: string) => void;
  handleFilesChange: (files: File[]) => void;
  handleSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  onDelete?: () => void;
  isSubmitting: boolean;
}

const JobSheetForm: React.FC<JobSheetFormProps> = ({
  job,
  formData,
  setFormData,
  technicians,
  customers,
  handleTechnicianToggle,
  handleFilesChange,
  handleSubmit,
  onCancel,
  onDelete,
  isSubmitting
}) => {
  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl mx-auto px-4 py-6">
      <div>
        <Label>Job Number</Label>
        <Input value={formData.jobNumber} readOnly className="bg-gray-100" />
      </div>

      <div>
        <Label>Title</Label>
        <Input
          value={formData.title}
          onChange={(e) => setFormData((prev: any) => ({ ...prev, title: e.target.value }))}
          required
        />
      </div>

      <div>
        <Label>Description</Label>
        <Textarea
          value={formData.description}
          onChange={(e) => setFormData((prev: any) => ({ ...prev, description: e.target.value }))}
        />
      </div>

      <div>
        <Label>Customer</Label>
        <select
          value={formData.customerId}
          onChange={(e) => setFormData((prev: any) => ({ ...prev, customerId: e.target.value }))}
          className="w-full border rounded px-2 py-2"
        >
          <option value="">Select Customer</option>
          {customers.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      <div>
        <Label>Assign Technicians</Label>
        <div className="space-y-2">
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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label>Start Time</Label>
          <Input
            type="datetime-local"
            value={formData.startTime}
            onChange={(e) => setFormData((prev: any) => ({ ...prev, startTime: e.target.value }))}
          />
        </div>
        <div>
          <Label>End Time</Label>
          <Input
            type="datetime-local"
            value={formData.endTime}
            onChange={(e) => setFormData((prev: any) => ({ ...prev, endTime: e.target.value }))}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label>Status</Label>
          <select
            value={formData.status}
            onChange={(e) => setFormData((prev: any) => ({ ...prev, status: e.target.value }))}
            className="w-full border rounded px-2 py-2"
          >
            <option value="assigned">Assigned</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>
        <div>
          <Label>Priority</Label>
          <select
            value={formData.priority}
            onChange={(e) => setFormData((prev: any) => ({ ...prev, priority: e.target.value }))}
            className="w-full border rounded px-2 py-2"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
      </div>

      <div>
        <Label>Location</Label>
        <Input
          value={formData.location}
          onChange={(e) => setFormData((prev: any) => ({ ...prev, location: e.target.value }))}
        />
      </div>

      <div>
        <Label>Upload Files</Label>
        <Input
          type="file"
          multiple
          onChange={(e) => handleFilesChange(Array.from(e.target.files || []))}
        />
      </div>

      <div>
        <Label>Upload Purchase Order</Label>
        <Input
          type="file"
          onChange={(e) => setFormData((prev: any) => ({ ...prev, purchaseOrder: e.target.files?.[0] || null }))}
        />
      </div>

      <div className="flex flex-wrap gap-3 justify-end pt-6">
        <Button type="button" variant="outline" onClick={onCancel}>
          <XCircle className="mr-2 h-4 w-4" /> Cancel
        </Button>
        {onDelete && job?.id && (
          <Button type="button" variant="destructive" onClick={onDelete}>
            <Trash2 className="mr-2 h-4 w-4" /> Delete
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting}>
          <Save className="mr-2 h-4 w-4" /> {isSubmitting ? 'Saving...' : 'Save Job'}
        </Button>
        <Button type="button" variant="default" className="bg-green-600 hover:bg-green-700">
          <CheckCircle className="mr-2 h-4 w-4" /> Completed
        </Button>
      </div>
    </form>
  );
};

export default JobSheetForm;
