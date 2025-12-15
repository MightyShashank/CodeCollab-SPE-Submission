import React, { useEffect, useState } from 'react';
import { Remarkable } from 'remarkable';
import { useRecoilState } from 'recoil';
import { parsedProblemState } from '@/recoil/atoms/problemAtoms';
// import { formatProblemMarkdown } from '@/utils/link_markdown_formatting';
import ProblemDisplay from '@/utils/ProblemDisplay';

// The base URL of your deployed API
const API_URL = ' http://localhost:8085';

export default function SolveByLinkPage() {
  const [url, setUrl] = useState('');
  const [problemData, setProblemData] = useRecoilState(parsedProblemState);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const md = new Remarkable();

  const handleLoadProblem = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    // setProblemMarkdown(''); // we clear the global state on a new load

    try {
      // The request is sent to your API Gateway, which then routes it
      // to the url-parser-internal service.
        const response = await fetch(`${API_URL}/parse-from-url`, {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json',
            // The browser will automatically send the httpOnly cookie with the JWT,
            // which the API Gateway will use for verification.
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
            body: JSON.stringify({ url }),
            // --- FIXED: This is crucial for sending the auth cookie ---
            credentials: 'include',
        });


        const data = await response.json();

        console.log(JSON.stringify(data));

        if (!response.ok) {
            throw new Error(data.error || 'Failed to load problem from the provided URL.');
        }

            // properties: {
            //     title: { type: "STRING" },
            //     description_md: { type: "STRING" },
            //     constraints_md: { type: "STRING" },
            //     examples_md: { type: "STRING" },
            //     final_md: { type: "STRING" }, // Added the new field
            // }

        // first lets run the markdown through a standardized format
        //   const beautifulMarkdown = formatProblemMarkdown(data);
        // Set the state with the final combined markdown from the backend
        setProblemData(data);

        

    } catch (err) {
      setError(err.message);
      console.error("Error loading problem by link:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="text-white w-full max-w-4xl mx-auto p-6">
      <h2 className="text-3xl font-bold mb-6">Load Problem from URL</h2>
      <form onSubmit={handleLoadProblem} className="flex items-center gap-x-4 mb-8">
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Enter LeetCode, CodeChef, or Codeforces URL"
          className="flex-1 p-3 bg-zinc-700 rounded-md border border-zinc-600 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          required
        />
        <button
          type="submit"
          disabled={isLoading}
          className="p-3 bg-indigo-600 rounded-md font-semibold hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? 'Loading...' : 'Load Problem'}
        </button>
      </form>

      {/* Display any errors that occur */}
      {error && (
        <div className="bg-red-900 bg-opacity-50 border border-red-700 text-red-300 p-4 rounded-md">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      )}

      {/* Render the parsed markdown content */}
      {/* {problemMarkdown && (
        <div 
          className="prose prose-invert max-w-none bg-zinc-900 p-6 rounded-md border border-zinc-700 mt-6"
          dangerouslySetInnerHTML={{ __html: md.render(problemMarkdown) }}
        />
      )} */}

        {/* Now render the Problem Display but in the /solve page 
        {problemData ? (
            <ProblemDisplay 
            title={problemData.title}
            description={problemData.description_md}
            examples={problemData.examples_md}
            constraints={problemData.constraints_md}
            />
        ) : (
            <p></p>
        )} */}
    </div>
  );
};
