import React, { useState, useMemo, useEffect } from 'react';
import { useRecoilState, useRecoilValue, useSetRecoilState  } from 'recoil';
import { userState } from '@/recoil/atoms/authAtoms';
import { parsedProblemState } from '@/recoil/atoms/problemAtoms';
import { Routes, Route, useNavigate, useParams } from 'react-router-dom';

import ResizableLayout from '@/utils/render_problem';


// --- Helper Components (Unchanged from your version) ---

const SolvedIcon = () => (
  <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
  </svg>
);

// Add this helper component alongside your SolvedIcon
const AttemptedIcon = () => (
  <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
  </svg>
);

// ✅ ADD THIS: A simple loading component
const LoadingSpinner = () => (
    <div className="flex justify-center items-center py-16">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-200"></div>
    </div>
);

// --- Submission Details Panel ---
const SubmissionDetailPanel = ({ submission, onClose }) => {
    const [testCaseResults, setTestCaseResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [openTestCaseIndex, setOpenTestCaseIndex] = useState(null);

    useEffect(() => {
        if (!submission?.submission_id) {
            setTestCaseResults([]);
            return;
        }

        const fetchTestCases = async () => {
            setIsLoading(true);
            setError(null);
            setOpenTestCaseIndex(null); // Reset open case when submission changes
            try {
                const response = await fetch(` http://localhost:8085/submissions/results/${submission.submission_id}`, {
                    credentials: 'include',
                    headers: {
                      Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                });
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Failed to load test case results.');
                }
                const data = await response.json();
                setTestCaseResults(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };
        fetchTestCases();
    }, [submission]);

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

    function getLanguageNameById(languageId) {
        const lang = languages.find(l => l.language_id === languageId);
        return lang ? lang.name : "Unknown Language";
    }
    const languageName = getLanguageNameById(submission.language_id) || 'Unknown Language';

    // Sub-component for a single test case, now with state managed by parent
    const TestCaseResult = ({ result, index, isOpen, onToggle }) => {
        const CodeBlock = ({ title, content }) => (
            <div>
                <h5 className="font-semibold text-sm text-gray-400 mt-3 mb-1">{title}</h5>
                <pre className="bg-[#202225] p-3 rounded-md text-xs text-gray-300 whitespace-pre-wrap overflow-auto font-mono">
                    <code>{content != null && content !== '' ? content : '(empty)'}</code>
                </pre>
            </div>
        );

        return (
            <div className={`rounded-md border ${result.verdict === 'Accepted' ? 'bg-green-500/10 border-green-500/20' : 'bg-red-500/10 border-red-500/20'}`}>
                <button className="w-full text-left p-3 focus:outline-none" onClick={onToggle}>
                    <div className="flex justify-between items-center">
                        <span className="font-semibold text-gray-300">Test Case #{index + 1}</span>
                        <div className="flex items-center space-x-2">
                            <span className={`font-bold text-sm ${result.verdict === 'Accepted' ? 'text-green-300' : 'text-red-300'}`}>{result.verdict}</span>
                            <svg className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                        </div>
                    </div>
                    <div className="text-xs text-gray-400 mt-2">
                        <span>Time: {result.time_seconds != null ? `${(parseFloat(result.time_seconds) * 1000).toFixed(0)} ms` : 'N/A'}</span>
                        <span className="ml-4">Memory: {result.memory_kb != null ? `${result.memory_kb} KB` : 'N/A'}</span>
                    </div>
                </button>
                <div className={`grid transition-all duration-500 ease-in-out ${isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
                    <div className="overflow-hidden">
                        <div className="px-3 pb-3 pt-3 border-t border-gray-700/50">
                            <CodeBlock title="Input" content={result.input} />
                            <CodeBlock title="Expected Output" content={result.expected_output} />
                            <CodeBlock title="Your Output" content={result.user_output} />
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="w-full h-full bg-[#2c2f33] border-l-2 border-gray-700/60 shadow-2xl flex flex-col">
            <header className="flex items-center justify-between p-4 border-b border-gray-700/60 shrink-0">
                <div>
                    <h3 className="text-lg font-bold text-white">Submission Details</h3>
                    <p className="text-xs text-gray-400">{new Date(submission.submitted_at).toLocaleString()}</p>
                </div>
                <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
            </header>

            <main className="flex-1 p-4 overflow-y-auto">
                <div className="mb-6">
                    <h4 className="font-semibold text-gray-300 mb-2">Verdict & Language</h4>
                    <div className="flex items-center space-x-4">
                        <span className={`px-3 py-1 text-sm font-bold rounded-full ${submission.verdict === 'Accepted' ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>{submission.verdict}</span>
                        <span className="text-sm text-gray-400">{languageName}</span>
                    </div>
                </div>

                <div className="mb-6">
                    <h4 className="font-semibold text-gray-300 mb-2">Submitted Code</h4>
                    <pre className="bg-[#202225] p-4 rounded-md text-sm text-gray-300 whitespace-pre-wrap overflow-auto font-mono max-h-60">
                        <code>{submission.code}</code>
                    </pre>
                </div>
                
                <div>
                    <h4 className="font-semibold text-gray-300 mb-2">Test Case Results</h4>
                    {isLoading ? <LoadingSpinner /> : error ? <p className="text-red-400">{error}</p> : (
                        <div className="space-y-2">
                            {testCaseResults.length > 0 ? testCaseResults.map((result, index) => (
                                <TestCaseResult 
                                    key={index} 
                                    result={result} 
                                    index={index}
                                    isOpen={openTestCaseIndex === index}
                                    onToggle={() => setOpenTestCaseIndex(openTestCaseIndex === index ? null : index)}
                                />
                            )) : <p className="text-sm text-gray-400">No detailed test case results available for this submission.</p>}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

// --- All Submissions Page ---
const AllSubmissionsPage = () => {
    const { problemId } = useParams();
    // fix needed
    const user = useRecoilValue(userState); // 
    const navigate = useNavigate();

    const [submissions, setSubmissions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedSubmission, setSelectedSubmission] = useState(null);

    // Hardcoded list of languages since it's not available from the backend easily
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

    useEffect(() => {
        const fetchSubmissions = async () => {
            if (!user?.user_id) {
                setError("You must be logged in to view submissions.");
                setIsLoading(false);
                return;
            }
            setIsLoading(true);
            try {
                const response = await fetch(` http://localhost:8085/submissions/user/${user.user_id}`, { 
                  credentials: 'include',
                  headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                  }, 
                });
                if (!response.ok) {
                    throw new Error('Failed to fetch submissions.');
                }
                const allSubmissions = await response.json();
                const problemSubmissions = allSubmissions.filter(sub => sub.problem_id == problemId);
                setSubmissions(problemSubmissions);
            } catch (err) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };
        fetchSubmissions();
    }, [problemId, user]);

    return (
        <div className="w-full h-full flex overflow-hidden">
            {/* ✅ EDITED: This is the main content panel (the list of submissions) */}
            <div className={`transition-all duration-300 ease-in-out h-full ${selectedSubmission ? 'w-1/2' : 'w-full'}`}>
                {/* ✅ ADDED: A container to make this panel independently scrollable */}
                <div className="h-full overflow-y-auto">
                    <header className="mb-8 mt-8 px-4 sm:px-6 lg:px-8">
                        <button onClick={() => navigate(-1)} className="text-sm text-gray-400 hover:text-white mb-4 flex items-center space-x-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
                            <span>Back to Problems</span>
                        </button>
                        <h1 className="text-3xl font-bold text-white mb-2">Submissions for "{submissions[0]?.problem_title || 'Problem'}"</h1>
                        <p className="text-gray-400">Showing your past submissions for this problem.</p>
                    </header>

                    <main className="px-4 sm:px-6 lg:px-8 pb-8">
                        {isLoading ? <LoadingSpinner /> : error ? <div className="text-red-400">{error}</div> : (
                            <div className="space-y-4">
                                {submissions.length > 0 ? submissions.map(sub => (
                                    <button key={sub.submission_id} onClick={() => setSelectedSubmission(sub)} className="w-full text-left bg-[#2c2f33] p-4 rounded-lg border border-gray-700/50 hover:bg-gray-700/50 transition-colors flex justify-between items-center">
                                        <div>
                                            <p className={`font-bold ${sub.verdict === 'Accepted' ? 'text-green-400' : 'text-red-400'}`}>{sub.verdict}</p>
                                            <p className="text-xs text-gray-400 mt-1">{new Date(sub.submitted_at).toLocaleString()}</p>
                                        </div>
                                        <span className="text-sm font-semibold text-gray-300">{sub.language}</span>
                                    </button>
                                )) : <p className="text-gray-400 text-center py-8">No submissions found for this problem.</p>}
                            </div>
                        )}
                    </main>
                </div>
            </div>
            {/* ✅ EDITED: The SubmissionDetailPanel is now a flex item that appears when a submission is selected. */}
            <div className={`transition-all duration-300 ease-in-out h-full ${selectedSubmission ? 'w-1/2' : 'w-0'}`}>
                {selectedSubmission && (
                    <SubmissionDetailPanel 
                        submission={selectedSubmission} 
                        onClose={() => setSelectedSubmission(null)} 
                    />
                )}
            </div>
        </div>
    );
};

const ProblemCard = ({ problem }) => {
    const navigate = useNavigate();

    const levelColorClasses = {
        'Easy': 'bg-green-500/20 text-green-400',
        'Medium': 'bg-yellow-500/20 text-yellow-400',
        'Hard': 'bg-red-500/20 text-red-400',
    };

    // This function is called when the "Solve" button is clicked
    const handleSolveClick = () => {
        // It navigates to a URL relative to the current one.
        // e.g., if you are at /home/all-problems, this will go to /home/all-problems/123
        navigate(`${problem.id}`);
    };

    return (
        <div className="bg-[#2c2f33] p-5 rounded-lg border border-gray-700/50 flex flex-col justify-between transition-transform hover:scale-[1.02] hover:border-gray-600/80">
            <div>
                <div className="flex justify-between items-start mb-3">
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${levelColorClasses[problem.difficulty]}`}>
                        {problem.difficulty}
                    </span>
                    {problem.solved && (
                        <div className="flex items-center space-x-2 text-green-400">
                            <SolvedIcon />
                            <span className="text-sm font-semibold">Solved</span>
                        </div>
                    )}
                    {problem.rejected && !problem.solved && (
                        <div className="flex items-center space-x-2 text-yellow-400">
                            <AttemptedIcon />
                            <span className="text-sm font-semibold">Attempted</span>
                        </div>
                    )}
                </div>
                <h3 className="text-lg font-semibold text-gray-200 mb-4">{problem.title}</h3>
            </div>
            {/* The "View Submissions" button is now added here and the "Solve" button is in the same container */}
            <div className="space-y-2 mt-auto pt-4">
                <button 
                    onClick={handleSolveClick}
                    className="w-full bg-[#5865F2] hover:bg-[#4f5bda] text-white font-bold py-2 px-4 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#2c2f33] focus:ring-[#5865F2]">
                    Solve
                </button>
                 {(problem.solved || problem.rejected) && (
                    <button onClick={() => navigate(`${problem.id}/all-submissions`)} className="w-full bg-gray-600/50 hover:bg-gray-700/50 text-gray-300 font-bold py-2 px-4 rounded-md transition-colors">
                        View Submissions
                    </button>
                )}
            </div>
        </div>
    );
};

// --- NEW Component for Solving a Single Problem ---
// This fetches data for one problem, sets Recoil state, and renders the layout.
const ProblemSolverComponent = () => {
    const { problemId } = useParams();
    const setParsedProblem = useSetRecoilState(parsedProblemState);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProblemData = async () => {
            if (!problemId) return;
            setIsLoading(true);
            setError(null);
            try {
                const response = await fetch(` http://localhost:8085/problems/${problemId}`, {
                    credentials: 'include',
                    headers: {
                      Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                });
                if (!response.ok) {
                    throw new Error('Failed to fetch problem data.');
                }
                const data = await response.json();
                // Set the Recoil state with the fetched problem data
                console.log(JSON.stringify(data));
                setParsedProblem(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };
        fetchProblemData();
    }, [problemId, setParsedProblem]);

    if (isLoading) return <LoadingSpinner />;
    if (error) return <div className="text-center py-16 text-red-400"><p>Error: {error}</p></div>;

    // Once data is fetched and state is set, render the layout.
    // ResizableLayout will consume the state from Recoil.
    return <ResizableLayout />;
};


// --- Main App Component ---
const ProblemListComponent = () => {
  // ✅ ADD THIS: State for loading and error handling.
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // ✅ MODIFIED: Initialize `problems` state as an empty array.
  const [problems, setProblems] = useState([]);
  const [filter, setFilter] = useState('all');

  const [user] = useRecoilState(userState); // i need user_id

  // ✅ ADD THIS: useEffect hook to fetch data when the component mounts.
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // In a real app, you would get the userId from your auth context/state.
        const userId = user?.user_id; // <-- REPLACE WITH ACTUAL LOGGED-IN USER ID

        // Fetch all problems and user submissions in parallel
        const [problemsResponse, submissionsResponse] = await Promise.all([
          fetch('http://localhost:8085/problems', {
            credentials: 'include', // Automatically sends the auth cookie
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          }),
          fetch(`http://localhost:8085/submissions/user/${userId}`, {
            credentials: 'include',
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          })
        ]);

        if (!problemsResponse.ok) {
          throw new Error('Failed to fetch problems.');
        }
        if (!submissionsResponse.ok) {
          throw new Error('Failed to fetch user submissions.');
        }

        const allProblems = await problemsResponse.json();
        const userSubmissions = await submissionsResponse.json();

        // Create a Set of solved problem IDs for efficient lookup
        const solvedProblemIds = new Set(
          userSubmissions
            .filter(sub => sub.verdict === 'Accepted') // Assuming 'Accepted' is the success verdict
            .map(sub => sub.problem_id)
        );

        const rejectedProblemIds = new Set(
            userSubmissions
                .filter(sub => sub.verdict === 'Rejected' && sub.status==='Completed') // 'Rejected' is the reject verdict but submitted
                .map(sub => sub.problem_id)
        );

        // Combine the data: add a `solved` property to each problem
        const enrichedProblems = allProblems.map(problem => ({
          ...problem,
          // The backend returns problem_id, let's keep it consistent
          id: problem.problem_id, 
          solved: solvedProblemIds.has(problem.problem_id),
          rejected: rejectedProblemIds.has(problem.problem_id)
        }));

        setProblems(enrichedProblems);

      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []); // Empty dependency array means this runs once on mount


  const filteredProblems = useMemo(() => {
    if (filter === 'solved') {
      return problems.filter(p => p.solved);
    }
    if (filter === 'unsolved') {
      return problems.filter(p => !p.solved);
    }
    return problems;
  }, [problems, filter]);

  const FilterButton = ({ type, text }) => {
    const isActive = filter === type;
    return (
      <button
        onClick={() => setFilter(type)}
        className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors duration-200 focus:outline-none ${
          isActive
            ? 'bg-gray-600/50 text-white'
            : 'text-gray-400 hover:bg-gray-700/50 hover:text-gray-200'
        }`}
      >
        {text}
      </button>
    );
  };

  

  return (
    
      <div className="w-full mx-auto">
        <header className="mb-8 mt-8">
          <h1 className="text-3xl font-bold text-white mb-2">Problem Set</h1>
          <p className="text-gray-400">Select a problem to start solving.</p>
          <div className="mt-6 p-1.5 bg-[#2c2f33] rounded-lg flex items-center space-x-2 w-full sm:w-auto">
            <FilterButton type="all" text="All Problems" />
            <FilterButton type="solved" text="Solved" />
            <FilterButton type="unsolved" text="Unsolved" />
          </div>
        </header>

        <main>
          {/* ✅ MODIFIED: Handle loading and error states */}
          {isLoading ? (
            <LoadingSpinner />
          ) : error ? (
            <div className="text-center py-16 text-red-400">
              <p>Error: {error}</p>
            </div>
          ) : filteredProblems.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {filteredProblems.map(problem => (
                <ProblemCard key={problem.id} problem={problem} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-gray-400">No problems found for this filter.</p>
            </div>
          )}
        </main>
      </div>
  );
};

const ProblemsPage = () => {

    // --- Main ProblemsPage Component (Acts as a Router) ---
    // This is the main export. It uses Routes to decide whether to show
    // the list of problems or the solver for a single problem.
    return (
        <div className="h-full bg-zinc-800 text-gray-200 font-sans w-full">
            <Routes>
                {/* The "index" route shows the list of all problems */}
                <Route index element={<ProblemListComponent />} />
                
                {/* The nested route with a ":problemId" param shows the solver */}
                <Route path=":problemId" element={<ProblemSolverComponent />} />

                {/* Viewing submissions pg for a problem */}
                <Route path=":problemId/all-submissions" element={<AllSubmissionsPage />} />
            </Routes>
        </div>
    );
};

export default ProblemsPage;