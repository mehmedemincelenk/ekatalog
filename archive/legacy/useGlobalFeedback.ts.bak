import { create } from 'zustand';

type FeedbackType = 'success' | 'error' | 'idle';

interface FeedbackState {
  status: FeedbackType;
  message?: string;
  showFeedback: (type: FeedbackType, message?: string, duration?: number) => void;
  hideFeedback: () => void;
}

export const useGlobalFeedback = create<FeedbackState>((set) => ({
  status: 'idle',
  message: '',
  showFeedback: (type, message = '', duration = 1500) => {
    set({ status: type, message });
    setTimeout(() => {
      set({ status: 'idle', message: '' });
    }, duration);
  },
  hideFeedback: () => set({ status: 'idle', message: '' }),
}));
