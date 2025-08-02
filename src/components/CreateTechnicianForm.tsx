import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';

interface CreateTechnicianFormProps {
  onSuccess?: () => void;
}

export function CreateTechnicianForm({ onSuccess }: CreateTechnicianFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'tech'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const { toast } = useToast();

  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData({ ...formData, password });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setResult(null);

    try {
      // Get current user's JWT token
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Not authenticated');
      }

      console.log('Calling create-technician edge function with:', {
        email: formData.email,
        name: formData.name,
        role: formData.role
      });

      // Call the edge function with secret
      const { data, error } = await supabase.functions.invoke('create-technician', {
        body: {
          email: formData.email,
          password: formData.password,
          full_name: formData.name,
          role: formData.role,
          secret: 'JosieBeePopulin2023!'
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      if (error) {
        console.error('Edge function error:', error);
        throw new Error(error.message || 'Failed to create technician');
      }

      if (data?.error) {
        if (data.error === 'Email already exists') {
          setResult({ success: false, message: 'A user with this email already exists' });
        } else {
          setResult({ success: false, message: data.error });
        }
        return;
      }

      if (data?.success) {
        setResult({ 
          success: true, 
          message: `Technician ${formData.name} created successfully!` 
        });
        setFormData({ name: '', email: '', password: '', role: 'tech' });
        onSuccess?.();
      } else {
        throw new Error('Unexpected response from server');
      }
    } catch (error: any) {
      console.error('Error creating technician:', error);
      setResult({ 
        success: false, 
        message: error.message || 'Failed to create technician' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Create New Technician</CardTitle>
      </CardHeader>
      <CardContent>
        {result && (
          <Alert className={`mb-4 ${result.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
            {result.success ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-600" />
            )}
            <AlertDescription className={result.success ? 'text-green-800' : 'text-red-800'}>
              {result.message}
            </AlertDescription>
          </Alert>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              placeholder="Enter technician name"
            />
          </div>
          
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              placeholder="Enter email address"
            />
          </div>
          
          <div>
            <Label htmlFor="password">Password</Label>
            <div className="flex space-x-2">
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                placeholder="Enter password"
              />
              <Button type="button" variant="outline" onClick={generatePassword}>
                Generate
              </Button>
            </div>
          </div>
          
          <div>
            <Label htmlFor="role">Role</Label>
            <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Administrator</SelectItem>
                <SelectItem value="senior_tech">Senior Technician</SelectItem>
                <SelectItem value="tech">Technician</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? 'Creating...' : 'Create Technician'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
