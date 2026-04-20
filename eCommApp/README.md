# The Daily Harvest 🌿

A modern, fully client-side e-commerce storefront for fresh produce. Built with React 18, TypeScript, and Vite. Features a product catalog, shopping cart, product reviews, checkout flow, and an admin portal.

> This project is used as a hands-on learning application for the **Mastering GitHub Copilot Across the SDLC** lab series.

---

## ✨ Features

- **Product Catalog** — Browse a grid of products loaded from static JSON, with images, prices, descriptions, and stock status
- **Shopping Cart** — Add items, track quantities, and manage your cart across pages via React Context
- **Checkout Flow** — Confirm your order via a modal; view a post-order summary on completion
- **Product Reviews** — Click any product image to open a review modal and submit or read reviews
- **Admin Portal** — Set or clear a site-wide sale percentage (e.g., "20% off all items")
- **User Login Page** — Login form UI with email/password fields and validation
- **Responsive Layout** — Consistent header navigation and footer across all pages

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| UI Framework | React 18 |
| Language | TypeScript 5 |
| Build Tool | Vite 4 |
| Routing | React Router DOM v6 |
| State Management | React Context API |
| Testing | Vitest + Testing Library |
| Linting | ESLint (zero-warnings policy) |
| Data Source | Static JSON files (no backend) |

---

## ⚡ Quick Start

New to the project? Follow these steps to go from zero to a running app.

### Step 1 — Check Your Node.js Version

This project requires **Node.js version 18 or higher**.

```bash
node --version
```

You should see something like `v18.x.x` or higher. If not, [download the latest LTS from nodejs.org](https://nodejs.org/). npm comes bundled with Node — no separate install needed.

```bash
# Verify npm is available too
npm --version
```

### Step 2 — Get the Code

```bash
git clone <repo-url>
cd ghcplab
```

### Step 3 — Install Dependencies

Navigate into the app folder and install all packages:

```bash
cd eCommApp
npm install
```

This installs everything listed in `package.json` into a local `node_modules/` folder. It only needs to be run once (or again after pulling changes that modify `package.json`).

> ⏱️ First install takes ~30–60 seconds depending on your connection.

### Step 4 — Start the App

```bash
npm run dev
```

Your browser will open automatically at **http://localhost:3000**. The app hot-reloads as you edit files — no need to refresh manually.

> **No environment variables required.** The app runs entirely in the browser with no backend, database, or API keys needed.

---

## 🧪 Testing

This project uses **Vitest** (a Vite-native test runner with a Jest-compatible API) and **React Testing Library** for component tests.

### Running Tests

```bash
# ✅ Recommended during development — reruns automatically as you edit
npm run test

# Run all tests once and exit (good for CI or a quick check)
npm run test:run

# Run all tests and generate a coverage report
npm run test:coverage

# Open an interactive visual test UI in your browser
npm run test:ui
```

### What the Output Looks Like

A passing test run looks like this:

```
✓ src/components/CartPage.test.tsx (1 test) 61ms
  ✓ CartPage > displays cart items when cart has items

Test Files  1 passed (1)
     Tests  1 passed (1)
```

A failing test will show the component name, test name, and a diff of what was expected vs. what was received.

### Coverage Report

After running `npm run test:coverage`, a summary prints to the terminal:

```
--------------------|---------|----------|---------|---------|
File                | % Stmts | % Branch | % Funcs | % Lines |
--------------------|---------|----------|---------|---------|
CartPage.tsx        |   54.32 |    33.33 |      25 |   54.32 |
helpers.ts          |       0 |      100 |     100 |       0 |
...
```

A full HTML report is also generated at `coverage/index.html` — open it in your browser for a line-by-line breakdown.

### Writing New Tests

Tests live **next to the component they test**:

```
src/components/
├── CartPage.tsx
├── CartPage.test.tsx      ← test file for CartPage
├── ProductsPage.tsx
└── ProductsPage.test.tsx  ← (doesn't exist yet — good first contribution!)
```

Always use the **custom `render` helper** from `src/test/test-utils.tsx` instead of the default one from Testing Library. It automatically wraps components with `BrowserRouter` and `CartProvider` so you don't need to set those up in every test:

```tsx
// ✅ Do this
import { render, screen } from '../test/test-utils'

// ❌ Not this (missing router and cart context)
import { render, screen } from '@testing-library/react'
```

#### Example: A Simple Component Test

```tsx
import { render, screen } from '../test/test-utils'
import { describe, it, expect } from 'vitest'
import HomePage from './HomePage'

describe('HomePage', () => {
  it('shows the welcome message', () => {
    render(<HomePage />)
    expect(screen.getByText(/Welcome to the The Daily Harvest/i)).toBeInTheDocument()
  })
})
```

#### Example: Testing a Utility Function

```ts
import { describe, it, expect } from 'vitest'
import { formatPrice, calculateTotal, validateEmail } from '../utils/helpers'

describe('formatPrice', () => {
  it('formats a number as USD currency', () => {
    expect(formatPrice(1.5)).toBe('$1.50')
    expect(formatPrice(10)).toBe('$10.00')
  })
})

describe('validateEmail', () => {
  it('returns true for valid emails', () => {
    expect(validateEmail('user@example.com')).toBe(true)
  })

  it('returns false for invalid emails', () => {
    expect(validateEmail('not-an-email')).toBe(false)
  })
})
```

#### Example: Testing with a Mocked Cart Context

```tsx
import { render, screen } from '@testing-library/react'
import { CartContext } from '../context/CartContext'
import CartPage from './CartPage'

const emptyCartContext = {
  cartItems: [],
  addToCart: vi.fn(),
  clearCart: vi.fn()
}

it('shows empty cart message when cart has no items', () => {
  render(
    <CartContext.Provider value={emptyCartContext}>
      <CartPage />
    </CartContext.Provider>
  )
  expect(screen.getByText('Your cart is empty.')).toBeInTheDocument()
})
```

---

## 📦 All Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server at http://localhost:3000 |
| `npm run build` | Type-check + build for production → `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | Run ESLint (fails on any warning) |
| `npm run test` | Run tests in watch mode |
| `npm run test:run` | Run tests once and exit |
| `npm run test:ui` | Open visual test browser UI |
| `npm run test:coverage` | Run tests + generate coverage report |

---

## 📁 Project Structure

```
eCommApp/
├── public/
│   └── products/
│       ├── apple.json          # Product data files
│       ├── grapes.json
│       ├── orange.json
│       ├── pear.json
│       └── productImages/      # Product image assets (.png)
│
├── src/
│   ├── components/             # All pages and UI components
│   │   ├── App.tsx             # ← Start here: routes and providers
│   │   ├── HomePage.tsx        # / — Landing page
│   │   ├── ProductsPage.tsx    # /products — Catalog, cart, reviews
│   │   ├── CartPage.tsx        # /cart — Cart and checkout
│   │   ├── LoginPage.tsx       # /login — Login form
│   │   ├── AdminPage.tsx       # /admin — Sale management
│   │   ├── Header.tsx          # Shared navigation header
│   │   ├── Footer.tsx          # Shared footer
│   │   ├── CheckoutModal.tsx   # Checkout confirmation modal
│   │   └── ReviewModal.tsx     # Product review modal
│   │
│   ├── context/
│   │   └── CartContext.tsx     # Global cart state (addToCart, clearCart)
│   │
│   ├── types/
│   │   └── index.ts            # Shared interfaces: Product, Review, User, Address
│   │
│   ├── utils/
│   │   └── helpers.ts          # formatPrice, calculateTotal, validateEmail
│   │
│   ├── test/
│   │   ├── setup.ts            # Global test setup (jest-dom matchers)
│   │   └── test-utils.tsx      # Custom render() with providers pre-applied
│   │
│   ├── App.tsx                 # Route definitions
│   ├── main.tsx                # App entry point
│   ├── App.css                 # App-level styles
│   └── index.css               # Global styles
│
├── index.html                  # HTML shell
├── package.json                # Dependencies and scripts
├── vite.config.ts              # Vite, dev server, and Vitest configuration
├── tsconfig.json               # TypeScript compiler settings
└── tsconfig.node.json          # TypeScript config scoped to vite.config.ts
```

---

## 🔑 Key Files for New Developers

| File | Why It Matters |
|---|---|
| `src/App.tsx` | All routes defined here — the map of the app |
| `src/context/CartContext.tsx` | Global cart state shared across all pages |
| `src/types/index.ts` | Core data shapes: `Product`, `Review`, `User`, `Address` |
| `src/components/ProductsPage.tsx` | Most complex component — fetches data, manages cart and reviews |
| `public/products/*.json` | Product data driving the entire catalog |
| `src/utils/helpers.ts` | Shared utilities used across components |
| `vite.config.ts` | Controls dev server, build output, and test configuration |

---

## 🗺️ App Routes

| Route | Component | Description |
|---|---|---|
| `/` | `HomePage` | Welcome landing page |
| `/products` | `ProductsPage` | Product catalog |
| `/cart` | `CartPage` | Shopping cart and checkout |
| `/login` | `LoginPage` | User login form |
| `/admin` | `AdminPage` | Admin sale management portal |

---

## 🤝 Contributing

- **Components**: Add new `.tsx` files to `src/components/`
- **Tests**: Co-locate test files with components (e.g., `MyComponent.test.tsx`)
- **Utilities**: Add pure functions to `src/utils/helpers.ts`
- **Types**: Add or extend interfaces in `src/types/index.ts`
- **Product data**: Add new product JSON files to `public/products/` and register them in `ProductsPage.tsx`

Ensure `npm run lint`, `npm run build`, and `npm run test:run` all pass before submitting changes.

---

## 🔧 Troubleshooting

### `npm install` fails or throws errors

- **Check your Node version**: run `node --version` — must be 18 or higher
- **Clear the cache and retry**:
  ```bash
  npm cache clean --force
  rm -rf node_modules package-lock.json
  npm install
  ```
- **On Windows**, if you see permission errors, try running your terminal as Administrator

---

### The app doesn't open at http://localhost:3000

- **Port already in use?** Another process may be using port 3000. Stop it, or temporarily edit `vite.config.ts` to use a different port:
  ```ts
  server: { port: 3001, open: true }
  ```
- **Browser didn't open automatically?** Manually navigate to `http://localhost:3000`
- **Check the terminal** — Vite will print the actual URL it's serving on if the port changed

---

### `npm run build` fails with TypeScript errors

TypeScript strict mode is enabled. Common causes:
- **Unused variables**: remove them or prefix with `_` (e.g., `_unusedParam`)
- **Missing types**: ensure all function parameters and return values are typed
- Run `npm run lint` first — it often surfaces the same issues with clearer messages

---

### Tests fail with "Cannot find module" or context errors

- Make sure you're importing `render` from `src/test/test-utils.tsx`, **not** directly from `@testing-library/react`
- If testing a component that uses `CartContext`, either use the custom render (which includes `CartProvider`) or wrap manually with `<CartContext.Provider value={...}>`

---

### `npm run test:coverage` shows 0% for a file

- The file may not be imported by any test yet — coverage only tracks files that are exercised during a test run
- Check `vite.config.ts` under `coverage.exclude` to ensure the file isn't excluded

---

### Port 3000 is blocked by a firewall or corporate proxy

Run the dev server on a different port:
```bash
npx vite --port 5173
```
Then open `http://localhost:5173` manually.
