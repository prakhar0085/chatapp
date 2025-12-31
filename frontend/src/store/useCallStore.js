import { create } from "zustand";

export const useCallStore = create((set) => ({
  isCallIncoming: false,
  isCallActive: false,
  caller: null,
  callSignal: null,
  
  setCallIncoming: (caller, signal) => set({ isCallIncoming: true, caller, callSignal: signal }),
  setCallActive: (active) => set({ isCallActive: active, isCallIncoming: false }),
  endCall: () => set({ isCallActive: false, isCallIncoming: false, caller: null, callSignal: null }),
}));
