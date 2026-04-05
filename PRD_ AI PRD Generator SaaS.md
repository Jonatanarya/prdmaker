# PRD: AI PRD Generator SaaS

### TL;DR

A freemium SaaS app enabling users to define their product through a chat with a **configurable LLM** (default: Groq; alternatives: Google Gemini, OpenRouter, xAI Grok) and instantly generate a full PRD, including ERD and sequence diagrams. Built on Next.js 14, Tailwind, shadcn/ui, and Stripe Checkout for monetization. The platform targets indie hackers, startup founders, and product managers seeking speedy, high-quality PRDs without writing from scratch.

---

## Goals

### Business Goals

* Acquire 500 registered users within 60 days of launch.
* Convert 10% of free users to paid customers via Stripe Checkout.
* Maintain a hosting cost of Rp 0 by utilizing the Vercel free tier.
* Achieve first revenue within 2 weeks post-launch.
* Establish product-market fit with a rapid, 3–4 hour build cycle.

### User Goals

* Empower users to describe their product ideas via guided AI chat, eliminating manual PRD writing.
* Deliver a comprehensive, structured PRD with diagrams in under 5 minutes.
* Enable users to export PRDs as .md files for Notion or GitHub integration.
* Make freemium limits (2 free generations) transparent, with instant upgrades via Stripe.

### Non-Goals

* Exclude user authentication and account systems in v1 (usage tracked via localStorage).
* Do not include team collaboration or multi-user editing features.
* Omit custom PRD template editor in v1.

---

## User Stories

**Persona 1 — Indie Hacker**

* As an indie hacker, I want to describe my app idea in plain language, so that the AI generates a full PRD I can hand to a developer.
* As an indie hacker, I want to export my PRD as a .md file, so that I can paste it into my GitHub repo or Notion.

**Persona 2 — Startup Founder**

* As a startup founder, I want to see an ERD and sequence diagram auto-generated, so that I can validate my product architecture quickly.
* As a startup founder, I want to unlock unlimited PRD generations with a one-time payment, so that I can generate multiple PRDs for different features.

**Persona 3 — Product Manager (PM)**

* As a PM, I want a guided AI conversation that asks the right questions, so that I don’t miss critical sections like user flows or edge cases.
* As a PM, I want to see a usage counter showing how many free generations remain, so that I can plan before hitting the paywall.

---

## Functional Requirements

### Chat Page (Priority: P0)

* **AI Chat Interface:** Multi-turn conversation with the configured LLM provider, maintaining conversation context per session.
* **AI Persona:** ‘PRD Expert’ persona that structures questions to extract all required product context.
* **Generate PRD Button:** Appears contextually after sufficient information is gathered via the conversation.
* **Usage Counter:** Visibly displays number of free generations remaining (2 max), sourced from localStorage.

### PRD Result Page (Priority: P0)

* **Markdown Preview:** Renders the complete PRD with section headers using react-markdown.
* **Mermaid Diagram Rendering:** Renders ERD and sequence diagrams inline using Mermaid.js.
* **Export Button:** Exports/downloads the PRD as a .md file.

### Freemium & Paywall (Priority: P0)

* **Usage Tracking:** Tracks generation usage per session via localStorage.
* **Paywall Modal:** Triggered on 3rd generation attempt; presents pricing and upgrade options.
* **Stripe Checkout:** Integrates one-time and subscription payment flows.
* **Unlock Logic:** Upon Stripe webhook confirmation, sets an “unlimited access” flag for the user.

### API Layer (Priority: P0)

* **/api/chat/route.ts:** Handles streaming LLM calls (Vercel AI SDK) to maintain multi-turn chat sessions.
* **/api/generate/route.ts:** Generates a full PRD (including Mermaid syntax for diagrams) from input context; server-side Mermaid structure validation with one automatic retry if ERD/sequence blocks are missing or invalid.
* **lib/llm/client.ts:** Selects the active model from `LLM_PROVIDER` and the matching API key (Groq, Gemini, OpenRouter, or xAI).
* **Stripe Webhook Handler:** Manages post-payment logic to unlock unlimited access.

### Data Persistence (Priority: P1)

* **Supabase:** Stores generated PRDs linked to unique session identifiers.
* **.env.local:** Manages LLM keys (`GROQ_API_KEY`, `GOOGLE_GENERATIVE_AI_API_KEY`, or `OPENROUTER_API_KEY`), optional `LLM_PROVIDER` / model overrides, Stripe keys, and Supabase URL. See `.env.example` in the repo root.

---

## User Experience

**Entry Point & First-Time User Experience**

* Users land directly on the Chat page with no login or sign-up required.
* An instant AI onboarding prompt (“Hi! I'm your PRD Expert. Tell me about the product you want to build.”) kicks off the session.
* No lengthy tutorials—users are guided in real time by the AI.

**Core Experience**

* **Step 1:** The user types their product idea in the chat input.
  * The UI presents a single-line input, mirroring familiar messaging apps to reduce cognitive load.
  * Error handling for empty or overly short submissions (with helpful hints).
  * AI responds contextually, asking clarifying questions about the product (users, features, market, tech needs, monetization).
* **Step 2:** As the conversation progresses (4–6 exchanges typical), the “Generate PRD” button becomes active below the chat.
  * A badge displays “2 free generations remaining.”
* **Step 3:** User clicks “Generate PRD.” A progress/loading indicator displays while the LLM generates the markdown and Mermaid diagrams (optionally streamed in the UI once wired to the generate endpoint).
* **Step 4:** Upon completion, the user is taken to a Result page.
  * The full PRD renders in markdown, auto-formatted with clear section headers.
  * ERD + sequence diagrams are shown inline, rendered by Mermaid.js in a scrollable container.
  * A prominent “Export .md” button is available for saving or sharing.
* **Step 5 (Paywall):** On the 3rd generation attempt, the paywall modal appears.
  * Modal includes: feature summary, one-time/subscription price, and a “Unlock Now” CTA to Stripe Checkout.
* **Step 6 (Post-Payment):** Stripe webhook fires and updates the user’s unlock status (in localStorage or Supabase). User is redirected back to unlimited access.

**Advanced Features & Edge Cases**

* If the LLM returns malformed Mermaid syntax, the diagram area displays a fallback message (“Diagram unavailable — export .md to view raw syntax”). The generate API retries once when structural checks fail (missing `erDiagram` / `sequenceDiagram` or empty blocks); complex syntax errors may still require client-side fallback.
* If Stripe webhook fails, offer a manual unlock flow (e.g., via email receipt).
* For long PRDs, enable pagination or collapsible sections in the result view for improved navigation.

**UI/UX Highlights**

* Streaming responses in chat minimize idle time, giving real-time feedback.
* The paywall is non-destructive and never erases generated work.
* Mobile-responsive layout with Tailwind’s breakpoints.
* shadcn/ui components for consistent appearance and accessible design.
* Mermaid diagrams displayed in a horizontally scrollable container to handle wide or complex ERDs.

---

## Narrative

Rizky, a first-time SaaS founder, struggled for two evenings trying to create a PRD in Notion. With a technical idea and no background in product management, he found himself staring at a blank page, unsure of what sections to include or which diagrams mattered. Searching for a solution, Rizky discovers the AI PRD Generator.

Upon opening the app, he’s instantly welcomed by the PRD Expert AI, which asks simple, focused questions: “Who are your users?”, “What problem are you solving?”, “How do you plan to charge for your product?”. Rizky finds himself having an easy conversation—like explaining his idea over coffee. The AI guides him, ensuring he covers essential requirements, use cases, and features he hadn’t considered. After a few short exchanges, a “Generate PRD” button appears, and with a single click, Rizky watches a detailed, structured PRD fill his screen, complete with a diagram of his database relationships and a sequence chart for payment flow.

With the export button, he saves the markdown file and shares it with his developer that night. By morning, his developer has clarity and a roadmap, while Rizky is freed from PRD paralysis. In under five minutes, he converted to a paid user after hitting the freemium limit—delighted by the value at just the right moment.

---

## Success Metrics

### User-Centric Metrics

* **Chat-to-Generate Conversion Rate:** Percentage of users who start a chat and proceed to generate a PRD (target: >60%).
* **Time-to-PRD:** Average time from first message to PRD rendered (target: <5 minutes).
* **Export Rate:** Percentage of PRDs exported as .md files (target: >40%).
* **User Satisfaction:** Average rating from post-PRD prompt (target: >4.0/5.0).

### Business Metrics

* **Free-to-Paid Conversion Rate:** Percentage of users upgrading after hitting the 2-free generate cap (target: 10% within 60 days).
* **First Revenue Timing:** First Stripe payment within 2 weeks of go-live.
* **PRDs Generated Per Week:** Ongoing count as a proxy for user engagement/growth.

### Technical Metrics

* **Streaming Latency:** Time to first token of chat LLM response (target: <2s; Groq often meets this; other providers may vary).
* **Diagram Render Success Rate:** Mermaid diagrams rendered successfully (target: >95%).
* **API Error Rate:** Percentage of failed backend/API requests (target: <1%).
* **Vercel Uptime:** Service availability (target: 99.9%).

### Tracking Plan

* `chat_started` — User sends first chat message
* `generate_clicked` — “Generate PRD” button clicked
* `prd_generated` — PRD rendered on Result page
* `export_clicked` — .md file download initiated
* `paywall_shown` — Paywall modal displayed
* `checkout_started` — Stripe Checkout session initiated
* `payment_completed` — Stripe webhook confirmation
* `diagram_render_failed` — Mermaid diagram failed to render

---

## Technical Considerations

### Technical Needs

* **Frontend:** Built with Next.js 14 App Router, Tailwind CSS, shadcn/ui components, react-markdown for rendering, and Mermaid.js for diagrams.
* **Backend:** Next.js API Routes manage chat and PRD generation, as well as Stripe payment flows.
* **LLM (configurable):** Powers AI chat and PRD/diagram generation via the [Vercel AI SDK](https://sdk.vercel.ai/) (`streamText` for chat, `generateText` for PRD). Provider is chosen with `LLM_PROVIDER` (`groq` | `gemini` | `openrouter` | `xai`).

### LLM environment variables

| Variable | When required |
|----------|----------------|
| `LLM_PROVIDER` | Optional; defaults to `groq`. Set to `gemini`, `openrouter`, or `xai` to switch providers. |
| `GROQ_API_KEY` | Required when `LLM_PROVIDER` is `groq` (or unset). |
| `GROQ_MODEL` | Optional Groq model id override. |
| `GOOGLE_GENERATIVE_AI_API_KEY` | Required when `LLM_PROVIDER=gemini`. |
| `GEMINI_MODEL` | Optional Gemini model id override. |
| `OPENROUTER_API_KEY` | Required when `LLM_PROVIDER=openrouter`. |
| `OPENROUTER_MODEL` | Optional OpenRouter model slug override. |
| `XAI_API_KEY` | Required when `LLM_PROVIDER=xai` ([xAI Console](https://console.x.ai)). |
| `XAI_MODEL` | Optional xAI model id (default `grok-2-latest`; confirm in xAI docs). |

Reference copy for local development: `.env.example` in the repository root.

### Integration Points

* **Groq / Gemini / OpenRouter / xAI:** One of these supplies chat completions and PRD synthesis, depending on env configuration (no Anthropic/Claude dependency). xAI uses the OpenAI-compatible endpoint `https://api.x.ai/v1`.
* **Stripe:** Enables one-time or subscription payment, with webhook for unlock logic.
* **Supabase:** Stores PRDs per session, no authentication needed in v1.
* **Vercel:** Handles hosting and serverless API routing.

### Data Storage & Privacy

* **localStorage:** Tracks generation usage and unlock status client-side.
* **Supabase:** Stores generated PRDs, linked to a session ID—no PII collected.
* **Stripe:** Handles all payment data externally; no card information processed in-app.

### Scalability & Performance

* Vercel serverless deployment for scalable API endpoints and frontend.
* Streaming markdown generation to minimize user wait times.
* Mermaid diagrams rendered client-side—no additional server load.
* Supabase free tier supports the storage/load required for v1.

### Potential Challenges

* Open models’ Mermaid output may be malformed—mitigated by server-side structural validation, one retry, and client fallback rendering.
* Stripe webhook reliability on Vercel—requires robust verification and idempotency controls.
* Usage tracking based on localStorage is potentially bypassable; acceptable for v1 but plan migration to robust, server-backed auth in future iterations.

---

## Milestones & Sequencing

### Project Estimate

* **Small:** 3–4 hours total build time (across key phases).

### Team Size & Composition

* **1 full-stack developer:** Handles product, engineering, UX, and deployment. (Extra-small—lean build for startup velocity.)

### Suggested Phases

**Phase 1 — Setup (15 minutes)**

* Key Deliverables: Full-stack developer prepares Next.js project, installs all libraries (including `ai`, `@ai-sdk/groq`, `@ai-sdk/google`, `@ai-sdk/openai`), organizes folder structure, and configures `.env.local` from `.env.example` (`LLM_PROVIDER` + matching API key).
* Dependencies: None.

**Phase 2 — Chat UI (30 minutes)**

* Key Deliverables: Build chat page and components (page.tsx, ChatMessage.tsx), integrate AI persona message, implement Generate PRD button and usage counter.
* Dependencies: Phase 1 complete.

**Phase 3 — API + PRD Generator (45 minutes)**

* Key Deliverables: Implement `/api/chat/route.ts` for streaming chat, `/api/generate/route.ts` for PRD/diagram output (with Mermaid validation in `lib/llm/mermaid.ts`), wire LLM to front end via `lib/llm/client.ts`.
* Dependencies: Phase 2 complete.

**Phase 4 — Result Page + Export (30 minutes)**

* Key Deliverables: Build result page (result/page.tsx), integrate react-markdown, MermaidDiagram.tsx, and .md download button.
* Dependencies: Phase 3 complete.

**Phase 5 — Freemium + Stripe (40 minutes)**

* Key Deliverables: lib/usage.ts for usage logic, Paywall.tsx modal, Stripe Checkout integration, webhook handler for unlock logic.
* Dependencies: Phase 4 complete.

**Phase 6 — Deploy + Launch (20 minutes)**

* Key Deliverables: Push to GitHub, deploy on Vercel, configure environment variables, connect Stripe webhook to production, run end-to-end test.
* Dependencies: Phase 5 complete.

---

Total estimated time: 3–4 hours. Hosting cost: Rp 0 (free Vercel tier). Output: Monetizable SaaS, Stripe-ready, lean and fast to launch. Build phases are sequential—start with setup and proceed step by step for a rapid MVP launch.