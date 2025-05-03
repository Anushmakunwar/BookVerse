import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userService, CreateUserInput, UpdateUserInput } from '@/lib/api/services/user.service';
import { toast } from 'react-hot-toast';

/**
 * User query keys
 */
export const userKeys = {
  all: ['users'] as const,
  details: (id: string) => [...userKeys.all, id] as const,
};

/**
 * Hook to get all users (admin only)
 */
export const useAllUsers = () => {
  return useQuery({
    queryKey: userKeys.all,
    queryFn: () => userService.getAllUsers(),
  });
};

/**
 * Hook to get user by ID (admin only)
 */
export const useUserById = (id: string) => {
  return useQuery({
    queryKey: userKeys.details(id),
    queryFn: () => userService.getUserById(id),
    enabled: !!id,
  });
};

/**
 * Hook to create a user (admin only)
 */
export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (user: CreateUserInput) => userService.createUser(user),
    onSuccess: (data) => {
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: userKeys.all });
        toast.success('User created successfully');
      } else {
        toast.error(data.message || 'Failed to create user');
      }
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create user');
    },
  });
};

/**
 * Hook to update a user (admin only)
 */
export const useUpdateUser = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (user: UpdateUserInput) => userService.updateUser(id, user),
    onSuccess: (data) => {
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: userKeys.details(id) });
        queryClient.invalidateQueries({ queryKey: userKeys.all });
        toast.success('User updated successfully');
      } else {
        toast.error(data.message || 'Failed to update user');
      }
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update user');
    },
  });
};

/**
 * Hook to delete a user (admin only)
 */
export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => userService.deleteUser(id),
    onSuccess: (data) => {
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: userKeys.all });
        toast.success('User deleted successfully');
      } else {
        toast.error(data.message || 'Failed to delete user');
      }
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete user');
    },
  });
};
