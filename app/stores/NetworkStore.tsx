// src/stores/networkStore.ts
import { create } from 'zustand';
import NetInfo from '@react-native-community/netinfo';

interface NetworkState {
  isOnline: boolean;
  setIsOnline: (status: boolean) => void;
}

export const useNetworkStore = create<NetworkState>((set) => ({
  isOnline: true,
  setIsOnline: (status) => set({ isOnline: status }),
}));

// Initialize network monitoring
NetInfo.addEventListener(state => {
  useNetworkStore.getState().setIsOnline(!!state.isConnected);
});