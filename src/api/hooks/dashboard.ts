import { useQuery } from '@tanstack/react-query';
import api from '../axios';
import { KpiData, Product, Review, ContactSubmission } from '@/types';

export const useDashboardKpis = () => {
  return useQuery({
    queryKey: ['dashboard', 'kpis'],
    queryFn: async (): Promise<KpiData> => {
      try {
        const { data } = await api.get('/dashboard/kpis/');
        return data;
      } catch (error) {
        // Return mock data for development
        return {
          totalProducts: 150,
          inStock: 142,
          outOfStock: 8,
          totalSold: 1250,
          ordersToday: 12,
          revenueToday: "₹15,450",
          ordersThisMonth: 345,
          revenueThisMonth: "₹2,15,000",
          averageRating: "4.5",
          wishlistItems: 89,
        };
      }
    },
  });
};

export const useTopProducts = () => {
  return useQuery({
    queryKey: ['dashboard', 'top-products'],
    queryFn: async (): Promise<Product[]> => {
      try {
        const { data } = await api.get('/products/?ordering=-sold_count&limit=10');
        return data.results || [];
      } catch (error) {
        // Return mock data for development
        return [];
      }
    },
  });
};

export const useRecentReviews = () => {
  return useQuery({
    queryKey: ['dashboard', 'recent-reviews'],
    queryFn: async (): Promise<Review[]> => {
      try {
        const { data } = await api.get('/product-reviews/?is_approved=true&ordering=-created_at&limit=5');
        return data.results || [];
      } catch (error) {
        // Return mock data for development
        return [];
      }
    },
  });
};

export const useRecentContacts = () => {
  return useQuery({
    queryKey: ['dashboard', 'recent-contacts'],
    queryFn: async (): Promise<ContactSubmission[]> => {
      try {
        const { data } = await api.get('/contact-submissions/?ordering=-created_at&limit=10');
        return data.results || [];
      } catch (error) {
        // Return mock data for development
        return [];
      }
    },
  });
};