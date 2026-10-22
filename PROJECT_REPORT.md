# PROJECT REPORT

## Expense Tracker Pro — React-Based Student Expense Management System

**Course:** Mini Project — Second Year Engineering
**Technology:** HTML5 · CSS3 · JavaScript (ES6+) · React · React Router · Vite
**Report version:** 1.0

---

## 1. Introduction

Personal finance management is one of the most practical applications a student can build.
Every student receives money from limited sources — pocket money, scholarships, part-time
work, freelancing — and spends it across many small categories: food, transport, education,
entertainment. Without visibility, money quietly disappears.

**Expense Tracker Pro** is a client-side single-page application (SPA) that records income
and expenses, organises them by category and month, compares actual spending against
student-friendly budgets, and visualises trends — all without a server. It is designed to
double as a learning artefact that demonstrates modern front-end engineering practices:

- Component-based UI architecture with React functional components
- Declarative state management with `useState` and React Context
- Side-effect handling with `useEffect`
- Client-side routing with React Router
- Browser persistence with `localStorage`
- Design systems with CSS custom properties
- Data visualisation with pure SVG and CSS

The application deliberately avoids frameworks and libraries beyond React itself. Charts are
hand-drawn SVG; styling is hand-written CSS; calculations are pure JavaScript functions.

### 1.1 Purpose of the Report

This report documents the analysis, design, implementation, and testing of Expense Tracker
Pro as required for the mini-project submission. It follows the standard software
engineering report structure: existing systems, proposed system, requirements, architecture,
module implementation, testing, results, limitations, and future enhancements.

## 2. Existing System

Several categories of existing solutions were considered:

### 2.1 Commercial Finance Apps (Wallet, Mint, YNAB)

**Strengths:** bank sync, receipt capture, multi-device sync, polished UI.
**Weaknesses for students:** require accounts and personal data submission; many are
ad-supported or subscription-based; feature overload; closed source — unusable as a learning
project.

### 2.2 Spreadsheet Templates (Excel / Google Sheets)

**Strengths:** flexible, familiar.
**Weaknesses:** manual formula maintenance; poor mobile experience; no interactive charts
without extra effort; easy to break; no validation.

### 2.3 Existing Open-Source Trackers

Many open-source trackers exist, but they typically use databases (SQL/MongoDB), backend
frameworks (Node/Express, Django, Spring Boot), or heavy UI kits (Bootstrap, Material UI).
These are valuable for full-stack projects but obscure the core React concepts a
second-year mini-project is meant to demonstrate.

### 2.4 Gap Identified

| Need | Commercial apps | Spreadsheets | Typical open-source | **This project** |
| ---- | :-: | :-: | :-: | :-: |
| No account / sign-up required | ✗ | ✓ | varies | **✓** |
| Runs fully offline, no backend | ✗ | ✓ | ✗ | **✓** |
| Interactive visual reports | ✓ | partial | ✓ | **✓** (pure SVG) |
| Budget alerts at 80 % / 100 % | ✓ | ✗ | varies | **✓** |
| Source suitable for React learning | ✗ | ✗ | varies | **✓** |
| Custom pastel design system | ✗ | ✗ | ✗ | **✓** |

## 3. Proposed System

A React single-page application with seven routed pages, a shared Context-based state
layer, and `localStorage` persistence.

**Core propositions:**

1. **Zero infrastructure.** No backend, no database, no API keys. `npm install && npm run dev` is the entire deployment story.
2. **Everything computed, nothing hard-coded.** Every number on screen is derived from the
   transaction array by pure functions.
3. **Safe persistence.** All reads from `localStorage` are validated; corrupt data degrades
   gracefully instead of crashing.
4. **Accessible and responsive.** Semantic HTML, labelled inputs, focus-visible states,
   keyboard-operable dialogs, and a mobile drawer navigation.
5. **Design-system driven.** Four mandated palette colours are defined once as CSS custom
   properties and reused everywhere, including a dark theme.

### 3.1 User Roles

A single implicit user (the student). There is no authentication by design; the app is a
personal journal.

### 3.2 Primary User Workflows

```
First launch ──► sample data seeded ──► explore dashboard
      │
      ├─► Add Transaction ──► validate ──► save ──► toast ──► transactions list
      │
      ├─► Transactions ──► search / filter / sort ──► edit or delete (with confirm)
      │
      ├─► Budgets ──► pick month ──► set overall + category limits ──► see usage %
      │
      ├─► Reports ──► pick month ──► analyse metrics, trend, breakdown, comparison
      │
      └─► Settings ──► name / currency / theme / restore samples / clear data
```

## 4. Functional Requirements

| ID | Requirement | Status |
| -- | ----------- | ------ |
| FR1 | Display dashboard with greeting, date, balance, income, expenses, month spending | Implemented |
| FR2 | Show monthly budget progress and warnings on the dashboard | Implemented |
| FR3 | Show recent transactions and category breakdown on the dashboard | Implemented |
| FR4 | Show daily spending chart (SVG) on the dashboard | Implemented |
| FR5 | Provide Quick Add Expense and Quick Add Income actions | Implemented |
| FR6 | Add, edit, delete transactions (delete requires confirmation) | Implemented |
| FR7 | Search transactions by title and notes | Implemented |
| FR8 | Filter by type, category, and date range | Implemented |
| FR9 | Sort by date / amount / title with direction toggle | Implemented |
| FR10 | Validate title, amount (> 0, ≤ 2 decimals), category, date (no future, ≥ 2000) | Implemented |
| FR11 | Categories switch based on transaction type (9 expense, 5 income) | Implemented |
| FR12 | Prevent duplicate submissions while a save is in progress | Implemented |
| FR13 | Accessible inline validation messages + success toast | Implemented |
| FR14 | Set/edit/delete overall and per-category monthly budgets | Implemented |
| FR15 | Budget warning at ≥ 80 % utilisation; exceeded at > 100 % | Implemented |
| FR16 | Reject zero or negative budget values | Implemented |
| FR17 | Month selector for budgets and reports; history never deleted | Implemented |
| FR18 | Reports: monthly income, expenses, net savings, savings rate | Implemented |
| FR19 | Reports: category breakdown, 6-month trend, month comparison | Implemented |
| FR20 | Reports: highest individual expense, most frequent category | Implemented |
| FR21 | All charts built with CSS/HTML/SVG only | Implemented |
| FR22 | Editable display name persisted to localStorage | Implemented |
| FR23 | Currency selection (INR, USD, EUR) updates all amounts | Implemented |
| FR24 | Light/dark theme persisted across refreshes | Implemented |
| FR25 | Restore sample data (confirmed) | Implemented |
| FR26 | Clear all data (confirmed) | Implemented |
| FR27 | Friendly 404 page with link to dashboard | Implemented |
| FR28 | Seed sample data once on first launch; never on every render | Implemented |
| FR29 | Survive malformed localStorage without crashing | Implemented |

## 5. Non-Functional Requirements

| Category | Requirement | How addressed |
| -------- | ----------- | ------------- |
| Performance | Instant interaction, no network calls | Entire bundle ≈ 231 KB JS (72 KB gzip) + 26 KB CSS; pure client-side |
| Reliability | Corrupt storage must not crash the app | `readStorage` try/catch + object sanitisation in Context |
| Usability | Calm, uncluttered, journal-like UI | Pastel palette, generous whitespace, restrained motion |
| Accessibility | Keyboard operable, labelled, contrast-safe | Semantic HTML, labels, focus-visible, ARIA roles, AA contrast checks |
| Responsiveness | Works 360 px → desktop | Grid/flex layouts, mobile drawer, fluid type |
| Portability | Runs on any modern OS with Node | Vite static build; no native dependencies |
| Maintainability | Separation of concerns | Pure utils / context / pages / components folders |
| Data integrity | Single source of truth, no double counting | All figures derived from one transactions array |

## 6. Architecture

### 6.1 Architectural Style

**Component-based unidirectional data flow** — the canonical React architecture:

```
User Event → Component handler → Context action → setState
                                                    │
                     UI re-render (declarative) ◄───┘
                            │
              useEffect persists to localStorage
```

There is no two-way binding, no direct DOM manipulation, and no mutation of state objects;
updates are always produced by returning new arrays/objects from updater functions.

### 6.2 Layered View

```
Presentation layer   Pages + components (JSX)
        │ consumes context / props
State layer          AppContext (useState + useMemo + useCallback)
        │ reads/writes via hook
Persistence layer    useLocalStorage → window.localStorage
        │
Utility layer        calculations · currency · dateHelpers · validation · categories
(no React dependencies — unit-testable in plain Node)
```

### 6.3 Routing Map

| Path | Page | Notes |
| ---- | ---- | ----- |
| `/` | Dashboard | |
| `/transactions` | Transactions | filters/sort in local state |
| `/add-transaction` | AddTransaction | `?type=income\|expense` preselects type |
| `/add-transaction?edit=<id>` | AddTransaction (edit mode) | loads existing transaction |
| `/budgets` | Budgets | `?month=` not required; month picker in page |
| `/reports` | Reports | month picker in page |
| `/settings` | Settings | |
| `*` | NotFound | |

## 7. Module Implementation

### 7.1 State Management (AppContext)

`AppProvider` holds four persistent slices (transactions, budgets, profile, settings) plus
two ephemeral slices (toasts, confirm dialog).

Key implementation decisions:

- **First-launch seeding.** A `seeded` flag in `localStorage` guarantees sample data is
  inserted exactly once. After "Clear all data" the flag remains true, so the app stays
  empty on refresh instead of re-seeding.
- **Sanitisation.** Every array read from storage is filtered through `isValidTransaction`
  / `isValidBudget`; settings are whitelisted to known currency and theme values.
- **Confirmation as a Promise.** `requestConfirm(options)` returns a Promise; the dialog
  resolves it. Delete flows read naturally: `if (!(await requestConfirm(…))) return`.
- **Toast lifecycle.** Each toast gets a unique id and auto-dismisses after 3.8 s.

### 7.2 Transaction Management

`TransactionForm` serves both create and edit:

- Create mode: `addTransaction(data)` prepends the new object.
- Edit mode: detected by `initialData.id`; `updateTransaction(id, data)` maps over the
  array replacing only the matching object (preserving `createdAt`, refreshing `updatedAt`).
- Validation runs in `utils/validation.js` (pure), and the first invalid field receives
  focus for keyboard users.
- A `submitting` flag guards against double-click duplicate submissions.

### 7.3 Budget Engine

- Budgets are keyed by `(month, category)`; the special category `Overall` represents the
  total monthly spending limit.
- Spending for a budget is computed on demand: the `Overall` budget uses all expenses of
  the month; category budgets sum only that category.
- `budgetStatus()` returns `ok` / `warning` (≥ 80 %) / `exceeded` (> 100 %); the
  `ProgressBar` and badge colours follow the status.
- Categories that already have a budget for the selected month are removed from the
  "add budget" dropdown — a UI-level duplicate guard backed by an explicit check in
  `saveBudget`.

### 7.4 Reporting Engine

All report metrics call the same pure functions used by the dashboard, guaranteeing
consistency:

- `monthlyIncome`, `monthlyExpenses`, `netSavings`, `savingsRate`
- `categorySpendingForMonth` → donut segments + legend
- `monthlyTrend(6 keys)` → SVG bar chart
- `monthlyComparison` → current vs previous month with % change (handles previous = 0)
- `highestIndividualExpense`, `mostFrequentExpenseCategory`

Selecting a month with no data shows friendly empty messaging instead of zeros pretending
to be meaningful.

### 7.5 Chart Implementation (no libraries)

**Donut (`CategoryBreakdown`)** — one `<circle>` per category with `stroke-dasharray` /
`stroke-dashoffset` arithmetic on a shared radius; `<title>` elements provide native
tooltips; a centre label shows the total.

**Bar chart (`SpendingChart`)** — a `viewBox="0 0 100 40"` SVG stretched responsively with
`preserveAspectRatio="none"`; bar heights are proportional to the running maximum; grid
lines use `vector-effect="non-scaling-stroke"` so they stay 1 px at any width; x-axis
labels are thinned by a computed step so they never collide.

### 7.6 Persistence Details

| Key | Content |
| --- | ------- |
| `expenseTrackerPro.transactions` | Transaction array |
| `expenseTrackerPro.budgets` | Budget array |
| `expenseTrackerPro.profile` | `{ name }` |
| `expenseTrackerPro.settings` | `{ currency, theme }` |
| `expenseTrackerPro.seeded` | `true` after first seeding |

Failure modes handled: unavailable storage (private browsing quotas) logs a warning and
continues in memory; malformed JSON falls back to defaults; non-array payloads are coerced
to `[]`.

## 8. Testing Methodology

Testing was performed at three levels:

1. **Unit tests (Node).** `tests/calculations.test.mjs` imports the pure utility modules
   directly and asserts 60+ behaviours using the built-in `assert` module — totals,
   monthly aggregation, savings-rate guard, budget thresholds, filters, sorting, date
   validation (including leap years and invalid dates like 2026-02-30), currency
   formatting, and every validation rule.
2. **End-to-end browser tests (Playwright).** `tests/browser-smoke.mjs` drives a real
   Chromium (system Edge channel) through 33 scenarios covering every user-facing
   requirement: CRUD, calculations, filters, sorting, budgets, reports, currency, theme
   persistence, profile, browser navigation, 404, corrupt storage, mobile drawer, and
   label accessibility. Console errors are captured and asserted to be zero.
3. **Manual visual verification.** Screenshots of all pages in light, dark, and mobile
   modes were captured and reviewed for palette consistency, spacing, and contrast.

## 9. Test Cases

| # | Test case | Expected result | Actual |
| - | --------- | --------------- | ------ |
| T1 | Load application first time | Dashboard renders; 28 sample transactions seeded once | Pass |
| T2 | Add income ₹1,234 | Balance increases by exactly ₹1,234; success toast | Pass |
| T3 | Add expense ₹334 | Balance decreases by exactly ₹334 | Pass |
| T4 | Submit empty form | Inline errors for title and amount; focus moves to first invalid field | Pass |
| T5 | Enter negative amount | "Amount must be greater than zero" | Pass |
| T6 | Enter future date (2099-01-01) | "Date cannot be in the future" | Pass |
| T7 | Search "Test income entry" | Exactly one matching row | Pass |
| T8 | Filter type = expense | All visible amounts are negative (expenses) | Pass |
| T9 | Sort by amount ascending | Smallest absolute amount first | Pass |
| T10 | Edit a transaction amount to 999 | Saves, navigates back, toast shown, all totals recompute | Pass |
| T11 | Delete a transaction | Confirmation dialog appears; confirm removes exactly one row | Pass |
| T12 | Cancel the delete dialog | Transaction count unchanged | Pass |
| T13 | Refresh browser | Same data present (localStorage persistence) | Pass |
| T14 | Budgets page | Cards show real spending vs limits with status badges | Pass |
| T15 | Add Healthcare budget ₹50 (spend ≈ ₹320) | Badge shows "Exceeded"; progress > 100 % | Pass |
| T16 | Add duplicate Healthcare budget | Healthcare removed from dropdown (duplicate prevented) | Pass |
| T17 | Budget limit = −5 | "Budget must be greater than zero" | Pass |
| T18 | Reports page | 4 metric cards + SVG chart render | Pass |
| T19 | Select empty month (2026-01) | Empty-month notice; metrics zero/`—` gracefully | Pass |
| T20 | Settings → currency USD | All amounts display `$` across pages | Pass |
| T21 | Settings → dark theme, refresh | `data-theme="dark"` persists | Pass |
| T22 | Change display name to "Aarav" | Dashboard greeting shows "Aarav!" | Pass |
| T23 | Browser back / forward | Correct pages restore | Pass |
| T24 | Visit `/definitely-not-a-page` | 404 page; link returns to dashboard | Pass |
| T25 | Corrupt all localStorage keys, reload | App loads without crash | Pass |
| T26 | Restore sample data (confirm) | Fresh sample transactions and budgets appear | Pass |
| T27 | Mobile 390 × 844 | Hamburger visible; drawer opens/closes; no horizontal overflow | Pass |
| T28 | All form controls | Every input/select/textarea has an associated `<label>` | Pass |
| T29 | Console during entire session | Zero errors | Pass |
| T30 | Unit suite (`npm test`) | All calculation/validation assertions pass | Pass |
| T31 | Production build (`npm run build`) | Builds without errors or warnings | Pass |
| T32 | Production preview full suite | All 33 E2E tests pass against `dist/` | Pass |

## 10. Results and Discussion

### 10.1 Build Results

```
vite v5.4.21 building for production…
✓ 66 modules transformed.
dist/index.html                 1.05 kB │ gzip:  0.62 kB
dist/assets/index-*.css        26.30 kB │ gzip:  5.45 kB
dist/assets/index-*.js        231.08 kB │ gzip: 71.71 kB
✓ built in 1.01s
```

The bundle is small because React and React Router are the only runtime dependencies; all
charts and icons are inline SVG.

### 10.2 Test Results

- **Unit tests:** `ALL CALCULATION & VALIDATION TESTS PASSED ✓`
- **Browser tests (dev server):** `ALL 33 BROWSER SMOKE TESTS PASSED ✓` — no console errors.
- **Browser tests (production preview):** `ALL 33 BROWSER SMOKE TESTS PASSED ✓`.

### 10.3 Discussion

Several design decisions deserve note:

1. **Why one shared list instead of per-page state?** Every page derives its numbers from
   the same `transactions` array, so editing a transaction instantly updates the dashboard
   balance, budget utilisation, and report metrics — there is no possibility of divergence.
2. **Why Promise-based confirmation?** Declarative dialogs usually require callback props;
   wrapping the dialog in a Promise keeps call sites linear (`await requestConfirm(…)`)
   while the dialog itself remains a controlled React component.
3. **Why seed sample data once?** Students evaluating the project should see meaningful
   charts immediately, but a tracker that re-injects demo rows on every refresh would be
   unusable. The `seeded` flag separates "first launch" from "cleared by user".
4. **Why not a chart library?** The brief requires CSS/HTML/SVG visualisation, and hand-built
   charts (~120 lines total) keep the bundle tiny and demonstrate SVG competency —
   `stroke-dasharray` donut arithmetic is a genuinely useful technique.
5. **Contrast discipline.** Forest sage `#86A487` with dark green text `#243024` scores
   ≈ 5.0:1 (WCAG AA pass); expense red is deepened for small text usage. White text is used
   only where contrast permits.

## 11. Limitations

1. **No multi-device sync** — `localStorage` is per-browser, per-device.
2. **Not secure storage** — data is readable via dev-tools; unsuitable for sensitive records.
3. **No authentication** — anyone opening the browser sees the data.
4. **No import/export** — transactions cannot yet be exported to CSV or JSON.
5. **Currency change is formatting-only** — amounts are not converted between currencies.
6. **Manual entry only** — no bank feeds, OCR, or recurring transaction engine.
7. **Storage ceiling** — typical ~5 MB `localStorage` quota limits the app to thousands,
   not tens of thousands, of transactions.
8. **`input[type=month]`** styling varies slightly across browsers (native picker UI).

## 12. Future Enhancements

| Enhancement | Value | Effort |
| ----------- | ----- | ------ |
| CSV/JSON export & import | Backup and portability | Low |
| Recurring transactions | Automate rent/subscriptions | Medium |
| Budget rollover | Carry unused budget to next month | Low |
| PWA install + reminders | App-like experience, threshold alerts | Medium |
| Encrypted optional sync | Multi-device with privacy | High |
| Savings goals with rings | Motivation feature | Medium |
| Dark-mode system preference detection | Better first-run theming | Low |
| Virtualised lists | Smooth scrolling with 1000+ rows | Medium |

## 13. Conclusion

Expense Tracker Pro fulfils every requirement of the mini-project brief: a complete,
functional, polished expense-management application built exclusively with HTML5, CSS3,
JavaScript (ES6+), and React — supplemented only by React Router for navigation and Vite as
the build tool. Seven routed pages provide dashboard insights, full transaction management
with search/filter/sort, monthly budgets with warning thresholds, rich SVG reports,
personalisable settings, and a friendly 404. All financial figures are computed from real
data; all state persists safely in `localStorage`; the pastel design system (pastel pink,
warm ivory, sage green, forest sage) is applied consistently with an optional dark theme.

The project demonstrates — concretely and verifiably — components, props, state,
`useEffect`, Context, routing, persistence, validation, and financial calculation. Thirty-three
end-to-end browser tests and a Node unit suite confirm the behaviour, and the production
build completes without errors.

Beyond grades, the application is genuinely useful: a student can install it, record a
week of spending, set realistic budgets, and understand their financial habits — with no
account, no ads, and no data leaving their machine.

---

*Submitted as the Second Year Engineering Mini Project. Expense Tracker Pro is a
JavaScript/React project; Java is not part of this implementation (see VIVA_QUESTIONS.md,
Question 25, for the Java vs. JavaScript clarification).*
