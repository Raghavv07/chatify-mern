import { Socket } from 'socket.io-client';

// User Interface (matching backend IUser but for frontend use)
export interface IUser {
  _id: string;
  email: string;
  fullName: string;
  profilePic: string;
  createdAt: string;
  updatedAt: string;
}

// Message Interface (matching backend IMessage but for frontend use)
export interface IMessage {
  _id: string;
  senderId: string;
  receiverId: string;
  text?: string;
  image?: string;
  createdAt: string;
  updatedAt: string;
  isOptimistic?: boolean;
}

// Auth Store State
export interface AuthState {
  authUser: IUser | null;
  isCheckingAuth: boolean;
  isSigningUp: boolean;
  isLoggingIn: boolean;
  socket: Socket | null;
  onlineUsers: string[];
  checkAuth: () => Promise<void>;
  signup: (data: SignupData) => Promise<void>;
  login: (data: LoginData) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: UpdateProfileData) => Promise<void>;
  connectSocket: () => void;
  disconnectSocket: () => void;
}

// Chat Store State
export type ActiveTab = 'chats' | 'contacts';

export interface ChatState {
  allContacts: IUser[];
  chats: IUser[];
  messages: IMessage[];
  activeTab: ActiveTab;
  selectedUser: IUser | null;
  isUsersLoading: boolean;
  isMessagesLoading: boolean;
  isSoundEnabled: boolean;
  toggleSound: () => void;
  setActiveTab: (tab: ActiveTab) => void;
  setSelectedUser: (user: IUser | null) => void;
  getAllContacts: () => Promise<void>;
  getMyChatPartners: () => Promise<void>;
  getMessagesByUserId: (userId: string) => Promise<void>;
  sendMessage: (messageData: SendMessageData) => Promise<void>;
  subscribeToMessages: () => void;
  unsubscribeFromMessages: () => void;
}

// Request/Response Types
export interface SignupData {
  fullName: string;
  email: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface UpdateProfileData {
  profilePic?: string;
}

export interface SendMessageData {
  text?: string;
  image?: string | null;
}

// API Response Types
export interface ApiErrorResponse {
  message: string;
}

// Keyboard Sound Hook Return Type
export interface UseKeyboardSoundReturn {
  playRandomKeyStrokeSound: () => void;
}

// Component Props Types
export interface BorderAnimatedContainerProps {
  children: React.ReactNode;
}

export interface NoChatHistoryPlaceholderProps {
  name: string;
}
