import { useQuery } from '@tanstack/react-query';
import api from '../axios';
import { KpiData, Product, Review, ContactSubmission } from '@/types';

export const useDashboardKpis = () => {
  return useQuery({
    queryKey: ['dashboard', 'kpis'],
    queryFn: async (): Promise<KpiData> => {
      const { data } = await api.get('/dashboard/kpis/');
      return data;
    },
  });
};

export const useTopProducts = () => {
  return useQuery({
    queryKey: ['dashboard', 'top-products'],
    queryFn: async (): Promise<Product[]> => {
      const { data } = await api.get('/products/?ordering=-sold_count&limit=10');
      return data.results;
    },
  });
};

export const useRecentReviews = () => {
  return useQuery({
    queryKey: ['dashboard', 'recent-reviews'],
    queryFn: async (): Promise<Review[]> => {
      const { data } = await api.get('/product-reviews/?is_approved=true&ordering=-created_at&limit=5');
      return data.results;
    },
  });
};

export const useRecentContacts = () => {
  return useQuery({
    queryKey: ['dashboard', 'recent-contacts'],
    queryFn: async (): Promise<ContactSubmission[]> => {
      const { data } = await api.get('/contact-submissions/?ordering=-created_at&limit=10');
      return data.results;
    },
  });
};