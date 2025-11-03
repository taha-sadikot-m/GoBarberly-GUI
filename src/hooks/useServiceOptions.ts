import { useMemo } from 'react';
import { useBarbershopServices } from './useBarbershopServices';

/**
 * Custom hook that provides services formatted for form inputs
 * Replaces static service arrays with dynamic database services
 */
export const useServiceOptions = () => {
  const { services, loading, error, fetchServices } = useBarbershopServices();

  // Log for debugging
  console.log('🔧 useServiceOptions Debug:', {
    servicesCount: services.length,
    loading,
    error,
    services: services.map(s => ({ id: s.id, name: s.name, price: s.price, active: s.is_active }))
  });

  // Filter only active services and format for select options
  const serviceOptions = useMemo(() => {
    // If there's an error (likely authentication), provide fallback services
    if (error && services.length === 0) {
      console.warn('⚠️ Services API error, using fallback services:', error);
      return [
        { value: '', label: 'Select Service' },
        { value: 'Haircut', label: 'Haircut - ₹300', price: 300 },
        { value: 'Beard Trim', label: 'Beard Trim - ₹200', price: 200 },
        { value: 'Hair + Beard', label: 'Hair + Beard - ₹450', price: 450 },
        { value: 'Shave', label: 'Shave - ₹250', price: 250 },
        { value: 'Hair Color', label: 'Hair Color - ₹500', price: 500 },
      ];
    }

    const activeServices = services.filter(service => service.is_active);
    
    return [
      { value: '', label: 'Select Service' },
      ...activeServices.map(service => {
        const price = typeof service.price === 'string' ? parseFloat(service.price) : service.price;
        const formattedPrice = service.formatted_price || `₹${price}`;
        
        return {
          value: service.name,
          label: `${service.name} - ${formattedPrice}`,
          'data-price': price.toString(),
          price: price // Additional field for easy access
        };
      })
    ];
  }, [services, error]);

  // Get price for a service by name
  const getServicePrice = (serviceName: string): number => {
    // Try database services first
    const service = services.find(s => s.name === serviceName && s.is_active);
    if (service) {
      return typeof service.price === 'string' ? parseFloat(service.price) : service.price;
    }
    
    // Fallback to static prices if no database service found
    const fallbackPrices: Record<string, number> = {
      'Haircut': 300,
      'Beard Trim': 200,
      'Hair + Beard': 450,
      'Shave': 250,
      'Hair Color': 500,
    };
    
    return fallbackPrices[serviceName] || 0;
  };

  // Get service details by name
  const getServiceDetails = (serviceName: string) => {
    return services.find(s => s.name === serviceName && s.is_active);
  };

  return {
    serviceOptions,
    services: services.filter(s => s.is_active), // Only active services
    loading,
    error,
    fetchServices,
    getServicePrice,
    getServiceDetails
  };
};