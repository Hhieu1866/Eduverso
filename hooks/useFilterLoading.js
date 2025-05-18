import { create } from "zustand";

// Custom hook để quản lý trạng thái loading khi filter
const useFilterLoading = create((set) => ({
  isLoading: false,
  setLoading: (loading) => set({ isLoading: loading }),
}));

export default useFilterLoading;
