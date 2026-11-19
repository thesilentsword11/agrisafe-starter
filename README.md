# AgriSafe

A full-stack starter for pesticide-residue assessment and food-safety decision support.

## Stack
- Frontend: React + Vite
- Backend: FastAPI + SQLAlchemy
- Database: SQLite (local development)
- Authentication: JWT access tokens with admin/user roles
- Reports: PDF endpoint scaffold (ReportLab)

> Important: AgriSafe does not detect or quantify pesticide residues from photographs. Residue comparisons require laboratory measurements. MRL data in this starter is user-entered/demo data and must be verified against current official FSSAI requirements before real-world use.

## Prerequisites
- Python 3.10+
- Node.js 20+ and npm
- Git

## 1. Clone / create the GitHub repository

Create an empty repository on GitHub named `agrisafe-pesticide-residue-system`, then:

```bash
git clone https://github.com/YOUR-USERNAME/agrisafe-pesticide-residue-system.git
cd agrisafe-pesticide-residue-system
```

Copy the contents of this project into that repository if you downloaded the ZIP.

## 2. Start the backend

```bash
cd backend
python -m venv .venv
```

Windows PowerShell:
```powershell
.venv\Scripts\Activate.ps1
```

macOS/Linux:
```bash
source .venv/bin/activate
```

Install and configure:
```bash
pip install -r requirements.txt
```

Copy `.env.example` to `.env` and replace `SECRET_KEY` with a long random secret.

Windows:
```powershell
Copy-Item .env.example .env
```

macOS/Linux:
```bash
cp .env.example .env
```

Run:
```bash
uvicorn app.main:app --reload
```

Backend: http://127.0.0.1:8000  
Interactive API docs: http://127.0.0.1:8000/docs

### Create the first admin

In a second terminal, activate the same virtual environment and run:

```bash
python -m app.create_admin
```

Follow the prompts. Admin creation is deliberately kept out of public registration.

## 3. Start the frontend

Open a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the URL printed by Vite, usually http://localhost:5173.

The frontend expects the backend at `http://127.0.0.1:8000`. To change it, create `frontend/.env`:

```env
VITE_API_URL=http://127.0.0.1:8000
```

## 4. Push to GitHub

From the project root:

```bash
git init
git add .
git commit -m "Initial AgriSafe full-stack starter"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/agrisafe-pesticide-residue-system.git
git push -u origin main
```

If you cloned the empty repository in step 1, skip `git init`, `git branch`, and `git remote add`; just commit and push.

## Included features

- User registration and login
- JWT authentication
- Admin and user roles
- Admin-only pesticide/MRL record creation
- Sample creation and listing
- Laboratory residue assessment
- Explicit `NO_MRL_FOUND` outcome when no matching limit exists
- Assessment history
- Health-check endpoint

## Important next steps before deployment

1. Replace the development secret key and configure environment-specific CORS.
2. Use HTTPS and a production database.
3. Add refresh-token/session revocation and rate limiting.
4. Validate all MRL records against the latest official FSSAI schedules, including commodity definitions, units, effective dates and footnotes.
5. Add audit logs and protect uploaded files before accepting real user data.
6. Have the regulatory interpretation reviewed by a qualified food-safety professional.
