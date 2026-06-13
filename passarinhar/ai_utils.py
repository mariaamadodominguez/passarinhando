import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

# Configure the Gemini API wrapper
genai.configure(api_key=os.environ.get("GEMINI_API_KEY"))
import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

# Configure the free Gemini client
genai.configure(api_key=os.environ.get("GEMINI_API_KEY"))

def synthesize_bird_dashboard(bird_name, ebird_data, weather_data, wiki_summary, xeno_canto_recordings):
    """
    Takes data from eBird, OpenWeather, Wikipedia, and Xeno-canto metadata,
    and uses Gemini to generate a complete visual and acoustic summary.
    """
    try:
        # Initialize the free tier Gemini 2.5 Flash model
        model = genai.GenerativeModel("gemini-2.5-flash")
        
        # Extract audio meta-details from the first record matching your search
        audio_details = "No recorded song context available."
        audio_link = "#"
        
        if xeno_canto_recordings and len(xeno_canto_recordings) > 0:
            top_track = xeno_canto_recordings[0] # Take the best/first result
            audio_type = top_track.get("type", "vocalization")
            remarks = top_track.get("rmk", "No extra remarks.")
            audio_link = f"https:{top_track.get('file', '')}"
            
            audio_details = f"Type: {audio_type}. Recorder notes: '{remarks}'."

        # Create an expanded prompt forcing Gemini to break down the audio
        prompt = f"""
        You are an advanced AI field guide built into the Birdie app. 
        Synthesize the following live data into a compelling, 3-sentence birding report.
        
        Target Bird: {bird_name}
        
        1. Wikipedia Context: {wiki_summary}
        2. Recent Local eBird Sightings: {ebird_data}
        3. Active Field Weather Conditions: {weather_data}
        4. Xeno-canto Sound Profile: {audio_details}
        
        Requirements for the 3 sentences:
        - Sentence 1: General bird info (in pt-BR).
        - Sentence 2: Describe what the user will hear (sound/call type) using the sound profile notes (in pt-BR).
        - Sentence 3: Location confirmation and state if the current weather is ideal for a birding trip (in pt-BR).
        """
        
        response = model.generate_content(prompt)
        
        # Return both the text summary and the audio link to embed in the player
        return {
            "summary": response.text,
            "audio_url": audio_link
        }
        
    except Exception as e:
        return {
            "summary": f"Could not generate AI insights: {str(e)}",
            "audio_url": "#"
        }

