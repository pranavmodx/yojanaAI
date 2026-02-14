from typing import List, Dict, Any
import models


class AIService:
    """
    Rule-based eligibility engine that analyzes user profiles
    against scheme criteria and provides reasoning.
    """

    def _check_eligibility(self, user: models.User, scheme: models.Scheme) -> Dict[str, Any]:
        """Check if a user is eligible for a specific scheme and return reasoning."""
        criteria = scheme.eligibility_criteria or []
        criteria_lower = [c.lower() for c in criteria]
        reasons_for = []
        reasons_against = []

        # ── Farmer schemes ──
        if "farmer" in criteria_lower or "land ownership" in criteria_lower:
            if user.occupation and user.occupation.lower() == "farmer":
                reasons_for.append("You are a farmer")
            else:
                reasons_against.append("This scheme is for farmers")

        # ── Income-based schemes ──
        if "low income" in criteria_lower:
            if user.income is not None and user.income < 250000:
                reasons_for.append(f"Your income (₹{user.income:,}) qualifies as low income")
            elif user.income is not None:
                reasons_against.append(f"Your income (₹{user.income:,}) is above the low-income threshold")

        if user.ration_card_type and user.ration_card_type in ("BPL", "AAY"):
            if "low income" in criteria_lower or "secc database inclusion" in criteria_lower:
                reasons_for.append(f"You have a {user.ration_card_type} ration card")

        # ── Rural household ──
        if "rural household" in criteria_lower:
            # Approximate: if user has a district/address, likely rural
            if user.district or user.address:
                reasons_for.append("You appear to be from a rural area")
            else:
                reasons_for.append("Assumed rural eligibility based on profile")

        # ── Gender-specific schemes ──
        if "girl child" in criteria_lower or "women" in criteria_lower:
            if user.gender and user.gender.lower() == "female":
                reasons_for.append("You meet the gender eligibility")
            else:
                # Parents can also be eligible
                if "parents" in criteria_lower:
                    reasons_for.append("Parents are eligible for this scheme")
                else:
                    reasons_against.append("This scheme is targeted at women/girls")

        # ── Caste / category ──
        if "sc" in criteria_lower or "st" in criteria_lower or "obc" in criteria_lower:
            if user.caste and user.caste.upper() in ("SC", "ST", "OBC"):
                reasons_for.append(f"Your category ({user.caste}) qualifies")
            else:
                reasons_against.append("This scheme is for reserved categories")

        # ── SECC / Ration Card ──
        if "secc database inclusion" in criteria_lower:
            if user.ration_card_type and user.ration_card_type in ("BPL", "AAY"):
                reasons_for.append("BPL/AAY ration card holders are typically in SECC")
            elif user.income is not None and user.income < 200000:
                reasons_for.append("Low income suggests SECC eligibility")

        # ── Homeless / housing ──
        if "homeless" in criteria_lower or "living in kutcha houses" in criteria_lower:
            if user.income is not None and user.income < 200000:
                reasons_for.append("Low income suggests housing need")

        # ── Adult / employment ──
        if "adult members willing to do unskilled manual work" in criteria_lower:
            if user.age and user.age >= 18:
                reasons_for.append("You are an adult eligible for employment")

        # ── General fallback: if no specific block matched, use broad heuristics ──
        if not reasons_for and not reasons_against:
            if user.income is not None and user.income < 300000:
                reasons_for.append("Your income level may qualify you")
            else:
                reasons_against.append("No matching criteria found in your profile")

        eligible = len(reasons_for) > 0 and len(reasons_against) == 0
        # Even with some against, if strong for-reasons exist, mark as potentially eligible
        if reasons_for and reasons_against:
            eligible = len(reasons_for) >= len(reasons_against)

        return {
            "eligible": eligible,
            "reasons_for": reasons_for,
            "reasons_against": reasons_against,
            "reason": ". ".join(reasons_for) if eligible else ". ".join(reasons_against),
        }

    def run_agent(
        self,
        user: models.User,
        schemes: List[models.Scheme],
        existing_app_scheme_ids: List[int],
    ) -> List[Dict[str, Any]]:
        """
        Analyze all schemes for the user and return eligibility results.
        Does NOT auto-apply — returns results for the user to choose from.
        """
        results = []
        for scheme in schemes:
            check = self._check_eligibility(user, scheme)
            already_applied = scheme.id in existing_app_scheme_ids

            results.append({
                "scheme_id": scheme.id,
                "scheme_name": scheme.name,
                "description": scheme.description,
                "benefits": scheme.benefits,
                "eligible": check["eligible"],
                "reason": check["reason"],
                "already_applied": already_applied,
                "documents_needed": scheme.documents_required or [],
            })

        return results

    def recommend_schemes(self, user: models.User, all_schemes: List[models.Scheme]) -> List[models.Scheme]:
        """Return only eligible schemes (used by /schemes/recommend endpoint)."""
        recommended = []
        for scheme in all_schemes:
            check = self._check_eligibility(user, scheme)
            if check["eligible"]:
                recommended.append(scheme)
        return recommended if recommended else all_schemes  # fallback to all if none match

    def chat_response(self, query: str, context: str) -> str:
        return f"This is a mocked AI response to: '{query}'. based on context: {context[:20]}..."


ai_service = AIService()
