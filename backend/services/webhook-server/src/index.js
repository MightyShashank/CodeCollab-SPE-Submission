const express = require('express');
const axios = require('axios');
const fs = require('fs');
const crypto = require('crypto');
const http = require('http');
const { Server } = require('socket.io'); // socker.io helps for real-time communication
const redisClient = require('./redis/redisClient'); // Import Redis client
require('dotenv').config();
const { getClient, pool } = require('./db_neon/connectDB');
const bodyParser = require("body-parser");
// const { list } = require('postcss');
// const { Storage } = require('@google-cloud/storage'); // Import GCS client
const storage = require('./storage-adapter');
const cors = require("cors");
const session = require('express-session');
const cookieParser = require('cookie-parser');
const { WebSocketServer, WebSocket } = require('ws');

const app = express();

app.use(cors({
    origin:  ['https://localhost:5175', 'https://codecollab.co.in'], // In production, change this to your frontend's domain
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const server = http.createServer(app);

// 1. Define your session middleware configuration
const sessionMiddleware = session({
    secret: '419641090eec6f5f0721109141efcfdd10be777ed5eba5e6fe1e998b74d75dec', // Put it in env, Change this to a secure secret
    resave: false,
    saveUninitialized: true,
    cookie: { secure: true } // true (since site is https)
});

app.use(cookieParser()); // Use cookie parser
app.use(sessionMiddleware);


// --- ✅ NEW: Redis Pub/Sub and WebSocket Server Setup ---

// Create a dedicated client for subscribing by duplicating your existing client.
// This is the standard pattern required by the redis library.
const redisSubscriber = redisClient.duplicate();
// It's crucial to handle errors for the new subscriber client
redisSubscriber.on('error', (err) => console.error('Redis Subscriber Error', err));

// Connect the subscriber client. We assume your main `redisClient` is already connected via its module.
redisSubscriber.connect().catch(err => {
    console.error('Failed to connect Redis Subscriber', err);
    process.exit(1);
});

// 2. Create a WebSocket server and attach it to the HTTP server
const wss = new WebSocketServer({ server });
// This map ONLY tracks connections that are physically on THIS server instance.
const localClients = new Map();

// 3. Manually implement "rooms" to track clients by submissionID
// Map<submissionID, Set<WebSocketClient>>
// const submissionClients = new Map(); THis gives issues since its local to the server

// This function is called for each new connection to keep it alive.
function heartbeat() {
  this.isAlive = true;
}

// 4. Handle new WebSocket connections, connection handling with redis pub/sub
wss.on('connection', (ws, req) => {
    sessionMiddleware(req, {}, () => {
        console.log('✅ Client connected with session:', req.sessionID);
    });

    ws.isAlive = true;
    ws.on('pong', heartbeat);

    // Assign a unique ID to this connection for local tracking
    const clientId = crypto.randomUUID();
    localClients.set(clientId, ws);
    console.log(`Client ${clientId} connected to this server instance.`);

    // Store subscription info on the WebSocket object itself for easy cleanup
    ws.subscriptions = new Map();

    ws.on('message', async (message) => {
        try {
            const data = JSON.parse(message);
            if (data.type === 'subscribe' && data.submissionID) {
                const { submissionID } = data;
                const channel = `channel:${submissionID}`;

                if (ws.subscriptions.has(channel)) return;

                console.log(`Client ${clientId} is subscribing to Redis channel: ${channel}`);
                
                const listener = (message) => {
                    const client = localClients.get(clientId);
                    if (client && client.readyState === WebSocket.OPEN) {
                        client.send(message);
                    }
                };

                ws.subscriptions.set(channel, listener);
                // Use the dedicated subscriber client to subscribe
                await redisSubscriber.subscribe(channel, listener);
            }
        } catch (error) {
            console.error('Failed to parse incoming message or subscribe:', error);
        }
    });

    ws.on('close', () => {
        console.log(`Client ${clientId} disconnected.`);
        // Unsubscribe from all Redis channels this client was listening to
        ws.subscriptions.forEach((listener, channel) => {
            redisSubscriber.unsubscribe(channel, listener);
            console.log(`Client ${clientId} unsubscribed from Redis channel: ${channel}`);
        });
        localClients.delete(clientId);
    });

    ws.on('error', (error) => {
        console.error(`WebSocket error for client ${clientId}:`, error);
    });
});


// --- NEW: Global Heartbeat Interval ---
// This runs every 25 seconds to check all connections.
const interval = setInterval(function ping() {
  wss.clients.forEach(function each(ws) {
    // If a client hasn't responded to the last ping, assume it's dead.
    if (ws.isAlive === false) return ws.terminate();

    // Reset the liveness check and send a new ping.
    ws.isAlive = false;
    ws.ping();
  });
}, 25000); // 25 seconds

// --- NEW: Clean up the interval on server shutdown ---
wss.on('close', function close() {
  clearInterval(interval);
});

// const storage = new Storage(); // Initialize GCS client
const bucketName = process.env.GCS_TESTCASES_BUCKET; // Get bucket name from .env

const JUDGE0_URL = process.env.JUDGE0_URL;

function toBase64(str) {
    return Buffer.from(str, 'utf8').toString('base64');
}

// this is a temp tracking mechanism to distinguish 2 users submission
function generateSubmissionId() {
    return crypto.randomBytes(8).toString('hex'); 
}

// Socket.IO connection (it runs everytime a new user opens our website and establishes a websocket connection)

// --- NEW: Parse Problem from URL Endpoint ---
app.post('/parse-from-url', async (req, res) => {
    const { url } = req.body;
    if (!url) {
        return res.status(400).json({ error: 'The "url" field is required.' });
    }
    if (!process.env.INTERNAL_PARSER_SERVICE_URL) {
        return res.status(500).json({ error: 'Parser service URL is not configured.' });
    }

    try {
        // Get the auth token from the header forwarded by the API Gateway
        const authToken = req.headers['x-auth-token'];
        const authHeader = authToken ? { 'Authorization': `Bearer ${authToken}` } : {};

        console.log(`Forwarding URL to parser service: ${url}`);
        
        // Make an internal, authenticated call to the URL parser service
        const parserResponse = await axios.post(
            process.env.INTERNAL_PARSER_SERVICE_URL, 
            { url: url }, 
            { headers: authHeader }
        );

        // Forward the parsed response back to the client
        res.status(200).json(parserResponse.data);

    } catch (error) {
        console.error("Error calling parser service:", error.response ? error.response.data : error.message);
        res.status(500).json({ error: 'Failed to parse problem from URL.' });
    }
});

// --- Create Problem Endpoint ---
// --- Create Problem Endpoint ---
// --- Create Problem Endpoint ---
app.post('/problems', async (req, res) => {
    const { 
        title, 
        description_md, 
        difficulty, 
        test_cases,
        visible_testcases,
        main_required,
        boilerplate_md,
        time_limit_ms,
        memory_limit_kb,
        visibility,
        actual_solution
    } = req.body;

    if (!title || !description_md || !difficulty || !test_cases || !visible_testcases) {
        return res.status(400).json({ error: 'Missing required fields.' });
    }
    if (!bucketName) {
        return res.status(500).json({ error: 'GCS_BUCKET_NAME is not configured on the server.' });
    }
    if (!process.env.INTERNAL_BOILERPLATE_URL) {
        return res.status(500).json({ error: 'Boilerplate service URL is not configured.' });
    }

    let dbClient;
    try {
        dbClient = await pool.connect();
        
        const testCasesFileName = `testcases/${crypto.randomUUID()}.json`;
        const file = storage.bucket(bucketName).file(testCasesFileName);
        const contents = JSON.stringify(test_cases, null, 2);
        await file.save(contents, { contentType: 'application/json' });
        const testcasesLink = `http://minio:9000/${bucketName}/${testCasesFileName}`;
        console.log(`Successfully uploaded test cases. Public URL: ${testcasesLink}`);

        const problemQuery = `
            INSERT INTO problems (
                title, description_md, difficulty, 
                testcases_object_link, visible_testcases,
                main_required, boilerplate_md, time_limit_ms, 
                memory_limit_kb, visibility, actual_solution
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            RETURNING problem_id;
        `;
        const problemValues = [
            title, description_md, difficulty, testcasesLink, 
            JSON.stringify(visible_testcases), main_required, boilerplate_md, 
            time_limit_ms, memory_limit_kb, visibility, actual_solution
        ];
        const dbResult = await dbClient.query(problemQuery, problemValues);
        const newProblemId = dbResult.rows[0].problem_id;
        console.log(`Successfully created problem with ID: ${newProblemId}`);

        // --- Respond to the user immediately ---
        res.status(201).json({
            message: 'Problem created successfully! Boilerplates are being generated in the background.',
            problem_id: newProblemId,
            testcases_url: testcasesLink
        });

        // --- Run the slow boilerplate generation process in the background ---
        // The function now manages its own DB client.
        generateBoilerplatesInBackground(newProblemId, boilerplate_md, req.headers['x-auth-token']);


    } catch (error) {
        console.error("Error in /problems endpoint:", error);
        if (!res.headersSent) {
            res.status(500).json({ error: 'Failed to create problem.' });
        }
    } finally {
        // This only releases the client used for the initial, fast part of the request.
        if (dbClient) {
            dbClient.release();
        }
    }
});

// --- Helper function for background processing ---
async function generateBoilerplatesInBackground(newProblemId, boilerplate_md, authToken) {
    let dbClient; // --- This function will use its own client ---
    try {
        dbClient = await pool.connect(); // --- Acquire a new client from the pool ---
        const languagesResult = await dbClient.query('SELECT language_id, language_name FROM languages_id_name_mapping');
        const allLanguages = languagesResult.rows;
        console.log(`Found ${allLanguages.length} languages to generate boilerplate for in the background.`);

        const authHeader = authToken ? { 'Authorization': `Bearer ${authToken}` } : {};

        for (const lang of allLanguages) {
            try {
                console.log(`Generating boilerplate for ${lang.language_name}...`);
                const boilerplateResponse = await axios.post(
                    process.env.INTERNAL_BOILERPLATE_URL, 
                    { language: lang.language_name, markdown: boilerplate_md },
                    { headers: authHeader }
                );
                const { function_boilerplate, main } = boilerplateResponse.data;

                const problemLangQuery = `
                    INSERT INTO problem_languages (problem_id, language_id, function_code, main_code)
                    VALUES ($1, $2, $3, $4);
                `;
                await dbClient.query(problemLangQuery, [newProblemId, lang.language_id, function_boilerplate, main]);
                console.log(`Successfully stored boilerplate for ${lang.language_name} for problem ID ${newProblemId}`);

            } catch (langError) {
                console.error(`Failed to process language ${lang.language_name}:`, langError.response ? langError.response.data : langError.message);
            }
        }
        console.log("Background boilerplate generation complete.");
    } catch (error) {
        console.error("Error during background boilerplate generation:", error);
    } finally {
        // --- Release the client used by this background task ---
        if (dbClient) {
            dbClient.release();
        }
    }
}


// --- NEW: Get All Problems (with optional filtering) ---
app.get('/problems', async (req, res) => {
    const { difficulty } = req.query;

    let dbClient;
    try {
        dbClient = await pool.connect();
        
        // Base query
        let query = 'SELECT problem_id, title, difficulty, solved_by_total FROM problems WHERE visibility = \'public\'';
        const queryParams = [];

        // Add filters dynamically
        if (difficulty) {
            queryParams.push(difficulty);
            query += ` AND difficulty = $${queryParams.length}`;
        }

        // Add ordering
        query += ' ORDER BY created_at DESC';

        const { rows } = await dbClient.query(query, queryParams);
        res.status(200).json(rows);

    } catch (error) {
        console.error("Error fetching problems:", error);
        res.status(500).json({ error: 'Failed to fetch problems.' });
    } finally {
        if (dbClient) {
            dbClient.release();
        }
    }
});

// --- NEW: Get a Single Problem by ID ---
app.get('/problems/:id', async (req, res) => {
    const { id } = req.params;
    let dbClient;
    try {
        dbClient = await pool.connect();
        const query = 'SELECT * FROM problems WHERE problem_id = $1';
        const { rows } = await dbClient.query(query, [id]);

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Problem not found.' });
        }
        res.status(200).json(rows[0]);

    } catch (error) {
        console.error(`Error fetching problem ${id}:`, error);
        res.status(500).json({ error: 'Failed to fetch problem details.' });
    } finally {
        if (dbClient) {
            dbClient.release();
        }
    }
});

// --- NEW: Get All Submissions for a User ---
app.get('/submissions/user/:userId', async (req, res) => {
    const { userId } = req.params;
    let dbClient;
    try {
        dbClient = await pool.connect();
        // Join with problems table to get the problem title
        const query = `
            SELECT 
                s.submission_id,
                s.problem_id,
                s.code,
                s.language_id,
                p.title AS problem_title,
                s.verdict,
                s.status,
                s.testcases_result_link,
                s.submitted_at
            FROM submissions s
            JOIN problems p ON s.problem_id = p.problem_id
            WHERE s.user_id = $1
            ORDER BY s.submitted_at DESC;
        `;
        const { rows } = await dbClient.query(query, [userId]);
        res.status(200).json(rows);

    } catch (error) {
        console.error(`Error fetching submissions for user ${userId}:`, error);
        res.status(500).json({ error: 'Failed to fetch submissions.' });
    } finally {
        if (dbClient) {
            dbClient.release();
        }
    }
});

// to get testcases Result link (since the Obj store cannot be accesed from FE directly)
app.get('/submissions/results/:submissionId', async (req, res) => {
    const { submissionId } = req.params;
    // We get the authenticated user's ID from the verifyToken middleware
    const userId = req.headers['x-user-id']; 

    // Print request details
    console.log(JSON.stringify({
        method: req.method,
        url: req.originalUrl,
        params: req.params,
        query: req.query,
        body: req.body,
        headers: req.headers,
        userId: req.userId
    }, null, 2));

    
    let dbClient;

    try {
        dbClient = await pool.connect();
        
        // Query for the specific submission, ensuring it belongs to the authenticated user
        const query = 'SELECT testcases_result_link FROM submissions WHERE submission_id = $1 AND user_id = $2';
        const { rows } = await dbClient.query(query, [submissionId, userId]);
        
        console.log(`submissionId = ${submissionId}`);
        console.log(`userId = ${userId}`);
        console.log(`rows = ${rows}`);

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Submission not found or you do not have permission to view it.' });
        }

        const resultsLink = rows[0].testcases_result_link;

        if (!resultsLink) {
            return res.status(404).json({ error: 'Test case results are not available for this submission yet.' });
        }

        // Fetch the content from the GCS URL
        const gcsResponse = await axios.get(resultsLink);
        
        // Forward the JSON data back to the client
        res.status(200).json(gcsResponse.data);

    } catch (error) {
        console.error(`Error fetching results for submission ${submissionId}:`, error);
        res.status(500).json({ error: 'Failed to fetch test case results.' });
    } finally {
        if (dbClient) {
            dbClient.release();
        }
    }
});


// Submit code
app.post('/submit', async (req, res) => {

    // -------------------------------
    // Step 0: Validate request body
    // -------------------------------
    const { problem_id, source_code, language_id, user_id } = req.body;

    if (!problem_id || !source_code || !language_id || !user_id) {
        return res.status(400).json({ error: 'Missing required fields.' });
    }

    let dbClient;

    try {
        // -------------------------------
        // Step 1: Fetch problem details
        // -------------------------------
        dbClient = await pool.connect();

        const problemQuery = `
            SELECT testcases_object_link
            FROM problems
            WHERE problem_id = $1
        `;
        const problemResult = await dbClient.query(problemQuery, [problem_id]);

        if (problemResult.rows.length === 0) {
            return res.status(404).json({ error: 'Problem not found.' });
        }

        const testcasesLink = problemResult.rows[0].testcases_object_link;
        if (!testcasesLink) {
            return res.status(500).json({ error: 'Test cases not found for this problem.' });
        }

        // ------------------------------------------------------
        // Step 2: Download testcases via HTTP (public MinIO)
        // ------------------------------------------------------
        let problemData;

        try {
            const testcasesResponse = await axios.get(testcasesLink);
            console.log(`testcasesResponse = ${testcasesResponse}`);
            problemData = testcasesResponse.data;
            console.log(`problemData = ${problemData}`)
        } catch (err) {
            console.error('Failed to fetch testcases:', err);
            return res.status(500).json({ error: 'Failed to load test cases.' });
        }

        // -------------------------------
        // Step 2.1: Validate testcase format
        // -------------------------------
        if (
            !problemData ||
            !Array.isArray(problemData.test_cases)
        ) {
            console.error('Invalid testcase format:', problemData);
            return res.status(500).json({ error: 'Invalid test case file format.' });
        }

        const testCases = problemData.test_cases;
        const totalTestCases = testCases.length;

        // ------------------------------------------------------
        // Step 3: Create submission record
        // ------------------------------------------------------
        const submissionID = generateSubmissionId(); // submission UUID

        const insertSubmissionQuery = `
            INSERT INTO submissions (
                user_id,
                problem_id,
                code,
                language_id,
                status,
                submission_uuid
            )
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING submission_id;
        `;

        const insertValues = [
            user_id,
            problem_id,
            source_code,
            language_id,
            'Processing',
            submissionID
        ];

        const dbResult = await dbClient.query(insertSubmissionQuery, insertValues);

        console.log(
            `Created submission record with ID: ${dbResult.rows[0].submission_id}`
        );

        // ------------------------------------------------------
        // Step 4: Initialize Redis state
        // ------------------------------------------------------
        await redisClient.set(`total_cases:${submissionID}`, totalTestCases);
        await redisClient.del(`results:${submissionID}`);

        // ------------------------------------------------------
        // Step 5: Respond to client immediately
        // ------------------------------------------------------
        res.status(202).json({ submissionID });

        // ------------------------------------------------------
        // Step 6: Prepare Judge0 callback URL
        // ------------------------------------------------------
        const callbackUrl =
            `${process.env.CODECOLLAB_WEBHOOK_BASE_URL}/${submissionID}`;

        console.log(`Judge0 callback URL: ${callbackUrl}`);

        // ------------------------------------------------------
        // Step 7: Submit testcases to Judge0 (sequential)
        // ------------------------------------------------------
        for (const testCase of testCases) {
            try {
                const judgeResponse = await axios.post(JUDGE0_URL, {
                    language_id,
                    source_code: toBase64(source_code),
                    stdin: toBase64(testCase.input),
                    expected_output: toBase64(testCase.expected_output),
                    callback_url: callbackUrl,
                });

                const token = judgeResponse.data.token;

                if (token) {
                    await redisClient.set(
                        `token:${token}`,
                        JSON.stringify(testCase),
                        { EX: 3600 } // 1 hour TTL
                    );
                }

            } catch (judgeError) {
                console.error('Judge0 submission error:', judgeError.message);
            }
        }

        // Judge0 → webhook → Redis aggregation → Socket.IO emit

    } catch (error) {
        console.error('Error in /submit:', error);
        res.status(500).json({ error: 'Internal server error.' });
    } finally {
        if (dbClient) {
            dbClient.release();
        }
    }
});



// --- Webhook Endpoint to Receive Judge0 Results ---
// --- Webhook Endpoint to Receive Judge0 Results ---

app.get('/webhook/test', (req, res) => {
    console.log('✅✅✅ Canary test endpoint was successfully reached! ✅✅✅');
    res.status(200).send('Webhook service is alive!');
});

app.put('/webhook/:submissionID', async (req, res) => {
    const { submissionID } = req.params;
    const resultPayload = req.body;
    res.status(200).send("OK");

    try {
        const token = resultPayload.token;
        if (!token) {
            console.error("Webhook received without a token.");
            return;
        }

        const testCaseJSON = await redisClient.get(`token:${token}`);
        if (!testCaseJSON) {
            console.error(`No test case data found for token: ${token}`);
            return;
        }
        const testCaseData = JSON.parse(testCaseJSON);

        const combinedResult = {
            ...resultPayload,
            input: testCaseData.input,
            expected_output: testCaseData.expected_output
        };
        
        console.log(`Combined Result = ${JSON.stringify(combinedResult)}`);

        // Use your original `redisClient` to PUBLISH the 'result' message
        const resultMessage = JSON.stringify({ type: 'result', payload: combinedResult });
        await redisClient.publish(`channel:${submissionID}`, resultMessage);
        console.log(`Published 'result' message to channel: channel:${submissionID}`);

        // Replaced io.to().emit() with our manual broadcast function
        // const subscribers = submissionClients.get(submissionID);
        // if (subscribers) {
        //     // The message must be stringified and should have a type for the client to parse
        //     const message = JSON.stringify({ type: 'result', payload: combinedResult });
        //     subscribers.forEach(client => {
        //         // Only send to open connections
        //         if (client.readyState === require('ws').OPEN) {
        //             client.send(message);
        //         }
        //     });
        //     console.log(`Forwarded result for submission ${submissionID} to ${subscribers.size} client(s).`);
        // }

        const listLength = await redisClient.rPush(`results:${submissionID}`, JSON.stringify(combinedResult));
        const totalTestCases = parseInt(await redisClient.get(`total_cases:${submissionID}`), 10);

        if (listLength >= totalTestCases) {
            console.log(`All ${totalTestCases} test cases received for ${submissionID}. Finalizing...`); 
            
            const dbClient = await pool.connect();
            try {
                // --- Get problem_id and limits from DB ---
                const submissionQuery = await dbClient.query('SELECT problem_id FROM submissions WHERE submission_uuid = $1', [submissionID]);
                if (submissionQuery.rows.length === 0) throw new Error('Submission not found in DB');
                const problemId = submissionQuery.rows[0].problem_id;

                const problemQuery = await dbClient.query('SELECT time_limit_ms, memory_limit_kb FROM problems WHERE problem_id = $1', [problemId]);
                if (problemQuery.rows.length === 0) throw new Error('Problem not found in DB');
                const { time_limit_ms, memory_limit_kb } = problemQuery.rows[0];

                // --- Process results with limits ---
                const resultsRaw = await redisClient.lRange(`results:${submissionID}`, 0, -1);
                const results = resultsRaw.map(res => JSON.parse(res));
                
                let finalVerdict = 'Accepted';
                let maxTime = 0;
                let maxMemory = 0;

                let processedResults = results.map(result => {
                    const actualOutput = result.stdout ? Buffer.from(result.stdout, 'base64').toString('utf8').trim() : '';
                    const expectedOutput = result.expected_output ? String(result.expected_output).trim() : '';
                    
                    let testCaseVerdict = 'Accepted';
                    if (!result.status || result.status.id > 4) { // Compile Error, Runtime Error etc.
                        testCaseVerdict = result.status ? result.status.description : 'Runtime Error';
                    } else if (result.status.id === 4) { // Wrong Answer
                        testCaseVerdict = 'Wrong Answer';
                    } else if (result.time * 1000 > time_limit_ms) {
                        testCaseVerdict = 'Time Limit Exceeded';
                    } else if (result.memory > memory_limit_kb) {
                        testCaseVerdict = 'Memory Limit Exceeded';
                    } else if (actualOutput !== expectedOutput) {
                        testCaseVerdict = 'Wrong Answer';
                    }

                    if (testCaseVerdict !== 'Accepted') {
                        finalVerdict = 'Rejected';
                    }

                    if (result.time && parseFloat(result.time) > maxTime) maxTime = parseFloat(result.time);
                    if (result.memory && parseInt(result.memory) > maxMemory) maxMemory = parseInt(result.memory);

                    return {
                        judge0_response: result, 
                        input: result.input,
                        expected_output: expectedOutput,
                        user_output: actualOutput,
                        verdict: testCaseVerdict,
                        time_seconds: result.time,
                        memory_kb: result.memory,
                        status: result.status,
                    };
                });

                processedResults = processedResults.map(result => ({
                    ...result, // Copy all existing fields from the result object
                    finalVerdict: finalVerdict // Add the new finalVerdict field
                }));
                
                        
                let resultsLink = null;
                if (bucketName) {
                    try {
                        const fileName = `results/${submissionID}.json`;
                        const file = storage.bucket(bucketName).file(fileName);
                        const contents = JSON.stringify(processedResults, null, 2);
                        await file.save(contents, { contentType: 'application/json' });
                        resultsLink = `http://minio:9000/${bucketName}/${fileName}`;
                        console.log(`Successfully uploaded results to ${resultsLink}`);
                    } catch (gcsError) {
                        console.error(`Failed to upload results for ${submissionID} to GCS:`, gcsError);
                    }
                }
                
                const updateQuery = `
                    UPDATE submissions
                    SET verdict = $1, status = $2, time_taken_ms = $3, memory_taken_kb = $4, testcases_result_link = $5
                    WHERE submission_uuid = $6;
                `;
                const values = [finalVerdict, 'Completed', Math.round(maxTime * 1000), maxMemory, resultsLink, submissionID];
                await dbClient.query(updateQuery, values);
                console.log(`Finalized submission ${submissionID} in PostgreSQL.`);

                // PUBLISH the final 'completed' message with all processed results
                const finalMessage = JSON.stringify({ type: 'completed', payload: { verdict: finalVerdict, results: processedResults } });
                await redisClient.publish(`channel:${submissionID}`, finalMessage);
                console.log(`Published 'completed' message to channel: channel:${submissionID}`);

                for (const result of results) {
                    if (result.token) {
                        await redisClient.del(`token:${result.token}`);
                    }
                }
                await redisClient.del(`results:${submissionID}`);
                await redisClient.del(`total_cases:${submissionID}`);

            } finally {
                dbClient.release();
            }
        }
    } catch (error) {
        console.error(`Error processing webhook for ${submissionID}:`, error);
    }
});

// --- NEW: Get a Single Problem with Boilerplate for a Specific Language ---
app.get('/display_problem/:problem_id', async (req, res) => {
    const { problem_id } = req.params;
    // ✅ FIX: The backend now expects 'language_id'. We default to 62 (Java) if not provided.
    const language_id = parseInt(req.query.language_id || '62', 10); 

    let dbClient;
    try {
        dbClient = await pool.connect();

        // Step 1: Get the main problem details (No change here)
        const problemQuery = 'SELECT * FROM problems WHERE problem_id = $1';
        const problemResult = await dbClient.query(problemQuery, [problem_id]);

        if (problemResult.rows.length === 0) {
            return res.status(404).json({ error: 'Problem not found.' });
        }
        const problem = problemResult.rows[0];

        // ✅ FIX: Step 2 is now removed. We don't need to look up the language ID anymore.
        
        // Step 3: Get the language-specific code directly using problem_id and language_id
        const boilerplateQuery = 'SELECT function_code, main_code FROM problem_languages WHERE problem_id = $1 AND language_id = $2';
        // The query now uses the language_id passed from the frontend.
        const boilerplateResult = await dbClient.query(boilerplateQuery, [problem_id, language_id]);
        
        if (boilerplateResult.rows.length === 0) {
            return res.status(404).json({ error: `Boilerplate for the selected language not found for this problem.` });
        }
        const { function_code, main_code } = boilerplateResult.rows[0];

        // Step 4: Construct the final response object (No change here)
        const responsePayload = {
            problem_details: problem,
            function_boilerplate: function_code,
        };

        if (problem.main_required === true) { // is the main required
            responsePayload.main_code = main_code;
        }

        res.status(200).json(responsePayload);

    } catch (error) {
        console.error(`Error fetching display problem ${problem_id}:`, error);
        res.status(500).json({ error: 'Failed to fetch problem details.' });
    } finally {
        if (dbClient) {
            dbClient.release();
        }
    }
});

// Health check endpoint
app.get("/healthy", (req, res) => {
  res.send("healthy");
});

// ✅ FIX: Add this global error handler at the VERY END of your file.
// This will catch errors from any middleware (like express.json()) that runs
// before your route handlers.
app.use((err, req, res, next) => {
  // Log the error to your console
  console.error('--- GLOBAL ERROR HANDLER CAUGHT ---');
  console.error('Error occurred at:', new Date().toISOString());
  console.error('Request Path:', req.path);
  console.error('Error Details:', err);

  // Send a generic error response back to the client (Judge0)
  if (!res.headersSent) {
    res.status(500).send({ error: 'An unexpected server error occurred.' });
  }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
