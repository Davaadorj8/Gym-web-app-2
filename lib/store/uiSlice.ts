import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface UiState {
  sidebarOpen: boolean;
  activeFilterPreset: 'all' | 'active' | 'unpaid' | 'expired' | 'in-gym';
  searchQuery: string;
  activeModal: string | null;
}

const initialState: UiState = {
  sidebarOpen: false,
  activeFilterPreset: 'all',
  searchQuery: '',
  activeModal: null,
};

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload;
    },
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setActiveFilterPreset: (
      state,
      action: PayloadAction<'all' | 'active' | 'unpaid' | 'expired' | 'in-gym'>
    ) => {
      state.activeFilterPreset = action.payload;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    setActiveModal: (state, action: PayloadAction<string | null>) => {
      state.activeModal = action.payload;
    },
  },
});

export const {
  setSidebarOpen,
  toggleSidebar,
  setActiveFilterPreset,
  setSearchQuery,
  setActiveModal,
} = uiSlice.actions;

export default uiSlice.reducer;
