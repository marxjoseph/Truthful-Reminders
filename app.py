import os
import uuid
from google import genai
#from dotenv import load_dotenv
from flask import Flask, request, render_template, redirect, url_for, jsonify, session

app = Flask(__name__)
app.secret_key = os.urandom(24)  # For session management

# Load environment variables once at startup
#load_dotenv()
#api_key = os.getenv("API_KEY")
client = genai.Client(api_key="AIzaSyCC0MuLw-JEcACeu3GwVY8TZlT18BQ4_Ow")

@app.route('/')
def home():
    # Retrieve the response from query parameters
    response = request.args.get('response')
    
    # Initialize session history if it doesn't exist
    if 'history' not in session:
        session['history'] = []
        
    return render_template('index.html', response=response)

@app.route('/submit', methods=['POST'])
def submit():
    textarea_content = request.form.get('textarea')  # Get the content of the textarea
    
    # Get preferences if they exist
    preferences = request.form.getlist('preferences')

    # Build preference
    preference = ""
    
    # Adjust prompt based on preferences
    if preferences:
        if 'old-testament' in preferences and 'new-testament' not in preferences:
            preference = "Please only use verses from the Old Testamen."
        elif 'new-testament' in preferences and 'old-testament' not in preferences:
            preference = "Please only use verses from the New Testament."

    prompt = f"""
        Context: I am developing a website where users can share their feelings in a text box. The website utilizes AI to respond with a Bible verse that aligns with their emotions and provides support.

        Action: Your task is to respond to the user's message ('{textarea_content}') with a relevant Bible verse that addresses their emotions and offers encouragement. You will:

        Cite the verse.

        {preference}

        Explain the verse in a way that relates to the user's feelings.

        Offer practical ways for the user to apply the teachings of the verse in their life.

        End the response with a brief, positive message to the user.

        Rules:

        Always provide a verse that aligns with the user's emotions.

        Ensure that the verse is cited, explained, and accompanied by practical suggestions for applying it.

        Make sure to include the explanation.

        If the user’s response is unrelated to emotions, religion, or their feelings, reply with "Not Applicable."

        Do not provide any Bible verses that the user explicitly asks not to use.

        Do not say anything about you understanding or say what the user said. Just reply like in the examples.

        Be creative with the verses. Try to give different answers each time.

        Examples:

        Example 1:
        User Response: "I am feeling very sad."
        Your Response:

        Relevant Bible Verse: "Cast all your anxiety on him because he cares for you." – 1 Peter 5:7

        Explanation: This verse from 1 Peter 5:7 is a source of comfort during sadness. It encourages us to release our worries to God, trusting that He deeply cares for us. It’s a reminder that we are not alone, and while God may not instantly remove the sadness, He promises to be with us through it.

        Ways to Practice this Verse:

        Prayer: Share your sadness openly with God, expressing your feelings and anxieties.

        Journaling: Write about your emotions and follow up with a prayer based on the verse.

        Meditation: Reflect quietly on the verse, letting it provide peace.

        Support: Talk to a trusted person for comfort.

        Worship: Engage in activities that help you feel connected to God.

        Example 2:
        User Response: "Do my math homework."
        Your Response: "Not Applicable."
        """
    
    try:
        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=prompt,
            )
        response_text = response.text if hasattr(response, 'text') else str(response)
        response_split = response_text.splitlines()
        
        # Format the response with HTML elements
        formatted_response = []
        in_verse = False
        in_explanation = False
        in_practice = False
        
        for line in response_split:
            line = line.strip()
            if not line:
                formatted_response.append("<br>")
                continue
                
            if ":" in line and any(book in line for book in ["Genesis", "Exodus", "Leviticus", "Numbers", "Deuteronomy", "Joshua", "Judges", "Ruth", "Samuel", "Kings", "Chronicles", "Ezra", "Nehemiah", "Esther", "Job", "Psalm", "Proverbs", "Ecclesiastes", "Song", "Isaiah", "Jeremiah", "Lamentations", "Ezekiel", "Daniel", "Hosea", "Joel", "Amos", "Obadiah", "Jonah", "Micah", "Nahum", "Habakkuk", "Zephaniah", "Haggai", "Zechariah", "Malachi", "Matthew", "Mark", "Luke", "John", "Acts", "Romans", "Corinthians", "Galatians", "Ephesians", "Philippians", "Colossians", "Thessalonians", "Timothy", "Titus", "Philemon", "Hebrews", "James", "Peter", "John", "Jude", "Revelation"]):
                in_verse = True
                in_explanation = False
                in_practice = False
                formatted_response.append(f'<h4 class="mt-3 verse-reference">{line}</h4>')
            elif "Explanation:" in line or "Understanding this verse:" in line:
                in_verse = False
                in_explanation = True
                in_practice = False
                formatted_response.append(f'<h5 class="mt-4">Explanation:</h5>')
            elif "Practice:" in line or "Application:" in line or "Ways to Practice:" in line or "How to Apply:" in line:
                in_verse = False
                in_explanation = False
                in_practice = True
                formatted_response.append(f'<h5 class="mt-4">Ways to Practice:</h5>')
            elif in_verse:
                formatted_response.append(f'<blockquote class="blockquote verse-text">{line}</blockquote>')
            elif in_explanation:
                formatted_response.append(f'<p class="explanation-text">{line}</p>')
            elif in_practice:
                if line.startswith("- ") or line.startswith("• "):
                    formatted_response.append(f'<li class="practice-item">{line[2:]}</li>')
                    if "<ul>" not in formatted_response[-2]:
                        formatted_response.insert(-1, "<ul class='practice-list'>")
                else:
                    if "<ul>" in "".join(formatted_response[-5:]):
                        formatted_response.append("</ul>")
                    formatted_response.append(f'<p class="practice-text">{line}</p>')
            else:
                formatted_response.append(f'<p>{line}</p>')
        
        # Handle any unclosed lists
        if "<ul>" in "".join(formatted_response[-10:]) and "</ul>" not in "".join(formatted_response[-5:]):
            formatted_response.append("</ul>")
            
        # Join the formatted response
        response_html = "".join(formatted_response)
        
        # Store in session for history feature (with a unique ID)
        entry_id = str(uuid.uuid4())
        entry = {
            'id': entry_id,
            'prompt': textarea_content[:50] + ('...' if len(textarea_content) > 50 else ''),
            'full_prompt': textarea_content,
            'response': response_html,
            'timestamp': '__TIME__'  # Will be replaced with JS timestamp on client
        }
        
        history = session.get('history', [])
        history.insert(0, entry)  # Add to beginning of list
        session['history'] = history[:20]  # Keep only the 20 most recent entries
        session.modified = True
        
        return redirect(url_for('home', response=response_html))
    
    except Exception as e:
        error_message = f"<p class='text-danger'>Sorry, there was an error processing your request: {str(e)}</p>"
        return redirect(url_for('home', response=error_message))

@app.route('/api/history', methods=['GET'])
def get_history():
    history = session.get('history', [])
    return jsonify(history)

@app.route('/api/history', methods=['POST'])
def save_to_history():
    data = request.json
    if not data or 'response' not in data:
        return jsonify({'error': 'Missing response data'}), 400
    
    entry_id = str(uuid.uuid4())
    entry = {
        'id': entry_id,
        'prompt': data.get('prompt', 'Saved Scripture'),
        'full_prompt': data.get('full_prompt', ''),
        'response': data['response'],
        'timestamp': '__TIME__'  # Will be replaced with JS timestamp on client
    }
    
    history = session.get('history', [])
    history.insert(0, entry)
    session['history'] = history[:20]
    session.modified = True
    
    return jsonify({'success': True, 'id': entry_id})

@app.route('/api/history', methods=['DELETE'])
def clear_history():
    session['history'] = []
    session.modified = True
    return jsonify({'success': True})

@app.route('/api/history/<entry_id>', methods=['DELETE'])
def delete_history_entry(entry_id):
    history = session.get('history', [])
    history = [entry for entry in history if entry['id'] != entry_id]
    session['history'] = history
    session.modified = True
    return jsonify({'success': True})

@app.route('/api/feedback', methods=['POST'])
def save_feedback():
    data = request.json
    if not data or 'value' not in data:
        return jsonify({'error': 'Missing feedback data'}), 400
    
    return jsonify({'success': True})

@app.route('/share/<entry_id>')
def share_scripture(entry_id):
    history = session.get('history', [])
    for entry in history:
        if entry['id'] == entry_id:
            return render_template('share.html', entry=entry)
    
    return render_template('share.html', error="Scripture not found")

if __name__ == "__main__":
    app.run()