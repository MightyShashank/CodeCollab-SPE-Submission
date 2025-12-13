import { atom } from 'recoil';

// ✅ This atom will hold the source code string from the Monaco Editor.
export const codeState = atom({
    key: 'codeState',
    default: '// Your code here...',
});

// ✅ This atom will hold the currently selected language object.
export const selectedLanguageState = atom({
    key: 'selectedLanguageState',
    default: { 
        id: 'java', 
        name: 'Java (OpenJDK 13.0.1)', 
        language_id: 62, 
        monacoId: 'java' 
    },
});

// This thing is for the problem 
export const selectedProblemState = atom({
    key: 'selectedProblemState',
    default: null,
});

