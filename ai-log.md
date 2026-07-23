# AI Usage Log

This log documents interactions with AI assistants (Gemini/Claude) during the design, development, and optimization of the 10X CRM project.

---

## Entry 1: Core Layout and Theme System Setup

- **Goal:** Set up a neomorphic and glassmorphic responsive layout with unified dark/light themes.
- **Prompt & Tool:**
  - *Tool:* Claude 3.5 Sonnet
  - *Prompt:* "Create a CSS stylesheet for a neomorphic dashboard page. It needs CSS custom variables for colors, support for dark mode, and a glassmorphism style card container. Keep it clean and use vanilla CSS."
- **Result:** **Used with modifications.**
  - *Reason:* The colors generated were standard grey and white. I manually tweaked the HSL color variables to give it a premium, curated dark palette and sleek borders.
- **What I Learned:** CSS variables (`var(--bg-color)`) are incredibly powerful for global theme changes because toggling a single class on the `body` element modifies styles instantly across all elements.

---

## Entry 2: Routing Authentication Guard Implementation

- **Goal:** Prevent non-logged-in users from accessing dashboard, clients, or profile pages, and redirect logged-in users away from the login/signup views.
- **Prompt & Tool:**
  - *Tool:* Gemini 1.5 Pro
  - *Prompt:* "Write a basic JavaScript auth guard that redirects to index.html if crm_session doesn't exist in localStorage. Check the current path using window.location.pathname."
- **Result:** **Used and refactored.**
  - *Reason:* The initial code matched exact paths like `window.location.pathname === '/dashboard.html'`. When deployed, Vercel/Netlify hide the `.html` extension, causing the check to fail. I refactored the logic to use `.includes('dashboard')` to prevent routing bypasses.
- **What I Learned:** Checking paths via exact extensions is fragile in cloud deployments. Robust route checking must account for pretty URLs.

---

## Entry 3: Centralized Storage Utility (Prompt Refinement)

- **Goal:** Avoid code duplication of `JSON.parse` and key variables across multiple JS files.
- **Prompt & Tool (Initial - Vague):**
  - *Tool:* Gemini 1.5 Pro
  - *Prompt:* "How do I make a simple localStorage manager in JS?"
  - *Output:* A generic copy-paste function that didn't match our project structures or specific keys.
- **Prompt & Tool (Refined - Precise):**
  - *Prompt:* "Write a centralized JavaScript Storage object that has helper methods Storage.get(key, default) and Storage.set(key, value). It should safely wrap JSON.parse in a try-catch to prevent crashes. Declare keys crm_users, crm_session, crm_clients, and crm_theme as constants."
- **Result:** **Used directly.**
  - *Reason:* The refined prompt produced a tailored, bulletproof object that fit directly into `guard.js`, solving our DRY requirements.
- **What I Learned:** Being precise with input parameters and constraints (like wrapping in try-catch and outputting specific constant mappings) yields production-ready code.

---

## Entry 4: Clients API Sync & Error Handling (Critical Evaluation)

- **Goal:** Fetch initial client data from the DummyJSON API and handle loading/offline errors with a retry option.
- **Prompt & Tool:**
  - *Tool:* Gemini 1.5 Pro
  - *Prompt:* "Write a fetch function in JS that gets users from https://dummyjson.com/users?limit=30, maps them to a clientsState array with deal values, and writes them to local storage. Add error catch block."
- **Result:** **Rejected AI's mistake and manually corrected.**
  - *Reason:* The AI's code lacked check for `response.ok` (it only had try-catch). In fetch APIs, network issues trigger `catch`, but HTTP error codes like 500 or 404 do NOT throw an exception and must be manually verified via `response.ok`. If the API returned a 500 error, the AI code would have written corrupted empty arrays into storage. I added `if (!response.ok) throw new Error(...)` and implemented a visual "Retry" button.
- **What I Learned:** `fetch` only rejects a promise on network failures. Always validate HTTP status codes via `response.ok` before working with responses.

---

## Entry 5: Safe Client Deletion with Mock API Calls

- **Goal:** Sync local deletes with the DummyJSON API endpoints.
- **Prompt & Tool:**
  - *Tool:* Claude 3.5 Sonnet
  - *Prompt:* "Write a deleteClient(id) function in JS that prompts user confirmation, makes a DELETE fetch request to https://dummyjson.com/users/id, and removes the client from local state."
- **Result:** **Used with modifications.**
  - *Reason:* The prompt correctly sent requests, but caused crashes in tests when trying to delete newly added clients. Since newly added clients only exist locally, the mock API returned 404 Not Found. I added a catch condition to ignore 404 responses so the local state deletes correctly.
- **What I Learned:** When working with mock REST endpoints, mock servers do not persist data. Therefore, local client deletions must survive 404 responses gracefully.
