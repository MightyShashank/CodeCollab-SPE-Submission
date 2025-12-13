import React, { useState, useEffect, useRef } from 'react';
import { userState } from '@/recoil/atoms/authAtoms';
import { useRecoilValue } from 'recoil';
import { showResultsPanelState, isSubmittingState, submissionResultsState, finalVerdictState } from '@/recoil/atoms/resultsPanelAtom';
import { useRecoilState } from "recoil";
import { codeState, selectedLanguageState, selectedProblemState } from '@/recoil/atoms/editorAtoms';
// --- EDITED: Removed unused imports for Recoil and Socket.IO ---

// --- Monaco Editor Component ---
// This component is correctly structured and requires no changes.
const MonacoEditor = ({ language, value, onChange }) => {
    const editorRef = useRef(null);
    const containerRef = useRef(null);
    const valueRef = useRef(value);
    const onChangeRef = useRef(onChange);

    useEffect(() => {
        valueRef.current = value;
        onChangeRef.current = onChange;
    });

    useEffect(() => {
        const initializeEditor = () => {
            if (!containerRef.current) return;
            const editor = window.monaco.editor.create(containerRef.current, {
                value: valueRef.current,
                language: language,
                theme: 'vs-dark',
                automaticLayout: true,
                minimap: { enabled: false },
                scrollbar: {
                    verticalScrollbarSize: 10,
                    horizontalScrollbarSize: 10,
                },
                fontFamily: 'Consolas, "Courier New", monospace',
                fontSize: 14,
                lineHeight: 21,
                padding: { top: 16, bottom: 16 },
                roundedSelection: false,
                scrollBeyondLastLine: false,
                background: '#2b2d31',
            });
            editor.onDidChangeModelContent(() => {
                if (onChangeRef.current) {
                    onChangeRef.current(editor.getValue());
                }
            });
            editorRef.current = editor;
        };

        if (containerRef.current && !editorRef.current) {
            if (window.monaco) {
                initializeEditor();
            } else {
                const script = document.createElement('script');
                script.src = 'https://cdn.jsdelivr.net/npm/monaco-editor@0.44.0/min/vs/loader.js';
                script.onload = () => {
                    window.require.config({ paths: { 'vs': 'https://cdn.jsdelivr.net/npm/monaco-editor@0.44.0/min/vs' }});
                    window.require(['vs/editor/editor.main'], initializeEditor);
                };
                document.body.appendChild(script);
            }
        }

        return () => {
            if (editorRef.current) {
                editorRef.current.dispose();
                editorRef.current = null;
            }
        };
    }, []);

    useEffect(() => {
        if (editorRef.current && value !== editorRef.current.getValue()) {
            editorRef.current.setValue(value);
        }
    }, [value]);

    return <div ref={containerRef} className="w-full h-full overflow-hidden" />;
};

// Component to render the AI-powered code explanation.
const ExplanationPanel = ({ explanationData, isLoading, onClose }) => {
    const [isOpen, setIsOpen] = useState(true);

    const Section = ({ title, content }) => (
        <div className="mb-4">
            <h4 className="font-bold text-gray-300 text-md mb-2">{title}</h4>
            <div className="text-sm text-gray-400 whitespace-pre-wrap leading-relaxed">{content}</div>
        </div>
    );
    
    const ComplexityTag = ({ label, value }) => (
         <div className="mr-4">
            <p className="text-sm text-gray-500 font-semibold">{label}</p>
            <p className="font-mono text-base text-gray-300">{value}</p>
        </div>
    );

    return (
        <div className="bg-[#202225] rounded-lg border border-gray-700/50 mb-2 max-h-full overflow-y-auto">
            <div className="flex justify-between items-center p-3">
                <h3 className="font-semibold text-gray-300">Code Explanation</h3>
                <div className="flex items-center space-x-2">
                    <button onClick={() => setIsOpen(!isOpen)} className="text-gray-400 hover:text-white">
                        <svg className={`w-5 h-5 transition-transform duration-300 ${isOpen ? '' : '-rotate-180'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </button>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>
            </div>
            <div className={`grid transition-all duration-500 ease-in-out ${isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
                <div className="overflow-hidden">
                    <div className="p-4 border-t border-gray-700/50">
                        {isLoading ? (
                            <div className="flex justify-center items-center py-4">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-400"></div>
                            </div>
                        ) : explanationData ? (
                            <>
                                <Section title="Explanation" content={explanationData.explanation} />
                                <div className="flex items-center my-4">
                                    <ComplexityTag label="Time Complexity" value={explanationData.time_complexity} />
                                    <ComplexityTag label="Space Complexity" value={explanationData.space_complexity} />
                                </div>
                                <Section title="Optimization Suggestion" content={explanationData.optimization_suggestion} />
                            </>
                        ) : (
                             <p className="text-sm text-red-400">Could not load explanation.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

// Component to render the AI-powered debugging analysis.
const DebugPanel = ({ debugData, isLoading, onClose }) => {
    const [isOpen, setIsOpen] = useState(true);

    const Section = ({ title, content }) => (
        <div className="mb-4">
            <h4 className="font-bold text-gray-300 text-md mb-2">{title}</h4>
            <div className="text-sm text-gray-400 whitespace-pre-wrap leading-relaxed">{content}</div>
        </div>
    );

    return (
        <div className="bg-[#202225] rounded-lg border border-yellow-500/30 mb-2 max-h-full overflow-y-auto">
            <div className="flex justify-between items-center p-3">
                <h3 className="font-semibold text-yellow-300">Debugging Assistant</h3>
                <div className="flex items-center space-x-2">
                    <button onClick={() => setIsOpen(!isOpen)} className="text-gray-400 hover:text-white">
                        <svg className={`w-5 h-5 transition-transform duration-300 ${isOpen ? '' : '-rotate-180'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </button>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>
            </div>
            <div className={`grid transition-all duration-500 ease-in-out ${isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
                <div className="overflow-hidden">
                    <div className="p-4 border-t border-gray-700/50">
                        {isLoading ? (
                            <div className="flex justify-center items-center py-4">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-400"></div>
                            </div>
                        ) : debugData ? (
                            <>
                                <Section title="Error Analysis" content={debugData.error_analysis} />
                                <Section title="Fix Suggestion" content={debugData.fix_suggestion} />
                            </>
                        ) : (
                             <p className="text-sm text-red-400">Could not load debug analysis.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Submission Status Component ---
// This component displays the live results of the code submission.
// --- Detailed Submission Results Panel ---
export const ResultsPanel = ({ results, finalVerdict, isSubmitting, onClose, code, language, problem }) => {
    const [activeTab, setActiveTab] = useState('input');
    const [selectedCase, setSelectedCase] = useState(null);

    const [explanation, setExplanation] = useState(null);
    const [isExplanationLoading, setIsExplanationLoading] = useState(false);
    const [showExplanationPanel, setShowExplanationPanel] = useState(false);

     // State for the debugging feature
    const [debugInfo, setDebugInfo] = useState(null);
    const [isDebugging, setIsDebugging] = useState(false);
    const [showDebugPanel, setShowDebugPanel] = useState(false);
    const [debuggingCaseToken, setDebuggingCaseToken] = useState(null);

    useEffect(() => {
        // When results update, auto-select the first failed test case or the latest result.
        if (finalVerdict && results.length > 0) {
            const firstFailed = results.find(r => r.verdict !== 'Accepted');
            const newSelected = firstFailed || results[0];
            setSelectedCase(newSelected);
            // If the selected case has a compilation error, show that tab by default.
            if (newSelected?.judge0_response?.compile_output) {
                setActiveTab('compile_error');
            } else {
                setActiveTab('input');
            }
        } else if (results.length > 0 && !finalVerdict) {
            // While running, show the latest result as it comes in.
            const latestResult = results[results.length - 1];
            setSelectedCase(latestResult);
             if (latestResult?.judge0_response?.compile_output) {
                setActiveTab('compile_error');
            } else {
                setActiveTab('input');
            }
        }
    }, [finalVerdict, results]);

    // This useEffect hook resets the debug panel whenever a new test case is selected
    useEffect(() => {
        setShowDebugPanel(false);
        setDebugInfo(null);
    }, [selectedCase]);

    // Handler to fetch the explanation from the backend
    const handleGetExplanation = async () => {
        if (!code || !language?.name) {
            console.error("Code or language is not available to generate explanation.");
            setExplanation({ explanation: "Error: Missing code or language." });
            return;
        }
        setIsExplanationLoading(true);
        setShowExplanationPanel(true);
        setExplanation(null);

        try {
            const response = await fetch('https://mostly-postfemoral-xenia.ngrok-free.dev/explain', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    code: code,
                    language: language.name,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to get explanation.');
            }
            const data = await response.json();
            setExplanation(data);
        } catch (error) {
            console.error('Explanation fetch error:', error);
            setExplanation({ explanation: `Error: ${error.message}` });
        } finally {
            setIsExplanationLoading(false);
        }
    };

    // Handler to fetch the debug analysis for a failed test case
    const handleDebugTestCase = async (failedCase) => {
        console.log(`problem = ${JSON.stringify(problem)}`);
        console.log(`code = ${code}`);
        // console.log(`failedCase = ${JSON.stringify(failedCase)}`);
        if (!problem?.description_md || !code || !failedCase) {
            console.error("Missing data required for debugging.");
            return;
        }
        setIsDebugging(true);
        setShowDebugPanel(true);
        setDebugInfo(null);
        setDebuggingCaseToken(failedCase?.judge0_response?.token);

        try {
             const response = await fetch('https://mostly-postfemoral-xenia.ngrok-free.dev/debug', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    problem_markdown: problem.description_md,
                    user_code: code,
                    failed_test_case: {
                        input: failedCase.input,
                        user_output: failedCase.user_output,
                        expected_output: failedCase.expected_output,
                        compilation_error: failedCase?.judge0_response?.compile_output ? atob(failedCase?.judge0_response?.compile_output) : null
                    }
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to get debug analysis.');
            }
            const data = await response.json();
            setDebugInfo(data);

        } catch(error) {
            console.error('Debug fetch error:', error);
            setDebugInfo({ error_analysis: `Error: ${error.message}`, fix_suggestion: "Please try again." });
        } finally {
            setIsDebugging(false);
        }
    };

    const TabButton = ({ id, label }) => (
        <button
            onClick={() => setActiveTab(id)}
            disabled={!selectedCase}
            className={`px-3 py-1.5 text-sm font-semibold rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                activeTab === id ? 'bg-[#40444b] text-white' : 'text-gray-400 hover:text-white'
            }`}
        >
            {label}
        </button>
    );
    
    const TestCaseItem = ({ result, index }) => (
         <div className={`p-2 rounded-md flex flex-col transition-colors ${selectedCase?.judge0_response?.token === result?.judge0_response?.token ? 'bg-gray-600/50' : ''}`}>
            <button 
                onClick={() => {
                    setSelectedCase(result);
                    if (result.judge0_response?.compile_output) {
                        setActiveTab('compile_error');
                    } else {
                        setActiveTab('input');
                    }
                }}
                className="w-full text-left flex items-center space-x-2"
            >
                {result.verdict === 'Accepted' ? (
                    <svg className="w-4 h-4 text-green-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                ) : (
                    <svg className="w-4 h-4 text-red-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                )}
                <span className="text-sm text-gray-300">Test Case #{index + 1}</span>
                <span className={`text-xs font-bold ml-auto ${result.verdict === 'Accepted' ? 'text-green-400' : 'text-red-400'}`}>{result.verdict}</span>
            </button>
            
        </div>
    );

    const DetailContent = ({ content }) => (
        <pre className="w-full h-full bg-[#202225] p-4 rounded-md text-sm text-gray-300 whitespace-pre-wrap overflow-auto font-mono">
            {content || "No data available."}
        </pre>
    );
    
    // Check if the selected case has a compilation error to decide if the tab should be shown
    const hasCompileError = selectedCase?.judge0_response?.compile_output;

    return (
        <div className="absolute bottom-0 left-0 right-0 h-full bg-[#1e1f22] p-2 border-t-2 border-gray-700/60 shadow-lg flex flex-col">
            <div className="flex justify-between items-center p-2 shrink-0">
                <div className="flex items-center space-x-2">
                    {finalVerdict ? (
                        <div className={`text-lg font-bold ${finalVerdict === 'Accepted' ? 'text-green-400' : 'text-red-400'}`}>
                            Verdict: {finalVerdict}
                        </div>
                    ) : (
                        <div className="flex items-center space-x-2 text-gray-300">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
                            <span>Running on Test Case {results.length + 1}...</span>
                        </div>
                    )}
                    {/* Conditionally render the "Get Explanation" button */}
                    {finalVerdict === 'Accepted' && !showExplanationPanel && (
                        <button 
                            onClick={handleGetExplanation}
                            disabled={isExplanationLoading}
                            className="ml-4 flex items-center space-x-2 bg-[#424549] hover:bg-[#585b5f] text-gray-200 font-medium py-1.5 px-3 rounded-md transition-colors duration-200 text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#1e1f22] focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                            <span>{isExplanationLoading ? 'Analyzing...' : 'Get Explanation'}</span>
                        </button>
                    )}
                </div>
                <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
            </div>

            {/* Conditionally render the ExplanationPanel */}
            {showExplanationPanel && (
                <ExplanationPanel
                    explanationData={explanation}
                    isLoading={isExplanationLoading}
                    onClose={() => setShowExplanationPanel(false)}
                />
            )}

             {/* Conditionally render the DebugPanel */}
            {showDebugPanel && (
                <DebugPanel
                    debugData={debugInfo}
                    isLoading={isDebugging}
                    onClose={() => setShowDebugPanel(false)}
                />
            )}

            <div className="flex-1 flex min-h-0">
                <div className="w-1/3 p-2 flex flex-col">
                    <h4 className="font-semibold text-gray-300 mb-2 px-2">Test Cases</h4>
                    <div className="flex-1 bg-[#2b2d31] rounded-md p-2 overflow-y-auto space-y-1">
                        {results.map((res, i) => <TestCaseItem key={res?.judge0_response?.token || i} result={res} index={i} />)}
                        {isSubmitting && !finalVerdict && (
                             <div className="p-2 flex items-center space-x-2 text-gray-400">
                                <div className="animate-pulse h-2 w-2 bg-gray-500 rounded-full"></div>
                                <span className="text-sm">Waiting...</span>
                             </div>
                        )}
                    </div>
                </div>
                <div className="w-2/3 p-2 flex flex-col">
                    {/* Tabs are now dynamic */}
                    <div className="flex items-center space-x-1 mb-2">
                        <TabButton id="input" label="Input" />
                        <TabButton id="output" label="Your Output" />
                        <TabButton id="expected" label="Expected Output" />
                        {hasCompileError && (
                             <TabButton id="compile_error" label="Compilation Error" />
                        )}
                    </div>
                    <div className="flex-1 bg-[#2b2d31] rounded-md overflow-hidden">
                        {selectedCase ? (
                            <>
                                {activeTab === 'input' && <DetailContent content={selectedCase.input} />}
                                {activeTab === 'output' && <DetailContent content={selectedCase.user_output} />}
                                {activeTab === 'expected' && <DetailContent content={selectedCase.expected_output} />}
                                {/* ✅ MODIFIED: Display decoded compilation error */}
                                {activeTab === 'compile_error' && hasCompileError && (
                                    <DetailContent content={atob(selectedCase.judge0_response.compile_output)} />
                                )}
                            </>
                        ) : (
                            <div className="flex items-center justify-center h-full text-gray-500">Select a test case to view details</div>
                        )}
                    </div>

                    <div className="pt-2">
                        {selectedCase && selectedCase.verdict !== 'Accepted' && finalVerdict && !showDebugPanel && (
                            <button 
                                onClick={handleDebugTestCase}
                                disabled={isDebugging}
                                className="w-full flex items-center justify-center space-x-2 bg-yellow-600/50 hover:bg-yellow-700/50 text-yellow-200 font-medium py-2 px-4 rounded-md transition-colors text-sm disabled:opacity-50"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                <span>{isDebugging ? 'Debugging...' : 'Debug this Test Case'}</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const HintLoadingSpinner = () => (
    <div className="flex justify-center items-center py-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-400"></div>
    </div>
);

const HintPanel = ({ hint, isLoading, onClose }) => {
    const [isOpen, setIsOpen] = useState(true);

    return (
        <div className="px-3 pb-2">
            <div className="bg-[#202225] rounded-lg border border-gray-700/50">
                <div className="flex justify-between items-center p-3">
                    <h3 className="font-semibold text-gray-300">Hint</h3>
                    <div className="flex items-center space-x-2">
                        <button onClick={() => setIsOpen(!isOpen)} className="text-gray-400 hover:text-white">
                            <svg className={`w-5 h-5 transition-transform duration-300 ${isOpen ? '' : '-rotate-180'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                        </button>
                        <button onClick={onClose} className="text-gray-400 hover:text-white">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                        </button>
                    </div>
                </div>
                <div className={`grid transition-all duration-500 ease-in-out ${isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
                    <div className="overflow-hidden">
                        <div className="p-3 border-t border-gray-700/50">
                            {isLoading ? (
                                <HintLoadingSpinner />
                            ) : (
                                <p className="text-sm text-gray-300 whitespace-pre-wrap">{hint}</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Main App Component ---
export default function CodeEditor({ problemId }) {
    const languages = [
        { id: 'assembly', name: 'Assembly (NASM 2.14.02)', language_id: 45, monacoId: 'asm' },
        { id: 'bash', name: 'Bash (5.0.0)', language_id: 46, monacoId: 'shell' },
        { id: 'basic', name: 'Basic (FBC 1.07.1)', language_id: 47, monacoId: 'vb' },
        { id: 'c-clang-7', name: 'C (Clang 7.0.1)', language_id: 75, monacoId: 'c' },
        { id: 'cpp-clang-7', name: 'C++ (Clang 7.0.1)', language_id: 76, monacoId: 'cpp' },
        { id: 'c-gcc-7', name: 'C (GCC 7.4.0)', language_id: 48, monacoId: 'c' },
        { id: 'cpp-gcc-7', name: 'C++ (GCC 7.4.0)', language_id: 52, monacoId: 'cpp' },
        { id: 'c-gcc-8', name: 'C (GCC 8.3.0)', language_id: 49, monacoId: 'c' },
        { id: 'cpp-gcc-8', name: 'C++ (GCC 8.3.0)', language_id: 53, monacoId: 'cpp' },
        { id: 'c-gcc-9', name: 'C (GCC 9.2.0)', language_id: 50, monacoId: 'c' },
        { id: 'cpp-gcc-9', name: 'C++ (GCC 9.2.0)', language_id: 54, monacoId: 'cpp' },
        { id: 'clojure', name: 'Clojure (1.10.1)', language_id: 86, monacoId: 'clojure' },
        { id: 'csharp', name: 'C# (Mono 6.6.0.161)', language_id: 51, monacoId: 'csharp' },
        { id: 'cobol', name: 'COBOL (GnuCOBOL 2.2)', language_id: 77, monacoId: 'cobol' },
        { id: 'commonlisp', name: 'Common Lisp (SBCL 2.0.0)', language_id: 55, monacoId: 'lisp' },
        { id: 'd', name: 'D (DMD 2.089.1)', language_id: 56, monacoId: 'd' },
        { id: 'elixir', name: 'Elixir (1.9.4)', language_id: 57, monacoId: 'elixir' },
        { id: 'erlang', name: 'Erlang (OTP 22.2)', language_id: 58, monacoId: 'erlang' },
        { id: 'executable', name: 'Executable', language_id: 44, monacoId: 'plaintext' },
        { id: 'fsharp', name: 'F# (.NET Core SDK 3.1.202)', language_id: 87, monacoId: 'fsharp' },
        { id: 'fortran', name: 'Fortran (GFortran 9.2.0)', language_id: 59, monacoId: 'fortran' },
        { id: 'go', name: 'Go (1.13.5)', language_id: 60, monacoId: 'go' },
        { id: 'groovy', name: 'Groovy (3.0.3)', language_id: 88, monacoId: 'groovy' },
        { id: 'haskell', name: 'Haskell (GHC 8.8.1)', language_id: 61, monacoId: 'haskell' },
        { id: 'java', name: 'Java (OpenJDK 13.0.1)', language_id: 62, monacoId: 'java' },
        { id: 'javascript', name: 'JavaScript (Node.js 12.14.0)', language_id: 63, monacoId: 'javascript' },
        { id: 'kotlin', name: 'Kotlin (1.3.70)', language_id: 78, monacoId: 'kotlin' },
        { id: 'lua', name: 'Lua (5.3.5)', language_id: 64, monacoId: 'lua' },
        { id: 'multi-file', name: 'Multi-file program', language_id: 89, monacoId: 'plaintext' },
        { id: 'objectivec', name: 'Objective-C (Clang 7.0.1)', language_id: 79, monacoId: 'objective-c' },
        { id: 'ocaml', name: 'OCaml (4.09.0)', language_id: 65, monacoId: 'ocaml' },
        { id: 'octave', name: 'Octave (5.1.0)', language_id: 66, monacoId: 'matlab' },
        { id: 'pascal', name: 'Pascal (FPC 3.0.4)', language_id: 67, monacoId: 'pascal' },
        { id: 'perl', name: 'Perl (5.28.1)', language_id: 85, monacoId: 'perl' },
        { id: 'php', name: 'PHP (7.4.1)', language_id: 68, monacoId: 'php' },
        { id: 'plaintext', name: 'Plain Text', language_id: 43, monacoId: 'plaintext' },
        { id: 'prolog', name: 'Prolog (GNU Prolog 1.4.5)', language_id: 69, monacoId: 'prolog' },
        { id: 'python2', name: 'Python (2.7.17)', language_id: 70, monacoId: 'python' },
        { id: 'python', name: 'Python (3.8.1)', language_id: 71, monacoId: 'python' },
        { id: 'r', name: 'R (4.0.0)', language_id: 80, monacoId: 'r' },
        { id: 'ruby', name: 'Ruby (2.7.0)', language_id: 72, monacoId: 'ruby' },
        { id: 'rust', name: 'Rust (1.40.0)', language_id: 73, monacoId: 'rust' },
        { id: 'scala', name: 'Scala (2.13.2)', language_id: 81, monacoId: 'scala' },
        { id: 'sql', name: 'SQL (SQLite 3.27.2)', language_id: 82, monacoId: 'sql' },
        { id: 'swift', name: 'Swift (5.2.3)', language_id: 83, monacoId: 'swift' },
        { id: 'typescript', name: 'TypeScript (3.7.4)', language_id: 74, monacoId: 'typescript' },
        { id: 'vbnet', name: 'Visual Basic.Net (vbnc 0.0.0.5943)', language_id: 84, monacoId: 'vb' }
    ];

    const [selectedLanguage, setSelectedLanguage] = useRecoilState(selectedLanguageState);
    const user = useRecoilValue(userState);
    const [isDropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);
    const [code, setCode] = useRecoilState(codeState);
    

    const [isSubmitting, setIsSubmitting] = useRecoilState(isSubmittingState);; //
    const [showResultsPanel, setShowResultsPanel] = useRecoilState(showResultsPanelState);
    const [submissionResults, setSubmissionResults] = useRecoilState(submissionResultsState); //
    const [finalVerdict, setFinalVerdict] = useRecoilState(finalVerdictState); //
    const wsRef = useRef(null);

    // hint 
    const [hint, setHint] = useState('');
    const [isHintLoading, setIsHintLoading] = useState(false);
    const [showHint, setShowHint] = useState(false);
    const [problem, setProblem] = useRecoilState(selectedProblemState); //state for problem details
    const [problemError, setProblemError] = useState(null);

    // useEffect to fetch problem details (its needed for the hint functionality)
    useEffect(() => {
        const fetchProblemData = async () => {
            if (!problemId) return;
            setProblemError(null);
            try {
                const response = await fetch(`https://mostly-postfemoral-xenia.ngrok-free.dev/problems/${problemId}`, {
                    credentials: 'include',
                });
                if (!response.ok) {
                    throw new Error('Failed to fetch problem data.');
                }
                const data = await response.json();
                setProblem(data);
            } catch (err) {
                setProblemError(err.message);
            }
        };
        fetchProblemData();
    }, [problemId]);

    // Effect to fetch boilerplate code
    useEffect(() => {
        if (!problemId) return;
        const fetchBoilerplate = async () => {
            setCode('// Loading boilerplate code...');
            try {
                const langId = selectedLanguage.language_id;
                const response = await fetch( `https://mostly-postfemoral-xenia.ngrok-free.dev/display_problem/${problemId}?language_id=${langId}`, { credentials: 'include' });
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Failed to fetch boilerplate code.');
                }
                const data = await response.json();
                let fullCode = data.function_boilerplate;
                if (data.main_code) {
                    fullCode += `\n\n${data.main_code}`;
                }
                setCode(fullCode);
            } catch (err) {
                setCode(`// Error: ${err.message}\n// Could not load boilerplate for ${selectedLanguage.name}.`);
            }
        };
        fetchBoilerplate();
    }, [problemId, selectedLanguage]);

    // --- EDITED: Simplified to a single safety cleanup effect ---
    // This ensures that if the component unmounts mid-submission, the connection is closed.
    useEffect(() => {
        return () => {
            if (wsRef.current) {
                console.log("Component unmounting, closing WebSocket.");
                wsRef.current.close();
            }
        };
    }, []);

    // this one is meant for cleaning verdict during pg refresh
    useEffect(() => {
        return () => {
            // Close WebSocket connection if it exists
            if (wsRef.current) {
                console.log("Component unmounting, closing WebSocket.");
                wsRef.current.close();
            }
            // Reset all submission-related states
            setShowResultsPanel(false);
            setIsSubmitting(false);
            setSubmissionResults([]);
            setFinalVerdict(null); // Use null for consistency
        };
    }, []);

    
    // Effect to handle clicks outside the dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLanguageSelect = (lang) => {
        setSelectedLanguage(lang);
        setDropdownOpen(false);
    };

    // Handler for the "Get Hint" button
    const handleGetHint = async () => {
        if (isHintLoading || !problem) {
            console.error("Cannot get hint: either already loading or problem data is not available.");
             setHint("Could not fetch problem details needed for the hint.");
             setShowHint(true);
            return;
        }

        setIsHintLoading(true);
        setShowHint(true);
        setHint('');

        try {
            const response = await fetch('https://mostly-postfemoral-xenia.ngrok-free.dev/hint', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    problem_markdown: problem.description_md, 
                    user_code: code,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to get hint.');
            }

            const data = await response.json();
            setHint(data.hint); 

        } catch (error) {
            console.error('Hint error:', error);
            setHint(`Error: ${error.message}`);
        } finally {
            setIsHintLoading(false);
        }
    };

    // --- EDITED: `handleSubmit` now manages the entire WebSocket lifecycle per submission ---
    const handleSubmit = async () => {
        if (!user || !problemId || isSubmitting) return;

        // 1. Reset state for the new submission
        setIsSubmitting(true);
        setShowResultsPanel(true);
        setSubmissionResults([]);
        setFinalVerdict(null);

        // 2. Create a new WebSocket connection for this submission
        console.log("Initiating new WebSocket connection for submission...");
        // In the handleSubmit function
        const ws = new WebSocket('wss://mostly-postfemoral-xenia.ngrok-free.dev');
        wsRef.current = ws;
        console.log("Checkpoint 1");

        // 3. Define what happens when the connection opens
        ws.onopen = async () => {
            console.log('✅ WebSocket connection established.');

            try {
                // Once connected, send the HTTP request to start the submission process
                const response = await fetch('https://mostly-postfemoral-xenia.ngrok-free.dev/submit', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({
                        problem_id: problemId,
                        source_code: code,
                        language_id: selectedLanguage.language_id,
                        user_id: user.user_id,
                    }),
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Submission failed.');
                }

                const data = await response.json();
                
                // Immediately subscribe to the submission channel
                console.log(`Sending 'subscribe' message for submission ID: ${data.submissionID}`);
                ws.send(JSON.stringify({
                    type: 'subscribe',
                    submissionID: data.submissionID
                }));

            } catch (error) {
                console.error('Submission error:', error);
                setFinalVerdict(`Error: ${error.message}`);
                setIsSubmitting(false);
                ws.close(); // Close the connection if the HTTP part fails
            }
        };

        // 4. Define how to handle incoming messages
        ws.onmessage = (event) => {
            // console.log("Checkpoint 2");
            const message = JSON.parse(event.data);
            switch (message.type) {
                case 'result':
//                     setSubmissionResults(prev => [...prev, message.payload]);
//                     console.log(`result = ${JSON.stringify(message.payload)}`);
                    break; // ignoring result message as of now
                case 'completed':
                    setFinalVerdict(message.payload.verdict);
                    setSubmissionResults(message.payload.results);
                    setIsSubmitting(false);
                    // The submission is complete, so we close the connection.
                    console.log("Final verdict received. Closing connection.");
                    ws.close();
                    break;
                default:
                    console.warn('Received unknown message type:', message.type);
            }
        };

        // 5. Define cleanup and error handling
        ws.onclose = () => {
            console.log('❌ WebSocket connection closed.');
            wsRef.current = null; // Clear the ref
            // Ensure isSubmitting is false if the connection closes prematurely
            if (!finalVerdict) {
                setIsSubmitting(false);
            }
        };

        ws.onerror = (error) => {
            console.error('WebSocket error:', error);
            setFinalVerdict("Connection Error");
            setIsSubmitting(false);
            wsRef.current = null;
        };
    };

    return (
        <div className="w-full h-full relative">
            <div className="w-full h-full bg-[#2f3136] rounded-lg overflow-hidden shadow-2xl flex flex-col">
                {/* Header */}
                <div className="bg-[#1e1f22] pt-3 flex items-center justify-between shrink-0">
                    <span className="text-sm font-medium text-gray-400 tracking-wider pl-8">CODECOLLAB EDITOR</span>
                    <div className="relative pt-2 pr-2" ref={dropdownRef}>
                        <button
                            onClick={() => setDropdownOpen(!isDropdownOpen)}
                            className="flex items-center justify-between w-36 bg-[#2b2d31] hover:bg-[#35373c] text-gray-200 text-sm font-medium py-1.5 px-3 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <span>{selectedLanguage.name}</span>
                            <svg className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isDropdownOpen ? 'transform rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                        </button>
                        
                        {isDropdownOpen && (
                            <div className="absolute z-10 right-0 mt-2 w-48 bg-[#1e1f22] rounded-md shadow-lg border border-[#111214] max-h-60 overflow-y-auto">
                                <ul className="py-1">
                                    {languages.map((lang) => (
                                        <li key={lang.language_id}>
                                            <a href="#" onClick={(e) => { e.preventDefault(); handleLanguageSelect(lang); }}
                                                className={`block px-4 py-2 text-sm transition-colors duration-150 ${selectedLanguage.id === lang.id ? 'bg-[#404249] text-white' : 'text-gray-300 hover:bg-[#2b2d31] hover:text-white'}`}>
                                                {lang.name}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
                
                {/* Editor */}
                <div className="flex-1 overflow-hidden h-full">
                    <MonacoEditor 
                        key={selectedLanguage.language_id}
                        language={selectedLanguage.monacoId}
                        value={code}
                        onChange={setCode}
                    />
                </div>

                {/* Conditionally render the HintPanel above the footer */}
                {showHint && (
                    <HintPanel
                        hint={hint}
                        isLoading={isHintLoading}
                        onClose={() => setShowHint(false)}
                    />
                )}
                
                {/* Footer */}
                <div className="p-3 flex items-center justify-end space-x-3 shrink-0 bg-zinc-800">
                    {/* ✅ Hooked up the new handleGetHint function and loading state */}
                    <button 
                        onClick={handleGetHint}
                        disabled={isHintLoading || isSubmitting}
                        className="flex items-center space-x-2 bg-[#424549] hover:bg-[#585b5f] text-gray-200 font-medium py-2 px-4 rounded-md transition-colors duration-200 text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#1e1f22] focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path></svg>
                        <span>{isHintLoading ? 'Getting Hint...' : 'Get Hint'}</span>
                    </button>
                    
                    <button 
                        onClick={handleSubmit}
                        disabled={isSubmitting || isHintLoading}
                        className="flex items-center space-x-2 bg-[#5865F2] hover:bg-[#4f5bda] text-white font-medium py-2 px-6 rounded-md transition-colors duration-200 text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#1e1f22] focus:ring-[#5865F2] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z"></path></svg>
                        <span>{isSubmitting ? 'Submitting...' : 'Submit'}</span>
                    </button>
                </div>
            </div>
            {/* The new status component is rendered here */}
{/*             {showResultsPanel && (
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
                />
            )} */}
        </div>
    );
}

