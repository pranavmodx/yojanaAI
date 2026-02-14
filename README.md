# 🇮🇳 YojanaAI — AI-Powered Government Scheme Discovery for Rural India

<div align="center">

![Python](https://img.shields.io/badge/Python-3.9+-3776AB?logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.128-009688?logo=fastapi&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![SQLite](https://img.shields.io/badge/SQLite-003B57?logo=sqlite&logoColor=white)
![i18next](https://img.shields.io/badge/i18next-10%20Languages-26A69A)
![License](https://img.shields.io/badge/License-MIT-green)

**Bridging the gap between government welfare schemes and rural citizens through voice-guided, multilingual AI assistance.**

</div>

---

## 📋 Table of Contents

- [Problem Statement](#-problem-statement)
- [Solution](#-solution)
- [Features](#-features)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [API Endpoints](#-api-endpoints)
- [Supported Languages](#-supported-languages)
- [Screenshots](#-screenshots)
- [Future Enhancements](#-future-enhancements)
- [Team](#-team)
- [License](#-license)

---

## 🎯 Problem Statement

Rural India faces significant challenges in accessing government welfare schemes:

- **Low digital literacy** — Many beneficiaries cannot navigate complex government portals
- **Language barriers** — Most portals are in English/Hindi, excluding speakers of regional languages
- **Lack of awareness** — Citizens are often unaware of schemes they are eligible for
- **Complex eligibility criteria** — Determining eligibility requires understanding multiple parameters

## 💡 Solution

**YojanaAI** is an AI-powered platform that:

1. **Speaks the user's language** — Supports 10 Indian languages with voice-guided navigation
2. **Understands user profiles** — Collects socio-economic data through a conversational onboarding flow
3. **Matches schemes intelligently** — Uses a rule-based AI engine to match users with eligible government schemes
4. **Simplifies applications** — Allows one-click application to matched schemes with document guidance
5. **Uses high-quality TTS** — Microsoft Neural voices (via edge-tts) for natural-sounding voice guidance

---

## ✨ Features

### 🗣️ Voice-Guided Onboarding
- Step-by-step conversational data collection
- Speech-to-Text (STT) input via Web Speech API
- Text-to-Speech (TTS) output via **Microsoft Edge Neural Voices**
- Pulsating voice replay button for accessibility
- Fallback to browser TTS if backend is unavailable

### 🌐 Multilingual Support (10 Languages)
Full UI localization using **i18next** for:

| Language | Script | Code |
|----------|--------|------|
| English | Latin | `en` |
| Hindi | देवनागरी | `hi` |
| Tamil | தமிழ் | `ta` |
| Telugu | తెలుగు | `te` |
| Bengali | বাংলা | `bn` |
| Marathi | मराठी | `mr` |
| Gujarati | ગુજરાતી | `gu` |
| Kannada | ಕನ್ನಡ | `kn` |
| Malayalam | മലയാളം | `ml` |
| Punjabi | ਪੰਜਾਬੀ | `pa` |

### 🤖 AI Eligibility Engine
- Rule-based scheme matching against 15+ user profile attributes
- Eligibility reasoning (why you qualify / why you don't)
- Supports criteria: income, caste, gender, occupation, ration card, location, disability, etc.
- Agent endpoint for batch eligibility analysis across all schemes

### 📋 Scheme Management
- Pre-seeded with 5 major government schemes (PM-KISAN, MGNREGA, PMAY, Beti Bachao, Ayushman Bharat)
- Scheme recommendation based on user profile
- One-click application with document requirement guidance
- Application tracking

### 👤 User Profile System
- Phone or Email-based authentication with JWT tokens
- Comprehensive profile: name, age, gender, state, district, income, caste, education, occupation, etc.
- Profile picture upload with avatar fallback
- Profile completion tracking for onboarding flow

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────┐
│                    Frontend (React)                   │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌─────────┐ │
│  │  Pages   │ │ Contexts │ │  i18next  │ │  Voice  │ │
│  │ (6 pages)│ │Auth/Lang │ │10 locales │ │edge-tts │ │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬────┘ │
│       └─────────────┴───────────┴─────────────┘      │
│                         │ Axios                       │
└─────────────────────────┼───────────────────────────┘
                          │ HTTP/REST
┌─────────────────────────┼───────────────────────────┐
│                  Backend (FastAPI)                    │
│  ┌──────┐ ┌───────┐ ┌────────┐ ┌──────┐ ┌────────┐ │
│  │ Auth │ │ Users │ │Schemes │ │Agent │ │  TTS   │ │
│  │Router│ │Router │ │ Router │ │Router│ │Router  │ │
│  └──┬───┘ └───┬───┘ └───┬────┘ └──┬───┘ └───┬────┘ │
│     └─────────┴─────────┴─────────┘         │       │
│               │ SQLAlchemy ORM         edge-tts      │
│         ┌─────┴──────┐             ┌────────┴──────┐│
│         │  SQLite DB  │             │  MS Neural TTS ││
│         └────────────┘             └───────────────┘│
└─────────────────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

### Backend
| Technology | Purpose |
|-----------|---------|
| **FastAPI** | REST API framework with auto-docs (Swagger UI) |
| **SQLAlchemy** | ORM for database models and queries |
| **SQLite** | Lightweight relational database |
| **Pydantic** | Request/response schema validation |
| **python-jose** | JWT token authentication |
| **bcrypt** | Password hashing |
| **edge-tts** | Microsoft Neural Text-to-Speech |
| **Uvicorn** | ASGI server with hot-reload |

### Frontend
| Technology | Purpose |
|-----------|---------|
| **React 19** | UI framework (Vite-based) |
| **React Router DOM** | Client-side routing |
| **Axios** | HTTP client for API calls |
| **i18next** | Internationalization (10 languages) |
| **Lucide React** | Icon library |
| **Web Speech API** | Browser-based speech recognition |
| **Context API** | Global state management (Auth, Language) |

---

## 📁 Project Structure

```
yojanaAI/
├── backend/
│   ├── main.py                 # FastAPI app setup, CORS, routers
│   ├── database.py             # SQLAlchemy engine & session
│   ├── models.py               # User, Scheme, Application models
│   ├── schemas.py              # Pydantic request/response schemas
│   ├── seed.py                 # Database seeder (5 govt schemes)
│   ├── requirements.txt        # Python dependencies
│   ├── routes/
│   │   ├── auth.py             # Signup, login, JWT, /auth/me
│   │   ├── users.py            # Profile CRUD, picture upload
│   │   ├── schemes.py          # Scheme listing & recommendation
│   │   ├── apply.py            # Application submission
│   │   ├── agent.py            # AI agent — batch eligibility check
│   │   └── tts.py              # Text-to-Speech endpoint (edge-tts)
│   ├── services/
│   │   └── ai_service.py       # Rule-based eligibility engine
│   └── uploads/                # Profile pictures & TTS cache
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx             # Routes, HomePage, ProtectedRoute
│   │   ├── main.jsx            # React entry point
│   │   ├── i18n.js             # i18next config (10 languages)
│   │   ├── index.css           # Global styles & CSS variables
│   │   ├── components/
│   │   │   └── Layout.jsx      # Header, nav, footer, lang dropdown
│   │   ├── contexts/
│   │   │   ├── AuthContext.jsx  # Auth state, JWT, refreshUser
│   │   │   └── LanguageContext.jsx  # Language state, i18n bridge
│   │   ├── pages/
│   │   │   ├── SignupPage.jsx   # Phone/email signup
│   │   │   ├── LoginPage.jsx    # Login
│   │   │   ├── OnboardingPage.jsx  # Voice-guided profile setup
│   │   │   ├── ProfilePage.jsx  # Edit profile & picture
│   │   │   ├── SchemesPage.jsx  # View & apply to schemes
│   │   │   └── AgentPage.jsx    # AI agent eligibility analysis
│   │   ├── utils/
│   │   │   ├── api.js           # Axios instance & endpoints
│   │   │   └── voice.js         # TTS (edge-tts) + STT utilities
│   │   └── locales/             # Translation JSON files
│   │       ├── en.json, hi.json, ta.json, te.json, bn.json
│   │       ├── mr.json, gu.json, kn.json, ml.json, pa.json
│   └── package.json
│
├── start.sh                    # Launch script (backend + frontend)
├── LICENSE                     # MIT License
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- **Python 3.9+** (Conda recommended)
- **Node.js 18+** and npm
- **SQLite** (comes pre-installed on most systems)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/pranavmodx/yojanaAI.git
cd yojanaAI

# 2. Set up the backend
cd backend
pip install -r requirements.txt
python seed.py          # Seed government schemes into DB
cd ..

# 3. Set up the frontend
cd frontend
npm install
cd ..

# 4. Start both servers
./start.sh
```

The app will be running at:
- **Frontend:** http://localhost:5173
- **Backend:** http://localhost:8000
- **API Docs:** http://localhost:8000/docs

### Environment Setup (Conda)

```bash
conda create -n yojanaAI python=3.9 -y
conda activate yojanaAI
pip install -r backend/requirements.txt
```

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/auth/signup` | Register with phone/email |
| `POST` | `/auth/login` | Login & receive JWT |
| `GET` | `/auth/me` | Get current user profile |
| `PATCH` | `/users/me/profile` | Update profile data |
| `POST` | `/users/me/profile-picture` | Upload profile picture |
| `GET` | `/schemes/` | List all schemes |
| `GET` | `/schemes/recommend/{user_id}` | Get recommended schemes |
| `POST` | `/apply/` | Apply to a scheme |
| `POST` | `/agent/run` | Run AI eligibility analysis |
| `POST` | `/agent/apply/{scheme_id}` | Apply via AI agent |
| `POST` | `/tts/speak` | Generate speech audio (edge-tts) |

---

## 🔮 Future Enhancements

- [ ] **LLM-based eligibility engine** — Replace rule-based matching with a fine-tuned language model
- [ ] **OCR document upload** — Auto-extract data from Aadhaar, ration cards, etc.
- [ ] **Real-time scheme data** — Integrate with government APIs for live scheme information
- [ ] **WhatsApp / SMS bot** — Reach users who don't have smartphones
- [ ] **Offline mode** — PWA with cached scheme data for low-connectivity areas
- [ ] **Admin dashboard** — Manage schemes, view analytics, and track applications
- [ ] **Push notifications** — Alert users about new eligible schemes

---

## 👥 Team

Built with ❤️ for rural India.

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
