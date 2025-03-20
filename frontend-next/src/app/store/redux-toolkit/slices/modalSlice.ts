import { createSlice } from "@reduxjs/toolkit";
import { RootState } from "../store"; // ✅ Ensure correct store path

// ✅ Define the state type
interface ModalState {
  isOpen: boolean;
}

// ✅ Initial State
const initialState: ModalState = {
  isOpen: false, // ✅ Modal starts closed
};

// ✅ Modal Slice
const modalSlice = createSlice({
  name: "modal",
  initialState,
  reducers: {
    openModal: (state) => {
      state.isOpen = true;
    },
    closeModal: (state) => {
      state.isOpen = false;
    },
    toggleModal: (state) => {
      state.isOpen = !state.isOpen;
    },
  },
});

// ✅ Export Actions
export const { openModal, closeModal, toggleModal } = modalSlice.actions;

// ✅ Selector (to get modal state in components)
export const selectIsModalOpen = (state: RootState) => state.modal.isOpen;

// ✅ Reducer
export default modalSlice.reducer;
