import React, { useEffect } from 'react';
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
  // Auto-set end time to +1hr when startTime filled and endTime empty
  useEffect(() => {
    if (formData.startTime && !formData.endTime) {
      const start = new Date(formData.startTime);
      const end = new Date(start.getTime() + 60 * 60 * 1000);
      setFormData((prev: any) => ({
        ...prev,
        endTime: end.toISOString().slice(0, 16),
      }));
    }
  }, [formData.startTime, setFormData]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleCompleted = () => {
    setFormData((prev: any) => ({ ...prev, status: 'completed' }));
  };

  // File handlers for UI below
  const onPhotosChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    handleFilesChange(Array.from(e.target.files));
  };
  const onPurchaseOrderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setFormData((prev: any) => ({ ...prev, purchaseOrder: file }));
  };

  return (
    <div className="relative w-full mx-auto px-4 py-6 bg-white shadow-sm rounded-xl border border-neutral-200">
      {/* FORM */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* === Job Details Card === */}
        <div className="rounded-xl border border-neutral-200 bg-neutral-50/40 p-5">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xl">👤</span>
            <h2 className="text-2xl font-semibold">Job Details</h2>
          </div>

          {/* Top row: Job Number + Job Title */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Job Number</Label>
              <Input name="jobNumber" value={formData.jobNumber} onChange={handleInputChange} required />
            </div>
            <div>
              <Label>Job Title</Label>
              <Input name="title" value={formData.title} onChange={handleInputChange} required />
            </div>
          </div>

          {/* Customer + Quote Number */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <Label>Customer</Label>
              <select
                name="customerId"
                value={formData.customerId}
                onChange={handleInputChange}
                className="w-full border rounded-md px-3 py-2"
              >
                <option value="">Select customer</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label>Quote Number</Label>
              <Input name="quoteNumber" value={formData.quoteNumber} onChange={handleInputChange} />
            </div>
          </div>

          {/* Assigned Technicians (2-column checkboxes) */}
          <div className="mt-4">
            <Label>Assigned Technicians</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
              {technicians.map((tech) => (
                <label key={tech.id} className="flex items-center gap-2">
                  <Checkbox
                    checked={formData.technicianIds.includes(tech.id)}
                    onCheckedChange={() => handleTechnicianToggle(tech.id)}
                  />
                  <span>{tech.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Time + Status row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
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
              <Label>End Time (optional)</Label>
              <Input type="datetime-local" name="endTime" value={formData.endTime} onChange={handleInputChange} />
            </div>
            <div>
              <Label>Status</Label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full border rounded-md px-3 py-2"
              >
                <option value="assigned">Assigned</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          {/* Priority + Location */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <Label>Priority</Label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleInputChange}
                className="w-full border rounded-md px-3 py-2"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div>
              <Label>Location</Label>
              <Input name="location" value={formData.location} onChange={handleInputChange} placeholder="Optional" />
            </div>
          </div>
        </div>

        {/* === Calendar Invite (smaller, near top) === */}
        <div className="rounded-xl border border-neutral-200 bg-white p-4">
          <div className="flex items-center gap-2 mb-3">
            <span>📅</span>
            <h3 className="text-lg font-semibold">Calendar Invite</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3">
            <Input
              type="email"
              name="inviteEmail"
              placeholder="Email address"
              value={formData.inviteEmail}
              onChange={handleInputChange}
            />
            <Button type="button" variant="outline" disabled>
              Prepare Invite
            </Button>
          </div>
          <p className="text-xs text-neutral-500 mt-2">
            Compact by design — we’ll wire the actual send later.
          </p>
        </div>

        {/* === Description & Parts === */}
        <div className="grid grid-cols-1 gap-4">
          <div>
            <Label>Description</Label>
            <Textarea
              rows={4}
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Enter job description…"
              className="resize-y"
            />
          </div>
          <div>
            <Label>Parts Used</Label>
            <Textarea
              rows={3}
              name="partsUsed"
              value={formData.partsUsed ?? ''}
              onChange={handleInputChange}
              placeholder="Enter parts or materials used…"
              className="resize-y"
            />
          </div>
        </div>

        {/* === Bottom: Purchase Order + Photos === */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Purchase Order */}
          <div className="rounded-xl border-2 border-dashed border-neutral-300 p-5 bg-neutral-50/60">
            <h4 className="font-semibold mb-3">Purchase Order</h4>
            <label
              htmlFor="po-upload"
              className="block w-full text-center py-10 rounded-lg border border-neutral-300 border-dashed hover:bg-white transition cursor-pointer"
            >
              <div className="text-3xl mb-2">⤴️</div>
              <div className="font-medium">Drag and drop a PDF purchase order here</div>
              <div className="text-sm text-neutral-500">or click to browse</div>
              <input
                id="po-upload"
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={onPurchaseOrderChange}
              />
            </label>
            {formData.purchaseOrder && (
              <p className="text-sm mt-2">Selected: {formData.purchaseOrder.name}</p>
            )}
          </div>

          {/* Photos */}
          <div className="rounded-xl border-2 border-dashed border-neutral-300 p-5 bg-neutral-50/60">
            <h4 className="font-semibold mb-3">Photos</h4>
            <label
              htmlFor="photos-upload"
              className="block w-full text-center py-10 rounded-lg border border-neutral-300 border-dashed hover:bg-white transition cursor-pointer"
            >
              <div className="text-3xl mb-2">📷</div>
              <div className="font-medium">Drag and drop photos here</div>
              <div className="text-sm text-neutral-500">or click to select (you can choose multiple)</div>
              <input
                id="photos-upload"
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={onPhotosChange}
              />
            </label>
          </div>
        </div>

        {/* === Action Bar === */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2">
          <div>
            <Button
              type="button"
              variant="secondary"
              className="font-semibold bg-green-600 text-white hover:bg-green-700"
              onClick={handleCompleted}
            >
              Mark Complete
            </Button>
          </div>

          <div className="flex items-center gap-3">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving…' : job ? 'Save Job' : 'Create Job'}
            </Button>
          </div>
        </div>

        {/* Optional delete */}
        {onDelete && (
          <div className="pt-2">
            <Button type="button" variant="destructive" onClick={onDelete}>
              Delete
            </Button>
          </div>
        )}
      </form>
    </div>
  );
};

export default JobSheetForm;
