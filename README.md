# Daily Expense Tracker (SPA)

A modern, responsive, zero-overhead single-page web application (SPA) for logging, organizing, and visualizing daily expenses.

Built with **Next.js (App Router, TypeScript)**, **Tailwind CSS**, **Lucide React**, **Recharts**, and **LocalStorage** for instant client-side persistence. Fully prepared for one-click deployment on **Vercel**.

---

## Key Features

- 💸 **Expense Management**: Log daily expenses with amount, date, custom category, and description notes. Real-time search, category filter, date filtering, sorting, and deletion.
- 🎨 **Category Customization**: Modal panel to create, edit, or delete categories with custom hex colors and Lucide icons.
- 📊 **Visual Insights & Charts**:
  - **Weekly Overview Bar Chart**: Daily totals breakdown from Monday to Sunday.
  - **Monthly Category Donut Chart**: Interactive category breakdown percentage donut chart with custom hover tooltips and active legends.
  - **Summary Metrics Cards**: Instant display of Total Spent (This Week), Total Spent (This Month), Highest Spending Category, and Daily Average.
- 🌙 **Dark Mode & Responsive UI**: Built-in dark/light mode toggle with `next-themes` and a fluid mobile layout.
- 💾 **Instant Persistence & Backup**: Saved to `LocalStorage` with zero database setup required. Includes JSON backup download, JSON restore, and demo seed data reset options.
- 🚀 **Vercel Deployment Ready**: Standard Next.js layout, relative path assets, and error-free build configuration.

---

## Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router, Client Components)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Charts**: [Recharts](https://recharts.org/)
- **Theme**: [next-themes](https://github.com/pacocoursey/next-themes)
- **Utilities**: `date-fns`, `clsx`, `tailwind-merge`

---

## Local Development Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Run the Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Build for Production
To test production build compilation locally:
```bash
npm run build
```

---

## Deploying to Vercel

1. Push this project folder to your GitHub, GitLab, or Bitbucket repository:
   ```bash
   git init
   git add .
   git commit -m "Initial commit of Daily Expense Tracker"
   git remote add origin <your-repo-url>
   git push -u origin main
   ```
2. Log in to [Vercel](https://vercel.com/) and click **Add New > Project**.
3. Select your repository and import it.
4. Vercel will automatically detect Next.js settings:
   - **Framework Preset**: Next.js
   - **Build Command**: `next build`
   - **Output Directory**: `.next`
5. Click **Deploy**. Your app will be live within seconds!
