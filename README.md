# Learnify

Social learning platform for online courses with an integrated AI tutor and sandboxed in-browser code execution.

Final-year capstone project in Software Engineering, Sami Shamoon College of Engineering.

**Live API:** https://learnify-ahmad-axg6had3hcfhbhbr.israelcentral-01.azurewebsites.net/api/health/
running on Azure App Service (Linux) with Azure Database for PostgreSQL, deployed through GitHub Actions on every push to `main`.

---

## About

Learnify is a web platform that combines online course delivery, hands-on coding practice, and a social feed. Instructors create courses and sell them, students enroll and learn, and the platform supports the full learning loop: video lessons, downloadable materials, quizzes and assignments, live sessions, and a course-scoped AI assistant that answers questions based on the course materials.

The project was built end-to-end by a team of two as part of the Software Engineering B.Sc. program, covering the backend, frontend, database, and external integrations.

---

## Features

**Learning**
- Course catalog with categories, search, and instructor profiles
- Video lessons with progress tracking and auto-resume
- Downloadable course resources (PDFs, files)
- Quizzes, exams, and assignments with automatic and manual grading
- Sandboxed code editor (write, run, save, share)
- AI Tutor scoped to each course's materials
- Live sessions via Zoom integration

**Community**
- Social feed for posts, comments, and likes
- Per-course forums
- Sharing code snippets in posts and discussions

**Roles**
- Student: browse, enroll, learn, ask, post
- Instructor: create and manage courses, schedule live sessions, grade assignments, view analytics
- Admin: manage users, review teacher applications, moderate content, oversee platform metrics

**Other**
- JWT authentication with refresh tokens
- Role-Based Access Control (RBAC) enforced across all endpoints
- Email notifications for enrollment, assignments, grades, live sessions, and account events
- Sandbox payment flow for subscriptions and course purchases
- Dashboards and analytics for all three roles

---

## Tech Stack

**Backend**
- Python 3
- Django + Django REST Framework
- PostgreSQL
- JWT authentication

**Frontend**
- React 18
- Vite
- Tailwind CSS

**External Services**
- OpenAI API (course-scoped AI Tutor)
- Judge0 API (sandboxed code execution)
- Zoom API (live sessions)
- SMTP (email notifications)

---

## Project Structure

```
learnify/
├── backend/
│   ├── server/         # Django project configuration
│   ├── core/           # Shared models and base logic
│   ├── users/          # Authentication, profiles, RBAC
│   ├── courses/        # Courses, enrollments, assessments
│   ├── social/         # Feed, posts, comments
│   ├── ide/            # Code execution and snippets
│   ├── templates/      # Email templates
│   └── manage.py
└── frontend/
    ├── src/
    │   ├── pages/      # Page components (Home, Login, course views, etc.)
    │   ├── components/ # Reusable UI components
    │   ├── context/    # Auth and cart contexts
    │   └── lib/        # API clients
    └── vite.config.js
```

---

## Getting Started

### Prerequisites

- Python 3.10 or higher
- Node.js 18 or higher
- PostgreSQL 14 or higher
- An OpenAI API key (for the AI Tutor)
- A Judge0 API endpoint (self-hosted or RapidAPI)
- Optional: Zoom credentials for live sessions, SMTP credentials for email

### Backend Setup

```bash
cd backend
python -m venv .venv

# Activate the virtual environment
.venv\Scripts\activate          # Windows
source .venv/bin/activate       # macOS / Linux

pip install -r requirements.txt

# Create your local .env from the example
cp .env.example .env
# Then edit .env and fill in your own values

python manage.py migrate
python manage.py runserver
```

The backend will be available at http://localhost:8000.

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at http://localhost:5173.

### Environment Variables

The backend reads configuration from a `.env` file. See `.env.example` for the full list of keys:

```
SECRET_KEY=
DEBUG=
ALLOWED_HOSTS=

DB_NAME=
DB_USER=
DB_PASSWORD=
DB_HOST=
DB_PORT=

CORS_ORIGINS=

JUDGE0_URL=

ZOOM_ACCOUNT_ID=
ZOOM_CLIENT_ID=
ZOOM_CLIENT_SECRET=

EMAIL_HOST_USER=
EMAIL_HOST_PASSWORD=

OPENAI_API_KEY=
```

The actual `.env` file is excluded by `.gitignore` and should never be committed.

---

## Running the tests

The backend ships with an automated API test suite (pytest + pytest-django),
the automated translation of the manual test plan from the project report:
authentication, profile management, the course catalogue and cart,
role-based access control, and the AI tutor endpoint.

```bash
cd backend
pip install -r requirements-dev.txt
pytest
```

The suite runs against a temporary test database, so it never touches your
development data.

---

## Team

- Ahmad Mashal
- Morad Khamaesy

Academic advisor: Dr. Karim Abu Affash

Sami Shamoon College of Engineering, Software Engineering B.Sc., 2026.

---

## Status

The project was presented to the supervisory committee in May 2026 and submitted as part of the final-year capstone.
