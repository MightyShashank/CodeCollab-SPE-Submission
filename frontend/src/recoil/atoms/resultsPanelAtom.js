// this atom is to show vertical in the console pane

// state/resultsPanelAtom.js
import { atom } from "recoil";

export const showResultsPanelState = atom({
  key: "showResultsPanelState", // unique ID for this atom
  default: false,               // initial value
});

// const [isSubmitting, setIsSubmitting] = useState(false); //
// const [showResultsPanel, setShowResultsPanel] = useRecoilState(showResultsPanelState);
// const [submissionResults, setSubmissionResults] = useState([]); //
// const [finalVerdict, setFinalVerdict] = useState(null); //

export const isSubmittingState = atom({
    key: "isSubmittingState",
    default: false
});

export const submissionResultsState = atom({
    key: "submissionResultsState",
    default: []
});

export const finalVerdictState = atom({
    key: "finalVerdictState",
    default: null
});

