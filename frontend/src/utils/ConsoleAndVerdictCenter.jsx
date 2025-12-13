import React from 'react'
import { useRecoilState } from 'recoil';
import { ResultsPanel } from './codeEditor';
import { showResultsPanelState, isSubmittingState, submissionResultsState, finalVerdictState } from '@/recoil/atoms/resultsPanelAtom';
import { codeState, selectedLanguageState, selectedProblemState } from '@/recoil/atoms/editorAtoms';

function ConsoleAndVerdictCenter() {

    const [isSubmitting, setIsSubmitting] = useRecoilState(isSubmittingState);; //
    const [showResultsPanel, setShowResultsPanel] = useRecoilState(showResultsPanelState);
    const [submissionResults, setSubmissionResults] = useRecoilState(submissionResultsState); //
    const [finalVerdict, setFinalVerdict] = useRecoilState(finalVerdictState); //
    const [selectedLanguage, setSelectedLanguage] = useRecoilState(selectedLanguageState);
    const [code, setCode] = useRecoilState(codeState);
    const [problem, setProblem] = useRecoilState(selectedProblemState);

    return (
    <div className="w-full h-full relative">
        {showResultsPanel ? (
            <ResultsPanel 
                isSubmitting={isSubmitting}
                results={submissionResults}
                finalVerdict={finalVerdict}
                onClose={() => {
                    setShowResultsPanel(false);
                    setIsSubmitting(false);
                    setSubmissionResults([]);
                    setFinalVerdict("");
                }}
                code={code}
                language={selectedLanguage}
                problem={problem}
            />
        ): (
            <div className="flex items-center justify-center w-full h-full text-lg font-semibold text-gray-600">
                Console and Verdict center
            </div>
        )}
    </div>
    )
}

export default ConsoleAndVerdictCenter;