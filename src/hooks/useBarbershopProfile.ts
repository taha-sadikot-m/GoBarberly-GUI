import { useState, useEffect, useCallback } from 'react';
import { barbershopProfileService } from '../services/barbershopApi';

interface BarbershopProfile {
  id: number;
  shop_name: string;
  shop_owner_name: string;
  shop_logo?: string;
  address?: string;
  phone_number?: string;
  email: string;
}

export const useBarbershopProfile = (enabled: boolean = true) => {
  const [profile, setProfile] = useState<BarbershopProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    if (!enabled) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await barbershopProfileService.getProfile();
      setProfile(data);
    } catch (err: any) {
      // Handle 404 or other API errors gracefully - don't log as error since endpoint might not exist yet
      if (err?.response?.status === 404) {
        console.log('Barbershop profile endpoint not available (404) - using auth data only');
      } else {
        console.warn('Error fetching barbershop profile:', err);
      }
      setError(err instanceof Error ? err.message : 'Failed to fetch barbershop profile');
      setProfile(null); // Set to null so we fall back to auth data
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  const updateProfile = useCallback(async (data: {
    shop_name?: string;
    shop_owner_name?: string;
    shop_logo?: File | string;
    address?: string;
    phone_number?: string;
  }) => {
    try {
      const updatedProfile = await barbershopProfileService.updateProfile(data);
      setProfile(updatedProfile);
      return updatedProfile;
    } catch (err) {
      console.error('Error updating barbershop profile:', err);
      throw err;
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return {
    profile,
    loading,
    error,
    fetchProfile,
    updateProfile,
  };
};