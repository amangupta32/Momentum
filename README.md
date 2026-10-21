# Momentum 🚀

A modern, high-performance goal and task workspace built with **React**, **TypeScript**, **Vite**, and **Supabase**.

Momentum is designed to help individuals and teams track high-leverage goals, manage tasks with an interactive board, conduct weekly reviews, monitor blockers, and collaborate securely with Supabase authentication.

---

## ✨ Features

- **🔐 Secure Authentication**: Integrated with Supabase Auth (email/password signup, login, password recovery, and secure sessions).
- **🎯 Goals & Milestones**: Track strategic objectives with measurable progress, sub-milestones, and target dates.
- **📋 Interactive Task Board**: Kanban-style task management with priority levels, blockers, and status tags.
- **🛡️ Blocker Radar**: Visualize and clear friction points that stall progress.
- **📈 Commitment Wall & Weekly Review**: Reflect on weekly achievements, maintain momentum, and plan upcoming sprints.
- **📝 Scoped Notes & Scratchpad**: Context-rich notes linked directly to your active authenticated account.
- **⚡ Supercharged DX**: Fast Vite HMR, typed components with TypeScript, and clean modular architecture.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Modern CSS with smooth transitions and glassmorphism styling
- **Backend / Database**: Supabase (PostgreSQL with Row Level Security)
- **State & Storage**: Account-scoped local persistence + Supabase client integration

---

## 🚀 Getting Started

### 1. Prerequisites
Ensure you have Node.js (version 18 or newer) and npm installed.

### 2. Installation
Clone the repository and install dependencies:
```bash
git clone https://github.com/amangupta32/Momentum.git
cd Momentum
npm install
npm --prefix Productivity install
```

### 3. Environment Configuration
Navigate to the `Productivity` directory and set up your Supabase credentials:
```bash
cp Productivity/.env.example Productivity/.env
```

Open `Productivity/.env` and supply your Supabase project keys:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
```

### 4. Database Setup
Set up the required tables and security policies:
1. Open your project on the [Supabase Dashboard](https://supabase.com/dashboard).
2. Go to the **SQL Editor**.
3. Run the schema migrations from [`Productivity/supabase/schema.sql`](./Productivity/supabase/schema.sql).

### 5. Running the Development Server
From the root directory, start the app:
```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser to view the application.

---

## 📂 Project Structure

```
Momentum/
├── package.json               # Root scripts for dev, build, and lint
├── .gitignore                 # Root gitignore protecting secrets & build artifacts
├── README.md                  # Project overview & documentation
└── Productivity/              # Main application directory
    ├── index.html             # HTML entry point
    ├── vite.config.ts         # Vite configuration
    ├── package.json           # Application dependencies
    ├── public/                # Static assets & icons
    ├── src/
    │   ├── components/        # UI Views (Auth, Goals, Tasks, Dashboard, etc.)
    │   ├── context/           # App state management & providers
    │   ├── services/          # Supabase client & storage utilities
    │   └── types/             # TypeScript definitions
    └── supabase/
        ├── schema.sql         # Database schema & RLS policies
        └── migrations/        # Versioned database migrations
```

---

## 📜 License

MIT License. Feel free to use and adapt for your own productivity workflows.
