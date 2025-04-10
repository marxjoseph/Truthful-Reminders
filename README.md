# Truthful Reminders

## Overview
Truthful Reminders is a web application that provides scriptural guidance and support based on users' emotional states. Users can share how they're feeling, and the application uses Google's Gemini AI to generate relevant Bible verses, explanations, and practical applications to help address their emotions.

## Features
- **Scripture Generation**: Provides relevant Bible verses based on the user's emotional state
- **Personalized Responses**: Each response includes the verse, an explanation, and ways to practice the verse
- **History System**: Save and access previous scripture responses
- **Sharing Options**: Share scriptures via WhatsApp, email, or by copying the text
- **Mobile Responsive**: Fully responsive design that works well on all device sizes
- **Testament Preferences**: Option to specify Old or New Testament preferences

## Technology Stack
- **Backend**: Python with Flask
- **AI Integration**: Google's Generative AI (Gemini 1.5 Flash)
- **Frontend**: HTML, CSS, JavaScript, Bootstrap 5
- **Environment Management**: dotenv for managing API keys

## Setup Instructions

### Prerequisites
- Python 3.7+
- Google Generative AI API key

### Installation
1. Clone the repository:
   ```
   git clone https://github.com/yourusername/truthful-reminders.git
   cd truthful-reminders
   ```

2. Create a virtual environment and activate it:
   ```
   python -m venv venv
   
   # On Windows
   venv\Scripts\activate
   
   # On macOS/Linux
   source venv/bin/activate
   ```

3. Install the required packages:
   ```
   pip install -r requirements.txt
   ```

4. Create a `.env` file in the project root and add your Google API key:
   ```
   API_KEY=your_google_generative_ai_api_key
   ```

### Running the Application
1. Start the Flask development server:
   ```
   python app.py
   ```

2. Open your browser and navigate to:
   ```
   http://127.0.0.1:5000/
   ```

## Project Structure
```
truthful-reminders/
├── app.py                  # Main Flask application
├── requirements.txt        # Python dependencies
├── .env                    # Environment variables (not in version control)
├── static/
│   ├── styles.css          # CSS styles
│   └── script.js           # JavaScript functionality
└── templates/
    ├── index.html          # Main application page
    └── share.html          # Shared scripture page
```

## How to Use
1. Enter your current feelings or emotional state in the text area
2. (Optional) Select your testament preferences
3. Click "Get Scripture" to receive personalized scriptural guidance
4. Save responses to your history for future reference
5. Share meaningful scriptures with others via WhatsApp or email

## API Endpoints
- `GET /`: Main application route
- `POST /submit`: Processes user input and generates a scripture response
- `GET /api/history`: Retrieves saved history items
- `POST /api/history`: Saves a new item to history
- `DELETE /api/history`: Clears all history
- `DELETE /api/history/<entry_id>`: Deletes a specific history entry
- `POST /api/feedback`: Saves user feedback on responses
- `GET /share/<entry_id>`: Displays a shareable version of a scripture

## Requirements
- flask
- google-generativeai
- python-dotenv

## License
[MIT License](LICENSE)

## Acknowledgements
- [Google Generative AI](https://ai.google.dev/)
- [Bootstrap](https://getbootstrap.com/)
- [Bootstrap Icons](https://icons.getbootstrap.com/)
- [Poppins Font](https://fonts.google.com/specimen/Poppins)