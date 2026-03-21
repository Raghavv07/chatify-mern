import { AxiosError } from 'axios';
import toast from 'react-hot-toast';
import { create } from 'zustand';
import { axiosInstance } from '../lib/axios';
import { ActiveTab, ApiErrorResponse, ChatState, IMessage, IUser, SendMessageData } from '../types';
import { useAuthStore } from './useAuthStore';

export const useChatStore = create<ChatState>((set, get) => ({
  allContacts: [],
  chats: [],
  messages: [],
  activeTab: 'chats',
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,
  isSoundEnabled: JSON.parse(localStorage.getItem('isSoundEnabled') || 'false') === true,

  toggleSound: (): void => {
    localStorage.setItem('isSoundEnabled', JSON.stringify(!get().isSoundEnabled));
    set({ isSoundEnabled: !get().isSoundEnabled });
  },

  setActiveTab: (tab: ActiveTab): void => set({ activeTab: tab }),
  setSelectedUser: (selectedUser: IUser | null): void => set({ selectedUser }),

  getAllContacts: async (): Promise<void> => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get<IUser[]>('/messages/contacts');
      set({ allContacts: res.data });
    } catch (error) {
      const axiosError = error as AxiosError<ApiErrorResponse>;
      toast.error(axiosError.response?.data?.message || 'Something went wrong');
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMyChatPartners: async (): Promise<void> => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get<IUser[]>('/messages/chats');
      set({ chats: res.data });
    } catch (error) {
      const axiosError = error as AxiosError<ApiErrorResponse>;
      toast.error(axiosError.response?.data?.message || 'Something went wrong');
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessagesByUserId: async (userId: string): Promise<void> => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get<IMessage[]>(`/messages/${userId}`);
      set({ messages: res.data });
    } catch (error) {
      const axiosError = error as AxiosError<ApiErrorResponse>;
      toast.error(axiosError.response?.data?.message || 'Something went wrong');
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  sendMessage: async (messageData: SendMessageData): Promise<void> => {
    const { selectedUser, messages } = get();
    const { authUser } = useAuthStore.getState();

    if (!selectedUser || !authUser) return;

    const tempId = `temp-${Date.now()}`;

    const optimisticMessage: IMessage = {
      _id: tempId,
      senderId: authUser._id,
      receiverId: selectedUser._id,
      text: messageData.text,
      image: messageData.image || undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isOptimistic: true, // flag to identify optimistic messages (optional)
    };
    // immediately update the ui by adding the message
    set({ messages: [...messages, optimisticMessage] });

    try {
      const res = await axiosInstance.post<IMessage>(
        `/messages/send/${selectedUser._id}`,
        messageData
      );
      set({ messages: messages.concat(res.data) });
    } catch (error) {
      // remove optimistic message on failure
      set({ messages: messages });
      const axiosError = error as AxiosError<ApiErrorResponse>;
      toast.error(axiosError.response?.data?.message || 'Something went wrong');
    }
  },

  subscribeToMessages: (): void => {
    const { selectedUser, isSoundEnabled } = get();
    if (!selectedUser) return;

    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    socket.on('newMessage', (newMessage: IMessage) => {
      const isMessageSentFromSelectedUser = newMessage.senderId === selectedUser._id;
      if (!isMessageSentFromSelectedUser) return;

      const currentMessages = get().messages;
      set({ messages: [...currentMessages, newMessage] });

      if (isSoundEnabled) {
        const notificationSound = new Audio('/sounds/notification.mp3');

        notificationSound.currentTime = 0; // reset to start
        notificationSound.play().catch((e) => console.log('Audio play failed:', e));
      }
    });
  },

  unsubscribeFromMessages: (): void => {
    const socket = useAuthStore.getState().socket;
    if (socket) {
      socket.off('newMessage');
    }
  },
}));
