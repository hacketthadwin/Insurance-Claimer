import React, { useState, useEffect } from 'react';

const FileUploader = ({ isDarkMode, toggleTheme }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [query, setQuery] = useState('');
  // Changed answer state from string to null/object to hold the structured JSON response
  const [answer, setAnswer] = useState(null);
  const [message, setMessage] = useState(''); // State for displaying messages
  const [loading, setLoading] = useState(false); // New state for loading indicator

  // !!! IMPORTANT: Update this URL to point to your Node.js Express proxy !!!
  const BACKEND_URL = 'http://localhost:3001'; // This should match your Node.js proxy's port

  // Clear message after a few seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage('');
      }, 3000); // Message disappears after 3 seconds
      return () => clearTimeout(timer);
    }
  }, [message]);

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
    setMessage(''); // Clear any previous messages
    setAnswer(null); // Clear previous answer when a new file is selected
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setMessage('Please select a file!');
      return;
    }

    setLoading(true); // Start loading
    setMessage('Uploading and processing file...');
    setAnswer(null); // Clear previous answer

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await fetch(`${BACKEND_URL}/upload-document`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json(); // Parse response JSON

      if (response.ok) {
        setMessage(data.message); // Display success message from backend
      } else {
        setMessage(`Error: ${data.message || 'File upload failed'}`); // Display error message
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      setMessage(`Network error: ${error.message}. Make sure your Node.js proxy and Python backend are running.`);
    } finally {
      setLoading(false); // End loading
    }
  };

  const handleQuerySubmit = async (e) => {
    e.preventDefault();
    if (!query.trim()) {
      setMessage('Please enter a query!');
      return;
    }

    setLoading(true); // Start loading
    setMessage('Getting answer...');
    setAnswer(null); // Clear previous answer

    try {
      const response = await fetch(`${BACKEND_URL}/ask-query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: query }),
      });

      const data = await response.json(); // Parse response JSON

      if (response.ok) {
        // Assuming 'data' is already the structured JSON object from your RAG pipeline
        setAnswer(data); // Set the entire JSON object as the answer
        setMessage('Query answered successfully!');
      } else {
        setMessage(`Error: ${data.message || 'Failed to get answer'}`);
        setAnswer(data); // In case of error, set the error JSON if available
      }
    } catch (error) {
      console.error('Error asking query:', error);
      setMessage(`Network error: ${error.message}. Make sure your Node.js proxy and Python backend are running.`);
    } finally {
      setLoading(false); // End loading
    }
  };

  // Helper function to render the structured JSON answer
  const renderAnswer = () => {
    if (!answer) return null;

    // Check if it's an error object or the RAG output
    if (answer.error) {
      return (
        <div className="text-red-500">
          <p><strong>Error:</strong> {answer.error}</p>
          {answer.raw_output && <p>Raw Output: {answer.raw_output}</p>}
        </div>
      );
    }

    // Render the structured JSON output (decision, amount, justification)
    return (
      <div className="space-y-3">
        <p><strong>Decision:</strong> <span className="font-semibold">{answer.decision}</span></p>
        {answer.amount !== undefined && <p><strong>Amount:</strong> {answer.amount}</p>}
        {answer.justification && answer.justification.clauses && (
          <div>
            <strong>Justification:</strong>
            <ul className="list-disc pl-5">
              {answer.justification.clauses.map((clause, index) => (
                <li key={index}>
                  <p className="font-medium">Text: "{clause.text}"</p>
                  <p className="text-sm text-gray-500">Location: {clause.location}</p>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="pt-10 px-4 min-h-screen transition-colors duration-300">
      {/* Toggle Theme Button */}
      <div className="flex justify-end mb-6 w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={toggleTheme}
          className={`px-4 py-2 rounded-md transition duration-300
            ${isDarkMode
              ? 'bg-[#f1dfd1] text-black hover:bg-[#e0d0c0]'
              : 'bg-[#2d3436] text-white hover:bg-[#1a2123]'
            }`}
        >
          Switch to {isDarkMode ? 'Light' : 'Dark'} Mode
        </button>
      </div>

      {/* Message Display */}
      {message && (
        <div className={`w-full max-w-md mx-auto mb-4 p-3 rounded-lg text-center
          ${isDarkMode ? 'bg-blue-800 text-white' : 'bg-blue-100 text-blue-800'}`}>
          {message}
        </div>
      )}

      {/* Loading Indicator */}
      {loading && (
        <div className={`w-full max-w-md mx-auto mb-4 p-3 rounded-lg text-center
          ${isDarkMode ? 'bg-yellow-800 text-white' : 'bg-yellow-100 text-yellow-800'}`}>
          Loading... Please wait.
        </div>
      )}

      {/* File Upload Form */}
      <form
        onSubmit={handleSubmit}
        className={`w-full max-w-md mx-auto p-6 rounded-2xl shadow-lg border
          ${isDarkMode ? 'border-zinc-700 bg-zinc-800' : 'border-gray-200 bg-white'} space-y-6 sm:p-8`}
      >
        <div>
          <label
            htmlFor="file-upload"
            className={`block text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'} mb-1`}
          >
            Choose a file (PDF, DOCX, or TXT)
          </label>
          {/* Hidden file input */}
          <input
            id="file-upload"
            type="file"
            onChange={handleFileChange}
            className="hidden" // Hide the actual file input
            accept=".pdf,.docx,.txt" // Allow PDF, DOCX, TXT files
          />
          {/* Custom styled label acting as the "Choose File" button */}
          <label
            htmlFor="file-upload"
            className={`block w-full text-sm border rounded-md cursor-pointer px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-center
              ${isDarkMode
                ? 'border-[#f1dfd1] bg-[#f6f0ea] text-black hover:bg-[#e0d0c0]' // Light mode colors for dark mode
                : 'border-[#2d3436] bg-[#000000] text-white hover:bg-[#1a2123]' // Dark mode colors for light mode
              }`}
          >
            {selectedFile ? selectedFile.name : 'Choose File'}
          </label>
        </div>

        <button
          type="submit"
          disabled={loading} // Disable button when loading
          className={`w-full font-medium py-2 rounded-lg transition duration-300 shadow-md
            ${loading ? 'opacity-50 cursor-not-allowed' : ''}
            ${isDarkMode
              ? 'bg-gradient-to-r from-[#f1dfd1] to-[#f6f0ea] text-black hover:from-[#e0d0c0] hover:to-[#ebdfd4]'
              : 'bg-gradient-to-r from-[#2d3436] to-[#000000] text-white hover:from-[#1a2123] hover:to-[#000000]'
            }`}
        >
          {loading && message.includes('uploading') ? 'Uploading...' : 'Upload File'}
        </button>
      </form>

      {/* Query Section */}
      <div className={`w-full max-w-2xl mx-auto mt-12 p-6 rounded-2xl shadow-md border
        ${isDarkMode ? 'border-zinc-700 bg-zinc-800' : 'border-gray-200 bg-white'} space-y-6`}>
        <form onSubmit={handleQuerySubmit} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask a question about the uploaded file..."
            className={`flex-grow border
              ${isDarkMode ? 'border-zinc-600 bg-zinc-700 text-gray-200' : 'border-gray-300 text-gray-800'}
              rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500`}
            disabled={loading} // Disable input when loading
          />
          <button
            type="submit"
            disabled={loading} // Disable button when loading
            className={`px-4 py-2 rounded-lg transition
              ${loading ? 'opacity-50 cursor-not-allowed' : ''}
              ${isDarkMode
                ? 'bg-[#f1dfd1] text-black hover:bg-[#e0d0c0]'
                : 'bg-[#2d3436] text-white hover:bg-[#1a2123]'
              }`}
          >
            {loading && message.includes('Getting answer') ? 'Asking...' : 'Ask'}
          </button>
        </form>

        {answer && (
          <div className={`${isDarkMode ? 'bg-zinc-700 text-gray-200' : 'bg-gray-100 text-gray-800'} p-4 rounded-lg whitespace-pre-wrap`}>
            <strong className={`block mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Answer:</strong>
            {renderAnswer()} {/* Call renderAnswer function */}
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUploader;