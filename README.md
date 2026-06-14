<![CDATA[# Orbit

**Professional Salary Slip Generator by [Gaprio Labs](https://gaprio.in)**

Orbit is an internal tool that lets you fill out a web form with employee and salary details, then instantly generates a beautifully formatted PDF salary slip — complete with your company letterhead, earnings/deductions breakdown, net pay in words, and a year-to-date summary.

---

## Overview

Orbit is a **monorepo** containing two standalone applications that work together:

| Layer | Directory | What it does |
|---|---|---|
| **Frontend** | `orbit-frontend/` | A Next.js 16 web app that renders the salary slip form and sends the data to the backend. |
| **Backend** | `orbit-backend/` | A FastAPI server that receives form data, draws every element onto a PDF canvas using ReportLab, merges it with the company letterhead, and streams the finished file back. |

### How the flow works (step by step)

```
┌──────────────────────┐       POST /api/generate-salary-slip       ┌───────────────────────┐
│                      │  ─────────────────────────────────────────► │                       │
│   Next.js Frontend   │       (JSON with employee + salary data)   │   FastAPI Backend     │
│   (localhost:3000)   │                                             │   (localhost:8000)    │
│                      │  ◄───────────────────────────────────────── │                       │
└──────────────────────┘       application/pdf (streamed response)   └───────────────────────┘
```

1. The user fills in employee info (name, ID, designation, etc.) and salary details (gross amount, pay period, etc.) in the browser.
2. On clicking **"Generate Salary Slip"**, the frontend sends a `POST` request with the form data as JSON.
3. The backend validates the payload with **Pydantic**, draws all text, boxes, and tables onto a blank A4 canvas using **ReportLab**, then merges the canvas onto the company letterhead PDF (`gaprio_letter_head.pdf`) using **PyPDF**.
4. The finished PDF streams back to the browser and opens in a new tab for download.

---

## Features

- **One-Click PDF Generation** — Fill the form, press the button, and your salary slip opens instantly in a new browser tab.
- **Company Letterhead Overlay** — Every generated slip is merged onto `gaprio_letter_head.pdf` so it looks like it was printed on official stationery.
- **Automatic Deduction Calculations** — Professional Tax (₹200 flat), Income Tax / TDS (10%), and EPF (12%) are computed automatically from the gross salary.
- **Net Pay in Words** — The net pay amount is converted to Indian English words (e.g., *"Fifty-Six Thousand Four Hundred Only"*) using `num2words`.
- **Year-to-Date Summary** — A YTD section shows current-month and cumulative figures for earnings, deductions, and net pay.
- **Pre-filled Pay Date** — The "Pay Date" field defaults to today's date for convenience.
- **Date Picker Integration** — Both "Pay Period" (month picker) and "Pay Date" (date picker) fields use native browser date selectors.
- **Dark Mode UI** — A premium dark interface with the Gaprio brand palette (`#FC8B32` orange accent), subtle grid background, and glassmorphism-inspired card.
- **Responsive Layout** — The form grid adapts from 1 column on mobile → 2 on tablets → 3 on desktop.
- **Custom Typography** — IBM Plex Mono is used both on the web (via Google Fonts) and inside the PDF (via a bundled `.ttf` file).

---

## Tech Stack

### Frontend (`orbit-frontend/`)

| Technology | Version | Purpose |
|---|---|---|
| [Next.js](https://nextjs.org/) | 16.2.9 | React framework with App Router and Turbopack dev server |
| [React](https://react.dev/) | 19.2.4 | UI component library |
| [TypeScript](https://www.typescriptlang.org/) | ^5 | Static type checking |
| [Tailwind CSS](https://tailwindcss.com/) | v4 | Utility-first CSS framework |
| [Lucide React](https://lucide.dev/) | ^1.18.0 | Icon library (User, Mail, Phone, FileText, etc.) |
| [PostCSS](https://postcss.org/) | — | CSS processing pipeline (used by Tailwind v4) |
| [ESLint](https://eslint.org/) | ^9 | Code linting with Next.js config |

### Backend (`orbit-backend/`)

| Technology | Purpose |
|---|---|
| [FastAPI](https://fastapi.tiangolo.com/) | High-performance Python web framework for the REST API |
| [Uvicorn](https://www.uvicorn.org/) | ASGI server that runs FastAPI |
| [Pydantic](https://docs.pydantic.dev/) | Request/response data validation via `BaseModel` |
| [ReportLab](https://www.reportlab.com/) | Low-level PDF canvas drawing (text, rectangles, lines, fonts) |
| [PyPDF](https://pypdf.readthedocs.io/) | Reading the letterhead template and merging it with the generated overlay |
| [num2words](https://github.com/savoirfairelinux/num2words) | Converting the net pay number to Indian English words |
| [python-multipart](https://github.com/Kludex/python-multipart) | Required by FastAPI for form data parsing |

---

## Project Structure

```
Orbit/                              ← Monorepo root
│
├── README.md                       ← You are here
├── gaprio_letter_head.pdf          ← Company letterhead template (merged into every generated slip)
│
├── orbit-backend/                  ← Python / FastAPI backend
│   ├── main.py                     ← Entire API: Pydantic model + PDF generation endpoint
│   ├── requirements.txt            ← Python dependencies
│   ├── IBMPlexMono-Regular.ttf     ← Custom font embedded into PDFs
│   ├── venv/                       ← Python virtual environment (git-ignored)
│   └── __pycache__/                ← Compiled bytecode (git-ignored)
│
└── orbit-frontend/                 ← Next.js / React frontend
    ├── app/
    │   ├── layout.tsx              ← Root layout: HTML shell, Google Fonts (IBM Plex Mono), metadata
    │   ├── page.tsx                ← Main page: form fields, InputField component, submit handler
    │   └── globals.css             ← Design tokens (CSS variables), resets, scrollbar, grid background
    ├── public/
    │   └── gaprio_full_logo.png    ← Logo displayed in the form header
    ├── package.json                ← npm dependencies and scripts
    ├── tsconfig.json               ← TypeScript compiler options
    ├── next.config.ts              ← Next.js configuration
    ├── postcss.config.mjs          ← PostCSS config (Tailwind v4 plugin)
    ├── eslint.config.mjs           ← ESLint flat config with Next.js rules
    └── .gitignore                  ← Files excluded from version control
```

### Key files explained

| File | What it does |
|---|---|
| `orbit-backend/main.py` | Defines the `SalarySlipRequest` Pydantic model with 10 fields (employee name, email, phone, slip number, salary amount, employee ID, designation, pay period, pay date, bank account no.). The `POST /api/generate-salary-slip` endpoint creates a ReportLab canvas, draws the header ("SALARY SLIP"), employee details box, earnings/deductions tables, net pay box with words, and YTD summary. It then merges this canvas onto the letterhead PDF and streams the result. |
| `orbit-frontend/app/page.tsx` | A `"use client"` component that manages form state with `useState`. The `InputField` component renders a styled `<input>` element. On submit, it `fetch`es the backend, converts the response to a Blob, and opens it in a new tab via `URL.createObjectURL`. |
| `orbit-frontend/app/globals.css` | Declares CSS custom properties (design tokens) for the dark theme: `--bg-void`, `--brand-primary`, `--text-pure`, etc. Also sets up the decorative grid background using CSS `linear-gradient` and `mask-image`. |

---

## Installation

### Prerequisites

Make sure you have the following installed on your machine:

- **Node.js** ≥ 18 — [Download here](https://nodejs.org/)
- **Python** ≥ 3.10 — [Download here](https://www.python.org/downloads/)
- **Git** — [Download here](https://git-scm.com/)

### Step 1 — Clone the repository

```bash
git clone https://github.com/GaprioLabs/Orbit.git
cd Orbit
```

### Step 2 — Set up the backend

```bash
# Navigate to the backend directory
cd orbit-backend

# Create a Python virtual environment
python -m venv venv

# Activate it
# On Windows (PowerShell):
.\venv\Scripts\Activate.ps1
# On Windows (CMD):
.\venv\Scripts\activate.bat
# On macOS / Linux:
source venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt
```

> **What gets installed?** FastAPI, Uvicorn, ReportLab, PyPDF, Pydantic, python-multipart, and num2words.

### Step 3 — Set up the frontend

```bash
# Open a new terminal, navigate to the frontend directory
cd orbit-frontend

# Install Node.js dependencies
npm install
```

> **What gets installed?** Next.js 16, React 19, Tailwind CSS v4, Lucide icons, TypeScript, ESLint, and PostCSS.

---

## Running Locally

You need **two terminals** — one for the backend and one for the frontend.

### Terminal 1 — Start the backend server

```bash
cd orbit-backend

# Activate virtual environment (if not already active)
# Windows PowerShell:
.\venv\Scripts\Activate.ps1
# macOS / Linux:
source venv/bin/activate

# Start the FastAPI server
python main.py
```

You should see:

```
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
```

The API is now live at **http://localhost:8000**. You can verify it by visiting `http://localhost:8000/docs` in your browser to see the auto-generated Swagger documentation.

### Terminal 2 — Start the frontend dev server

```bash
cd orbit-frontend

# Start Next.js with Turbopack
npm run dev
```

You should see:

```
▲ Next.js 16.2.9 (Turbopack)
- Local:   http://localhost:3000
✓ Ready in ~500ms
```

### Using the app

1. Open **http://localhost:3000** in your browser.
2. Fill in the employee information (Name, Email, Phone, Employee ID, Designation).
3. Fill in the salary details (Slip Number, Pay Period, Pay Date, Bank Account No., Gross Salary Amount).
4. Click **"Generate Salary Slip"**.
5. The PDF opens in a new browser tab. You can download or print it from there.

---

## Environment Variables

Orbit is designed to work **out of the box without any `.env` files**. However, here are the implicit configuration values and how to change them if needed:

| Variable / Config | Default | Where it's set | How to change |
|---|---|---|---|
| Backend host | `0.0.0.0` | `orbit-backend/main.py` line 254 | Change `host` param in `uvicorn.run()` |
| Backend port | `8000` | `orbit-backend/main.py` line 254 | Change `port` param in `uvicorn.run()` |
| Frontend port | `3000` | Next.js default | Run `npm run dev -- -p 4000` for port 4000 |
| API URL | `http://localhost:8000` | `orbit-frontend/app/page.tsx` line 53 | Update the `fetch()` URL string |
| CORS origins | `*` (all origins) | `orbit-backend/main.py` line 23 | Restrict `allow_origins` list for production |
| Letterhead path | `../gaprio_letter_head.pdf` | `orbit-backend/main.py` line 222 | Move the PDF or update `letterhead_path` |

> **⚠️ Important for production:** If you deploy the frontend and backend to different domains, you **must** update the `fetch()` URL in `page.tsx` to point to the backend's production URL, and restrict the CORS `allow_origins` in `main.py` to your frontend's domain only.

---

## Deployment

### Frontend (Vercel — recommended)

The Next.js frontend deploys seamlessly to [Vercel](https://vercel.com/):

1. Push your repo to GitHub.
2. Go to [vercel.com/new](https://vercel.com/new) and import the repository.
3. Set the **Root Directory** to `orbit-frontend`.
4. Vercel auto-detects Next.js — click **Deploy**.
5. Update the `fetch()` URL in `page.tsx` to point to your backend's production URL before deploying.

### Backend (Railway, Render, or any VPS)

The FastAPI backend can be deployed to any platform that supports Python:

**Option A — [Railway](https://railway.app/)** or **[Render](https://render.com/)**
1. Create a new project and connect your GitHub repo.
2. Set the **Root Directory** to `orbit-backend`.
3. Set the **Start Command** to:
   ```bash
   uvicorn main:app --host 0.0.0.0 --port $PORT
   ```
4. Ensure `gaprio_letter_head.pdf` is accessible (copy it into `orbit-backend/` or set the path via an environment variable).

**Option B — Any Linux VPS (e.g., DigitalOcean, AWS EC2)**
```bash
# SSH into your server, clone the repo, then:
cd Orbit/orbit-backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Copy the letterhead into the backend directory
cp ../gaprio_letter_head.pdf .

# Run with Uvicorn (use a process manager like systemd or pm2 in production)
uvicorn main:app --host 0.0.0.0 --port 8000
```

> **📝 Note:** The `gaprio_letter_head.pdf` file must be in the **parent directory** of `orbit-backend/` (i.e., the repo root), or you must update the `letterhead_path` in `main.py` to reflect its actual location.

---

## API Reference

The backend exposes a single endpoint:

### `POST /api/generate-salary-slip`

**Request Body** (JSON):

```json
{
  "employee_name": "Arjun Mehta",
  "employee_email": "arjun@gaprio.in",
  "employee_phone": "+91 98765 43210",
  "salary_slip_number": "GS-001",
  "salary_amount": 80000.00,
  "employee_id": "GAP1234",
  "designation": "Software Engineer",
  "pay_period": "2026-06",
  "pay_date": "2026-06-15",
  "bank_account_no": "XXXX XXXX 1234"
}
```

**Response:**
- `200 OK` — Returns the generated PDF as a binary stream with `Content-Type: application/pdf`.
- `500 Internal Server Error` — Returns a JSON error object if something goes wrong.

**Example using cURL:**

```bash
curl -X POST http://localhost:8000/api/generate-salary-slip \
  -H "Content-Type: application/json" \
  -d '{
    "employee_name": "Arjun Mehta",
    "employee_email": "arjun@gaprio.in",
    "employee_phone": "+91 98765 43210",
    "salary_slip_number": "GS-001",
    "salary_amount": 80000,
    "employee_id": "GAP1234",
    "designation": "Software Engineer",
    "pay_period": "2026-06",
    "pay_date": "2026-06-15",
    "bank_account_no": "XXXX XXXX 1234"
  }' --output salary_slip.pdf
```

This saves the generated PDF to `salary_slip.pdf` in your current directory.

---

## PDF Layout Breakdown

The generated salary slip has the following visual structure (from top to bottom):

```
┌─────────────────────────────────────────────────────────┐
│  SALARY SLIP          GS-001              15/06/2026    │  ← Header row
│  ─────────── (orange underline)                         │
│                                                         │
│  ┌─────────────────────────────────────────────────┐    │
│  │ Employee Name  : Arjun Mehta    Pay Period : ...│    │  ← Employee Details Box
│  │ Employee ID    : GAP1234        Pay Date   : ...│    │    (rounded rectangle)
│  │ Designation    : SE             Bank Acc.  : .. │    │
│  └─────────────────────────────────────────────────┘    │
│                                                         │
│  ┌──────────────────┬───────────────────────┐           │
│  │    EARNINGS      │     DEDUCTIONS        │           │  ← Orange header bar
│  ├──────────────────┼───────────────────────┤           │
│  │ Basic Salary  ₹X │ Prof. Tax       ₹200  │           │  ← Line items
│  │                  │ TDS (10%)       ₹X    │           │
│  │                  │ EPF (12%)       ₹X    │           │
│  ├──────────────────┼───────────────────────┤           │
│  │ TOTAL (A)     ₹X │ TOTAL (B)       ₹X    │           │  ← Totals row
│  └──────────────────┴───────────────────────┘           │
│                                                         │
│  ┌────────────┬────────────────────────────────┐        │
│  │ NET PAY    │ ₹ XX,XXX.00                    │        │  ← Net Pay box
│  │ (A - B)    │ (In Words: ... Only)           │        │    (dark bg + white text)
│  └────────────┴────────────────────────────────┘        │
│                                                         │
│  ┌─────────────────────────────────────────────────┐    │
│  │         YEAR TO DATE SUMMARY (FY: 2025-26)      │    │  ← YTD section
│  │  Particulars    Current Month     Year to Dat   │    │    (orange header)
│  │  Total Earnings      ₹X                ₹X       │    │
│  │  Total Deductions    ₹X                ₹X       │    │
│  │  Net Pay             ₹X                ₹X       │    │
│  └─────────────────────────────────────────────────┘    │
│                                                         │
│  Computer generated slip, no signature required.        │  ← Footer
└─────────────────────────────────────────────────────────┘
```

---

## Troubleshooting

| Problem | Solution |
|---|---|
| `"Letterhead template not found"` error | Make sure `gaprio_letter_head.pdf` exists in the **root** of the repo (parent of `orbit-backend/`). |
| PDF opens but is blank | Check that `IBMPlexMono-Regular.ttf` exists in `orbit-backend/`. |
| CORS error in browser console | Ensure the backend is running on port 8000. If you changed the port, update the `fetch()` URL in `page.tsx`. |
| `npm run dev` fails | Run `npm install` in the `orbit-frontend/` directory first. Requires Node.js ≥ 18. |
| `python main.py` fails with `ModuleNotFoundError` | Activate your virtual environment and run `pip install -r requirements.txt`. |
| Frontend styling looks broken after code changes | Stop the dev server (`Ctrl+C`), delete `.next/` folder, and restart with `npm run dev`. |

---

## Contributing

Contributions are welcome! Here's how to get started:

1. **Fork** the repository on GitHub.
2. **Clone** your fork locally:
   ```bash
   git clone https://github.com/YOUR-USERNAME/Orbit.git
   ```
3. **Create a feature branch:**
   ```bash
   git checkout -b feature/your-feature-name
   ```
4. **Make your changes** — follow the existing code style and project structure.
5. **Test locally** — make sure both frontend and backend run without errors.
6. **Commit** with a descriptive message:
   ```bash
   git commit -m "feat: add HRA and DA allowance fields"
   ```
7. **Push** to your fork and open a **Pull Request** against the `main` branch.

### Code style guidelines

- **Frontend:** TypeScript with strict mode. Use Tailwind CSS utility classes. Follow the existing CSS variable pattern in `globals.css`.
- **Backend:** Python with type hints. Use Pydantic models for request validation. Keep all PDF drawing logic inside the single `main.py` for simplicity.

---

## License

```
MIT License

Copyright (c) 2025 Gaprio Labs

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

<p align="center">
  Built with ☕ by <strong>Hanu Shashwat</strong>
</p>
]]>
