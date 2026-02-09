# AI Agent Instructions for AppColeta 2026

## Project Overview
**AppColeta** is a biometric data collection system for UTFPR, built with **Vite + React + TypeScript** frontend and **Express.js + PostgreSQL** backend. The app enables field collectors (Coletistas) to capture fingerprint/hand data offline, sync to a central server, and supports multi-user administration with role-based access control.

### Architecture
- **Frontend**: React with shadcn-ui components, Tailwind CSS, Dexie (IndexedDB) for offline data
- **Backend**: Express API (port 3001) with PostgreSQL, JWT authentication
- **Database Sync**: Frontend queues changes to an async sync engine; backend UPSERTS via UUID conflicts
- **Internationalization**: i18next (pt-BR, en-US, es-ES)
- **Offline-First**: IndexedDB cache with sync queue system

---

## Essential Developer Workflows

### Development Setup
```bash
# Start both frontend + backend concurrently
npm run dev:all

# Or individually
npm run dev:frontend          # Vite on http://localhost:8080
npm run dev:backend           # Express on http://localhost:3001
```

**Key Config Files:**
- [vite.config.ts](vite.config.ts) - Proxy `/auth`, `/sync`, `/health` to backend
- [tailwind.config.ts](tailwind.config.ts) - Custom font sizes and color system
- [tsconfig.app.json](tsconfig.app.json) - Path alias `@/` points to `src/`

### Database Initialization
```bash
# First-time only: seed default users (admin@biometria.com, coletista@biometria.com)
npm --prefix appcoleta-backend run db:init
```

### Build & Deployment
```bash
npm run build              # Production build
npm run build:dev          # Development build
```

---

## Architecture & Data Flow

### 1. **Authentication & Permissions**
- **Login**: Email + password → backend JWT token → stored in localStorage
- **User Profiles**: `ADMINISTRADOR` or `COLETISTA`
- **Permission System**: [src/routes/permissions.ts](src/routes/permissions.ts) defines route-level access
  - Admins: All routes except `/dashboard-coletista`
  - Collectors: Limited to `/dashboard-coletista`, `/sincronizacao`
- **Routes**: Protected by [src/routes/ProtectedRoute.tsx](src/routes/ProtectedRoute.tsx) and [src/routes/RoleRoute.tsx](src/routes/RoleRoute.tsx)

### 2. **Offline-First Data Architecture**
**Database Layer** [src/lib/db.ts](src/lib/db.ts):
- Dexie IndexedDB schema with 11 tables: `usuarios`, `maes`, `bebes`, `scanners`, `arquivos_referencia`, `sessoes_coleta`, `dedos_coleta`, `forms_coleta`, `respostas_quali`, `auditorias`, `login_eventos`
- All records have `uuid` (UPSERT key) + local `id` (Dexie primary key)

**Bidirectional Sync System**:
- **PUSH** (`POST /sync`): Sends local changes to backend, which UPSERTS records via UUID conflict resolution
- **PULL** (`GET /sync/pull`): Fetches all updated records from server and syncs to IndexedDB
- **Flow**: `syncAll()` → Push local changes → Pull server updates → Update IndexedDB
- **Result**: When User A creates a record, User B sees it after sync (data appears across devices)

**Sync Queue** [src/lib/sync.ts](src/lib/sync.ts):
- `enqueueSyncItem()` serializes data (Dates → ISO strings, strip undefined)
- Types: `USUARIO`, `MAE`, `BEBE`, `SCANNER`, `SESSAO`, `DEDO`, `FORMULARIO`, `IMAGEM`, `AUDITORIA`, `LOGIN_EVENTO`
- Priority levels (1-4) control sync order; items processed by `useSync()` hook

**Sync Hook** [src/hooks/useSync.tsx](src/hooks/useSync.tsx):
- `syncAll()`: Push pending items → Pull server data → Update IndexedDB (full sync cycle)
- `pullDataFromServer()`: Standalone pull function to fetch fresh data from all tables
- Retry logic for failed syncs; tracks `pending` and `error` counts
- Ordered by `TYPE_ORDER` (dependency graph: users→sessions→fingers→forms)

### 3. **Component Architecture**
**Layout**: [src/components/AppLayout.tsx](src/components/AppLayout.tsx)
- Sidebar navigation with role-based menu items
- Breadcrumb tracking, connectivity indicator, sync status badge
- shadcn-ui Sidebar component (responsive)

**UI Library**: [src/components/ui/](src/components/ui/) contains 25+ shadcn components (Button, Card, Dialog, etc.)

**Custom Components**:
- `ConnectivityIndicator` - Shows online/offline status
- `SyncStatus` - Displays pending sync count + errors
- `HandDiagram` - Visualization of collected finger data
- `BabyHandsVisualization` - Baby fingerprint display
- `FingerprintBackground` - Decorative background

### 4. **Internationalization (i18n)**
[src/lib/i18n.ts](src/lib/i18n.ts):
- Locale files in [src/locales/](src/locales/) (JSON)
- Default: pt-BR; stored in `localStorage('app-locale')`
- Usage: `const { t } = useTranslation()` then `t('key')`

---

## Code Patterns & Conventions

### File Naming
- Pages (routes): `src/pages/PageName.tsx` (CamelCase)
- Components: `src/components/ComponentName.tsx`
- Utilities: `src/lib/featureName.ts` (kebab-case filenames with camelCase exports)
- Hooks: `src/hooks/useHookName.tsx`

### Database Operations
**Always use UUID as UPSERT key**:
```typescript
// ✅ Correct
await enqueueSyncItem({ 
  tipo: 'BEBE', 
  table: 'bebes', 
  data: { uuid: crypto.randomUUID(), maeId: 123, nome: 'João' }
});

// ❌ Avoid: Sync relies on uuid for conflict resolution
```

### Component Patterns
**Use shadcn Button + Dialog for forms**:
```tsx
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';

export function MyModal() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Open</Button>
      </DialogTrigger>
      <DialogContent>
        {/* Form content */}
      </DialogContent>
    </Dialog>
  );
}
```

**Auth-Protected Components**:
```tsx
const user = getAuthUser();
if (!user) return <Navigate to="/login" />;
if (user.perfil === 'COLETISTA') { /* restricted view */ }
```

### Styling
- **Tailwind CSS** with custom theme (see [tailwind.config.ts](tailwind.config.ts))
- **Colors**: Use CSS vars `hsl(var(--primary))` defined in index.css
- **Spacing**: Consistent rem units (e.g., `p-4`, `gap-2`)
- **Dark mode**: `darkMode: ["class"]` - add `dark` class to HTML

### Error Handling
- Use `useToast()` hook for user feedback (from `@/hooks/use-toast.ts`)
- Backend returns `{ error: string }` on failure; sync queue retries exponentially
- Log errors to browser console; audit logs recorded in `auditorias` table

---

## Backend API Contract

### Key Endpoints (Express on port 3001)
- `POST /auth/login` - Returns `{ token, user }`
- `POST /sync` - **Push**: Upserts batch of records (expects snake_case payload) → returns `{ results: [...] }`
- `GET /sync/pull` - **Pull**: Returns all data from all tables (fresh from server) → `{ ok: true, data: { usuarios: [...], maes: [...], etc } }`
- `GET /health` - Connection check

**Bidirectional Sync Flow**:
1. Frontend: `syncAll()` → `POST /sync` (push local changes)
2. Frontend: Pull server response and update IndexedDB
3. Frontend: `GET /sync/pull` (fetch fresh data from all tables)
4. Frontend: Merge server data into IndexedDB (UPSERT by UUID)
5. Result: All users see latest data across all entities

**CORS**: Open to all origins (`"*"`) for Cloudflare tunnel compatibility

**DB Connection**: PostgreSQL config via `.env`:
```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=...
DB_NAME=appcoleta
```

### UPSERT Strategy
Backend uses PostgreSQL `ON CONFLICT (uuid) DO UPDATE` to merge changes:
- Creates record if UUID doesn't exist
- Updates non-conflict columns if UUID exists
- Idempotent: Resend same sync item without side effects

---

## Common Tasks

### Adding a New Table/Entity
1. Define interface in [src/lib/db.ts](src/lib/db.ts)
2. Add table to Dexie schema in `initializeDatabase()`
3. Add sync type to [src/lib/sync.ts](src/lib/sync.ts) `SyncTable` union + `TYPE_CONFIG`
4. Add to backend schema: `appcoleta-backend/scripts/createTablesScript.sql`

### Adding a Route
1. Create page in `src/pages/PageName.tsx`
2. Import in [src/AppRoutes.tsx](src/AppRoutes.tsx)
3. Define permissions in [src/routes/permissions.ts](src/routes/permissions.ts)
4. Wrap with `<ProtectedRoute>` or `<RoleRoute>`

### Internationalization
1. Add key to `src/locales/pt-BR.json` (primary language)
2. Add same key to `src/locales/en-US.json`, `src/locales/es-ES.json`
3. Usage: `const { t } = useTranslation(); t('myKey')`

---

## Testing & Debugging

- **Lint**: `npm run lint` (ESLint)
- **Browser DevTools**: React DevTools extension for component tree inspection
- **IndexedDB**: Chrome DevTools → Application → IndexedDB → AppColeta DB
- **Network**: Proxy requests visible in Network tab (dev backend on 3001)
- **Offline Testing**: DevTools Network tab → throttle to offline

---

## External Dependencies & Integrations

- **React Router**: Client-side routing (v6)
- **React Query**: Server state management (v5)
- **Dexie**: IndexedDB wrapper for offline cache
- **shadcn-ui**: Component library (Radix UI + Tailwind)
- **Lucide Icons**: Icon library
- **React Hook Form**: Form state management
- **date-fns**: Date utilities
- **i18next**: Internationalization

---

## Key Files Summary
| File | Purpose |
|------|---------|
| [src/App.tsx](src/App.tsx) | Root component, providers setup |
| [src/AppRoutes.tsx](src/AppRoutes.tsx) | Route definitions |
| [src/lib/db.ts](src/lib/db.ts) | Dexie schema + types |
| [src/lib/sync.ts](src/lib/sync.ts) | Sync queue logic |
| [src/hooks/useSync.tsx](src/hooks/useSync.tsx) | Sync execution hook |
| [appcoleta-backend/server.js](appcoleta-backend/server.js) | Express API |
| [src/routes/permissions.ts](src/routes/permissions.ts) | RBAC rules |
