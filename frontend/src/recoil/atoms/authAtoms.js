import { atom } from 'recoil';

// This atom will hold the currently authenticated user's data.
// It defaults to null, meaning no user is logged in.
export const userState = atom({
  key: 'userState',
  default: null,
});

// This atom will track the status of any authentication process (like signup or login).
// This is useful for showing loading spinners or disabling buttons.
export const authProcessState = atom({
  key: 'authProcessState',
  default: {
    isLoading: false,
    error: null,
  },
});
