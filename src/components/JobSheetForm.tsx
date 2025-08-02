import React from 'react';
import { Job, Technician, Customer } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Calendar, User, Mail, Upload, Save, X, Hash } from 'lucide-react';
import FileUpload from './FileUpload';
import PdfDropZone from './PdfDropZone';

interface JobSheetFormProps {
  formData: any;
  setFormData: (data: any) => void;
  technicians: Technician[];
  customers: Customer[];
  handleTechnicianToggle: (techId: string) => void;
  handleFilesChange: (files: File[]) => void;
  handleSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  onDelete?: () => void;
  isSubmitting: boolean;
  job?: Job;
}

const JobSheetForm: React.FC<JobSheetFormProps> = ({
  formData,
  setFormData,
  technicians,
  customers,
  handleTechnicianToggle,
  handleFilesChange,
  handleSubmit,
  onCancel,
  onDelete,
  isSubmitting,
  job
}) => {
  const handlePurchaseOrderChange = (file: File | null) => {
    setFormData({ ...formData, purchaseOrder: file });
  };

  return (
    <div className="fixed inset-0 bg-background z-50 overflow-hidden">
      {/* Completed Watermark */}
      {formData.status === 'completed' && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <div className="text-green-600 font-bold text-8xl opacity-10 transform rotate-12">
            COMPLETED
          </div>
        </div>
      )}
      
      <div className="h-full flex flex-col relative">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-background">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold flex items-center space-x-2">
              <Calendar className="w-6 h-6" />
              <span>{job ? 'Edit Job Sheet' : 'New Job Sheet'}</span>
            </h1>
            {job && (
              <div className="text-sm text-muted-foreground bg-muted px-2 py-1 rounded">
                Job ID: {job.id}
              </div>
            )}
          </div>
          <Button variant="outline" onClick={onCancel}>
            <X className="w-4 h-4 mr-2" />
            Close
          </Button>
        </div>

        {/* Scrollable Content */}
        <ScrollArea className="flex-1">
          <div className="max-w-4xl mx-auto p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Job Details */}
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <User className="w-5 h-5" />
                      <span>Job Details</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
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
                          value={formData.quoteNumber || ''}
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
                    
                    {/* Purchase Order Section */}
                    <PdfDropZone
                      onFileSelect={handlePurchaseOrderChange}
                      selectedFile={formData.purchaseOrder}
                    />
                  </CardContent>
                </Card>

                {/* Calendar Invite & Files */}
                <div className="space-y-6">
                  {/* Calendar Invite */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Mail className="w-5 h-5" />
                        <span>Calendar Invite</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="inviteEmail">Email Address</Label>
                        <Input
                          id="inviteEmail"
                          type="email"
                          value={formData.inviteEmail}
                          onChange={(e) => setFormData({...formData, inviteEmail: e.target.value})}
                          placeholder="Enter email address"
                        />
                      </div>
                      <div className="text-sm text-gray-600">
                        <p>Calendar invite will be sent when job is saved.</p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Files */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Upload className="w-5 h-5" />
                        <span>Attach Files</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <FileUpload
                        onFilesChange={handleFilesChange}
                        acceptedTypes={{
                          'application/msword': ['.doc'],
                          'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
                          'image/jpeg': ['.jpg', '.jpeg'],
                          'image/png': ['.png'],
                          'message/rfc822': ['.eml']
                        }}
                        maxSize={10 * 1024 * 1024}
                      />
                      <div className="text-sm text-gray-600 mt-2">
                        <p>Supported: Word docs, Images, Email files</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </form>
          </div>
        </ScrollArea>
        
        {/* Footer */}
        <div className="flex justify-between p-6 border-t bg-background">
          <div>
            {job && onDelete && (
              <Button type="button" variant="destructive" onClick={onDelete}>
                Delete Job
              </Button>
            )}
          </div>
          <div className="space-x-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} onClick={handleSubmit}>
              <Save className="w-4 h-4 mr-2" />
              {isSubmitting ? 'Saving...' : job ? 'Update Job' : 'Create Job'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobSheetForm;