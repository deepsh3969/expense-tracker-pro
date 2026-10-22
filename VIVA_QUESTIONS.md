# VIVA QUESTIONS & ANSWERS

## Expense Tracker Pro — 30 Questions with Simple Answers

Covers: HTML · CSS · JavaScript · DOM · React · Props · State · `useState` · `useEffect` ·
React Router · array methods · event handling · `localStorage` · validation · financial
calculations · Java vs JavaScript.

---

### HTML

**1. What is HTML and what does it stand for?**
HTML stands for **HyperText Markup Language**. It is the standard markup language for
creating web pages — a set of tags (`<div>`, `<form>`, `<header>`) that describe the
structure and meaning of content to the browser.

**2. Which semantic HTML elements does this project use and why?**
`<header>` for the navbar, `<main>` for the content area, `<nav>` for the sidebar links,
`<section>` and `<article>` for panels/cards, `<form>`, `<fieldset>`, `<legend>`, `<label>`,
`<ul>/<li>` for lists, and `<dl>/<dt>/<dd>` in the Settings about panel. Semantic elements
improve accessibility (screen readers announce landmarks) and SEO.

**3. What is the difference between `<label>`'s `for` attribute and wrapping an input?**
Both associate a label with a control. `for="id"` links to an input by id; wrapping puts the
input inside the `<label>`. This project uses `for` + `id` (generated with React's `useId`)
so the association is explicit and testable — the E2E suite asserts every control has a
matching `label[for]`.

---

### CSS

**4. What are CSS custom properties (variables) and how are they used here?**
Custom properties are variables declared with `--name: value` and read with `var(--name)`.
The whole palette lives in `:root` in `global.css`:

```css
:root { --color-pink: #F5E1E8; --color-forest-sage: #86A487; }
.panel { background: var(--color-surface); }
```

They enable theming: overriding the same variables under `[data-theme='dark']` restyles
every component at once.

**5. How is the dark theme implemented?**
A `data-theme="dark"` attribute is set on `<html>` by a `useEffect` in `AppContext`. CSS
rules under `[data-theme='dark']` override the palette tokens (e.g. `--color-ivory:
#212620`). Because every component reads tokens via `var()`, the whole app re-skins with no
per-component logic.

**6. Explain the responsive layout technique used for the sidebar.**
On desktop (≥ 861 px) the sidebar is a fixed 258 px column and the main area has
`margin-left: var(--sidebar-width)`. Below 861 px the sidebar becomes an off-canvas drawer
(`transform: translateX(-100%)`) toggled by a hamburger button; a backdrop overlay closes
it. A single boolean `open` state in `AppLayout` drives both.

**7. What is the box model and which box-sizing does the project use?**
The box model describes how width/height apply to `content`, `padding`, `border`, and
`margin`. The project uses `box-sizing: border-box` globally so a 100 %-width card with
padding does not overflow its container.

---

### JavaScript

**8. What are arrow functions and where are they used?**
Arrow functions (`(a, b) => a + b`) are concise ES6 function expressions with lexical
`this`. They are used throughout for handlers, array callbacks (`.filter`, `.map`,
`.reduce`), and `useCallback` dependencies.

**9. Explain destructuring with an example from this project.**
Destructuring unpacks values from objects/arrays:

```js
const { transactions, settings, deleteTransaction } = useApp()
const { currency, theme } = settings
```

This keeps component code readable instead of repeating `context.settings.currency`.

**10. What is the spread operator and where is it essential here?**
`...` copies arrays/objects. It is essential for immutable state updates:

```js
setTransactions((prev) => [transaction, ...prev])   // prepend
setTransactions((prev) => prev.filter((t) => t.id !== id))
```

React only re-renders when state references change, so we never mutate arrays in place.

**11. What is a Promise and how does the confirmation dialog use one?**
A Promise represents a future value. `requestConfirm(options)` stores a `resolve` function
in state and returns `new Promise(resolve => …)`. When the user clicks Confirm or Cancel,
`handleConfirm(answer)` calls that resolver, so call sites can simply:

```js
const ok = await requestConfirm({ title: 'Delete?' })
if (!ok) return
```

**12. What does `crypto.randomUUID()` provide?**
Globally-unique string ids for transactions and budgets, generated in `generateId()`. A
fallback (`Date.now()` + random suffix) is included for older environments.

---

### DOM

**13. What is the DOM and how does React interact with it?**
The DOM (Document Object Model) is the browser's object tree of the page. In this project
developers never call `document.querySelector` for rendering; React's virtual DOM diffs
declarative JSX and applies minimal real-DOM updates. The only direct DOM touches are
legitimate side effects: setting `document.documentElement` theme attributes and focusing
the first invalid form field.

**14. What is event bubbling and how does the dialog handle it?**
Bubbling means a click on a child propagates to ancestors. The dialog overlay closes on
click, but the inner card calls `e.stopPropagation()` so clicks inside the dialog do not
dismiss it.

---

### React

**15. What is React and why is it used for this project?**
React is a declarative UI library by Meta. Components describe what the UI should look like
for a given state; React efficiently updates the DOM when state changes. It fits this
project because the interface is a live view over changing financial data.

**16. What are components and props? Give an example.**
Components are reusable functions returning JSX. Props are their inputs (like function
arguments). Example: `<SummaryCard label="Total income" value={formatCurrency(income)} tone="sage" />`
— `SummaryCard` renders differently for each tone without knowing the data source.

**17. What is state and how does it differ from props?**
State is data a component owns and can change over time; props are read-only data passed
from a parent. Transactions live in Context state; a page receives them via context and
passes derived slices down as props (e.g. `<TransactionList transactions={recent} />`).

**18. How does `useState` work?**
`useState(initial)` returns `[value, setValue]`. Calling `setValue` schedules a re-render
with the new value. The updater form `setValue(prev => …)` is used whenever the new value
depends on the old one, which also guards against stale closures.

```js
const [menuOpen, setMenuOpen] = useState(false)
```

**19. When is `useEffect` appropriate, and where is it used here?**
`useEffect` runs side effects after render. Uses in this project:
- persisting each state slice to `localStorage` inside `useLocalStorage`
- applying the `data-theme` attribute when the theme setting changes
- focus management and Escape-key handling while the confirm dialog is open

Effects list their dependencies so they re-run only when needed.

**20. What is React Context and why not prop-drill everything?**
Context shares values across the tree without passing props through every level.
`AppProvider` exposes transactions, budgets, settings, and actions; any page calls
`useApp()`. Prop-drilling 6 levels of handlers would be brittle; Context gives one
subscribe point while pages still pass focused props to leaf components.

**21. What is the difference between `useMemo` and `useCallback`?**
`useMemo` memoises a computed *value* (`safeTransactions = useMemo(() => …, [transactions])`);
`useCallback` memoises a *function reference* (`showToast = useCallback(…, [])`) so effects
and children do not re-run on every render. Both are used in `AppContext` to keep the
provider value stable.

**22. What is a key in a list and why must it be unique?**
`key` identifies items across renders so React can match old and new nodes. Duplicate keys
cause missing/duplicated UI. During testing a key warning exposed duplicate empty chart
labels; keys were made unique by combining label + index.

---

### React Router

**23. What is React Router and which routes does this app define?**
React Router provides client-side routing without full page reloads. Routes:
`/` (Dashboard), `/transactions`, `/add-transaction` (with `?type=` and `?edit=` params),
`/budgets`, `/reports`, `/settings`, and `*` → NotFound — all nested inside a layout route
that renders the sidebar, navbar, toasts, and dialog.

**24. How do `useSearchParams` and `useNavigate` help?**
`useSearchParams` reads query parameters — `?type=expense` preselects the form's type, and
`?edit=<id>` loads an existing transaction. `useNavigate` performs programmatic navigation,
e.g. redirecting to `/transactions` after a successful save, or `navigate(-1)` for Cancel.

---

### Array Methods

**25. Which array methods are used in the calculations, and what does each do?**
- `filter` — select transactions by type/month/search criteria
- `map` — transform items (e.g. wrap budgets with their spent totals)
- `reduce` — sum amounts (`acc + Number(t.amount)`)
- `sort` — order by date/amount/title with a direction multiplier
- `forEach` — accumulate into `Map` objects for category totals
- `find` — locate a single transaction/budget by id or month+category
- `some`/`every` — used in tests to assert properties of result sets

**26. Show how total expenses are calculated with `reduce`.**

```js
transactions
  .filter((t) => t.type === 'expense')
  .reduce((acc, t) => acc + Number(t.amount || 0), 0)
```

`filter` keeps only expenses; `reduce` folds them into a single sum starting at `0`.

---

### Event Handling

**27. How does form submission work in `TransactionForm`?**
The `<form onSubmit={handleSubmit}>` intercepts the native submit (`event.preventDefault()`
stops the page reload). `handleSubmit` runs pure validation; on failure it sets an `errors`
object that renders inline messages. On success it calls the context action and navigates.
A `submitting` flag blocks double-click duplicate saves.

**28. What is event delegation and are synthetic events relevant here?**
Delegation listens on a common ancestor instead of every child. React uses synthetic events
(`SyntheticEvent`) — a cross-browser wrapper with consistent `preventDefault`,
`stopPropagation`, and pooling-free behaviour — so handlers like the dialog overlay's
`onClick` behave the same in all browsers.

---

### localStorage

**29. How is `localStorage` used, and how is corruption handled?**
Five keys store transactions, budgets, profile, settings, and a `seeded` flag. The
`useLocalStorage` hook lazily parses JSON on mount inside `try/catch` (corrupt data →
defaults) and writes back in a `useEffect`. `AppContext` additionally sanitises shapes —
non-arrays become `[]`, invalid objects are filtered out, and unknown currencies/themes fall
back to defaults. The E2E suite writes garbage into every key and confirms the app still
loads.

**30. Difference between `localStorage`, `sessionStorage`, and cookies?**

| | `localStorage` | `sessionStorage` | Cookies |
| -- | -- | -- | -- |
| Lifetime | Until cleared | Until tab closes | Expiry date you set |
| Size | ~5 MB | ~5 MB | ~4 KB |
| Sent to server | No | No | Yes (every request) |

`localStorage` is chosen because the app is a persistent personal journal that must survive
refreshes without any server communication.

---

### Validation

**31. Where does validation live and what rules are enforced?**
Validation is a pure module (`utils/validation.js`) returning `{ valid, errors, data }`.
Rules: title required (≤ 80 chars); amount required, finite, > 0, ≤ 100,000,000, at most
two decimals; type must be `income`/`expense`; category must belong to that type's list;
date must be a real ISO date, ≥ 2000-01-01, never in the future; notes ≤ 300 chars;
budget limit > 0 with a valid `YYYY-MM` month. Being pure makes it unit-testable in Node.

**32. How are errors shown accessibly?**
Each error renders in a `role="alert"` paragraph tied to its input via `aria-describedby`;
inputs get `aria-invalid="true"` and a red border. On submit failure, focus moves to the
first invalid field so keyboard and screen-reader users land exactly where correction is
needed.

---

### Financial Calculations

**33. State the core formulas used.**

```
Balance         = Σ income − Σ expenses
Net Savings     = Monthly Income − Monthly Expenses
Savings Rate    = Net Savings / Monthly Income × 100   (only if income > 0)
Utilisation %   = Expenses / Budget × 100              (only if budget > 0)
Remaining       = Budget − Expenses
```

**34. How are division-by-zero and negative-savings cases handled?**
`savingsRate()` returns `null` when income ≤ 0, and the UI shows `—` with the hint "Needs
income > 0". `budgetUtilization()` returns `0` for non-positive limits. Negative savings are
valid data: they display with the expense colour and the hint "Expenses exceeded income".

**35. How does the app ensure months are filtered correctly?**
Every transaction date is ISO `YYYY-MM-DD`; `monthKey(date)` slices the first seven
characters, and comparisons are string equality — lexicographic ISO comparison is also
calendar-correct. `daysInMonth` uses `new Date(y, m, 0).getDate()` so February respects
leap years (2024-02 → 29 days; asserted in the unit tests).

---

### Java vs JavaScript (frequently asked)

**36. What is the difference between Java and JavaScript?**

| Aspect | Java | JavaScript |
| ------ | ---- | ---------- |
| Type system | Statically typed — types checked at compile time | Dynamically typed — types checked at runtime |
| Execution | Compiled to bytecode, runs on the JVM | Interpreted/JIT-compiled by a browser or Node.js |
| Paradigm | Class-based OOP | Multi-paradigm: prototypes, functions, classes (syntactic sugar) |
| Memory | Garbage-collected, explicit `new` for objects | Garbage-collected, objects created literally |
| Main use | Backend systems, Android apps, enterprise software | Web pages, SPAs, servers (Node), mobile (React Native) |
| Concurrency | Threads | Single-threaded event loop + async callbacks/promises |
| Syntax heritage | C/C++ | C-like syntax, but unrelated languages |

Despite the similar names, they are different languages maintained by different organisations
(Oracle for Java; standards body ECMA — ECMAScript — for JavaScript).

**37. Why is this project JavaScript/React and not Java?**
The mini-project brief specifies HTML, CSS, JavaScript, and React — a front-end
technologies submission. React is a JavaScript library, so the UI, state, and calculations
are all JavaScript. Java with Spring Boot is a *back-end* stack: it would require a server,
HTTP APIs, and typically a database — none of which this project needs since all data lives
in the browser's `localStorage`. A future full-stack version *could* pair this React front
end with a Java/Spring back end for cloud sync, but that is a different architecture and
outside this project's scope.

**38. Can Java and JavaScript run together in one system?**
Yes — they commonly do. A typical architecture is a JavaScript front end (React, as here)
communicating over HTTP/REST with a Java (Spring Boot) back end that owns the database.
They usually interoperate through JSON, which both languages natively support.

---

### Quick-Fire Round

**39. What is JSX?**
A syntax extension that looks like HTML inside JavaScript and compiles to
`React.createElement` calls. E.g. `<div className="panel">` becomes a function call.

**40. Why `className` instead of `class`?**
`class` is a reserved word in JavaScript. React uses the `className` prop to map to the
HTML `class` attribute.

**41. What is a controlled component?**
An input whose value comes from React state (`value={title}` + `onChange={…}`). Both
transaction and budget forms use controlled inputs so validation and editing are fully
predictable.

**42. What is StrictMode?**
A development-only wrapper that double-invokes renders and effects to surface impure logic.
It revealed that seeding logic must be idempotent — handled via the `seeded` flag.

**43. What does Vite do?**
Vite is the build tool: it serves modules instantly during development via native ES
modules + esbuild, and produces an optimised static bundle (`npm run build` → `dist/`).

**44. Name the four palette colours.**
Pastel pink `#F5E1E8`, warm ivory `#FFFBF5`, sage green `#B8CEB3`, forest sage `#86A487` —
defined as CSS custom properties and used consistently across all pages and themes.

**45. How do you run the project?**
`npm install` → `npm run dev` (development), `npm run build` (production bundle),
`npm test` (unit tests), `npm run test:browser` (33 Playwright end-to-end tests).

---

*30+ questions · ideal for a mini-project viva demonstration alongside the live application.*
