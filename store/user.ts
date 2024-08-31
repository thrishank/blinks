import { create } from 'zustand';

// Define the interface for your state
interface StoreState {
    accessToken: string;
    storeUrl: string;
    setAccessToken: (token: string) => void;
    setStoreUrl: (url: string) => void;
}

// Create the Zustand store with typed state
const useStore = create<StoreState>((set) => ({
    accessToken: '',
    storeUrl: '',
    setAccessToken: (token: string) => set((state) => ({ ...state, accessToken: token })),
    setStoreUrl: (url: string) => set((state) => ({ ...state, storeUrl: url })),
}));

export default useStore;
