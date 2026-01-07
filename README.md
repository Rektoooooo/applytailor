<p align="center">
  <img src="public/applytailor-icon.svg" alt="ApplyTailor Logo" width="80" height="80" />
</p>

<h1 align="center">ApplyTailor</h1>

<p align="center">
  <strong>AI-powered job application tailoring tool</strong>
</p>

<p align="center">
  Generate tailored CVs, cover letters, and professional email responses in seconds.
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#tech-stack">Tech Stack</a> •
  <a href="#getting-started">Getting Started</a> •
  <a href="#project-structure">Project Structure</a> •
  <a href="#environment-variables">Environment Variables</a>
</p>

---

## Features

### CV Tailoring
- **Smart Analysis** - Paste any job description and get instant keyword analysis
- **Tailored Bullets** - AI transforms your experience into role-specific achievements
- **Match Score** - See how well your profile matches job requirements
- **Multiple Templates** - Export to professional PDF with various designs

### Cover Letter Generation
- **Personalized Content** - AI-generated cover letters based on your profile and job requirements
- **One-Click Refinement** - Make it shorter, regenerate, or adjust tone
- **Copy & Export** - Ready to paste or download

### Smart Reply
- **Email Response Generator** - Paste recruiter emails (interviews, rejections, offers, follow-ups)
- **Context-Aware** - Link to applications for better personalization
- **Conversation History** - Track all your email exchanges
- **Professional Tone** - Always sound polished and appropriate

### Base Profile
- **One-Time Setup** - Enter your experience, skills, and achievements once
- **Reusable Data** - Powers all your tailored applications
- **Completion Tracking** - See your profile strength

### Application Tracking
- **Status Management** - Track applications from draft to accepted
- **Search & Filter** - Find applications by company, role, or status
- **Statistics** - Monitor success rate, response times, and more

## Tech Stack

| Category | Technology |
|----------|------------|
| **Frontend** | React 19, Vite, React Router 7 |
| **Styling** | Tailwind CSS 4, Framer Motion |
| **Backend** | Supabase (PostgreSQL, Auth, Edge Functions) |
| **AI** | Anthropic Claude API |
| **Payments** | Stripe |
| **PDF Export** | jsPDF, html2canvas |
| **Deployment** | Vercel |

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account
- Stripe account
- Anthropic API key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/applytailor.git
   cd applytailor
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env.local
   ```
   Fill in your API keys (see [Environment Variables](#environment-variables))

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Deploy Supabase Edge Functions**
   ```bash
   supabase functions deploy --no-verify-jwt
   ```

## Project Structure

```
applytailor/
├── src/
│   ├── components/       # Reusable UI components
│   │   ├── cv-templates/ # PDF export templates
│   │   ├── Header.jsx
│   │   ├── Sidebar.jsx
│   │   ├── CompanyLogo.jsx
│   │   └── ...
│   ├── contexts/         # React contexts (Auth, Search, etc.)
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # API clients and utilities
│   │   ├── supabase.js   # Supabase client & queries
│   │   └── aiApi.js      # AI API functions
│   ├── pages/            # Route components
│   │   ├── Dashboard.jsx
│   │   ├── NewApplication.jsx
│   │   ├── Results.jsx
│   │   ├── SmartReply.jsx
│   │   └── ...
│   ├── App.jsx           # Main app with routing
│   └── main.jsx          # Entry point
├── supabase/
│   ├── functions/        # Edge functions
│   │   ├── generate-content/
│   │   ├── generate-reply/
│   │   ├── refine-bullet/
│   │   ├── refine-cover-letter/
│   │   └── ...
│   └── migrations/       # Database migrations
├── public/               # Static assets
└── api/                  # Vercel API routes
```

## Environment Variables

Create a `.env.local` file with:

```env
# Supabase
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Stripe
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
```

For Supabase Edge Functions, set these secrets:

```bash
supabase secrets set ANTHROPIC_API_KEY=your_anthropic_key
supabase secrets set STRIPE_SECRET_KEY=your_stripe_secret
supabase secrets set STRIPE_WEBHOOK_SECRET=your_webhook_secret
```

## Database Schema

Key tables:

- **user_profiles** - User settings, credits, preferences
- **applications** - Job applications with tailored content
- **conversations** - Smart Reply conversation threads
- **conversation_messages** - Individual messages in threads

## Credits System

| Action | Cost |
|--------|------|
| Generate application | 1 credit |
| Refine bullet/cover letter | Free (5 per app) then 0.25 credits/5 edits |
| Smart Reply | Free (3 lifetime) then 0.10 credits/5 replies |

## Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

## Deployment

### Vercel

1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy

### Supabase Edge Functions

```bash
supabase login
supabase link --project-ref your-project-ref
supabase functions deploy --no-verify-jwt
```

## License

This project is proprietary software. All rights reserved.

---

<p align="center">
  Built with Claude AI
</p>
