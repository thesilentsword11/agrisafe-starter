# AgriSafe

**AI-Based Leafy Vegetable Image Screening and Pesticide Residue Risk Assessment**

AgriSafe is a full-stack food-safety decision-support application combining image-based produce recognition with laboratory-based pesticide residue assessment.

## Features

- User registration and JWT authentication
- Admin dashboard and role-based access
- Produce sample management
- Pesticide and Maximum Residue Limit (MRL) management
- Laboratory residue assessment against configured MRL values
- Assessment history
- AI-powered fruit and vegetable image recognition
- Image upload for produce screening

## Technology Stack

**Frontend:** React, Vite, JavaScript, CSS

**Backend:** Python, FastAPI

**Database:** SQLite

**AI Model:** MobileNetV2 with TensorFlow.js

**Authentication:** JWT

## Important Scientific Limitation

The image recognition model identifies produce from an image. It does not detect pesticide residues or determine whether food is chemically safe.

Pesticide residue levels must be established through laboratory testing. AgriSafe compares laboratory-measured values with configured MRL records. If laboratory measurements are unavailable, residue safety cannot be determined from the photograph.

Only verified and appropriately sourced MRL data should be used for real-world assessments. Demo values are not official regulatory limits.

## Project Structure

```text
agrisafe-starter/
├── backend/
│   ├── app/
│   │   ├── routers/
│   │   ├── main.py
│   │   ├── models.py
│   │   ├── schemas.py
│   │   └── ...
│   ├── create_admin.py
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── public/
│   │   └── agrisafe-model/
│   ├── src/
│   ├── package.json
│   └── .env.example
└── README.md
```

## Requirements

- Python 3.10 or newer
- Node.js and npm
- Git

## Installation and Setup

### 1. Clone the repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
cd agrisafe-starter
```

### 2. Configure the backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
```

Edit `backend/.env` and set a unique, strong `SECRET_KEY`.

### 3. Start the backend

From the `backend` directory, with the virtual environment activated:

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

Backend API documentation:

```text
http://127.0.0.1:8000/docs
```

### 4. Create an administrator account

Open another terminal:

```bash
cd backend
source .venv/bin/activate
python create_admin.py
```

Follow the prompts to create an administrator.

### 5. Configure the frontend

Open another terminal:

```bash
cd frontend
npm install
cp .env.example .env
```

Set `VITE_API_URL` in `frontend/.env` to your backend URL.

For a local setup:

```env
VITE_API_URL=http://127.0.0.1:8000
```

### 6. Start the frontend

From the `frontend` directory:

```bash
npm run dev -- --host 0.0.0.0
```

Open the frontend URL shown in the terminal.

## GitHub Codespaces Setup

When running the project in GitHub Codespaces:

1. Start the backend on port `8000`.
2. Start the frontend on port `5173`.
3. Set `VITE_API_URL` in `frontend/.env` to your own Codespaces forwarded backend URL.
4. Set `FRONTEND_ORIGINS` in `backend/.env` to your own forwarded frontend URL.
5. Ensure the forwarded port visibility permits the frontend to access the backend.
6. Restart the servers after changing environment variables.

Each collaborator must configure their own environment variables and start their own backend and frontend servers. Local `.env` files and SQLite databases are not shared automatically.

## AI Model Information

The fruit and vegetable recognition model is based on MobileNetV2 and supports 36 produce categories.

Model source: https://huggingface.co/spaces/tml-engineering/fruit-vegetable-recognition

The prediction confidence represents the model's confidence in its selected class. It is not a measure of food safety.

## Disclaimer

AgriSafe is an academic project and a decision-support demonstration. It is not a substitute for accredited laboratory testing or official food-safety certification.
