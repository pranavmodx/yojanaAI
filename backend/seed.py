from database import SessionLocal, engine
import models
import json

# Ensure tables exist
models.Base.metadata.create_all(bind=engine)

db = SessionLocal()

schemes_data = [
    {
        "name": "Pradhan Mantri Kisan Samman Nidhi (PM-KISAN)",
        "description": "Income support of Rs 6000/- per year to all farmer families.",
        "ministry": "Ministry of Agriculture and Farmers Welfare",
        "eligibility_criteria": ["Farmer", "Land ownership"],
        "documents_required": ["Aadhaar", "Land Record", "Bank Account"],
        "benefits": "Rs 6000 per year in 3 installments"
    },
    {
        "name": "Mahatma Gandhi National Rural Employment Guarantee Act (MGNREGA)",
        "description": "Guarantees 100 days of wage employment in a financial year to a rural household.",
        "ministry": "Ministry of Rural Development",
        "eligibility_criteria": ["Rural Household", "Adult members willing to do unskilled manual work"],
        "documents_required": ["Job Card", "Aadhhaar", "Bank Account"],
        "benefits": "Guaranteed Employment / Unemployment Allowance"
    },
    {
        "name": "Pradhan Mantri Awas Yojana (Gramin)",
        "description": "Housing for all in rural areas.",
        "ministry": "Ministry of Rural Development",
        "eligibility_criteria": ["Homeless", "Living in kutcha houses", "Low Income"],
        "documents_required": ["Aadhaar", "Income Certificate"],
        "benefits": "Financial assistance for house construction"
    },
    {
        "name": "Beti Bachao Beti Padhao",
        "description": "Generate awareness and improve the efficiency of welfare services intended for girls.",
        "ministry": "Ministry of Women and Child Development",
        "eligibility_criteria": ["Girl Child", "Parents"],
        "documents_required": ["Birth Certificate", "Aadhaar of Parents"],
        "benefits": "Education and Welfare support"
    },
    {
        "name": "Ayushman Bharat",
        "description": "Health insurance coverage of up to 5 lakhs per family per year.",
        "ministry": "Ministry of Health and Family Welfare",
        "eligibility_criteria": ["Low Income", "SECC Database inclusion"],
        "documents_required": ["Aadhaar", "Ration Card"],
        "benefits": "Cashless treatment in empaneled hospitals"
    }
]

def seed():
    # Check if schemes exist
    if db.query(models.Scheme).count() > 0:
        print("Schemes already seeded.")
        return

    for item in schemes_data:
        scheme = models.Scheme(
            name=item["name"],
            description=item["description"],
            ministry=item["ministry"],
            eligibility_criteria=item["eligibility_criteria"], # SQLAlchemy passes this as JSON if column type is JSON
            documents_required=item["documents_required"],
            benefits=item["benefits"]
        )
        db.add(scheme)
    
    db.commit()
    print("Seeded schemes successfully!")

if __name__ == "__main__":
    seed()
    db.close()
