# Memorial Project

This project is a full-stack digital memorial and tribute website.

## 1. High-Level Architecture

- **Frontend**: A React single-page application (SPA) built with Vite, written in TypeScript. It uses Tailwind CSS and `shadcn/ui` for styling and componentry.
- **Backend**: A Node.js/Express API server that handles data persistence, authentication, and file storage.
- **Database**: PostgreSQL, managed via the `pg` library. It interacts with a Supabase instance for data and file storage.
- **Package Management**: The project uses `bun` (indicated by `bun.lockb`) for the frontend and `npm` for the backend.

---

## 2. Frontend (`src/`)

The frontend is responsible for rendering the user interface and interacting with the backend API.

- **Framework**: React 18
- **Build Tool**: Vite
- **Language**: TypeScript
- **Routing**: `react-router-dom` for all client-side routing.
- **Styling**:
  - Tailwind CSS for utility-first styling.
  - `shadcn/ui` for the core component library, located in `src/components/ui`.
  - Custom components are in `src/components`.
- **State Management**:
  - `@tanstack/react-query` for server state management (fetching, caching, updating data).
  - Component-level state and custom hooks (`src/hooks`) for UI state.
- **Key Pages**:
  - `Index.tsx`: The main landing page.
  - `Gallery.tsx`: Displays photos.
  - `Tributes.tsx`: Displays user-submitted tributes.
  - `Eulogy.tsx`: Displays the eulogy.
  - `AdminPage.tsx` & `Login.tsx`: For site administration.

## 3. Backend (`server/`)

The backend provides a RESTful API for the frontend.

- **Framework**: Express.js
- **Language**: JavaScript (Node.js)
- **Database**:
  - Uses `node-postgres` (`pg`) to connect to a PostgreSQL database.
  - Interacts with Supabase for authentication and object storage (`@supabase/supabase-js`).
- **Authentication**:
  - JWT-based authentication (`jsonwebtoken`, `express-jwt`).
  - Passwords are hashed with `bcrypt`.
  - An `admin` role is used for protected routes.
- **API Endpoints**:
  - `/login`: User authentication.
  - `/tributes`: CRUD for tributes.
  - `/eulogy`: CRUD for the eulogy content.
  - `/photos`: CRUD for photos, including uploads to Supabase Storage via `multer`.
- **Database Migrations**:
  - A custom migration system is in place (`server/migrate.js` and `server/migrations/`).

## 4. Getting Started

### Prerequisites

- Node.js and npm (for backend)
- Bun (for frontend)
- A PostgreSQL database (or Supabase account)

### Environment Variables

Create a `.env.production` file in the root directory with the following variables for the backend:

```env
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_supabase_service_key
SUPABASE_BUCKET=your_storage_bucket_name
JWT_SECRET=your_jwt_secret
```

### Running the Application

1.  **Start the Backend Server**:
    ```bash
    cd server
    npm install
    npm start
    ```
    The server will run on `http://localhost:3001`.

2.  **Start the Frontend Development Server**:
    ```bash
    # from the root directory
    bun install
    bun run dev
    ```
    The frontend will be available at `http://localhost:8080`.

## 5. Best Practices (`GEMINI.md`)

The project follows a set of best practices outlined in `GEMINI.md`. Key points include:

- **Coding Style**: TDD, consistent naming, prefer simple functions, use branded types for IDs.
- **Testing**: Emphasis on integration tests, clear test descriptions, and property-based testing.
- **Git**: Use Conventional Commits format for commit messages.
- **Tooling**: `prettier` for formatting, and `turbo typecheck lint` for static analysis (though `turbo` is not in `package.json`, this is the stated goal).