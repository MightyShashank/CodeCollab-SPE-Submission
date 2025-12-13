import { atom } from 'recoil';

// This atom will store the string key of the currently selected
// sidebar navigation item, e.g., 'home', 'problems', 'groups'.
export const sidebarNavState = atom({
  key: 'sidebarNavState',
  default: 'home', // Set 'home' as the default selected option
});
