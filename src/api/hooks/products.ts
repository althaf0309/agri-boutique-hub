import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../axios';
import { Product, Category } from '@/types';

interface ProductsResponse {
  results: Product[];
  count: number;
  next: string | null;
  previous: string | null;
}

interface ProductsParams {
  page?: number;
  search?: string;
  category?: string;
  in_stock?: boolean;
  featured?: boolean;
  new_arrival?: boolean;
  ordering?: string;
}

export const useProducts = (params: ProductsParams = {}) => {
  return useQuery({
    queryKey: ['products', params],
    queryFn: async (): Promise<ProductsResponse> => {
      try {
        const { data } = await api.get('/products/', { params });
        return data;
      } catch (error) {
        // Return mock data for development
        return {
          results: [],
          count: 0,
          next: null,
          previous: null,
        };
      }
    },
  });
};

export const useProduct = (id: number) => {
  return useQuery({
    queryKey: ['products', id],
    queryFn: async (): Promise<Product> => {
      const { data } = await api.get(`/products/${id}/`);
      return data;
    },
    enabled: !!id,
  });
};

export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async (): Promise<Category[]> => {
      try {
        const { data } = await api.get('/categories/');
        return data.results || data;
      } catch (error) {
        // Return mock data for development
        return [
          { id: 1, name: 'Electronics', slug: 'electronics', parent: null },
          { id: 2, name: 'Clothing', slug: 'clothing', parent: null },
          { id: 3, name: 'Home & Garden', slug: 'home-garden', parent: null },
        ];
      }
    },
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (productData: Partial<Product>) => {
      const { data } = await api.post('/products/', productData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...productData }: Partial<Product> & { id: number }) => {
      const { data } = await api.patch(`/products/${id}/`, productData);
      return data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['products', data.id], data);
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/products/${id}/`);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};