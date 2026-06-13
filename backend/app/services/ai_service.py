"""AI/ML core service for symptom analysis and medication suggestions.

Uses OpenAI or Google Gemini APIs to analyze health concerns and provide
intelligent, responsible suggestions with proper medical disclaimers.
"""

import asyncio
import json
import logging
import re
from typing import Optional
from datetime import datetime, timezone

from app.config import settings


SYMPTOM_ANALYSIS_SYSTEM_PROMPT = """You are HealthAI, a responsible medical AI assistant designed to provide HEALTH INFORMATION ONLY — NOT MEDICAL DIAGNOSIS.

Your role:
1. Analyze described symptoms carefully
2. Suggest POSSIBLE conditions (not diagnoses) with probability levels
3. Recommend OTC or common medications with proper precautions
4. Provide lifestyle recommendations
5. Clearly state when to see a doctor

CRITICAL RULES:
- Always include a clear medical disclaimer
- Never claim to provide a diagnosis
- For emergency symptoms (chest pain, difficulty breathing, severe bleeding, etc.), ALWAYS say to call emergency services immediately
- Be conservative — better to recommend seeing a doctor than to downplay symptoms
- Suggest medications only as general information, always with "consult your doctor/pharmacist" caveats
- Consider medication interactions and contraindications

Always respond in valid JSON format matching the structure:
{
  "analysis": "brief analysis summary",
  "possible_conditions": [
    {
      "name": "Condition name",
      "probability": "high|medium|low",
      "description": "brief description",
      "urgency": "emergency|see_doctor_soon|monitor|self_care",
      "common_symptoms": ["symptom1", "symptom2"]
    }
  ],
  "medication_suggestions": [
    {
      "name": "Medication name",
      "category": "e.g., Analgesic, Antihistamine",
      "dosage_notes": "general dosage guidance",
      "is_prescription_required": true/false,
      "warnings": ["warning1", "warning2"],
      "common_side_effects": ["effect1", "effect2"]
    }
  ],
  "lifestyle_recommendations": ["recommendation1", "recommendation2"],
  "when_to_see_doctor": "clear guidance on when to seek medical care"
}
"""


async def analyze_symptoms_with_openai(description: str, age: Optional[int] = None, gender: Optional[str] = None,
                                        duration: Optional[str] = None, severity: Optional[str] = None) -> dict:
    """Analyze symptoms using OpenAI API."""
    from openai import AsyncOpenAI

    client = AsyncOpenAI(api_key=settings.openai_api_key)

    user_context = f"Patient information: {age} year old {gender}" if age and gender else ""
    if duration:
        user_context += f", symptoms for {duration}"
    if severity:
        user_context += f", severity: {severity}"

    user_prompt = f"{user_context}\n\nSymptoms description: {description}" if user_context else f"Symptoms description: {description}"

    response = await client.chat.completions.create(
        model=settings.openai_model,
        messages=[
            {"role": "system", "content": SYMPTOM_ANALYSIS_SYSTEM_PROMPT},
            {"role": "user", "content": user_prompt},
        ],
        response_format={"type": "json_object"},
        temperature=0.3,
        max_tokens=2000,
    )

    content = response.choices[0].message.content
    return json.loads(content)


async def analyze_symptoms_with_openrouter(
    description: str, age: Optional[int] = None, gender: Optional[str] = None,
    duration: Optional[str] = None, severity: Optional[str] = None
) -> dict:
    """Analyze symptoms using OpenRouter API (free tier models like nvidia/llama-nemotron-rerank-vl-1b-v2:free).

    Uses the OpenAI-compatible SDK with a custom base_url pointing to OpenRouter.
    """
    from openai import AsyncOpenAI

    client = AsyncOpenAI(
        base_url="https://openrouter.ai/api/v1",
        api_key=settings.openrouter_api_key,
    )

    user_context = f"Patient information: {age} year old {gender}" if age and gender else ""
    if duration:
        user_context += f", symptoms for {duration}"
    if severity:
        user_context += f", severity: {severity}"

    user_prompt = f"{user_context}\n\nSymptoms description: {description}" if user_context else f"Symptoms description: {description}"

    # OpenRouter free models may not support response_format, so we parse JSON from text
    response = await client.chat.completions.create(
        model=settings.openrouter_model,
        messages=[
            {"role": "system", "content": SYMPTOM_ANALYSIS_SYSTEM_PROMPT},
            {"role": "user", "content": user_prompt},
        ],
        temperature=0.3,
        max_tokens=2000,
        extra_headers={
            "HTTP-Referer": "https://health-assistant.local",
            "X-Title": "Health Assistant",
        },
    )

    content = response.choices[0].message.content
    # Attempt to extract JSON from the response (may be wrapped in markdown code blocks)
    try:
        return json.loads(content)
    except json.JSONDecodeError:
        json_match = re.search(r'\{[\s\S]*\}', content)
        if json_match:
            return json.loads(json_match.group())
        raise ValueError(f"Failed to parse OpenRouter response as JSON: {content[:200]}")


async def analyze_symptoms_with_gemini(description: str, age: Optional[int] = None, gender: Optional[str] = None,
                                        duration: Optional[str] = None, severity: Optional[str] = None) -> dict:
    """Analyze symptoms using Google Gemini API."""
    import google.generativeai as genai

    genai.configure(api_key=settings.google_api_key)
    model = genai.GenerativeModel(settings.gemini_model)

    user_context = f"Patient information: {age} year old {gender}" if age and gender else ""
    if duration:
        user_context += f", symptoms for {duration}"
    if severity:
        user_context += f", severity: {severity}"

    user_prompt = f"{user_context}\n\nSymptoms description: {description}" if user_context else f"Symptoms description: {description}"

    full_prompt = f"{SYMPTOM_ANALYSIS_SYSTEM_PROMPT}\n\nUser query: {user_prompt}"

    response = model.generate_content(full_prompt)
    text = response.text

    # Extract JSON from response (Gemini might wrap in markdown)
    json_match = re.search(r'\{.*\}', text, re.DOTALL)
    if json_match:
        return json.loads(json_match.group())
    return json.loads(text)


async def analyze_symptoms(description: str, age: Optional[int] = None, gender: Optional[str] = None,
                            duration: Optional[str] = None, severity: Optional[str] = None) -> dict:
    """Analyze symptoms using the configured LLM provider.

    Provider priority:
    1. Gemini (if configured and llm_provider == "gemini")
    2. OpenAI (if configured)
    3. OpenRouter free model (if configured)
    4. Rule-based fallback (last resort)
    """
    if settings.llm_provider == "gemini" and settings.google_api_key:
        result = await analyze_symptoms_with_gemini(description, age, gender, duration, severity)
    elif settings.openai_api_key:
        result = await analyze_symptoms_with_openai(description, age, gender, duration, severity)
    elif settings.openrouter_api_key:
        try:
            result = await analyze_symptoms_with_openrouter(description, age, gender, duration, severity)
        except Exception as e:
            logging.getLogger("health-assistant").warning(
                "OpenRouter fallback failed (%s), using rule-based analysis", str(e)
            )
            # Graceful degradation: if OpenRouter fails (rate-limited, model down, parse error),
            # fall back to rule-based analysis
            result = await asyncio.to_thread(get_fallback_analysis, description)
    else:
        # Last resort: rule-based analysis - run in thread pool to avoid blocking event loop
        result = await asyncio.to_thread(get_fallback_analysis, description)

    return result


def get_fallback_analysis(description: str) -> dict:
    """Rule-based fallback when no LLM API is configured.

    This provides basic analysis without AI - always configure an API key for real use.
    """
    description_lower = description.lower()

    conditions = []
    meds = []
    when_to_see = "If symptoms persist for more than a few days or worsen, please consult a healthcare provider."

    # Simple keyword-based matching
    if any(w in description_lower for w in ["headache", "head pain", "migraine"]):
        conditions.append({
            "name": "Tension Headache",
            "probability": "medium",
            "description": "Common headache often caused by stress, eye strain, or muscle tension.",
            "urgency": "self_care",
            "common_symptoms": ["Dull aching head pain", "Tightness across forehead", "Scalp tenderness"]
        })
        meds.append({
            "name": "Ibuprofen (Advil, Motrin)",
            "category": "NSAID",
            "dosage_notes": "200-400mg every 4-6 hours as needed. Do not exceed 1200mg per day.",
            "is_prescription_required": False,
            "warnings": ["Do not use if you have stomach ulcers", "Avoid if allergic to NSAIDs"],
            "common_side_effects": ["Stomach upset", "Heartburn", "Drowsiness"]
        })
        meds.append({
            "name": "Acetaminophen (Tylenol)",
            "category": "Analgesic",
            "dosage_notes": "500-1000mg every 4-6 hours. Do not exceed 3000mg per day.",
            "is_prescription_required": False,
            "warnings": ["Avoid alcohol while taking", "Liver damage risk with overdose"],
            "common_side_effects": ["Nausea", "Mild stomach discomfort"]
        })

    if any(w in description_lower for w in ["fever", "temperature", "hot", "cold", "chills", "flu", "cough", "cold", "sore throat"]):
        conditions.append({
            "name": "Common Cold / Upper Respiratory Infection",
            "probability": "medium",
            "description": "Viral infection of the upper respiratory tract. Usually self-limiting.",
            "urgency": "self_care",
            "common_symptoms": ["Runny or stuffy nose", "Sore throat", "Cough", "Sneezing", "Mild fever"]
        })
        meds.append({
            "name": "Acetaminophen (Tylenol)",
            "category": "Antipyretic / Analgesic",
            "dosage_notes": "500-1000mg every 4-6 hours for fever/pain. Max 3000mg/day.",
            "is_prescription_required": False,
            "warnings": ["Do not combine with other acetaminophen products"],
            "common_side_effects": ["Nausea"]
        })

    if any(w in description_lower for w in ["stomach", "nausea", "vomiting", "diarrhea", "digest", "stomach ache", "cramp"]):
        conditions.append({
            "name": "Acute Gastroenteritis",
            "probability": "medium",
            "description": "Inflammation of the stomach and intestines, often due to infection or food poisoning.",
            "urgency": "monitor",
            "common_symptoms": ["Nausea", "Vomiting", "Diarrhea", "Abdominal cramps", "Mild fever"]
        })
        meds.append({
            "name": "Loperamide (Imodium)",
            "category": "Antidiarrheal",
            "dosage_notes": "4mg initially, then 2mg after each loose stool. Max 16mg per day.",
            "is_prescription_required": False,
            "warnings": ["Do not use if you have bloody stools or high fever", "Not for children under 6"],
            "common_side_effects": ["Dizziness", "Drowsiness", "Constipation"]
        })

    if not conditions:
        conditions.append({
            "name": "Non-specific symptoms",
            "probability": "low",
            "description": "Your symptoms don't clearly match a specific condition. Monitor and consult a doctor if they persist.",
            "urgency": "monitor",
            "common_symptoms": [description]
        })
        when_to_see = "Since your symptoms are unclear, please consult a healthcare provider for proper evaluation."

    return {
        "analysis": f"Based on your description: '{description[:100]}...' -- here are some possible considerations.",
        "possible_conditions": conditions,
        "medication_suggestions": meds,
        "lifestyle_recommendations": [
            "Get plenty of rest and stay hydrated",
            "Monitor your symptoms and track any changes",
            "Avoid strenuous activities until symptoms improve",
            "Maintain a balanced diet to support your immune system"
        ],
        "when_to_see_doctor": when_to_see,
    }


def format_analysis_response(raw: dict, analysis_id: str) -> dict:
    """Format the raw AI analysis into a standardized response."""
    return {
        "id": analysis_id,
        "analysis": raw.get("analysis", "Analysis complete."),
        "possible_conditions": raw.get("possible_conditions", []),
        "medication_suggestions": raw.get("medication_suggestions", []),
        "lifestyle_recommendations": raw.get("lifestyle_recommendations", []),
        "when_to_see_doctor": raw.get("when_to_see_doctor", "Consult a healthcare provider if symptoms persist."),
        "disclaimer": (
            "This is an AI-generated suggestion for informational purposes only. "
            "It is NOT a substitute for professional medical advice, diagnosis, or treatment. "
            "Always consult a qualified healthcare provider with any medical concerns."
        ),
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
