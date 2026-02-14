from typing import List
import models, schemas

class AIService:
    def recommend_schemes(self, user: models.User, all_schemes: List[models.Scheme]) -> List[models.Scheme]:
        """
        Mock AI logic to recommend schemes based on user profile.
        In a real app, this would use an LLM or a rule engine.
        """
        recommended = []
        for scheme in all_schemes:
            # Simple keyword matching logic for demonstration
            if "women" in scheme.description.lower() and user.gender.lower() == "female":
                recommended.append(scheme)
            elif "farmer" in scheme.description.lower() and user.occupation.lower() == "farmer":
                recommended.append(scheme)
            elif "student" in scheme.description.lower() and user.occupation.lower() == "student":
                recommended.append(scheme)
            elif user.income < 100000 and "low income" in scheme.description.lower():
                 recommended.append(scheme)
            # Default behavior if no matches but scheme is general
            elif "general" in scheme.description.lower():
                recommended.append(scheme)
                
        return recommended

    def chat_response(self, query: str, context: str) -> str:
        """
        Mock AI chat response.
        """
        return f"This is a mocked AI response to: '{query}'. based on context: {context[:20]}..."

ai_service = AIService()
