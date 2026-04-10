# GigFinder

> Your AI-powered career companion. 

GigFinder is a modern, AI-first job search platform designed to help you find your next gig, optimize your profile, and prepare for interviews. Built with a bold neo-brutalist design, it leverages the power of Google's Gemini AI to provide a personalized and intelligent job hunting experience.

## ✨ Features

- **🔍 Smart Job Search:** Instantly search through thousands of active jobs with advanced filtering (Remote, Salary, Experience, Skills).
- **🤖 AI Career Coach:** Chat with "GigCoach", your personal AI mentor powered by Gemini, for resume reviews, interview prep, and career advice.
- **📄 AI Resume Parser:** Upload your resume (PDF/Image) or paste the text, and let Gemini automatically extract your skills, experience, and details to build your "Vibe" (Profile).
- **🎙️ Voice Search:** Global voice widget to search for jobs hands-free.
- **📰 Discovery Feed:** Curated career feeds and trending job categories based on your profile.
- **🔖 Stashed Jobs:** Save your favorite gigs and keep track of your applications.
- **🎨 Neo-Brutalist UI:** A highly responsive, accessible, and visually striking interface built with Tailwind CSS.

## 🛠️ Tech Stack

- **Frontend:** React 18, TypeScript, Vite
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **AI Integration:** Google Gen AI SDK (`@google/genai`) using Gemini 3 Flash
- **State Management:** React Hooks (useState, useEffect)

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- A Google Gemini API Key

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/gigfinder.git
   cd gigfinder
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   Create a `.env.local` file in the root directory and add your Gemini API key:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

5. **Open the app:**
   Visit `http://localhost:3000` in your browser.

## 🔐 Demo Account

To test the application without creating a new account, you can use the built-in demo credentials:
- **Email:** `demo@example.com`
- **Password:** `password`

## 📁 Project Structure

- `/components`: Reusable UI components (JobCard, Sidebar, TopBar, etc.)
- `/services`: Core business logic and API integrations (`gemini.ts`, `authService.ts`, `jobDatabase.ts`)
- `/types.ts`: TypeScript interface definitions
- `App.tsx`: Main application routing and state management
- `vite.config.ts`: Vite configuration including environment variable injection

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
