# 💳 BudgetMate

> **Shared expenses, AI-powered financial insights, simplified household budget management.**

BudgetMate is a modern, full-stack expense management web application designed for roommates and shared households. It simplifies tracking shared expenses, splitting bills, managing monthly category budgets, requesting settlements, and receiving intelligent financial advice powered by Google's Gemini AI.

---

## ✨ Key Features

- 🤖 **AI-Powered Spending Insights**: Real-time financial analysis powered by Google's **Gemini 2.0 Flash** model via custom backend API endpoints (`/api/ai-insights`), delivering personalized budget warnings, saving tips, and predictions.
- 🔐 **Secure Authentication**: User sign-up, login, and session persistence integrated with **Supabase Auth**.
- 👥 **Household & Roommate Management**: Create or join household groups with invite codes and track active roommates.
- 💸 **Expense Tracking & Fair Bill Splitting**: Easily log expenses, tag categories, specify who paid, and calculate split balances across room members.
- 💰 **Settlement Calculation & Approval Workflow**: Automated net balance math with permission-based settlement workflows and debt clearance tracking.
- 📊 **Visual Analytics & Monthly Budgets**: Dynamic spending breakdowns and budget status powered by **Recharts** and modern UI charts.
- 🖼️ **Profile & Avatar Management**: Custom profile editing with image avatar uploads direct to Supabase Storage (`avatars` bucket).
- 🔒 **Row-Level Security (RLS)**: Enforced database isolation protecting private profile and household data.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 19 + Vite 6
- **Language**: TypeScript 5.8
- **Styling**: Tailwind CSS v4 + Motion (Framer Motion)
- **Icons**: Lucide React
- **Data Visualization**: Recharts

### Backend & AI Services
- **Server**: Express.js running via `tsx`
- **AI Model Integration**: `@google/genai` (Gemini 2.0 Flash)
- **Build & Packaging**: `esbuild` for production server bundling

### Database & Storage
- **Platform**: Supabase (PostgreSQL, Supabase Auth, Row Level Security, Supabase Storage)

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18 or higher)
- **npm** (or `bun` / `yarn`)
- **Supabase Account & Project** (for database & auth)
- **Gemini API Key** (from [Google AI Studio](https://aistudio.google.com/))

---

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd budgetmate
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

---

### Environment Configuration

Create a `.env` file in the root directory (refer to [.env.example](.env.example)):

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Gemini AI API Configuration
GEMINI_API_KEY=your_gemini_api_key

# Hosting Application URL (Optional / Production)
APP_URL=http://localhost:3000
```

---

### Database Setup

Execute the SQL script in [supabase_schema.sql](supabase_schema.sql) inside your Supabase project's **SQL Editor**:

1. Creates the `public.profiles` table with auto-updating timestamps.
2. Enables Row Level Security (RLS) and attaches secure access policies.
3. Sets up the public `avatars` storage bucket with upload & view policies.

---

### Running the App

#### Development Mode
Runs the Express server with Vite dev middleware on port 3000:
```bash
npm run dev
```
Open **http://localhost:3000** in your browser.

#### Production Build & Execution
```bash
# 1. Build frontend assets and bundle backend server
npm run build

# 2. Start production node server
npm start
```

---

## 📜 Available Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts local Express + Vite dev server (`tsx server.ts`) |
| `npm run build` | Builds Vite client bundle & bundles `server.ts` into `dist/server.cjs` via `esbuild` |
| `npm start` | Executes the built production server (`dist/server.cjs`) |
| `npm run preview` | Previews the built production assets via Vite |
| `npm run lint` | Runs TypeScript type checking (`tsc --noEmit`) |
| `npm run clean` | Cleans up the `dist` directory |

---

## 📁 Project Structure

```
budgetmate/
├── server.ts                                       # Express server & Gemini AI endpoint (/api/ai-insights)
├── supabase_schema.sql                             # Database schema & Supabase RLS setup
├── BudgetMate_Settlement_Permission_Logic_Specification.md  # Settlement authorization specification
├── public/                                         # Public static assets & favicon
├── src/
│   ├── main.tsx                                    # React entry point
│   ├── App.tsx                                     # Application routes & global layout
│   ├── components/                                 # UI components
│   │   ├── ai/                                     # Gemini AI insights UI cards & modals
│   │   ├── analytics/                              # Spending analytics charts
│   │   ├── auth/                                   # Authentication forms (Login/Signup)
│   │   ├── budgets/                                # Category budget cards & progress bars
│   │   ├── dashboard/                              # Main overview dashboard
│   │   ├── expenses/                               # Expense creation & list tables
│   │   ├── household/                              # Roommate list & room management
│   │   ├── profile/                                # User profile & avatar settings
│   │   └── settlements/                            # Settlement calculation & permission workflows
│   ├── context/                                    # React Context state management
│   ├── hooks/                                      # Custom React hooks
│   ├── lib/                                        # Supabase client initialization
│   ├── services/                                   # API service layers
│   └── types/                                      # TypeScript type definitions
└── vite.config.ts                                  # Vite build configuration
```

---

## 📖 Specifications & Documentation

- [Settlement Permission Logic Specification](BudgetMate_Settlement_Permission_Logic_Specification.md): Architectural document detailing permission scopes, settlement lifecycle states, and authorization rules for roommate bill settlements.

---

## 📄 License

This project is licensed under the MIT License.
