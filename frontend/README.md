# Srebrna Sad Frontend

React + TypeScript web application for the Srebrna Sad orchard website.

## Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Axios** - HTTP client for API calls

## Features (Phase 1)

- Information about the orchard
- Photo gallery
- Contact form

## Setup

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
npm install
```

### Development

Run the development server:

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

The dev server is configured to proxy API calls from `/api` to `http://localhost:8000`.

### Build

Create an optimized production build:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

### Type Checking

Check for TypeScript errors without building:

```bash
npm run type-check
```

## Project Structure

```
src/
├── components/
│   ├── Header.tsx       - Navigation header
│   ├── Hero.tsx         - Hero section
│   ├── About.tsx        - About the orchard
│   ├── Gallery.tsx      - Photo gallery
│   ├── Contact.tsx      - Contact form
│   └── Footer.tsx       - Footer
├── App.tsx              - Main app component
├── App.css
├── main.tsx             - Entry point
└── index.css            - Global styles
```

## API Integration

The Contact form makes POST requests to `/api/contact` with the following structure:

```typescript
{
  name: string
  email: string
  phone: string
  message: string
}
```

## Deployment

### GitHub Pages

Build and deploy to GitHub Pages:

```bash
npm run build
```

Then push the `dist/` folder to the `gh-pages` branch.

## Environment Variables

Create a `.env.local` file if needed (not required for Phase 1):

```
VITE_API_URL=http://localhost:8000
```

## Next Steps (Phase 2)

- Apple ordering system
- Admin panel
- Image management
- Order calendar and time slots
