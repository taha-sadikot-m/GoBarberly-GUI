import { useState, useEffect, useCallback } from 'react';
import { staffService, type Staff } from '../services/barbershopApi';

export const useBarbershopStaff = () => {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);

  const fetchStaff = useCallback(async (params?: {
    status?: string;
    role?: string;
    page?: number;
  }) => {
    try {
      setLoading(true);
      setError(null);
      const data = await staffService.getAll(params);
      console.log('DEBUG: Raw API response data:', data);
      console.log('DEBUG: Staff results:', data.results);
      // Log each staff member's data
      data.results.forEach((staff, index) => {
        console.log(`DEBUG: Staff ${index}:`, {
          id: staff.id,
          name: staff.name,
          email: staff.email,
          salary: staff.salary,
          join_date: staff.join_date
        });
      });
      setStaff(data.results);
      setTotalCount(data.count);
    } catch (err) {
      console.error('Error fetching staff:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch staff');
    } finally {
      setLoading(false);
    }
  }, []);

  const createStaff = useCallback(async (staffData: Omit<Staff, 'id'>) => {
    try {
      const newStaff = await staffService.create(staffData);
      setStaff(prev => [newStaff, ...prev]);
      setTotalCount(prev => prev + 1);
      return newStaff;
    } catch (err) {
      console.error('Error creating staff:', err);
      throw err;
    }
  }, []);

  const updateStaff = useCallback(async (id: number, updates: Partial<Staff>) => {
    try {
      const updatedStaff = await staffService.update(id, updates);
      setStaff(prev => 
        prev.map(member => member.id === id ? updatedStaff : member)
      );
      return updatedStaff;
    } catch (err) {
      console.error('Error updating staff:', err);
      throw err;
    }
  }, []);

  const deleteStaff = useCallback(async (id: number) => {
    try {
      await staffService.delete(id);
      setStaff(prev => prev.filter(member => member.id !== id));
      setTotalCount(prev => prev - 1);
    } catch (err) {
      console.error('Error deleting staff:', err);
      throw err;
    }
  }, []);

  const getActiveBarbers = useCallback(async () => {
    try {
      return await staffService.getActiveBarbers();
    } catch (err) {
      console.error('Error fetching active barbers:', err);
      throw err;
    }
  }, []);

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  // Get active staff count
  const getActiveStaffCount = useCallback(() => {
    return staff.filter(member => member.status === 'Active').length;
  }, [staff]);

  // Get staff by role
  const getStaffByRole = useCallback((role: string) => {
    return staff.filter(member => member.role === role);
  }, [staff]);

  // Get staff by status
  const getStaffByStatus = useCallback((status: 'Active' | 'Inactive') => {
    return staff.filter(member => member.status === status);
  }, [staff]);

  return {
    staff,
    loading,
    error,
    totalCount,
    fetchStaff,
    createStaff,
    updateStaff,
    deleteStaff,
    getActiveBarbers,
    // Computed values
    getActiveStaffCount,
    getStaffByRole,
    getStaffByStatus,
  };
};