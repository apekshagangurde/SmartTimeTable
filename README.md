# Asha AI Chatbot

## Overview
Asha AI Chatbot enhances user engagement on the **JobsForHer Foundation** platform by providing real-time access to job listings, mentorship programs, and career-related resources. Built with ethical AI principles, Asha ensures inclusive and unbiased interactions while leveraging advanced NLP and retrieval-augmented generation (RAG) techniques.

## Features
- 🔍 **Job Search**: Fetches job listings from external APIs
- 🎓 **Mentorship Matching**: Connects users with career mentors
- 📅 **Event Information**: Retrieves details about women empowerment events
- 🧠 **Context-Aware Conversations**: Handles multi-turn interactions smoothly
- 🚀 **Bias Detection**: Prevents gender-biased responses
- 🔐 **Privacy-Focused**: Ensures secure data handling

---

## Main Application Files

### Root Directory
- **`main.py`**: Entry point to run the Flask application.
- **`app.py`**: Core Flask app containing route definitions and API endpoints.
- **`.replit` & `replit.nix`**: Replit configuration files.
- **`pyproject.toml`**: Defines Python project dependencies.
- **`uv.lock`**: Lock file ensuring dependency version consistency.

### **Services Directory (`/services`)**
- **`analytics.py`**: Tracks user interactions and engagement metrics.
- **`bias_detection.py`**: Implements NLP-based bias detection.
- **`database.py`**: Manages database operations (fetching & storing data).
- **`external_apis.py`**: Integrates job search, mentorship, and event APIs.
- **`knowledge_base.py`**: Manages chatbot responses with a dynamic knowledge base.
- **`openai_service.py`**: Handles OpenAI API interactions for NLP processing.

### **Static Files (`/static`)**
- **`/css/`**: Contains stylesheet files.
- **`/data/`**: JSON files storing job listings, event details, and mentorship programs.
- **`/js/`**: JavaScript files for frontend chatbot interactions.

### **Templates (`/templates`)**
- **`index.html`**: Main chatbot UI template.

### **Data Directories**
- **`/analytics/`**: Stores interaction logs (e.g., `interactions.json`).
- **`/chroma_db/`**: Vector database for intelligent information retrieval.
- **`/attached_assets/`**: Stores uploaded files and attachments.

### **Generated Files**
- **`generated-icon.png`**: Default project icon.

---

## Installation & Setup
### **1️⃣ Clone the Repository**
```bash
git clone https://github.com/your-repo/asha-ai-chatbot.git
cd asha-ai-chatbot
```

### **2️⃣ Install Dependencies**
```bash
pip install -r requirements.txt
```

### **3️⃣ Run the Application**
```bash
python main.py
```

### **4️⃣ Access the Chatbot**
Navigate to `http://localhost:5000` in your browser.

---

## API Integration
Asha AI integrates with various **public APIs** for real-time job listings, events, and mentorship opportunities. API keys must be configured in `.env`:

```plaintext
JOB_API_KEY=your_api_key_here
MENTOR_API_KEY=your_api_key_here
EVENTS_API_KEY=your_api_key_here
```

---

## Contributing
We welcome contributions! Feel free to submit **issues** or **pull requests** to improve Asha AI.

### **🚀 Future Enhancements**
- 🔄 **Voice Interaction**: Support for voice-based chatbot interactions.
- 🌍 **Multi-Language Support**: Enable responses in multiple languages.
- 📊 **Advanced Analytics Dashboard**: Monitor chatbot performance & user trends.

💡 **Let’s build an AI assistant that truly empowers careers!** 🚀
