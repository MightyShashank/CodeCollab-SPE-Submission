import React, { useState, useCallback, useMemo } from 'react';
import toast from 'react-hot-toast';

// --- Helper Components ---

// Info Icon with Tooltip
const InfoTooltip = ({ text }) => (
  <div className="relative group flex items-center">
    <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
    </svg>
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-2 text-sm text-gray-200 bg-[#18191c] rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none">
      {text}
    </div>
  </div>
);

// Generic Form Field Component
const FormField = ({ label, tooltip, children, error }) => (
  <div className="mb-6">
    <div className="flex items-center space-x-2 mb-2">
      <label className="block text-sm font-bold text-gray-300">{label}</label>
      <InfoTooltip text={tooltip} />
    </div>
    {children}
    {error && <p className="mt-1 text-sm text-red-400">{error}</p>}
  </div>
);

// --- Sample Data for Tooltips and Placeholders ---
const sampleBoilerplate = `### Description
A clear and concise description of the problem.

### Function Signature
- Function Name: yourFunctionName
- Function Input:
  - arg1: Type
- Function Return Type: Type

### Execution Details
- Main Function Input:
  - Line 1: ...
- Main Function Logic: result = yourFunctionName(arg1)
- Main Function Output: The result

### Constraints
- 1 <= arg1.length <= 1000

### Example
Input:
- sample_input
Output:
- sample_output`;

const sampleJsonTestCases = `{
  "test_cases": [
    {
      "input": "line1\\nline2",
      "expected_output": "result1"
    },
    {
      "input": "another_input",
      "expected_output": "result2"
    }
  ]
}`;


// --- Main Create Problem Component ---
const CreateProblemPage = () => {
  // --- State Management ---
  const [formData, setFormData] = useState({
    title: '',
    description_md: '',
    difficulty: 'Easy',
    main_required: true,
    boilerplate_md: '',
    time_limit_ms: 1000,
    memory_limit_kb: 65536,
    visibility: 'public',
    actual_solution: '',
  });

  const [testCaseInputMode, setTestCaseInputMode] = useState('manual');
  const [manualTestCases, setManualTestCases] = useState([{ input: '', expected_output: '' }]);
  const [jsonTestCaseInput, setJsonTestCaseInput] = useState('');
  const [visibleTestCases, setVisibleTestCases] = useState([{ input: '', expected_output: '' }]);
  
  const [errors, setErrors] = useState({});

  // --- Handlers for Form Changes ---
  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleManualTestCaseChange = (index, field, value) => {
    const updatedCases = [...manualTestCases];
    updatedCases[index][field] = value;
    setManualTestCases(updatedCases);
  };
  
  const handleVisibleTestCaseChange = (index, field, value) => {
    const updatedCases = [...visibleTestCases];
    updatedCases[index][field] = value;
    setVisibleTestCases(updatedCases);
  };

  // State to handle submission status
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState({ message: '', type: '' });

  const addManualTestCase = () => setManualTestCases([...manualTestCases, { input: '', expected_output: '' }]);
  const removeManualTestCase = (index) => setManualTestCases(manualTestCases.filter((_, i) => i !== index));
  
  const addVisibleTestCase = () => setVisibleTestCases([...visibleTestCases, { input: '', expected_output: '' }]);
  const removeVisibleTestCase = (index) => setVisibleTestCases(visibleTestCases.filter((_, i) => i !== index));

  // --- Validation and Submission Logic ---
  const validate = useCallback(() => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required.';
    if (!formData.description_md.trim()) newErrors.description_md = 'Description is required.';
    if (!formData.boilerplate_md.trim()) newErrors.boilerplate_md = 'Boilerplate Markdown is required.';
    if (!formData.actual_solution.trim()) newErrors.actual_solution = 'An actual solution is required.';

    // Validate Test Cases
    if (testCaseInputMode === 'json') {
      try {
        const parsed = JSON.parse(jsonTestCaseInput);
        if (!parsed.test_cases || !Array.isArray(parsed.test_cases)) {
          throw new Error();
        }
        parsed.test_cases.forEach(tc => {
          if (typeof tc.input === 'undefined' || typeof tc.expected_output === 'undefined') {
            throw new Error();
          }
        });
      } catch (e) {
        newErrors.test_cases = 'Invalid JSON format. Please check the structure and try again.';
      }
    } else {
      if (manualTestCases.some(tc => !tc.input.trim() || !tc.expected_output.trim())) {
        newErrors.test_cases = 'All manual test case fields are required.';
      }
    }

    // Validate Visible Test Cases
    if (visibleTestCases.some(tc => !tc.input.trim() || !tc.expected_output.trim())) {
        newErrors.visible_testcases = 'All visible test case fields are required.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, testCaseInputMode, jsonTestCaseInput, manualTestCases, visibleTestCases]);


  // Updated the handleSubmit function to include the API call
  // handleSubmit now uses cookies for auth.
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmissionStatus({ message: '', type: '' });

    if (!validate()) {
      // Set a timeout to clear validation errors after a few seconds
      setTimeout(() => setErrors({}), 3000);
      return;
    }

    setIsSubmitting(true);

    const finalTestCases = testCaseInputMode === 'json' 
      ? JSON.parse(jsonTestCaseInput)
      : { test_cases: manualTestCases };

    const finalVisibleTestCases = visibleTestCases.reduce((acc, tc, index) => {
        acc[`case${index + 1}`] = tc;
        return acc;
    }, {});

    const finalPayload = {
      ...formData,
      test_cases: finalTestCases,
      visible_testcases: finalVisibleTestCases,
    };

    console.log('Checkpoint 1');

    try {
      const response = await fetch('https://mostly-postfemoral-xenia.ngrok-free.dev/problems', {
        method: 'POST',
        // Tells the browser to automatically send cookies with the request.
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          // REMOVED: No need to manually set the auth token header.there earlier used to be authToken kinda here
        },
        body: JSON.stringify(finalPayload),
      });

      const result = await response.json();

      console.log('Checkpoint 2');
      if (!response.ok) {
        throw new Error(result.error || 'An unknown error occurred.');
      }

      console.log('Checkpoint 3');
      setSubmissionStatus({ message: `Success! Problem created with ID: ${result.problem_id}`, type: 'success' });

    //   Success
      toast.success(`Success! Problem created with ID: ${result.problem_id}`, { duration: 2000 });
      console.log('Checkpoint 4');
      
    } catch (error) {
      setSubmissionStatus({ message: `Error: ${error.message}`, type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const formIsValid = useMemo(() => Object.keys(errors).length === 0, [errors]);

  return (
    <div className="h-screen w-full bg-[#36393f] text-gray-200 font-sans p-4 sm:p-6 lg:p-8">
      <div className="w-full mx-auto">
        <header className="mb-10 pt-6">
          <h1 className="text-3xl font-bold text-white mb-2">Create New Problem</h1>
          <p className="text-gray-400">Fill out the details below to add a new problem to the collection.</p>
        </header>

        <form onSubmit={handleSubmit} noValidate>
          {/* --- Basic Information --- */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
            <FormField label="Problem Title" tooltip="The main title of the problem, e.g., 'Two Sum'." error={errors.title}>
              <input type="text" name="title" value={formData.title} onChange={handleFormChange} className="w-full bg-[#2c2f33] border border-gray-700/50 rounded-md p-2 focus:ring-2 focus:ring-[#5865F2] focus:outline-none" />
            </FormField>
            <FormField label="Difficulty" tooltip="Select the difficulty level for this problem.">
              <select name="difficulty" value={formData.difficulty} onChange={handleFormChange} className="w-full bg-[#2c2f33] border border-gray-700/50 rounded-md p-2 focus:ring-2 focus:ring-[#5865F2] focus:outline-none">
                <option>Easy</option>
                <option>Medium</option>
                <option>Hard</option>
              </select>
            </FormField>
          </div>

          <FormField label="Problem Description" tooltip="A brief, user-facing description of the problem statement, written in Markdown." error={errors.description_md}>
            <textarea name="description_md" value={formData.description_md} onChange={handleFormChange} rows="4" className="w-full bg-[#2c2f33] border border-gray-700/50 rounded-md p-2 focus:ring-2 focus:ring-[#5865F2] focus:outline-none" />
          </FormField>

          <FormField label="Boilerplate Markdown" tooltip="The detailed markdown file content, including function signatures, constraints, and examples." error={errors.boilerplate_md}>
            <textarea name="boilerplate_md" value={formData.boilerplate_md} onChange={handleFormChange} rows="10" className="w-full bg-[#2c2f33] border border-gray-700/50 rounded-md p-2 focus:ring-2 focus:ring-[#5865F2] focus:outline-none font-mono text-sm" placeholder="Paste your markdown here or use a sample." />
            <button type="button" onClick={() => setFormData(p => ({...p, boilerplate_md: sampleBoilerplate}))} className="mt-2 text-xs text-[#5865F2] hover:underline">Use Sample Structure</button>
          </FormField>
          
          <FormField label="Actual Solution" tooltip="The complete, correct solution code for this problem. This is used for verification." error={errors.actual_solution}>
            <textarea name="actual_solution" value={formData.actual_solution} onChange={handleFormChange} rows="8" className="w-full bg-[#2c2f33] border border-gray-700/50 rounded-md p-2 focus:ring-2 focus:ring-[#5865F2] focus:outline-none font-mono text-sm" placeholder="function solve(args) { ... }" />
          </FormField>

          {/* --- Configuration --- */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8">
             <FormField label="Time Limit (ms)" tooltip="Maximum execution time in milliseconds.">
              <input type="number" name="time_limit_ms" value={formData.time_limit_ms} onChange={handleFormChange} className="w-full bg-[#2c2f33] border border-gray-700/50 rounded-md p-2 focus:ring-2 focus:ring-[#5865F2] focus:outline-none" />
            </FormField>
             <FormField label="Memory Limit (KB)" tooltip="Maximum memory usage in kilobytes.">
              <input type="number" name="memory_limit_kb" value={formData.memory_limit_kb} onChange={handleFormChange} className="w-full bg-[#2c2f33] border border-gray-700/50 rounded-md p-2 focus:ring-2 focus:ring-[#5865F2] focus:outline-none" />
            </FormField>
            <FormField label="Visibility" tooltip="Public problems are visible to everyone. Private problems are hidden.">
              <select name="visibility" value={formData.visibility} onChange={handleFormChange} className="w-full bg-[#2c2f33] border border-gray-700/50 rounded-md p-2 focus:ring-2 focus:ring-[#5865F2] focus:outline-none">
                <option value="public">Public</option>
                <option value="private">Private</option>
              </select>
            </FormField>
          </div>
          <div className="flex items-center space-x-2 mb-6">
            <input type="checkbox" name="main_required" checked={formData.main_required} onChange={handleFormChange} className="h-4 w-4 rounded bg-[#2c2f33] border-gray-700/50 text-[#5865F2] focus:ring-[#5865F2]" />
            <label htmlFor="main_required" className="text-sm font-bold text-gray-300">Main Function Required</label>
            <InfoTooltip text="Check this if the user's code needs to be wrapped in a main function for execution." />
          </div>

          <hr className="border-gray-700/50 my-8" />

          {/* --- Visible Test Cases --- */}
          <FormField label="Visible Test Cases" tooltip="These test cases are shown to the user as examples. At least one is required." error={errors.visible_testcases}>
            {visibleTestCases.map((tc, index) => (
              <div key={index} className="grid grid-cols-12 gap-4 mb-3 p-3 bg-[#2c2f33] rounded-md">
                <textarea value={tc.input} onChange={(e) => handleVisibleTestCaseChange(index, 'input', e.target.value)} placeholder={`Input for Case ${index + 1}`} rows="2" className="col-span-5 w-full bg-[#202225] border border-gray-700/50 rounded-md p-2 focus:ring-2 focus:ring-[#5865F2] focus:outline-none font-mono text-sm" />
                <textarea value={tc.expected_output} onChange={(e) => handleVisibleTestCaseChange(index, 'expected_output', e.target.value)} placeholder={`Expected Output for Case ${index + 1}`} rows="2" className="col-span-6 w-full bg-[#202225] border border-gray-700/50 rounded-md p-2 focus:ring-2 focus:ring-[#5865F2] focus:outline-none font-mono text-sm" />
                <button type="button" onClick={() => removeVisibleTestCase(index)} className="col-span-1 text-gray-500 hover:text-red-400 transition-colors">
                  <svg className="w-6 h-6 mx-auto" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                </button>
              </div>
            ))}
            <button type="button" onClick={addVisibleTestCase} className="mt-2 text-sm font-semibold text-[#5865F2] hover:underline">+ Add Visible Test Case</button>
          </FormField>

          <hr className="border-gray-700/50 my-8" />

          {/* --- Hidden Test Cases --- */}
          <FormField label="Hidden Test Cases" tooltip="These test cases are used for final judging and are not visible to the user." error={errors.test_cases}>
            <div className="flex space-x-2 mb-4">
              <button type="button" onClick={() => setTestCaseInputMode('manual')} className={`px-4 py-2 text-sm font-semibold rounded-md ${testCaseInputMode === 'manual' ? 'bg-[#5865F2] text-white' : 'bg-[#2c2f33] text-gray-300'}`}>Manual Input</button>
              <button type="button" onClick={() => setTestCaseInputMode('json')} className={`px-4 py-2 text-sm font-semibold rounded-md ${testCaseInputMode === 'json' ? 'bg-[#5865F2] text-white' : 'bg-[#2c2f33] text-gray-300'}`}>JSON Input</button>
            </div>
            
            {testCaseInputMode === 'manual' ? (
              <div>
                {manualTestCases.map((tc, index) => (
                  <div key={index} className="grid grid-cols-12 gap-4 mb-3 p-3 bg-[#2c2f33] rounded-md">
                    <textarea value={tc.input} onChange={(e) => handleManualTestCaseChange(index, 'input', e.target.value)} placeholder={`Input for Case ${index + 1}`} rows="2" className="col-span-5 w-full bg-[#202225] border border-gray-700/50 rounded-md p-2 focus:ring-2 focus:ring-[#5865F2] focus:outline-none font-mono text-sm" />
                    <textarea value={tc.expected_output} onChange={(e) => handleManualTestCaseChange(index, 'expected_output', e.target.value)} placeholder={`Expected Output for Case ${index + 1}`} rows="2" className="col-span-6 w-full bg-[#202225] border border-gray-700/50 rounded-md p-2 focus:ring-2 focus:ring-[#5865F2] focus:outline-none font-mono text-sm" />
                    <button type="button" onClick={() => removeManualTestCase(index)} className="col-span-1 text-gray-500 hover:text-red-400 transition-colors">
                      <svg className="w-6 h-6 mx-auto" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                    </button>
                  </div>
                ))}
                <button type="button" onClick={addManualTestCase} className="mt-2 text-sm font-semibold text-[#5865F2] hover:underline">+ Add Hidden Test Case</button>
              </div>
            ) : (
              <div>
                <textarea value={jsonTestCaseInput} onChange={(e) => setJsonTestCaseInput(e.target.value)} rows="10" className="w-full bg-[#2c2f33] border border-gray-700/50 rounded-md p-2 focus:ring-2 focus:ring-[#5865F2] focus:outline-none font-mono text-sm" placeholder="Paste your test cases JSON here." />
                <button type="button" onClick={() => setJsonTestCaseInput(sampleJsonTestCases)} className="mt-2 text-xs text-[#5865F2] hover:underline">Use Sample Format</button>
              </div>
            )}
          </FormField>

          {/* --- Submission Button --- */}
          <div className="mt-10 flex justify-end pb-10">
            <button
              type="submit"
              className="bg-[#5865F2] hover:bg-[#4f5bda] text-white font-bold py-3 px-6 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#36393f] focus:ring-[#5865F2] disabled:bg-gray-500 disabled:cursor-not-allowed"
              disabled={!formIsValid && Object.keys(errors).length > 0} // Disable if there are errors
            >
              {isSubmitting ? "Creating Problem..." : "Create Problem"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateProblemPage;
