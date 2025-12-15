// filename: index.js

import express from 'express';
import { GoogleGenerativeAI } from "@google/generative-ai";
import 'dotenv/config';

// --- Initialization ---
const app = express();
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
// UPDATED: Switched to gemini-1.5-flash for better free-tier stability
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// --- Delay Utility ---
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * ROBUST WRAPPER: Handles API calls with exponential backoff for Rate Limits (429)
 */
async function generateWithRetry(prompt, schema, retries = 3) {
    try {
        const generationConfig = {
            responseMimeType: "application/json",
            responseSchema: schema
        };

        return await model.generateContent({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig,
        });

    } catch (error) {
        // Check if it's a Rate Limit (429) or Service Unavailable (503)
        if ((error.status === 429 || error.status === 503) && retries > 0) {
            let delay = 5000; // Default wait 5s

            // Try to extract the specific wait time from Google's error object
            const retryInfo = error.errorDetails?.find(
                d => d['@type'] === 'type.googleapis.com/google.rpc.RetryInfo'
            );
            
            if (retryInfo?.retryDelay) {
                const seconds = parseFloat(retryInfo.retryDelay.replace('s', ''));
                // Add 1s buffer to be safe
                delay = (seconds * 1000) + 1000; 
            }

            console.warn(`[Rate Limit] Pausing for ${delay}ms before retry... (Retries left: ${retries})`);
            await sleep(delay);
            
            // Recursive retry
            return generateWithRetry(prompt, schema, retries - 1);
        }
        
        // If it's not a rate limit error, or we ran out of retries, throw it up the chain
        throw error; 
    }
}


/**
 * 1. AI-Powered Hints Endpoint
 */
app.post('/hint', async (req, res) => {
    const { problem_markdown, user_code } = req.body;

    if (!problem_markdown || !user_code) {
        return res.status(400).json({ error: 'Fields "problem_markdown" and "user_code" are required.' });
    }

    try {
        const prompt = `
            You are a world-class coding tutor. A student is stuck on a programming problem.
            Your task is to provide a single, concise, non-spoilery hint to guide them.
            Do not give away the solution. Focus on the logical next step or a concept they might be missing.

            Problem Description:
            ---
            ${problem_markdown}
            ---

            User's Current Code:
            ---
            ${user_code}
            ---

            Return your response as a single JSON object with the following structure: {"hint": "Your hint here."}.
        `;

        const schema = {
            type: "OBJECT",
            properties: { hint: { type: "STRING" } },
            required: ["hint"],
        };

        console.log("Generating hint...");
        const result = await generateWithRetry(prompt, schema);
        res.status(200).json(JSON.parse(result.response.text()));

    } catch (error) {
        console.error("Error generating hint:", error.message);
        res.status(500).json({ error: 'Failed to generate hint.' });
    }
});


/**
 * 2. Code Explanation and Optimization Endpoint
 */
app.post('/explain', async (req, res) => {
    const { code, language } = req.body;

    if (!code || !language) {
        return res.status(400).json({ error: 'Fields "code" and "language" are required.' });
    }

    try {
        const prompt = `
            You are an expert code analyst. You will be given a code snippet and its programming language.
            Your task is to provide a detailed analysis.

            1.  Explanation: Explain the code's logic and algorithm step-by-step.
            2.  Time Complexity: Determine and state the time complexity (e.g., O(n), O(n log n)).
            3.  Space Complexity: Determine and state the space complexity (e.g., O(1), O(n)).
            4.  Optimization Suggestion: Provide one clear, actionable suggestion on how the code could be optimized for performance or readability.

            Code Snippet (${language}):
            ---
            ${code}
            ---

            Return your response as a single JSON object with the following structure:
            {
                "explanation": "...",
                "time_complexity": "...",
                "space_complexity": "...",
                "optimization_suggestion": "..."
            }
        `;

        const schema = {
            type: "OBJECT",
            properties: {
                explanation: { type: "STRING" },
                time_complexity: { type: "STRING" },
                space_complexity: { type: "STRING" },
                optimization_suggestion: { type: "STRING" },
            },
            required: [
                "explanation",
                "time_complexity",
                "space_complexity",
                "optimization_suggestion"
            ],
        };

        console.log("Generating code explanation...");
        const result = await generateWithRetry(prompt, schema);
        res.status(200).json(JSON.parse(result.response.text()));

    } catch (error) {
        console.error("Error generating explanation:", error.message);
        res.status(500).json({ error: 'Failed to generate explanation.' });
    }
});


/**
 * 3. Intelligent Code Debugging Endpoint
 */
app.post('/debug', async (req, res) => {
    const { problem_markdown, user_code, failed_test_case } = req.body;

    if (!problem_markdown || !user_code || !failed_test_case) {
        return res.status(400).json({
            error: 'Fields "problem_markdown", "user_code", and "failed_test_case" are required.'
        });
    }

    try {
        const prompt = `
            You are an expert debugging assistant. A user's code has failed on a specific test case.
            Your task is to analyze the problem, the user's code, and the failed test case to identify the logical error.
            Explain the error clearly and provide a suggestion on how to fix it.

            Problem Description:
            ---
            ${problem_markdown}
            ---

            User's Failed Code:
            ---
            ${user_code}
            ---

            Failed Test Case:
            ---
            Input: ${failed_test_case.input}
            User's Output: ${failed_test_case.user_output}
            Expected Output: ${failed_test_case.expected_output}
            Compilation Error: ${failed_test_case.compilation_error}
            ---

            Return your response as a single JSON object with the following structure:
            {
                "error_analysis": "A clear explanation of the logical error.",
                "fix_suggestion": "A suggestion on how to approach the fix."
            }
        `;

        const schema = {
            type: "OBJECT",
            properties: {
                error_analysis: { type: "STRING" },
                fix_suggestion: { type: "STRING" },
            },
            required: ["error_analysis", "fix_suggestion"],
        };

        console.log("Generating debugging analysis...");
        const result = await generateWithRetry(prompt, schema);
        res.status(200).json(JSON.parse(result.response.text()));

    } catch (error) {
        console.error("Error generating debug analysis:", error.message);
        res.status(500).json({ error: 'Failed to generate debug analysis.' });
    }
});


// --- Health Check ---
app.get('/healthy', (req, res) => {
    res.status(200).send('healthy');
});

// --- Start the Server ---
const PORT = process.env.PORT || 6000;
app.listen(PORT, () => {
    console.log(`Problem AI service running on port ${PORT}`);
});