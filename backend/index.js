const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const multer = require('multer'); // For handling multipart/form-data (file uploads)
const axios = require('axios'); // For making HTTP requests to the Python backend

// Load environment variables from .env file
dotenv.config();

const app = express();
const NODE_PORT = 3001; // Port for this Node.js Express proxy server
const PYTHON_FLASK_URL = 'http://localhost:5001'; // URL of your Python Flask RAG backend

// --- Multer setup for file uploads ---
// We configure multer to store files in memory as a buffer.
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// --- Express Middleware ---
// Enable CORS for all origins.
app.use(cors());
// Enable parsing of JSON request bodies.
app.use(express.json());

// --- Proxy API Endpoints ---

/**
 * Handles file uploads from the React frontend.
 * This endpoint expects a single file under the field name 'file'.
 * It forwards the received file to the Python Flask backend's /upload-document endpoint.
 */
app.post('/upload-document', upload.single('file'), async (req, res) => {
    console.log("Node.js Proxy: Received file upload request from frontend.");

    // Check if a file was actually provided in the request
    if (!req.file) {
        return res.status(400).json({ message: "No file provided in the request." });
    }

    try {
        const formData = new FormData();
        formData.append('file', new Blob([req.file.buffer], { type: req.file.mimetype }), req.file.originalname);

        console.log(`Node.js Proxy: Forwarding file '${req.file.originalname}' to Python backend at ${PYTHON_FLASK_URL}/upload-document`);

        const pythonResponse = await axios.post(`${PYTHON_FLASK_URL}/upload-document`, formData, {
            maxBodyLength: Infinity,
            maxContentLength: Infinity,
        });

        console.log("Node.js Proxy: File upload response received from Python backend.");
        res.status(pythonResponse.status).json(pythonResponse.data);

    } catch (error) {
        console.error("Node.js Proxy: Error forwarding upload to Python backend:");
        if (error.response) {
            console.error("  Python backend responded with error status:", error.response.status);
            console.error("  Python backend error data:", error.response.data);
            res.status(error.response.status).json(error.response.data);
        } else if (error.request) {
            console.error("  No response received from Python backend. Is it running at", PYTHON_FLASK_URL + "?");
            res.status(503).json({
                message: "Service Unavailable: Python backend is not responding or is unreachable.",
                details: error.message
            });
        } else {
            console.error("  Error setting up proxy request:", error.message);
            res.status(500).json({
                message: `Proxy internal error: ${error.message}`,
                details: "An unexpected error occurred in the Node.js proxy while preparing the request."
            });
        }
    }
});

/**
 * Handles query requests from the React frontend.
 * This endpoint expects a JSON body with a 'query' field.
 * It forwards the query to the Python Flask backend's /ask-query endpoint.
 * IT INCLUDES LOGIC TO CLEAN THE PYTHON BACKEND'S RESPONSE.
 */
app.post('/ask-query', async (req, res) => {
    console.log("Node.js Proxy: Received query request from frontend.");

    const { query } = req.body;
    // Validate if the query string is provided
    if (!query) {
        return res.status(400).json({ message: "No query string provided in the request body." });
    }

    try {
        console.log(`Node.js Proxy: Forwarding query '${query}' to Python backend at ${PYTHON_FLASK_URL}/ask-query`);

        const pythonResponse = await axios.post(`${PYTHON_FLASK_URL}/ask-query`, { query: query }, {
            headers: { 'Content-Type': 'application/json' },
        });

        console.log("Node.js Proxy: Query response received from Python backend.");

        // --- START: Clean the raw output from the Python backend ---
        let responseData = pythonResponse.data;

        // Check if the response is a string that needs cleaning
        if (typeof responseData === 'string') {
            console.log("Node.js Proxy: Response from Python is a string. Attempting to clean and parse.");
            try {
                // Find the first '{' and the last '}' to extract the JSON object
                const jsonStart = responseData.indexOf('{');
                const jsonEnd = responseData.lastIndexOf('}');

                if (jsonStart !== -1 && jsonEnd > jsonStart) {
                    const jsonString = responseData.substring(jsonStart, jsonEnd + 1);
                    // Parse the extracted string into a JavaScript object
                    responseData = JSON.parse(jsonString);
                    console.log("Node.js Proxy: Successfully parsed the cleaned JSON string.");
                } else {
                    // If we can't find a JSON object, we log it but still send the raw data
                    console.log("Node.js Proxy: Could not find a valid JSON object within the string.");
                }
            } catch (parseError) {
                // If parsing fails, log the error and send the original, un-parsed data
                console.error("Node.js Proxy: Error parsing the cleaned string from Python backend.", parseError);
                // 'responseData' remains the original problematic string in this case
            }
        }
        // --- END: Clean the raw output ---

        // Send the (potentially cleaned) response data back to the React frontend.
        res.status(pythonResponse.status).json(responseData);

    } catch (error) {
        // --- Error Handling for Axios requests to Python Backend ---
        console.error("Node.js Proxy: Error forwarding query to Python backend:");
        if (error.response) {
            console.error("  Python backend responded with error status:", error.response.status);
            console.error("  Python backend error data:", error.response.data);
            res.status(error.response.status).json(error.response.data);
        } else if (error.request) {
            console.error("  No response received from Python backend. Is it running at", PYTHON_FLASK_URL + "?");
            res.status(503).json({
                message: "Service Unavailable: Python backend is not responding or is unreachable.",
                details: error.message
            });
        } else {
            console.error("  Error setting up proxy request:", error.message);
            res.status(500).json({
                message: `Proxy internal error: ${error.message}`,
                details: "An unexpected error occurred in the Node.js proxy while preparing the request."
            });
        }
    }
});

// --- Start the Node.js proxy server ---
app.listen(NODE_PORT, () => {
    console.log(`Node.js Proxy server is listening on http://localhost:${NODE_PORT}`);
    console.log(`It will forward all /upload-document and /ask-query requests`);
    console.log(`to your Python Flask backend at ${PYTHON_FLASK_URL}`);
    console.log("\n--- IMPORTANT SETUP CHECK ---");
    console.log(`1. Ensure your Python Flask backend is RUNNING on ${PYTHON_FLASK_URL}`);
    console.log(`2. Ensure your React frontend's BACKEND_URL constant is set to http://localhost:${NODE_PORT}`);
    console.log("-----------------------------\n");
});