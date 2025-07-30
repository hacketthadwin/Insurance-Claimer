# Insurance-Claimer
![Project Status](https://img.shields.io/badge/Status-Complete-brightgreen)
![Frontend](https://img.shields.io/badge/Frontend-React-61DAFB?logo=react&logoColor=white)
![Backend](https://img.shields.io/badge/Backend-Node.js-339933?logo=nodedotjs&logoColor=white)
![AI/ML](https://img.shields.io/badge/AI%20Core-Python%20%7C%20Gemini%20%7C%20LangChain-FF6347?logo=python&logoColor=white)


A smart, full-stack AI-powered system designed to evaluate natural language insurance queries against long, unstructured policy documents.

This project implements a **Retrieval Augmented Generation (RAG)** pipeline using **Gemini Pro** for embedding generation and **LangChain** for robust retrieval and decision logic — all exposed via a **Node.js backend** and a **React frontend**.

---

## 🌐 Overview

This application provides an interactive platform for users to query large insurance policy documents using natural language. It returns:

- ✅ **Decision**: Approved / Rejected  
- 💰 **Amount**: (if applicable)  
- 📊 **Justification**: With clearly referenced clauses  

All decisions are backed by **semantic search** using Gemini-generated embeddings and a **LangChain RAG pipeline**.

---

## 👨‍💻 Use Case Example

### 🔹 Query (from Web Frontend):

> `"46-year-old male, knee surgery in Pune, 3-month-old insurance policy"`

### 🔹 Expected Output (displayed on Frontend / from Backend API):

```json
{
  "decision": "approved",
  "amount": 0,
  "justification": {
    "clauses": [
      {
        "text": "During the first year of Global Health Care Policy with Us, 90 days waiting period would be applicable for all claims under Physiotherapy Benefit except those arising out of Accidental Injury...",
        "location": "Page 2, Clause 3a"
      },
      {
        "text": "...30 days waiting period applicable for all outpatient claims...",
        "location": "Page 2, Clause 1a"
      }
    ]
  }
}
```
## 🚀 Features

- 🔍 **Semantic Retrieval** – Handles vague or incomplete natural language queries  
- 🔄 **RAG Pipeline** – Built using LangChain  
- 📚 **Clause Mapping** – Shows which clause backs each decision  
- 🌐 **Interactive Web Interface** – Built with React.js  
- ⚡ **Robust Backend** – Powered by Express.js  
- 🪧 **Healthcare-specific Use Case** – Built for insurers and TPAs  

---

## ⚖️ Architecture
<details>
<summary>📦 Click to Expand: Text Architecture Diagram</summary>

```
[React Frontend]
        |
        v
[Node.js Backend API]
        |
        v
[Python AI Core (LangChain/Gemini)]
     |                      |
     v                      v
[Google Gemini API]   [Local Vector DB (FAISS)]
     \_____________________/
              |
              v
   Decision + Justification
              |
              v
[Structured JSON → Frontend]
```

</details>


## ⚙️ Tech Stack

### 🧠 AI/ML Core (Python)

- **Embeddings**: Gemini Pro (via Google Generative AI SDK)  
- **Framework**: LangChain  
- **Vector DB**: FAISS (in-memory)  
- **LLM for Reasoning**: Gemini Pro  
- **Interactive Dev**: Jupyter Notebook  
- **Env Management**: `pip`, `requirements.txt`  

---

### 🔙 Backend (Node.js)

- **Runtime**: Node.js  
- **Web Framework**: Express.js  
- **Environment**: `dotenv`  
- **Communication**: Bridges frontend ↔ AI core  
- **Package Manager**: npm  

---

### 🎨 Frontend (React)

- **Framework**: React.js  
- **Styling**: Tailwind CSS  
- **Build Tool**: Create React App  
- **Package Manager**: npm  

---

### 🛠️ Dev Tools

- **Code Editor**: VS Code  
- **Version Control**: Git  

---

## 📂 Project Structure

```plaintext
.
├── backend/
│   ├── node_modules/
│   ├── .env
│   ├── index.js
│   ├── package-lock.json
│   └── package.json
├── frontend/
│   ├── node_modules/
│   ├── public/
│   └── src/
│       ├── components/
│       ├── App.js
│       ├── App.test.js
│       ├── global.css
│       ├── index.css
│       ├── index.js
│       ├── reportWebVital.js
│       └── setupTests.js
├── python/
│   ├── main.py
│   ├── insurance_policy.pdf
│   ├── utils.py
│   ├── prompts.py
│   ├── .env
│   ├── notebook.ipynb
│   └── requirements.txt
├── .env
├── .gitignore
├── package-lock.json
├── package.json
├── README.md
└── tailwind.config.js
```
