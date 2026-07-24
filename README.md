# 10X CRM

10X CRM is a robust, responsive client relationship management platform designed specifically for sales representatives to manage leads and deals. Developed as a pure frontend solution, it leverages local storage caching and connects dynamically with remote endpoints to create a seamless workspace environment.

## Features

- **Route Protection & Security:** Active route guarding (`guard.js`) prevents unauthenticated page visits and automatically redirects active sessions.
- **Dynamic Theming:** Seamless global Light/Dark mode state management synced automatically across all views.
- **Client Base Management:** Full CRUD capability powered by a remote REST API (`dummyjson.com`) and backed by localized persistent storage.
- **Lead Metrics Dashboard:** Real-time calculation of active deals count, total value of pipeline leads, win rates, and progress distributions.
- **Interactive Reminders & Notes:** Detailed client profiles supporting live timestamps for phone call/meeting notes and single-click follow-up timers.

## Tech Stack

- **Markup:** Semantic HTML5 Structure
- **Styling:** Custom Neomorphic/Glassmorphic Vanilla CSS Variables
- **Logic:** Vanilla ES6+ JavaScript (DOM Manipulation, Promises, fetch API, Async/Await)
- **Data Persistence:** LocalStorage State Caching
- **External API:** DummyJSON API

## How to Run

1. Open your terminal in the project root directory.
2. Run a simple static file server. For example, using Python:
   ```bash
   python -m http.server 8080
   ```
   Or using Node.js:
   ```bash
   npx http-server -p 8080
   ```
3. Open your browser and navigate to `http://localhost:8080`.

## Live Demo

- **URL:** [10x-crm-nutsa.vercel.app](https://10x-crm-nutsa.vercel.app)

## Test Account

To log in immediately without completing the registration form, you can use the pre-configured demo account:

- **Email:** `demo@test.com`
- **Password:** `Password123`

## Credits

Special thanks to my 10X JavaScript mentors, lecturers and classmates for architectural guidance and support.
Aespecially big thanks to those who where ready toa answer e. g. from the work, from Turkey, from public transport, etc. You know who you are.
