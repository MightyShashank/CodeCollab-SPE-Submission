// filename: parser-server.js

const express = require('express');
const puppeteer = require('puppeteer'); // Import Puppeteer
const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();
const cors = require("cors");


// --- Initialization ---
const app = express();

app.use(cors({
    origin:  ['https://localhost:5175', 'https://codecollab.co.in'], // In production, change this to your frontend's domain
    credentials: true
}));

// Increase the request body size limit to handle large HTML pages
app.use(express.json({ limit: '10mb' }));


// Access your API key from environment variables
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// --- API Endpoint ---
app.post('/parse-problem-url', async (req, res) => {
    const { url } = req.body;

    // --- 1. Validate Input ---
    if (!url) {
        return res.status(400).json({ error: 'The "url" field is required.' });
    }

    let browser = null;
    try {
        let html_content;

        // --- Step 1.5: Launch a headless browser and fetch the page's body HTML ---
        try {
            console.log(`Launching browser to fetch content from: ${url}`);
            browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] }); // Important for Docker
            const page = await browser.newPage();

            await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
            
            await page.goto(url, { waitUntil: 'networkidle2', timeout: 9000000 }); // Wait for page to be reasonably loaded, increased timeout

            // --- NEW: Extract the HTML of the entire body ---
            // This is a more generic approach that doesn't rely on site-specific selectors.
            html_content = await page.evaluate(() => document.body.innerHTML);
            
            if (!html_content || html_content.length < 200) { // Check for a reasonable amount of content
                throw new Error("Extracted HTML content is too short, page might be a login wall or CAPTCHA.");
            }
            console.log(`Successfully fetched HTML content (${html_content.length} characters).`);

        } catch (scrapeError) {
            console.error("Scraping failed:", scrapeError.message);
            // Return a more specific error to the user
            return res.status(500).json({ error: 'Failed to scrape the problem content from the URL. The site may be blocking the request or the layout has changed.' });
        } finally {
            if (browser) {
                await browser.close();
            }
        }

        // --- 2. Select the Gemini Model ---
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        // --- 3. Construct the Prompt ---
        const prompt = `
            You are an expert web page parser and content formatter specializing in competitive programming problems.
            You will be given the raw HTML content of a problem page's body.
            Your task is to analyze the HTML, find the main problem content, and extract the key components.
            After extracting the components, you must combine them into a single, clean, and well-formatted Markdown document.

            You MUST return the output as a single, valid JSON object. The JSON should contain the following fields:
            - "title": The title of the problem.
            - "description_md": The full problem description, formatted in Markdown.
            - "constraints_md": A list of all constraints, formatted in Markdown.
            - "examples_md": All examples, including input, output, and explanation, formatted in Markdown.
            - "final_md": A single Markdown string that combines the title, description, examples, and constraints into a beautiful, readable document ready for rendering. Use headings like '## Description', '## Examples', and '## Constraints'.

            Here is the raw HTML content:
            ---
            ${html_content}
            ---
        `;

        // --- 4. Define the Expected JSON Schema for the Response ---
        const generationConfig = {
            responseMimeType: "application/json",
            responseSchema: {
                type: "OBJECT",
                properties: {
                    title: { type: "STRING" },
                    description_md: { type: "STRING" },
                    constraints_md: { type: "STRING" },
                    examples_md: { type: "STRING" },
                    final_md: { type: "STRING" }, // Added the new field
                },
                required: ["title", "description_md", "constraints_md", "examples_md", "final_md"], // Added the new field
            },
        };

        // --- 5. Call the Gemini API ---
        console.log("Parsing HTML content with Gemini...");
        const result = await model.generateContent({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig,
        });
        
        const response = result.response;
        const responseText = response.text();
        
        // --- 6. Parse and Send the Response ---
        const parsedProblem = JSON.parse(responseText);
        
        console.log("Successfully parsed problem from HTML.");
        res.status(200).json(parsedProblem);

    } catch (error) {
        console.error("Error during Gemini API call:", error);
        res.status(500).json({ error: 'Failed to parse problem using the LLM.' });
    }
});

app.get('/healthy', (req, res) => {
    res.status(200).send('healthy');
});

// --- Start the Server ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Problem parsing server running on port ${PORT}`);
});
