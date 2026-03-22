import { AxiosError } from 'axios';
import toast from 'react-hot-toast';
import { io, Socket } from 'socket.io-client';
import { create } from 'zustand';
import { axiosInstance } from '../lib/axios';
import {
  ApiErrorResponse,
  AuthState,
  IUser,
  LoginData,
  SignupData,
  UpdateProfileData,
} from '../types';

const BASE_URL = import.meta.env.MODE === 'development' ? 'http://localhost:3000' : '/';

export const useAuthStore = create<AuthState>((set, get) => ({
  authUser: null,
  isCheckingAuth: true,
  isSigningUp: false,
  isLoggingIn: false,
  socket: null,
  onlineUsers: [],

  checkAuth: async (): Promise<void> => {
    try {
      const res = await axiosInstance.get<IUser>('/auth/check');
      set({ authUser: res.data });
      get().connectSocket();
    } catch (error) {
      const axiosError = error as AxiosError<ApiErrorResponse>;
      if (axiosError.response?.status !== 401) {
        console.log('Error in authCheck:', axiosError.response?.data || error);
      }
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  signup: async (data: SignupData): Promise<void> => {
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post<IUser>('/auth/signup', data);
      set({ authUser: res.data });

      toast.success('Account created successfully!');
      get().connectSocket();
    } catch (error) {
      const axiosError = error as AxiosError<ApiErrorResponse>;
      toast.error(axiosError.response?.data?.message || 'Something went wrong');
    } finally {
      set({ isSigningUp: false });
    }
  },

  login: async (data: LoginData): Promise<void> => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post<IUser>('/auth/login', data);
      set({ authUser: res.data });

      toast.success('Logged in successfully');

      get().connectSocket();
    } catch (error) {
      const axiosError = error as AxiosError<ApiErrorResponse>;
      toast.error(axiosError.response?.data?.message || 'Something went wrong');
    } finally {
      set({ isLoggingIn: false });
    }
  },

  logout: async (): Promise<void> => {
    try {
      await axiosInstance.post('/auth/logout');
      set({ authUser: null });
      toast.success('Logged out successfully');
      get().disconnectSocket();
    } catch (error) {
      toast.error('Error logging out');
      console.log('Logout error:', error);
    }
  },

  updateProfile: async (data: UpdateProfileData): Promise<void> => {
    try {
      const res = await axiosInstance.put<IUser>('/auth/update-profile', data);
      set({ authUser: res.data });
      toast.success('Profile updated successfully');
    } catch (error) {
      console.log('Error in update profile:', error);
      const axiosError = error as AxiosError<ApiErrorResponse>;
      toast.error(axiosError.response?.data?.message || 'Something went wrong');
    }
  },

  connectSocket: (): void => {
    const { authUser } = get();
    if (!authUser || get().socket?.connected) return;

    const socket: Socket = io(BASE_URL, {
      withCredentials: true, // this ensures cookies are sent with the connection
    });

    socket.connect();

    set({ socket });

    // listen for online users event
    socket.on('getOnlineUsers', (userIds: string[]) => {
      set({ onlineUsers: userIds });
    });
  },

  disconnectSocket: (): void => {
    if (get().socket?.connected) get().socket?.disconnect();
  },
}));
