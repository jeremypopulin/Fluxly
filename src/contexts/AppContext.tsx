import React, { createContext, useContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { toast } from '@/components/ui/use-toast';
import { Job, Technician, Customer } from '@/types';
import { supabase } from '@/lib/supabase';
import { useAuth } from './AuthContext';

interface AppContextType {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  jobs: Job[];
  technicians: Technician[];
  customers: Customer[];
  addJob: (job: Job) => void;
  updateJob: (job: Job) => void;
  deleteJob: (jobId: string) => void;
  loadJobs: () => void;
  addCustomer: (customer: Omit<Customer, 'id'>) => void;
  updateCustomer: (id: string, customer: Omit<Customer, 'id'>) => void;
  importCustomers: (customers: Omit<Customer, 'id'>[]) => void;
  addTechnician: (tech: Omit<Technician, 'id'>) => Promise<void>;
  updateTechnician: (id: string, tech: Omit<Technician, 'id'>) => Promise<void>;
  deleteTechnician: (id: string) => void;
  generateJobNumber: () => string;
  loadTechnicians: () => void;
}

const AppContext = createContext<AppContextType>({} as AppContextType);
export const useAppContext = () => useContext(AppContext);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const { isAuthenticated } = useAuth();

  const toggleSidebar = () => setSidebarOpen(prev => !prev);
  const generateJobNumber = () => `JOB-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`;

  const loadTechnicians = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        setTechnicians(data.map((p: any) => ({
          id: p.id,
          name: p.name || 'Unknown',
          email: p.email || '',
          role: p.role || 'technician',
          status: p.status || 'active'
        })));
      }
    } catch (error) {
      console.error('Error loading technicians:', error);
    }
  };

  const loadCustomers = async () => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('name');

      if (error) throw error;

      if (data) {
        setCustomers(data.map((c: any) => ({
          id: c.id,
          name: c.name || 'Unknown',
          email: c.email || '',
          phone: c.phone || '',
          company: c.company || '',
          address: c.address || ''
        })));
      }
    } catch (error) {
      console.error('Error loading customers:', error);
    }
  };

  const loadJobs = async () => {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        setJobs(data.map((j: any) => ({
          id: j.id,
          jobNumber: j.job_number || generateJobNumber(),
          title: j.title,
          description: j.description,
          customerId: j.customer_id || '',
          technicianIds: j.technician_ids || [],
          startTime: new Date(j.start_time),
          endTime: new Date(j.end_time),
          status: j.status,
          priority: j.priority,
          location: j.location || '',
          quoteNumber: j.quote_number || ''
        })));
      }
    } catch (error) {
      console.error('Error loading jobs:', error);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadJobs();
      loadTechnicians();
      loadCustomers();
    }
  }, [isAuthenticated]);

  const addJob = async (job: Job) => {
    const jobId = job.id || uuidv4();
    const jobWithId = { ...job, id: jobId };
    setJobs(prev => [...prev, jobWithId]);
    toast({ title: 'Job Added', description: 'Job has been saved successfully' });
  };

  const updateJob = async (job: Job) => {
    setJobs(prev => prev.map(j => j.id === job.id ? job : j));
    toast({ title: 'Job Updated', description: 'Job has been updated successfully' });
  };

  const deleteJob = async (jobId: string) => {
    setJobs(prev => prev.filter(j => j.id !== jobId));
    toast({ title: 'Job Deleted', description: 'Job has been deleted successfully' });
  };

  const addCustomer = async (customerData: Omit<Customer, 'id'>) => {
    try {
      const { data, error } = await supabase.from('customers').insert({
        name: customerData.name,
        email: customerData.email,
        phone: customerData.phone,
        company: customerData.company,
        address: customerData.address
      }).select().single();

      if (error) throw error;

      const customer: Customer = {
        id: data.id,
        name: data.name,
        email: data.email,
        phone: data.phone || '',
        company: data.company || '',
        address: data.address || ''
      };
      setCustomers(prev => [...prev, customer]);

      toast({ title: 'Customer Added', description: `${customerData.name} has been added successfully` });
    } catch (error) {
      console.error('Error adding customer:', error);
      toast({ title: 'Error', description: 'Failed to add customer', variant: 'destructive' });
    }
  };

  const updateCustomer = async (id: string, customerData: Omit<Customer, 'id'>) => {
    try {
      const { error } = await supabase.from('customers').update({
        name: customerData.name,
        email: customerData.email,
        phone: customerData.phone,
        company: customerData.company,
        address: customerData.address
      }).eq('id', id);

      if (error) throw error;

      setCustomers(prev => prev.map(c => c.id === id ? { ...customerData, id } : c));
      toast({ title: 'Customer Updated', description: `${customerData.name} has been updated successfully` });
    } catch (error) {
      console.error('Error updating customer:', error);
      toast({ title: 'Error', description: 'Failed to update customer', variant: 'destructive' });
    }
  };

  const importCustomers = async (customersData: Omit<Customer, 'id'>[]) => {
    try {
      const { data, error } = await supabase.from('customers').insert(
        customersData.map(c => ({
          name: c.name,
          email: c.email,
          phone: c.phone,
          company: c.company,
          address: c.address
        }))
      ).select();

      if (error) throw error;

      const newCustomers: Customer[] = data.map((c: any) => ({
        id: c.id,
        name: c.name,
        email: c.email,
        phone: c.phone || '',
        company: c.company || '',
        address: c.address || ''
      }));
      setCustomers(prev => [...prev, ...newCustomers]);

      toast({ title: 'Customers Imported', description: `${customersData.length} customers imported successfully` });
    } catch (error) {
      console.error('Error importing customers:', error);
      toast({ title: 'Error', description: 'Failed to import customers', variant: 'destructive' });
    }
  };

  const addTechnician = async (techData: Omit<Technician, 'id'>) => {
    const technician: Technician = { ...techData, id: uuidv4(), status: 'active' };
    setTechnicians(prev => [...prev, technician]);
    toast({ title: 'Technician Added', description: `${technician.name} has been added successfully` });
  };

  const updateTechnician = async (id: string, techData: Omit<Technician, 'id'>) => {
    setTechnicians(prev => prev.map(t => t.id === id ? { ...techData, id, status: t.status } : t));
    toast({ title: 'Technician Updated', description: `${techData.name} has been updated successfully` });
  };

  const deleteTechnician = async (id: string) => {
    setTechnicians(prev => prev.filter(t => t.id !== id));
    toast({ title: 'Technician Deleted', description: 'Technician has been removed successfully' });
  };

  return (
    <AppContext.Provider value={{
      sidebarOpen, toggleSidebar, jobs, technicians, customers,
      addJob, updateJob, deleteJob, loadJobs, addCustomer,
      updateCustomer, importCustomers, addTechnician, updateTechnician,
      deleteTechnician, generateJobNumber, loadTechnicians
    }}>
      {children}
    </AppContext.Provider>
  );
};
