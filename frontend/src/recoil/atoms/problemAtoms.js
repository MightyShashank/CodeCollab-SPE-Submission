import { atom } from 'recoil';

// This atom will hold the parsed markdown string from the URL.
// It can be accessed by any component in application
export const parsedProblemState = atom({
  key: 'parsedProblemState',
  default: null, // Default to an null obj
});