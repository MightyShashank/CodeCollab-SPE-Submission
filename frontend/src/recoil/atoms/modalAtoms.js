import { atom } from 'recoil';

export const activeModalState = atom({
  key: 'activeModalState',
  default: null, // Can be 'login', 'signup', or null
});