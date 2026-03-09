# Feature Module Specification — CRUD List Section (v3)

> **Purpose:** A professional, abstract specification for building a self-contained CRUD feature module in this React + Supabase project. Designed to be followed step-by-step by an AI or developer with minimal context.
>
> **Scope:** One "section" = one database table exposed as a searchable, paginated list with add / edit / delete capabilities inside a dialog form.
>
> **Language rule:** All code, comments, variable names, UI text, and documentation must be written in **English only**.

---

## Table of Contents

1. [Tech Stack & Conventions](#1-tech-stack--conventions)
2. [Architecture Overview](#2-architecture-overview)
3. [Folder Structure & File Map](#3-folder-structure--file-map)
4. [Shared Infrastructure](#4-shared-infrastructure)
5. [Phase 0 — Database Table Design](#phase-0--database-table-design)
6. [Phase 1 — API Layer](#phase-1--api-layer)
7. [Phase 2 — Validation Schema & Defaults](#phase-2--validation-schema--defaults)
8. [Phase 3 — Custom Hooks](#phase-3--custom-hooks)
9. [Phase 4 — Column Definitions](#phase-4--column-definitions)
10. [Phase 5 — Form Component](#phase-5--form-component)
11. [Phase 6 — List (Page) Component](#phase-6--list-page-component)
12. [Phase 7 — Integration & Routing](#phase-7--integration--routing)
13. [Appendix A — Field Type Reference](#appendix-a--field-type-reference)
14. [Appendix B — FK Dropdown Pattern](#appendix-b--fk-dropdown-pattern)
15. [Appendix C — Advanced Form Patterns](#appendix-c--advanced-form-patterns)
16. [Appendix D — Anti-Patterns (DO NOT)](#appendix-d--anti-patterns-do-not)
17. [Appendix E — Complete Worked Example (CRUD)](#appendix-e--complete-worked-example-crud)
18. [Appendix F — Verification Checklist (CRUD)](#appendix-f--verification-checklist-crud)
19. [Appendix G — Read-Only List Variant](#appendix-g--read-only-list-variant)
20. [Appendix H — Filter Bar Pattern](#appendix-h--filter-bar-pattern)
21. [Appendix I — Details Drawer Pattern](#appendix-i--details-drawer-pattern)
22. [Appendix J — Complete Worked Example (Read-Only with Filters & Drawer)](#appendix-j--complete-worked-example-read-only-with-filters--drawer)
23. [Appendix K — Verification Checklist (Read-Only)](#appendix-k--verification-checklist-read-only)

---

## 1. Tech Stack & Conventions

| Layer            | Technology                                        |
| ---------------- | ------------------------------------------------- |
| UI Framework     | React 19 (JSX, functional components, hooks)      |
| UI Library       | MUI (Material UI) v7 — `@mui/material`            |
| Data Grid        | `@mui/x-data-grid` v8                             |
| Forms            | `react-hook-form` v7                              |
| Validation       | `zod` (via `@hookform/resolvers/zod`)             |
| Server State     | `@tanstack/react-query` v5                        |
| Backend / DB     | Supabase (`@supabase/supabase-js`)                |
| Routing          | `react-router-dom` v7                             |
| Build Tool       | Vite                                              |

### 1.1 Coding Conventions

- **Functional components only** — no class components.
- File naming: `camelCase` for logic files (`entity.api.js`, `entity.hooks.js`), **PascalCase** for component files (`EntityForm.jsx`).
- Each feature is **self-contained** under `src/features/<entityPlural>/`.
- **No Redux** inside feature modules — all server state via React Query.
- Shared / cross-feature components live in `src/components/`.
- Supabase client import path: `../../config/supabase`.
- **All code, comments, and UI strings must be in English.** No Arabic, Turkish, or other non-English text.
- Use `isPending` (TanStack Query v5) — never `isLoading` for mutations.
- Use `placeholderData: (prev) => prev` — never the deprecated `keepPreviousData` option.

---

## 2. Architecture Overview

```
┌──────────────────────────────────────────────────────────┐
│                     <EntityName>List                     │  ← Page component (thin UI shell)
│  ┌────────────────────────────────────────────────────┐  │
│  │              useEntityQuery()                      │  │  ← Custom hook: query + search
│  │              useEntityMutations()                  │  │  ← Custom hook: create/update/delete
│  └────────────────────────────────────────────────────┘  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │ <entity>     │  │ <Entity>     │  │ ConfirmDelete│   │
│  │ Columns()    │  │ Form         │  │ Dialog       │   │
│  └──────┬───────┘  └──────┬───────┘  └──────────────┘   │
│         │                 │                              │
│         │         ┌───────┴───────┐                      │
│         │         │ <entity>      │                      │
│         │         │ Schema        │                      │
│         │         └───────────────┘                      │
└─────────┼────────────────────────────────────────────────┘
          │
   ┌──────┴───────┐
   │ <entity>     │  ← Pure data-access layer
   │ .api.js      │
   └──────┬───────┘
          │
   ┌──────┴───────┐
   │  Supabase    │
   └──────────────┘
```

### 2.1 Design Principles

| Principle                 | What it means in practice                                                                                                       |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| **Single Responsibility** | Each file does exactly one thing. API files never import React. Schema files never import MUI. Columns never call API functions. |
| **Hooks encapsulate logic** | All React Query calls, cache invalidation, and error handling live in custom hooks — not in JSX components.                   |
| **UI is a thin shell**    | The List component only wires state ↔ hooks ↔ child components. No business logic inside JSX.                                  |
| **Props down, events up** | Form receives data via props, returns validated data via callbacks. It never fetches or mutates.                                |
| **Fail loudly**           | Every mutation shows a **dialog message** on success **and** on error. Silent failures are a bug.                               |
| **Consistent naming**     | Every file, export, query key, and function follows predictable `<entity>`-based naming — no guessing.                          |
| **English only**          | All code identifiers, comments, UI labels, error messages, and documentation must be in English.                                |
| **Explicit selects**      | Always specify the exact columns in Supabase `.select()` — never use `select("*")`.                                            |

---

## 3. Folder Structure & File Map

For a feature named **`<Entity>`** (e.g., Category, Warehouse), create:

```
src/features/<entityPlural>/
├── <entity>.api.js            # Supabase CRUD functions + query key constant
├── <entity>.schema.js         # Zod schema + exported default values
├── <entity>.hooks.js          # useEntityQuery + useEntityMutations custom hooks
├── <entity>.columns.jsx       # DataGrid column definitions (function)
├── <EntityName>Form.jsx       # Add / Edit dialog form (default export)
└── <EntityName>List.jsx       # Page component — thin UI shell (named export)
```

> **Key layer:** `<entity>.hooks.js` encapsulates all React Query logic, keeping the List component lean. The old pattern of putting `useMutation`, `useQuery`, and `useQueryClient` directly in the List component is **eliminated**.

### 3.1 Naming Rules

| Item              | Convention                     | Example               |
| ----------------- | ------------------------------ | --------------------- |
| Folder            | plural, lowercase, no spaces   | `warehouses`          |
| Logic files       | `singular.purpose.js`          | `warehouse.api.js`    |
| Component files   | `PascalCase + Suffix.jsx`      | `WarehouseForm.jsx`   |
| Schema export     | `<entity>Schema`               | `warehouseSchema`     |
| Defaults export   | `<entity>Defaults`             | `warehouseDefaults`   |
| Column export     | `<entity>Columns`              | `warehouseColumns`    |
| Query key         | `ENTITY_QUERY_KEY`             | `WAREHOUSE_QUERY_KEY` |
| Hook exports      | `use<Entity>Query`, `use<Entity>Mutations` | `useWarehouseQuery` |
| API functions     | `get<Plural>`, `create<Entity>`, `update<Entity>`, `delete<Entity>`, `delete<Plural>` | `getWarehouses`, `deleteWarehouses` |
| Component exports | `<EntityName>List` (named), `<EntityName>Form` (default) | `WarehouseList` |

---

## 4. Shared Infrastructure

These files exist once and are reused by every feature module. If they already exist, skip this section.

### 4.1 ConfirmDeleteDialog

**File:** `src/components/ConfirmDeleteDialog.jsx`

```jsx
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
} from "@mui/material";

export default function ConfirmDeleteDialog({
  open, itemName, onClose, onConfirm, isPending = false,
}) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ fontWeight: "bold" }}>Confirm Delete</DialogTitle>
      <DialogContent>
        Are you sure you want to delete <strong>{itemName}</strong>?
        This action cannot be undone.
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} disabled={isPending}>Cancel</Button>
        <Button variant="contained" color="error" onClick={onConfirm} disabled={isPending}>
          {isPending ? "Deleting..." : "Delete"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
```

### 4.2 MessageDialog

**File:** `src/components/MessageDialog.jsx`

> **Critical rule:** Every message generated by database operations or errors must be displayed as a **dialog** — never as a browser `alert()`, `console.error()`, or a Snackbar.

```jsx
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
} from "@mui/material";

export default function MessageDialog({
  open, title = "Notification", message, severity = "info", onClose,
}) {
  const titleColor = {
    success: "success.main", error: "error.main",
    warning: "warning.main", info: undefined,
  }[severity];

  const buttonColor =
    severity === "error" ? "error" :
    severity === "warning" ? "warning" : "primary";

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ color: titleColor, fontWeight: "bold" }}>{title}</DialogTitle>
      <DialogContent>{message}</DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button variant="contained" color={buttonColor} onClick={onClose}>OK</Button>
      </DialogActions>
    </Dialog>
  );
}
```

### 4.3 useMessageDialog Hook

**File:** `src/hooks/useMessageDialog.js`

```jsx
import { useState, useCallback } from "react";

export function useMessageDialog() {
  const [messageDialog, setMessageDialog] = useState({
    open: false, title: "", message: "", severity: "info",
  });

  const showMessageDialog = useCallback((message, severity = "info", title) => {
    const defaultTitles = { success: "Success", error: "Error", warning: "Warning", info: "Info" };
    setMessageDialog({
      open: true,
      title: title || defaultTitles[severity] || "Notification",
      message, severity,
    });
  }, []);

  const closeMessageDialog = useCallback(() => {
    setMessageDialog((prev) => ({ ...prev, open: false }));
  }, []);

  return { messageDialog, showMessageDialog, closeMessageDialog };
}
```

### 4.4 ScrollToTopButton

**File:** `src/components/ScrollToTopButton.jsx` — floating button that scrolls to the top of the page.

### 4.5 FormDialog (optional wrapper)

**File:** `src/components/FormDialog.jsx` — reusable Dialog with title, content slot, and Cancel/Save buttons.

### 4.6 FilterBar (optional wrapper)

**File:** `src/components/FilterBar.jsx` — reusable search + filter bar wrapper for List pages.

---

## Phase 0 — Database Table Design

Before writing any frontend code, ensure the Supabase table is correctly designed.

### 0.1 Table Naming

- Use **snake_case**, **plural** names: `product_categories`, `warehouse_stocks`, `stock_movements`.
- Junction tables: `<table1>_<table2>` (e.g., `product_type_attributes`).

### 0.2 Required Columns

Every table must have:

| Column       | Type                          | Notes                                  |
| ------------ | ----------------------------- | -------------------------------------- |
| `id`         | `bigint` / `uuid` (PK)       | Auto-generated primary key             |
| `created_at` | `timestamptz`                 | Default `now()`                        |

### 0.3 Foreign Key Conventions

- FK column name: `<singular_parent>_id` (e.g., `brand_id`, `customer_id`).
- Always add an index on FK columns.
- Use `ON DELETE CASCADE` for child tables, `ON DELETE RESTRICT` for critical references.

### 0.4 Column Guidelines

- Boolean columns: prefix with `is_` or `has_` (e.g., `is_active`, `has_stock`).
- Status columns: use text enums, not integers (e.g., `'active'`, `'draft'`).
- Money columns: use `numeric(12,2)` — never `float`.
- Always add `NOT NULL` constraints where the field is logically required.

### 0.5 Row-Level Security (RLS)

- Enable RLS on every table.
- At minimum, create a policy that allows authenticated users to perform CRUD.

---

## Phase 1 — API Layer

**File:** `<entity>.api.js`

### 1.1 Tasks

1. Create the file at `src/features/<entityPlural>/<entity>.api.js`.
2. Import the Supabase client:
   ```js
   import supabase from "../../config/supabase";
   ```
3. Export a **query key constant**:
   ```js
   export const ENTITY_QUERY_KEY = "<entityPlural>";
   ```
4. Implement and export these **five async functions**:

#### 1.1.1 Get All (Paginated)

```js
export async function getEntities({ page = 0, pageSize = 10, searchText = "" } = {}) {
  const from = page * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("table_name")
    .select("id, name, slug, is_active", { count: "exact" })
    .order("id", { ascending: false })
    .range(from, to);

  if (searchText) {
    const like = `%${searchText}%`;
    query = query.or(`name.ilike.${like},slug.ilike.${like}`);
  }

  const { data, error, count } = await query;
  if (error) throw error;
  return { data, count };
}
```

**Rules:**
- Select **only** the columns needed — **never `select("*")`**.
- Always pass `{ count: "exact" }` for server pagination.
- Always apply `.order()` for deterministic results.
- Return `{ data, count }` — not just `data`.

#### 1.1.2 Create

```js
export async function createEntity(payload) {
  const { data, error } = await supabase
    .from("table_name").insert(payload).select().single();
  if (error) throw error;
  return data;
}
```

#### 1.1.3 Update

```js
export async function updateEntity(id, payload) {
  const { data, error } = await supabase
    .from("table_name").update(payload).eq("id", id).select().single();
  if (error) throw error;
  return data;
}
```

#### 1.1.4 Delete (Single)

```js
export async function deleteEntity(id) {
  const { error } = await supabase.from("table_name").delete().eq("id", id);
  if (error) throw error;
  return true;
}
```

#### 1.1.5 Delete Multiple (Bulk)

```js
export async function deleteEntities(ids) {
  const { error } = await supabase.from("table_name").delete().in("id", ids);
  if (error) throw error;
  return true;
}
```

### 1.2 Rules

- **No React imports** — pure data-access layer.
- Every function **throws on failure** — callers (hooks) handle errors.
- The `ENTITY_QUERY_KEY` is the single source of truth for cache keys.
- Never use `console.log()` or `console.error()`.

---

## Phase 2 — Validation Schema & Defaults

**File:** `<entity>.schema.js`

### 2.1 Tasks

1. Import Zod: `import { z } from "zod";`
2. Define and export the schema with human-readable error messages.
3. Export defaults derived from the schema via `.parse()`:

```js
export const entitySchema = z.object({
  name: z.string().min(1, "Name is required").trim(),
  is_active: z.boolean().optional().default(true),
});

export const entityDefaults = entitySchema.parse({
  name: "",
});
```

### 2.2 Rules

- **No React imports** — pure validation module.
- `.trim()` on all string fields.
- Use `z.coerce.number()` for values from `<TextField>` (HTML returns strings).
- Export names: `<entity>Schema` and `<entity>Defaults`.
- **One source of truth** — defaults never duplicated in the Form.

---

## Phase 3 — Custom Hooks

**File:** `<entity>.hooks.js`

### 3.1 `useEntityQuery`

Handles server-side pagination and debounced search. Returns rows, count, and controls.

```js
export function useEntityQuery() {
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });
  const [searchText, setSearchText] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchText);
      setPaginationModel((prev) => ({ ...prev, page: 0 }));
    }, 500);
    return () => clearTimeout(timer);
  }, [searchText]);

  const { data, isLoading, isFetching, isError, error } = useQuery({
    queryKey: [ENTITY_QUERY_KEY, paginationModel, debouncedSearch],
    queryFn: () => getEntities({
      page: paginationModel.page, pageSize: paginationModel.pageSize,
      searchText: debouncedSearch,
    }),
    staleTime: 1000 * 60 * 5,
    placeholderData: (prev) => prev,
  });

  return {
    rows: data?.data || [], rowCount: data?.count || 0,
    isLoading, isFetching, isError, error,
    paginationModel, setPaginationModel, searchText, setSearchText,
  };
}
```

### 3.2 `useEntityMutations`

Returns create / update / delete / deleteMultiple mutations with cache invalidation and notifications.

```js
export function useEntityMutations({ onSuccess, showMessageDialog }) {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: [ENTITY_QUERY_KEY] });
  // ... createMutation, updateMutation, deleteMutation, deleteMultipleMutation
  return { createMutation, updateMutation, deleteMutation, deleteMultipleMutation };
}
```

### 3.3 Rules

- Imports from API file **and** React Query.
- **Never** imports MUI or renders JSX.
- `staleTime: 5 minutes`, `placeholderData: (prev) => prev`.
- Search debounce: 500ms, resets to page 0.
- Uses `isPending` (v5), never `isLoading` for mutations.

---

## Phase 4 — Column Definitions

**File:** `<entity>.columns.jsx`

### 4.1 Signature

```jsx
export const entityColumns = (
  onEdit, onDelete, selectedIds, toggleSelect, rows = [], toggleSelectAll,
) => [ /* columns */ ];
```

Use **positional parameters**, not an options object.

### 4.2 Required Columns

1. **Checkbox column** (first) — with select-all, indeterminate, `e.stopPropagation()`.
2. **Data columns** — `flex: 1` for text, fixed `width` for status.
3. **Actions column** (last) — Edit + Delete buttons in `<Stack>`, both with `e.stopPropagation()`.

### 4.3 Rules

- Never imports API functions.
- Use `<Stack direction="row" spacing={1}>` — not `<Box>`.
- Use `flex: 1` for text columns, fixed `width` for actions.

---

## Phase 5 — Form Component

**File:** `<EntityName>Form.jsx`

### 5.1 Props

| Prop          | Type                     | Description                          |
| ------------- | ------------------------ | ------------------------------------ |
| `open`        | `boolean`                | Dialog visibility                    |
| `mode`        | `"add" \| "edit"`        | Title text and reset behavior        |
| `initialData` | `object \| null`         | Row data for edit; `null` for add    |
| `onClose`     | `() => void`             | Close handler                        |
| `onSubmit`    | `(data) => void`         | Receives validated form data         |
| `isPending`   | `boolean`                | Disables Save, shows spinner         |

### 5.2 Rules

- **Default export.**
- **Never** fetches data or imports API/React Query.
- Defaults from `<entity>Defaults` (schema file).
- For FK dropdowns, options passed as props (see Appendix B).

---

## Phase 6 — List (Page) Component

**File:** `<EntityName>List.jsx` — thin UI shell.

### 6.1 Rules

- **Named export.**
- **Zero** direct `useMutation` or `useQuery` calls.
- Uses `ConfirmDeleteDialog` — never `ProductActionDialogs`.
- Uses `MessageDialog` — never Snackbar or `alert()`.
- Columns called with positional args.
- `selectedIds` clears on page change.
- Each List page owns its own padding (`sx={{ p: 3 }}`).

---

## Phase 7 — Integration & Routing

### 7.1 Route

Use **kebab-case** paths: `/customer-types`, `/warehouse-stock`.

### 7.2 Sidebar

Add to appropriate `menuGroups` in `SideBar.jsx`.

### 7.3 Verify

Run Appendix F checklist.

---

## Appendix A — Field Type Reference

| Data Type        | Zod Schema                               | Form Component                                  | Column Config                                    |
| ---------------- | ---------------------------------------- | ----------------------------------------------- | ------------------------------------------------ |
| Required text    | `z.string().min(n).trim()`               | `<TextField fullWidth margin="normal" />`        | `{ field, headerName, flex: 1 }`                 |
| Optional text    | `z.string().optional().or(z.literal(""))` | `<TextField fullWidth margin="normal" />`        | `{ field, headerName, flex: 1 }`                 |
| Boolean          | `z.boolean().default(true)`              | `<Switch>` in `<FormControlLabel>`               | `renderCell: (p) => p.value ? "Yes" : "No"`      |
| Integer          | `z.coerce.number().int().min(0)`         | `<TextField type="number" />`                    | `{ field, headerName, width: 100 }`              |
| Decimal / Money  | `z.coerce.number().min(0)`               | `<TextField type="number" />`                    | `{ field, headerName, width: 120 }`              |
| Enum / status    | `z.enum(["a", "b"])`                     | `<TextField select>` + `<MenuItem>`              | `renderCell` with mapping                         |
| FK (int)         | `z.coerce.number().positive()`           | `<TextField select>` from parent query           | `renderCell` with related name                    |
| Date             | `z.string().date()`                      | `<TextField type="date" />`                      | `renderCell` with formatting                      |

---

## Appendix B — FK Dropdown Pattern

### In List component (parent lookup — exception to "no useQuery"):

```jsx
const { data: brandsData } = useQuery({
  queryKey: [BRAND_QUERY_KEY, "all"],
  queryFn: () => getBrands({ page: 0, pageSize: 1000 }),
  staleTime: 1000 * 60 * 10,
});
const brands = brandsData?.data || [];

<EntityForm brands={brands} /* ... */ />
```

### In Form component:

```jsx
<TextField
  select label="Brand"
  value={watch("brand_id") || ""}
  onChange={(e) => setValue("brand_id", Number(e.target.value))}
  error={!!errors.brand_id} helperText={errors.brand_id?.message}
  fullWidth margin="normal"
>
  <MenuItem value=""><em>Select Brand</em></MenuItem>
  {brands.map((b) => (
    <MenuItem key={b.id} value={b.id}>{b.name}</MenuItem>
  ))}
</TextField>
```

---

## Appendix C — Advanced Form Patterns

### C.1 Auto-generated Slug

```jsx
useEffect(() => {
  if (mode === "add") {
    const name = watch("name");
    const slug = name?.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    setValue("slug", slug || "");
  }
}, [watch("name"), mode, setValue]);
```

### C.2 Field Arrays

```jsx
import { useFieldArray } from "react-hook-form";
const { fields, append, remove } = useFieldArray({ control, name: "items" });
```

### C.3 Conditional Fields

```jsx
{watch("type") === "physical" && (
  <TextField label="Weight" {...register("weight")} />
)}
```

---

## Appendix D — Anti-Patterns (DO NOT)

| #  | Anti-Pattern | Correct Pattern |
|----|-------------|-----------------|
| 1  | `select("*")` in Supabase queries | List explicit columns: `select("id, name, slug")` |
| 2  | `console.log()` / `console.error()` in production | Use `showMessageDialog()` for user errors; remove debug logs |
| 3  | `alert()` for error handling | Use `MessageDialog` component |
| 4  | Snackbar for database feedback | Use `MessageDialog` — users must acknowledge |
| 5  | `useMutation` / `useQuery` in List components | Move to `*.hooks.js` |
| 6  | Importing API in Form components | Forms receive data via props only |
| 7  | `keepPreviousData` (deprecated v4) | `placeholderData: (prev) => prev` |
| 8  | `isLoading` for mutation status (v4) | `isPending` (v5) |
| 9  | Hardcoded hex colors | Use `theme.palette.*` |
| 10 | Non-English comments or UI text | English only |
| 11 | `ProductActionDialogs` for non-product entities | Use `ConfirmDeleteDialog` |
| 12 | Duplicating defaults in Form and Schema | Use `schema.parse({})` |
| 13 | Options object in columns function | Positional parameters |
| 14 | Missing `e.stopPropagation()` on action buttons | Always prevent row-click capture |
| 15 | Client-side pagination with server data | `paginationMode="server"` with `rowCount` |
| 16 | Adding CRUD buttons to read-only pages | Read-only pages have NO Add, Edit, Delete, or Checkbox |
| 17 | `InputLabelProps={{ shrink: true }}` for date fields | `slotProps={{ inputLabel: { shrink: true } }}` (MUI v7) |
| 18 | Storing filter state in hooks | Filter state lives in the List component, passed to hooks |
| 19 | Omitting filter params from queryKey | ALL filter params MUST be in queryKey for auto-refetch |
| 20 | Using date picker library for date filters | Use `TextField type="date"` with `slotProps` |
| 21 | Creating schema/form files for read-only pages | Read-only pages do NOT need schema or form files |
| 22 | Using `select("*")` in filter data queries | Use `select("id, name")` for dropdown data |

---

## Appendix E — Complete Worked Example

A full `departments/` module showing all 6 files.

### E.1 `department.api.js`

```js
import supabase from "../../config/supabase";

const TABLE_NAME = "departments";
export const DEPARTMENT_QUERY_KEY = "departments";

export async function getDepartments({ page = 0, pageSize = 10, searchText = "" } = {}) {
  const from = page * pageSize;
  const to = from + pageSize - 1;
  let query = supabase
    .from(TABLE_NAME)
    .select("id, name, code, is_active, manager_name", { count: "exact" })
    .order("id", { ascending: false })
    .range(from, to);
  if (searchText) {
    const like = `%${searchText}%`;
    query = query.or(`name.ilike.${like},code.ilike.${like}`);
  }
  const { data, error, count } = await query;
  if (error) throw error;
  return { data, count };
}

export async function createDepartment(payload) {
  const { data, error } = await supabase.from(TABLE_NAME).insert(payload).select().single();
  if (error) throw error;
  return data;
}

export async function updateDepartment(id, payload) {
  const { data, error } = await supabase.from(TABLE_NAME).update(payload).eq("id", id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteDepartment(id) {
  const { error } = await supabase.from(TABLE_NAME).delete().eq("id", id);
  if (error) throw error;
  return true;
}

export async function deleteDepartments(ids) {
  const { error } = await supabase.from(TABLE_NAME).delete().in("id", ids);
  if (error) throw error;
  return true;
}
```

### E.2 `department.schema.js`

```js
import { z } from "zod";

export const departmentSchema = z.object({
  name: z.string().min(1, "Name is required").trim(),
  code: z.string().min(1, "Code is required").trim(),
  is_active: z.boolean().optional().default(true),
  manager_name: z.string().optional().or(z.literal("")).default(""),
});

export const departmentDefaults = departmentSchema.parse({
  name: "",
  code: "",
});
```

### E.3 `department.hooks.js`

```js
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getDepartments, createDepartment, updateDepartment,
  deleteDepartment, deleteDepartments, DEPARTMENT_QUERY_KEY,
} from "./department.api";

export function useDepartmentQuery() {
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });
  const [searchText, setSearchText] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchText);
      setPaginationModel((prev) => ({ ...prev, page: 0 }));
    }, 500);
    return () => clearTimeout(timer);
  }, [searchText]);

  const { data, isLoading, isFetching, isError, error } = useQuery({
    queryKey: [DEPARTMENT_QUERY_KEY, paginationModel, debouncedSearch],
    queryFn: () => getDepartments({
      page: paginationModel.page, pageSize: paginationModel.pageSize,
      searchText: debouncedSearch,
    }),
    staleTime: 1000 * 60 * 5,
    placeholderData: (prev) => prev,
  });

  return {
    rows: data?.data || [], rowCount: data?.count || 0,
    isLoading, isFetching, isError, error,
    paginationModel, setPaginationModel, searchText, setSearchText,
  };
}

export function useDepartmentMutations({ onSuccess, showMessageDialog }) {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: [DEPARTMENT_QUERY_KEY] });

  const createMutation = useMutation({
    mutationFn: createDepartment,
    onSuccess: () => { invalidate(); onSuccess?.(); showMessageDialog?.("Created successfully", "success"); },
    onError: (err) => { showMessageDialog?.(err?.message || "Failed to create", "error"); },
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateDepartment(id, data),
    onSuccess: () => { invalidate(); onSuccess?.(); showMessageDialog?.("Updated successfully", "success"); },
    onError: (err) => { showMessageDialog?.(err?.message || "Failed to update", "error"); },
  });
  const deleteMutation = useMutation({
    mutationFn: deleteDepartment,
    onSuccess: () => { invalidate(); showMessageDialog?.("Deleted successfully", "success"); },
    onError: (err) => { showMessageDialog?.(err?.message || "Failed to delete", "error"); },
  });
  const deleteMultipleMutation = useMutation({
    mutationFn: deleteDepartments,
    onSuccess: () => { invalidate(); showMessageDialog?.("Deleted successfully", "success"); },
    onError: (err) => { showMessageDialog?.(err?.message || "Failed to delete", "error"); },
  });

  return { createMutation, updateMutation, deleteMutation, deleteMultipleMutation };
}
```

### E.4 `department.columns.jsx`

```jsx
import { IconButton, Stack, Checkbox } from "@mui/material";
import EditNoteIcon from "@mui/icons-material/EditNote";
import DeleteIcon from "@mui/icons-material/Delete";

export const departmentColumns = (
  onEdit, onDelete, selectedIds, toggleSelect, rows = [], toggleSelectAll,
) => [
  {
    field: "select", headerName: "", width: 60, sortable: false, disableColumnMenu: true,
    renderHeader: () => {
      const allSelected = rows.length > 0 && rows.every((r) => selectedIds.has(r.id));
      return (
        <Checkbox checked={allSelected} indeterminate={selectedIds.size > 0 && !allSelected}
          onClick={(e) => e.stopPropagation()} onChange={toggleSelectAll} />
      );
    },
    renderCell: (params) => (
      <Checkbox checked={selectedIds.has(params.row.id)}
        onClick={(e) => e.stopPropagation()} onChange={() => toggleSelect(params.row.id)} />
    ),
  },
  { field: "id", headerName: "ID", width: 80 },
  { field: "name", headerName: "Name", flex: 1 },
  { field: "code", headerName: "Code", flex: 1 },
  { field: "manager_name", headerName: "Manager", flex: 1 },
  { field: "is_active", headerName: "Active", width: 100, renderCell: (p) => (p.value ? "Yes" : "No") },
  {
    field: "actions", headerName: "Actions", width: 140, sortable: false, filterable: false, disableExport: true,
    renderCell: (params) => (
      <Stack direction="row" spacing={1}>
        <IconButton onClick={(e) => { e.stopPropagation(); onEdit(params.row); }} color="primary"><EditNoteIcon /></IconButton>
        <IconButton onClick={(e) => { e.stopPropagation(); onDelete(params.row); }} color="error"><DeleteIcon /></IconButton>
      </Stack>
    ),
  },
];
```

### E.5 `DepartmentForm.jsx`

```jsx
import { useEffect } from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Stack, FormControlLabel, Switch, CircularProgress,
} from "@mui/material";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { departmentSchema, departmentDefaults } from "./department.schema";

export default function DepartmentForm({
  open, mode = "add", initialData = null, onClose, onSubmit, isPending = false,
}) {
  const { register, handleSubmit, setValue, reset, watch, formState: { errors } } = useForm({
    resolver: zodResolver(departmentSchema), defaultValues: departmentDefaults,
  });

  useEffect(() => {
    if (mode === "edit" && initialData) reset({ ...departmentDefaults, ...initialData });
    else reset(departmentDefaults);
  }, [mode, initialData, reset]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ fontWeight: "bold" }}>
        {mode === "edit" ? "Edit Department" : "Add Department"}
      </DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2} mt={1}>
          <TextField label="Name" {...register("name")} error={!!errors.name} helperText={errors.name?.message} fullWidth margin="normal" />
          <TextField label="Code" {...register("code")} error={!!errors.code} helperText={errors.code?.message} fullWidth margin="normal" />
          <TextField label="Manager Name" {...register("manager_name")} fullWidth margin="normal" />
          <FormControlLabel control={<Switch checked={!!watch("is_active")} onChange={(e) => setValue("is_active", e.target.checked)} />} label="Active" />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} disabled={isPending}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit(onSubmit)} disabled={isPending}
          startIcon={isPending ? <CircularProgress size={20} color="inherit" /> : null}>
          {isPending ? "Saving..." : "Save"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
```

### E.6 `DepartmentList.jsx`

```jsx
import { useState } from "react";
import { Box, Button, Typography, Alert, TextField, Paper } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { useDepartmentQuery, useDepartmentMutations } from "./department.hooks";
import { departmentColumns } from "./department.columns";
import DepartmentForm from "./DepartmentForm";
import ConfirmDeleteDialog from "../../components/ConfirmDeleteDialog";
import MessageDialog from "../../components/MessageDialog";
import ScrollToTopButton from "../../components/ScrollToTopButton";
import { useMessageDialog } from "../../hooks/useMessageDialog";

export function DepartmentList() {
  const [selectedItem, setSelectedItem] = useState(null);
  const [openForm, setOpenForm] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [openDeleteSelected, setOpenDeleteSelected] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [mode, setMode] = useState("add");

  function handleCloseForm() { setOpenForm(false); setSelectedItem(null); }

  const { messageDialog, showMessageDialog, closeMessageDialog } = useMessageDialog();
  const { rows, rowCount, isLoading, isFetching, isError, error, paginationModel, setPaginationModel, searchText, setSearchText } = useDepartmentQuery();
  const { createMutation, updateMutation, deleteMutation, deleteMultipleMutation } = useDepartmentMutations({ onSuccess: handleCloseForm, showMessageDialog });

  const handleOpenAdd = () => { setMode("add"); setSelectedItem(null); setOpenForm(true); };
  const handleOpenEdit = (row) => { setMode("edit"); setSelectedItem(row); setOpenForm(true); };
  const handleFormSubmit = (data) => { mode === "add" ? createMutation.mutate(data) : updateMutation.mutate({ id: selectedItem.id, data }); };
  const handleDeleteClick = (row) => { setSelectedItem(row); setOpenDelete(true); };
  const handleDeleteConfirm = () => { if (!selectedItem) return; deleteMutation.mutate(selectedItem.id, { onSettled: () => { setOpenDelete(false); setSelectedItem(null); } }); };
  const handlePaginationChange = (m) => { setSelectedIds(new Set()); setPaginationModel(m); };
  const toggleSelectAll = () => { const all = rows.length > 0 && rows.every((r) => selectedIds.has(r.id)); setSelectedIds(all ? new Set() : new Set(rows.map((r) => r.id))); };
  const toggleSelect = (id) => { const s = new Set(selectedIds); s.has(id) ? s.delete(id) : s.add(id); setSelectedIds(s); };
  const handleDeleteSelectedConfirm = () => { if (selectedIds.size === 0) return; deleteMultipleMutation.mutate(Array.from(selectedIds), { onSettled: () => { setOpenDeleteSelected(false); setSelectedIds(new Set()); } }); };

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5">Departments</Typography>
        <Box display="flex" gap={1}>
          {selectedIds.size > 0 && <Button variant="contained" color="error" onClick={() => setOpenDeleteSelected(true)}>Delete Selected ({selectedIds.size})</Button>}
          <Button variant="contained" onClick={handleOpenAdd}>Add Department</Button>
        </Box>
      </Box>
      <Box mb={2}>
        <TextField label="Search" variant="outlined" size="small" value={searchText} onChange={(e) => setSearchText(e.target.value)} fullWidth sx={{ maxWidth: 400 }} />
      </Box>
      {isError && <Alert severity="error" sx={{ mb: 2 }}>Failed to load data: {error?.message || "Unknown error"}</Alert>}
      <Paper sx={{ height: 650, width: "100%" }}>
        <DataGrid rows={rows} rowCount={rowCount} columns={departmentColumns(handleOpenEdit, handleDeleteClick, selectedIds, toggleSelect, rows, toggleSelectAll)} loading={isLoading || isFetching} paginationMode="server" paginationModel={paginationModel} onPaginationModelChange={handlePaginationChange} pageSizeOptions={[10, 25, 50]} disableSelectionOnClick sx={{ width: "100%" }} />
      </Paper>
      <DepartmentForm open={openForm} mode={mode} initialData={selectedItem} onClose={handleCloseForm} onSubmit={handleFormSubmit} isPending={createMutation.isPending || updateMutation.isPending} />
      <ConfirmDeleteDialog open={openDelete} itemName={selectedItem?.name || ""} onClose={() => { setOpenDelete(false); setSelectedItem(null); }} onConfirm={handleDeleteConfirm} isPending={deleteMutation.isPending} />
      <ConfirmDeleteDialog open={openDeleteSelected} itemName={`${selectedIds.size} selected items`} onClose={() => setOpenDeleteSelected(false)} onConfirm={handleDeleteSelectedConfirm} isPending={deleteMultipleMutation.isPending} />
      <MessageDialog open={messageDialog.open} title={messageDialog.title} message={messageDialog.message} severity={messageDialog.severity} onClose={closeMessageDialog} />
      <ScrollToTopButton />
    </Box>
  );
}
```

---

## Appendix F — Verification Checklist

### Functional

- [ ] Page loads without console errors
- [ ] Grid displays data with loading spinner
- [ ] Error Alert banner on query failure
- [ ] Server pagination works (next/prev, page size, row count)
- [ ] Server search works (debounce, page reset, clear)
- [ ] Add form opens with defaults, creates, shows dialog, closes, refreshes
- [ ] Edit form opens pre-filled, updates, shows dialog, closes, refreshes
- [ ] Delete shows confirmation, deletes, shows dialog, refreshes
- [ ] Cancel closes dialog without side effects
- [ ] Validation errors inline under fields
- [ ] Checkbox per row, select-all, indeterminate
- [ ] "Delete Selected (N)" appears only when items selected
- [ ] Bulk delete with confirmation
- [ ] Selection clears on page change

### Robustness

- [ ] Save button spinner + disabled while pending
- [ ] Delete button "Deleting..." + disabled while pending
- [ ] Failed mutations show error dialog
- [ ] `placeholderData` keeps previous data visible

### Code Quality

- [ ] `*.api.js` — no React imports, explicit columns, no `select("*")`
- [ ] `*.schema.js` — no React imports, defaults via `.parse()`
- [ ] `*.hooks.js` — no MUI imports, `isPending` not `isLoading`
- [ ] `*Form.jsx` — no API imports, no React Query imports
- [ ] `*List.jsx` — no `useMutation`/`useQuery`, `paginationMode="server"`
- [ ] `*.columns.jsx` — positional params, checkbox, `e.stopPropagation()`
- [ ] All messages via MessageDialog — no Snackbar, alert(), console.error()
- [ ] All text in English
- [ ] Query key from constant, invalidate with object syntax

---

## Summary

| #  | Deliverable                    | File                              | Phase |
| -- | ------------------------------ | --------------------------------- | ----- |
| 0  | Database table                 | Supabase dashboard                | 0     |
| 0a | ConfirmDeleteDialog (shared)   | `components/ConfirmDeleteDialog.jsx` | Infra |
| 0b | MessageDialog (shared)         | `components/MessageDialog.jsx`    | Infra |
| 0c | useMessageDialog hook (shared) | `hooks/useMessageDialog.js`       | Infra |
| 1  | API CRUD + query key           | `<entity>.api.js`                 | 1     |
| 2  | Zod schema + defaults          | `<entity>.schema.js`              | 2     |
| 3  | Custom hooks                   | `<entity>.hooks.js`               | 3     |
| 4  | Column definitions             | `<entity>.columns.jsx`            | 4     |
| 5  | Form dialog                    | `<EntityName>Form.jsx`            | 5     |
| 6  | List page                      | `<EntityName>List.jsx`            | 6     |
| 7  | Route + sidebar                | `main.jsx` + `SideBar.jsx`        | 7     |

**Execution order (CRUD):** Phase 0 → Shared infra → 1 → 2 → 3 → 4 → 5 → 6 → 7 → Verify (Appendix F).

**Execution order (Read-Only with Filters & Drawer):** Phase 0 → 1 → 3 → 4 → 5 (Drawer) → 6 (List) → 7 → Verify (Appendix K).

> **IMPORTANT:** If the page is **read-only** (view data only, no create/edit/delete), skip Phases 2 (schema), 5 (form), and all mutation-related code. Follow **Appendix G** instead. If the page requires **filter dropdowns, date ranges, or detail drawers**, follow **Appendices H, I** in addition.

---
---

# READ-ONLY LIST VARIANT — APPENDICES G through K

> The following appendices define the **Read-Only List** pattern: pages that display filtered, paginated data **without** create / edit / delete capabilities. Instead of CRUD operations, these pages provide **filter bars** (FK dropdowns, date ranges) and **detail drawers** (slide-out panels showing full record details with related data).

---

## Appendix G — Read-Only List Variant

### G.1 When to Use This Pattern

Use the Read-Only List pattern when:
- The page displays records from a table but users should NOT add, edit, or delete them.
- Data is already managed elsewhere (e.g., orders are created on a different page; this page only shows "finished" orders).
- The page filters data by a **fixed condition** (e.g., `status_id = 2` for finished orders).
- Clicking a row opens a **details drawer** instead of an edit form.

### G.2 Files Required (4 files + 1 optional drawer)

| #  | File                              | Purpose                                           |
| -- | --------------------------------- | ------------------------------------------------- |
| 1  | `<entity>.api.js`                 | Read-only query function + filter data function   |
| 2  | `<entity>.hooks.js`               | Query hook (NO mutation hook) + filter data hook   |
| 3  | `<entity>.columns.jsx`            | Column definitions with View button (NO edit/delete) |
| 4  | `<EntityName>List.jsx`            | List page with filter bar (NO Add button, NO form) |
| 5  | `<EntityName>DetailsDrawer.jsx`   | (Optional) Slide-out drawer for row details        |

**Files NOT created:**
- ~~`<entity>.schema.js`~~ — no form validation needed
- ~~`<EntityName>Form.jsx`~~ — no create/edit form
- ~~`ConfirmDeleteDialog`~~ — no delete operations

### G.3 Key Differences from CRUD Pattern

| Aspect                  | CRUD Pattern                         | Read-Only Pattern                           |
| ----------------------- | ------------------------------------ | ------------------------------------------- |
| API functions           | get, create, update, delete, deleteMultiple | get (with filters) + getFilterData          |
| Schema file             | Required                             | **NOT created**                             |
| Hooks file              | useEntityQuery + useEntityMutations  | useEntityQuery (filters) + useFilterData    |
| Columns                 | Checkbox + Edit + Delete buttons     | View button only (VisibilityIcon)           |
| Form component          | Required                             | **NOT created**                             |
| List component          | Add button, form dialog, delete dialogs | Filter bar, details drawer, NO Add button   |
| List state variables    | openForm, openDelete, selectedIds, mode | filter states, selectedOrder (for drawer)   |
| Filter bar              | Search only                          | Search + FK dropdowns + date range + clear  |
| Row click behavior      | Opens edit form                      | Opens details drawer                        |
| i18n keys               | Standard CRUD keys                   | Feature-specific filter/drawer keys         |

### G.4 API Layer Rules (Read-Only)

The API file exports exactly **2 functions**:

1. **`get<Entity>s()`** — paginated query with optional filter parameters
2. **`get<Entity>FilterData()`** — fetches dropdown options for all FK filter fields

**Rules:**
- The query function accepts an options object: `{ page, pageSize, searchText, ...filterParams }`
- Each filter parameter is **optional**; only apply `.eq()` / `.gte()` / `.lte()` if the value is truthy
- The filter data function uses `Promise.all()` to fetch all dropdown data in parallel
- Both functions throw on error
- Use a **fixed filter** in the query (e.g., `.eq("status_id", 2)`) to restrict results to the relevant subset
- Map raw data to display-friendly fields (e.g., `customer_name`, `display_date`, `total_items`)

```js
// Template: get<Entity>s with filters
export async function get<Entity>s({
  page = 0, pageSize = 10, searchText = "",
  fkId1, fkId2, dateFrom, dateTo,
} = {}) {
  const from = page * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from(TABLE_NAME)
    .select("id, ..., fk_table1 ( id, name ), fk_table2 ( name )", { count: "exact" })
    .eq("fixed_filter_column", FIXED_VALUE)   // <-- e.g., status_id = 2
    .order("date_column", { ascending: false })
    .range(from, to);

  if (searchText) {
    const like = `%${searchText}%`;
    query = query.or(`searchable_col.ilike.${like}`);
  }
  if (fkId1)    query = query.eq("fk1_id", fkId1);
  if (fkId2)    query = query.eq("fk2_id", fkId2);
  if (dateFrom) query = query.gte("date_column", dateFrom);
  if (dateTo)   query = query.lte("date_column", dateTo);

  const { data, error, count } = await query;
  if (error) throw error;

  const rows = (data || []).map((row) => ({
    ...row,
    display_date: row.date_column
      ? new Date(row.date_column).toLocaleDateString()
      : "No Date",
    fk1_name: row.fk_table1?.name || "Unknown",
    // ... map all FK display names
  }));

  return { data: rows, count };
}
```

```js
// Template: get<Entity>FilterData
export async function get<Entity>FilterData() {
  const [fk1Res, fk2Res] = await Promise.all([
    supabase.from("fk_table1").select("id, name").order("name"),
    supabase.from("fk_table2").select("id, name").order("name"),
  ]);
  if (fk1Res.error) throw new Error(fk1Res.error.message);
  if (fk2Res.error) throw new Error(fk2Res.error.message);
  return {
    fk1Items: fk1Res.data || [],
    fk2Items: fk2Res.data || [],
  };
}
```

### G.5 Hooks Rules (Read-Only)

The hooks file exports exactly **2 hooks**:

1. **`use<Entity>Query({ fkId1, fkId2, dateFrom, dateTo })`** — same pagination/search pattern as CRUD, but filter params are passed in and included in the `queryKey`
2. **`use<Entity>FilterData()`** — simple query hook with long `staleTime`

**Critical rules:**
- Filter params MUST be in the `queryKey` array so the query auto-refetches when filters change
- Filter params MUST be passed through to the API function
- `staleTime` for filter data should be `1000 * 60 * 10` (10 minutes) since dropdown options rarely change
- NO mutation hooks — DO NOT create `use<Entity>Mutations`

```js
// Template: use<Entity>Query with filters
export function use<Entity>Query({ fkId1, fkId2, dateFrom, dateTo } = {}) {
  // ... same pagination + debounce setup as CRUD ...

  const { data, isLoading, isFetching, isError, error } = useQuery({
    queryKey: [
      QUERY_KEY, paginationModel, debouncedSearch,
      fkId1, fkId2, dateFrom, dateTo,    // <-- filter params in key
    ],
    queryFn: () => get<Entity>s({
      page: paginationModel.page, pageSize: paginationModel.pageSize,
      searchText: debouncedSearch,
      fkId1, fkId2, dateFrom, dateTo,    // <-- pass through
    }),
    staleTime: 1000 * 60 * 5,
    placeholderData: (prev) => prev,
  });

  return { rows, rowCount, isLoading, isFetching, isError, error,
           paginationModel, setPaginationModel, searchText, setSearchText };
}

// Template: use<Entity>FilterData
export function use<Entity>FilterData() {
  const { data, isLoading } = useQuery({
    queryKey: [QUERY_KEY, "filterData"],
    queryFn: get<Entity>FilterData,
    staleTime: 1000 * 60 * 10,   // 10 minutes
  });
  return {
    fk1Items: data?.fk1Items || [],
    fk2Items: data?.fk2Items || [],
    isLoading,
  };
}
```

### G.6 Columns Rules (Read-Only)

**Differences from CRUD columns:**
- NO checkbox column
- NO edit/delete action buttons
- Actions column has ONLY a **View** button (`VisibilityIcon`)
- Column function signature: `(t, onView)` — NOT `(onEdit, onDelete, selectedIds, ...)`
- Use `useTranslation` keys for header names

```jsx
import { Chip, IconButton, Stack } from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";

export const <entity>Columns = (t, onView) => [
  { field: "id", headerName: t("common.id"), width: 70 },
  { field: "display_date", headerName: t("<feature>.orderDate"), width: 120 },
  { field: "fk1_name", headerName: t("<feature>.fk1Label"), flex: 1, minWidth: 140 },
  {
    field: "status_display", headerName: t("common.status"), width: 120,
    renderCell: (params) => (
      <Chip label={params.value} color="success" size="small" variant="outlined" sx={{ fontWeight: "bold" }} />
    ),
  },
  { field: "notes", headerName: t("common.notes"), flex: 1, minWidth: 120 },
  {
    field: "actions", headerName: t("common.actions"), width: 80,
    sortable: false, filterable: false, disableExport: true,
    renderCell: (params) => (
      <Stack direction="row" spacing={1}>
        <IconButton onClick={(e) => { e.stopPropagation(); onView(params.row); }}
          color="primary" size="small">
          <VisibilityIcon />
        </IconButton>
      </Stack>
    ),
  },
];
```

---

## Appendix H — Filter Bar Pattern

### H.1 Overview

A **Filter Bar** is a horizontal strip of filter controls wrapped in a `Paper` component, placed between the page header and the DataGrid. It provides:

1. **Text search** — `TextField` for free-text search (same as CRUD)
2. **FK dropdown filters** — `Select` dropdowns populated from related tables
3. **Date range filters** — `TextField type="date"` for from/to date filtering
4. **Clear Filters button** — resets all filters, visible only when at least one filter is active

### H.2 Layout Rules

- Wrap all filter controls in `<Paper variant="outlined" sx={{ p: 2, mb: 2, borderRadius: 2 }}>`
- Use `<Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ md: "center" }} flexWrap="wrap">`
- Each filter has `size="small"`
- Search field: `sx={{ minWidth: 200, flex: 1 }}`
- FK dropdowns: `<FormControl size="small" sx={{ minWidth: 200 }}>` with `InputLabel` + `Select`
- Date fields: `sx={{ minWidth: 160 }}` with `slotProps={{ inputLabel: { shrink: true } }}`
- Clear button: `variant="outlined" color="secondary" size="small" startIcon={<FilterAltOffIcon />}`
- Clear button is conditionally rendered: `{hasActiveFilters && ( ... )}`

### H.3 State Management Rules

Each filter is a **separate `useState` in the List component** (NOT in hooks):

```jsx
const [fkId1, setFkId1] = useState("");
const [fkId2, setFkId2] = useState("");
const [dateFrom, setDateFrom] = useState("");
const [dateTo, setDateTo] = useState("");
```

- Initial value is `""` (empty string), NOT `null` or `undefined`
- When passing to the query hook, convert `""` to `undefined`: `fkId1: fkId1 || undefined`
- `hasActiveFilters` checks all filter states: `const hasActiveFilters = fkId1 || fkId2 || dateFrom || dateTo || searchText;`
- `handleClearFilters` resets ALL filters to `""` AND resets `searchText` to `""`

### H.4 FK Dropdown Filter Template

```jsx
import { FormControl, InputLabel, Select, MenuItem } from "@mui/material";

{/* FK Dropdown Filter */}
<FormControl size="small" sx={{ minWidth: 200 }}>
  <InputLabel>{t("<feature>.fk1Label")}</InputLabel>
  <Select
    value={fkId1}
    label={t("<feature>.fk1Label")}
    onChange={(e) => setFkId1(e.target.value)}
  >
    <MenuItem value="">
      <em>{t("<feature>.allFk1Items")}</em>
    </MenuItem>
    {fk1Items.map((item) => (
      <MenuItem key={item.id} value={item.id}>
        {item.name}
      </MenuItem>
    ))}
  </Select>
</FormControl>
```

**Rules:**
- First `<MenuItem value="">` always has `<em>` text for the "All" option
- The `label` prop of `<Select>` MUST match the `<InputLabel>` text
- `value` is the FK id (number); the controlled component stores it as `""` or a number
- Dropdown data comes from `use<Entity>FilterData()` hook

### H.5 Date Range Filter Template

```jsx
{/* Date From */}
<TextField
  label={t("<feature>.dateFrom")}
  type="date"
  size="small"
  value={dateFrom}
  onChange={(e) => setDateFrom(e.target.value)}
  slotProps={{ inputLabel: { shrink: true } }}
  sx={{ minWidth: 160 }}
/>

{/* Date To */}
<TextField
  label={t("<feature>.dateTo")}
  type="date"
  size="small"
  value={dateTo}
  onChange={(e) => setDateTo(e.target.value)}
  slotProps={{ inputLabel: { shrink: true } }}
  sx={{ minWidth: 160 }}
/>
```

**Rules:**
- Use `type="date"` — NOT a date picker library
- Use `slotProps={{ inputLabel: { shrink: true } }}` to keep the label above the field (MUI v7 pattern)
- ~~Do NOT use `InputLabelProps`~~ — deprecated in MUI v7; use `slotProps` instead
- Date values are stored as ISO strings (e.g., `"2025-01-15"`)
- In the API layer: `dateFrom` → `.gte("date_column", dateFrom)` and `dateTo` → `.lte("date_column", dateTo)`

### H.6 Clear Filters Button Template

```jsx
import FilterAltOffIcon from "@mui/icons-material/FilterAltOff";

const hasActiveFilters = fkId1 || fkId2 || dateFrom || dateTo || searchText;

const handleClearFilters = () => {
  setFkId1("");
  setFkId2("");
  setDateFrom("");
  setDateTo("");
  setSearchText("");
};

{hasActiveFilters && (
  <Button
    variant="outlined"
    color="secondary"
    size="small"
    startIcon={<FilterAltOffIcon />}
    onClick={handleClearFilters}
    sx={{ whiteSpace: "nowrap" }}
  >
    {t("<feature>.clearFilters")}
  </Button>
)}
```

### H.7 Complete Filter Bar (assembled)

```jsx
<Paper variant="outlined" sx={{ p: 2, mb: 2, borderRadius: 2 }}>
  <Stack direction={{ xs: "column", md: "row" }} spacing={2}
    alignItems={{ md: "center" }} flexWrap="wrap">

    {/* 1. Text Search */}
    <TextField label={t("common.search")} variant="outlined" size="small"
      value={searchText} onChange={(e) => setSearchText(e.target.value)}
      sx={{ minWidth: 200, flex: 1 }} />

    {/* 2. FK Dropdown 1 */}
    <FormControl size="small" sx={{ minWidth: 200 }}>
      <InputLabel>{t("<feature>.fk1Label")}</InputLabel>
      <Select value={fkId1} label={t("<feature>.fk1Label")}
        onChange={(e) => setFkId1(e.target.value)}>
        <MenuItem value=""><em>{t("<feature>.allFk1Items")}</em></MenuItem>
        {fk1Items.map((item) => (
          <MenuItem key={item.id} value={item.id}>{item.name}</MenuItem>
        ))}
      </Select>
    </FormControl>

    {/* 3. FK Dropdown 2 */}
    <FormControl size="small" sx={{ minWidth: 200 }}>
      <InputLabel>{t("<feature>.fk2Label")}</InputLabel>
      <Select value={fkId2} label={t("<feature>.fk2Label")}
        onChange={(e) => setFkId2(e.target.value)}>
        <MenuItem value=""><em>{t("<feature>.allFk2Items")}</em></MenuItem>
        {fk2Items.map((item) => (
          <MenuItem key={item.id} value={item.id}>{item.name}</MenuItem>
        ))}
      </Select>
    </FormControl>

    {/* 4. Date From */}
    <TextField label={t("<feature>.dateFrom")} type="date" size="small"
      value={dateFrom} onChange={(e) => setDateFrom(e.target.value)}
      slotProps={{ inputLabel: { shrink: true } }} sx={{ minWidth: 160 }} />

    {/* 5. Date To */}
    <TextField label={t("<feature>.dateTo")} type="date" size="small"
      value={dateTo} onChange={(e) => setDateTo(e.target.value)}
      slotProps={{ inputLabel: { shrink: true } }} sx={{ minWidth: 160 }} />

    {/* 6. Clear Filters */}
    {hasActiveFilters && (
      <Button variant="outlined" color="secondary" size="small"
        startIcon={<FilterAltOffIcon />} onClick={handleClearFilters}
        sx={{ whiteSpace: "nowrap" }}>
        {t("<feature>.clearFilters")}
      </Button>
    )}
  </Stack>
</Paper>
```

### H.8 i18n Keys Required for Filters

For each feature that uses filters, add these keys to ALL locale files (`en.json`, `ar.json`, `tr.json`):

```json
{
  "<featureName>Feature": {
    "title": "Page Title",
    "fk1Label": "FK1 Label",
    "fk2Label": "FK2 Label",
    "allFk1Items": "All FK1 Items",
    "allFk2Items": "All FK2 Items",
    "dateFrom": "Date From",
    "dateTo": "Date To",
    "clearFilters": "Clear Filters"
  }
}
```

---

## Appendix I — Details Drawer Pattern

### I.1 When to Use

Use a **Details Drawer** when clicking a row should show a detailed view of the record in a slide-out panel instead of opening an edit form. This is the standard pattern for read-only list pages.

### I.2 Component Structure

The drawer component receives exactly **2 props**:

```jsx
export default function <EntityName>DetailsDrawer({ <entity>, onClose }) {
```

- `<entity>` — the full row object (or `null` when closed)
- `onClose` — function to close the drawer

**Render guard:** `if (!<entity>) return null;`

### I.3 Drawer Container

```jsx
<Drawer
  anchor="right"
  open={!!<entity>}
  onClose={onClose}
  PaperProps={{
    sx: { width: { xs: "100%", sm: 520 }, bgcolor: "background.default" },
  }}
>
  <Box sx={{ p: 3 }}>
    {/* Content goes here */}
  </Box>
</Drawer>
```

**Rules:**
- `anchor="right"` — always slides in from the right
- `width: { xs: "100%", sm: 520 }` — full width on mobile, 520px on desktop
- `bgcolor: "background.default"` — uses theme background

### I.4 Drawer Header

```jsx
<Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
  <Typography variant="h6" fontWeight="bold" color="primary">
    {t("<feature>.orderDetails")} #{<entity>.id}
  </Typography>
  <IconButton onClick={onClose} size="small">
    <CloseIcon />
  </IconButton>
</Stack>
<Divider sx={{ mb: 3 }} />
```

### I.5 Info Cards Section

Display key record fields as labeled rows with icons inside a `Paper`:

```jsx
<Paper variant="outlined" sx={{ p: 2, mb: 3, borderRadius: 2, bgcolor: "background.paper" }}>
  <Stack spacing={2.5}>
    {/* One info row per field */}
    <Stack direction="row" spacing={2} alignItems="center">
      <PersonIcon color="primary" />
      <Box>
        <Typography variant="caption" color="text.secondary" display="block">
          {t("<feature>.fieldLabel")}
        </Typography>
        <Typography variant="body1" fontWeight="medium">
          {<entity>.field_display_name}
        </Typography>
      </Box>
    </Stack>
    {/* Repeat for each info field */}
  </Stack>
</Paper>
```

**Rules for info rows:**
- Each row: `<Icon color="primary" />` + `<Box>` with caption label + body value
- Use appropriate MUI icons: `PersonIcon` (customer), `WarehouseIcon` (warehouse), `CalendarTodayIcon` (date), `StorefrontIcon` (status), etc.
- Status fields use a `<Chip>` instead of plain text
- Import icons from `@mui/icons-material`

### I.6 Related Items Table (if applicable)

If the record has child items (e.g., order_items), display them in a `<Table>`:

```jsx
<Box sx={{ mb: 3 }}>
  <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
    <InventoryIcon color="primary" fontSize="small" />
    <Typography variant="subtitle1" fontWeight="bold">
      {t("<feature>.itemsLabel")} ({items.length})
    </Typography>
  </Stack>

  <Paper variant="outlined" sx={{ borderRadius: 2, overflow: "hidden" }}>
    <Table size="small">
      <TableHead>
        <TableRow sx={{ bgcolor: "primary.main" }}>
          <TableCell sx={{ fontWeight: "bold", color: "primary.contrastText" }}>
            {t("<feature>.productColumn")}
          </TableCell>
          <TableCell align="center" sx={{ fontWeight: "bold", color: "primary.contrastText" }}>
            {t("<feature>.qtyColumn")}
          </TableCell>
          <TableCell align="right" sx={{ fontWeight: "bold", color: "primary.contrastText" }}>
            {t("<feature>.priceColumn")}
          </TableCell>
          <TableCell align="right" sx={{ fontWeight: "bold", color: "primary.contrastText" }}>
            {t("<feature>.totalColumn")}
          </TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {items.map((item, index) => {
          const price = item.related?.price_field || 0;
          const lineTotal = price * (item.quantity || 0);
          return (
            <TableRow key={item.id || index} hover>
              <TableCell>
                <Typography variant="body2" fontWeight="medium">
                  {item.related?.name || "Unknown"}
                </Typography>
              </TableCell>
              <TableCell align="center">
                <Chip label={item.quantity} size="small" color="primary" variant="outlined" />
              </TableCell>
              <TableCell align="right">
                <Typography variant="body2">{price.toLocaleString()}</Typography>
              </TableCell>
              <TableCell align="right">
                <Typography variant="body2" fontWeight="bold">{lineTotal.toLocaleString()}</Typography>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  </Paper>
</Box>
```

**Rules:**
- Table header row uses `bgcolor: "primary.main"` with `color: "primary.contrastText"`
- Quantities displayed as `<Chip>` with `color="primary" variant="outlined"`
- Prices and totals use `.toLocaleString()` for formatting
- Items come from a `raw_items` field mapped in the API layer

### I.7 Grand Total Summary (if applicable)

```jsx
{items.length > 0 && (
  <Paper variant="outlined" sx={{
    mt: 1, p: 2, borderRadius: 2, bgcolor: "success.50",
    display: "flex", justifyContent: "space-between", alignItems: "center",
  }}>
    <Typography variant="subtitle1" fontWeight="bold">
      {t("<feature>.grandTotal")}
    </Typography>
    <Typography variant="h6" fontWeight="bold" color="success.main">
      {items.reduce((sum, item) =>
        sum + (item.related?.price_field || 0) * (item.quantity || 0), 0
      ).toLocaleString()}
    </Typography>
  </Paper>
)}
```

### I.8 Notes Section (if applicable)

```jsx
{<entity>.notes && (
  <Paper variant="outlined" sx={{
    p: 2, bgcolor: "warning.50", borderColor: "warning.light", borderRadius: 2,
  }}>
    <Typography variant="caption" fontWeight="bold" color="warning.dark" display="block" gutterBottom>
      {t("common.notes")}:
    </Typography>
    <Typography variant="body2" color="warning.dark">
      {<entity>.notes}
    </Typography>
  </Paper>
)}
```

### I.9 Wiring the Drawer in the List Component

```jsx
// State
const [selectedOrder, setSelectedOrder] = useState(null);

// DataGrid row click
<DataGrid
  onRowClick={(params) => setSelectedOrder(params.row)}
  sx={{ "& .MuiDataGrid-row": { cursor: "pointer" } }}
/>

// Columns — pass handler
columns={entityColumns(t, (row) => setSelectedOrder(row))}

// Render drawer
<EntityDetailsDrawer
  entity={selectedOrder}
  onClose={() => setSelectedOrder(null)}
/>
```

### I.10 i18n Keys Required for Drawer

```json
{
  "<featureName>Feature": {
    "orderDetails": "Order Details",
    "orderedItems": "Ordered Items",
    "product": "Product",
    "qty": "Qty",
    "unitPrice": "Unit Price",
    "lineTotal": "Line Total",
    "grandTotal": "Grand Total"
  }
}
```

---

## Appendix J — Complete Worked Example (Read-Only with Filters & Drawer)

A full `customerFinishedOrders/` module showing all 5 files. This module displays **finished orders** (status_id = 2) with filters for customer, warehouse, and date range, plus a details drawer.

### J.1 `customerFinishedOrder.api.js`

```js
import supabase from "../../config/supabase";

const TABLE_NAME = "orders";
export const CUSTOMER_FINISHED_ORDER_QUERY_KEY = "customerFinishedOrders";

export async function getCustomerFinishedOrders({
  page = 0,
  pageSize = 10,
  searchText = "",
  customerId,
  warehouseId,
  dateFrom,
  dateTo,
} = {}) {
  const from = page * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from(TABLE_NAME)
    .select(
      `id,
       order_date,
       notes,
       customer_id,
       status_id,
       warehouse_id,
       customers ( id, name ),
       order_statuses ( status_name ),
       warehouses ( name ),
       order_items (
         id,
         quantity,
         notes,
         product_variant_id,
         products:product_variant_id ( id, name, sku, sell_price )
       )`,
      { count: "exact" },
    )
    .eq("status_id", 2)
    .order("order_date", { ascending: false })
    .range(from, to);

  if (searchText) {
    const like = `%${searchText}%`;
    query = query.or(`notes.ilike.${like}`);
  }

  if (customerId) {
    query = query.eq("customer_id", customerId);
  }

  if (warehouseId) {
    query = query.eq("warehouse_id", warehouseId);
  }

  if (dateFrom) {
    query = query.gte("order_date", dateFrom);
  }

  if (dateTo) {
    query = query.lte("order_date", dateTo);
  }

  const { data, error, count } = await query;
  if (error) throw error;

  const rows = (data || []).map((order) => {
    const warehouseObj = order.warehouses;
    const warehouseName = Array.isArray(warehouseObj)
      ? warehouseObj[0]?.name
      : warehouseObj?.name;

    const items = order.order_items || [];
    const totalItems = items.reduce((sum, i) => sum + (i.quantity || 0), 0);

    return {
      ...order,
      display_date: order.order_date
        ? new Date(order.order_date).toLocaleDateString()
        : "No Date",
      status_display: order.order_statuses?.status_name || "Confirmed",
      customer_name: order.customers?.name || "Unknown Customer",
      warehouse_name: warehouseName || "Not Assigned",
      total_items: totalItems,
      raw_items: items,
    };
  });

  return { data: rows, count };
}

export async function getFinishedOrderFilterData() {
  const [customersRes, warehousesRes] = await Promise.all([
    supabase.from("customers").select("id, name").order("name"),
    supabase.from("warehouses").select("id, name").order("name"),
  ]);

  if (customersRes.error) throw new Error(customersRes.error.message);
  if (warehousesRes.error) throw new Error(warehousesRes.error.message);

  return {
    customers: customersRes.data || [],
    warehouses: warehousesRes.data || [],
  };
}
```

### J.2 `customerFinishedOrder.hooks.js`

```js
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  getCustomerFinishedOrders,
  getFinishedOrderFilterData,
  CUSTOMER_FINISHED_ORDER_QUERY_KEY,
} from "./customerFinishedOrder.api";

export function useCustomerFinishedOrderQuery({
  customerId,
  warehouseId,
  dateFrom,
  dateTo,
} = {}) {
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });
  const [searchText, setSearchText] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchText);
      setPaginationModel((prev) => ({ ...prev, page: 0 }));
    }, 500);
    return () => clearTimeout(timer);
  }, [searchText]);

  const { data, isLoading, isFetching, isError, error } = useQuery({
    queryKey: [
      CUSTOMER_FINISHED_ORDER_QUERY_KEY,
      paginationModel,
      debouncedSearch,
      customerId,
      warehouseId,
      dateFrom,
      dateTo,
    ],
    queryFn: () =>
      getCustomerFinishedOrders({
        page: paginationModel.page,
        pageSize: paginationModel.pageSize,
        searchText: debouncedSearch,
        customerId,
        warehouseId,
        dateFrom,
        dateTo,
      }),
    staleTime: 1000 * 60 * 5,
    placeholderData: (prev) => prev,
  });

  return {
    rows: data?.data || [],
    rowCount: data?.count || 0,
    isLoading,
    isFetching,
    isError,
    error,
    paginationModel,
    setPaginationModel,
    searchText,
    setSearchText,
  };
}

export function useFinishedOrderFilterData() {
  const { data, isLoading } = useQuery({
    queryKey: [CUSTOMER_FINISHED_ORDER_QUERY_KEY, "filterData"],
    queryFn: getFinishedOrderFilterData,
    staleTime: 1000 * 60 * 10,
  });

  return {
    customers: data?.customers || [],
    warehouses: data?.warehouses || [],
    isLoading,
  };
}
```

### J.3 `customerFinishedOrder.columns.jsx`

```jsx
import { Chip, IconButton, Stack } from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";

export const customerFinishedOrderColumns = (t, onView) => [
  { field: "id", headerName: t("common.id"), width: 70 },
  {
    field: "display_date",
    headerName: t("finishedOrdersFeature.orderDate"),
    width: 120,
  },
  {
    field: "customer_name",
    headerName: t("finishedOrdersFeature.customer"),
    flex: 1,
    minWidth: 140,
  },
  {
    field: "warehouse_name",
    headerName: t("finishedOrdersFeature.warehouse"),
    flex: 1,
    minWidth: 120,
  },
  {
    field: "total_items",
    headerName: t("finishedOrdersFeature.totalItems"),
    width: 100,
    align: "center",
    headerAlign: "center",
  },
  {
    field: "status_display",
    headerName: t("common.status"),
    width: 120,
    renderCell: (params) => (
      <Chip
        label={params.value}
        color="success"
        size="small"
        variant="outlined"
        sx={{ fontWeight: "bold" }}
      />
    ),
  },
  {
    field: "notes",
    headerName: t("common.notes"),
    flex: 1,
    minWidth: 120,
  },
  {
    field: "actions",
    headerName: t("common.actions"),
    width: 80,
    sortable: false,
    filterable: false,
    disableExport: true,
    renderCell: (params) => (
      <Stack direction="row" spacing={1}>
        <IconButton
          onClick={(e) => {
            e.stopPropagation();
            onView(params.row);
          }}
          color="primary"
          size="small"
        >
          <VisibilityIcon />
        </IconButton>
      </Stack>
    ),
  },
];
```

### J.4 `CustomerFinishedOrderList.jsx`

```jsx
import { useState } from "react";
import {
  Box, Typography, Alert, TextField, Paper,
  MenuItem, FormControl, InputLabel, Select, Stack, Button,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { useTranslation } from "react-i18next";
import FilterAltOffIcon from "@mui/icons-material/FilterAltOff";

import {
  useCustomerFinishedOrderQuery,
  useFinishedOrderFilterData,
} from "./customerFinishedOrder.hooks";
import { customerFinishedOrderColumns } from "./customerFinishedOrder.columns";
import FinishedOrderDetailsDrawer from "./FinishedOrderDetailsDrawer";
import MessageDialog from "../../components/MessageDialog";
import ScrollToTopButton from "../../components/ScrollToTopButton";
import { useMessageDialog } from "../../hooks/useMessageDialog";

export function CustomerFinishedOrderList() {
  const { t } = useTranslation();
  const { messageDialog, closeMessageDialog } = useMessageDialog();

  // Filter states — each is "" by default
  const [customerId, setCustomerId] = useState("");
  const [warehouseId, setWarehouseId] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Dropdown data for filters
  const { customers, warehouses } = useFinishedOrderFilterData();

  // Main query — pass filter values (convert "" to undefined)
  const {
    rows, rowCount, isLoading, isFetching, isError, error,
    paginationModel, setPaginationModel, searchText, setSearchText,
  } = useCustomerFinishedOrderQuery({
    customerId: customerId || undefined,
    warehouseId: warehouseId || undefined,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
  });

  const handlePaginationChange = (newModel) => {
    setPaginationModel(newModel);
  };

  const handleClearFilters = () => {
    setCustomerId("");
    setWarehouseId("");
    setDateFrom("");
    setDateTo("");
    setSearchText("");
  };

  const hasActiveFilters = customerId || warehouseId || dateFrom || dateTo || searchText;

  return (
    <Box sx={{ p: 3 }}>
      {/* Header — NO Add button */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5" fontWeight="bold">
          {t("finishedOrdersFeature.title")}
        </Typography>
      </Box>

      {/* Filter Bar */}
      <Paper variant="outlined" sx={{ p: 2, mb: 2, borderRadius: 2 }}>
        <Stack direction={{ xs: "column", md: "row" }} spacing={2}
          alignItems={{ md: "center" }} flexWrap="wrap">

          {/* Search */}
          <TextField label={t("common.search")} variant="outlined" size="small"
            value={searchText} onChange={(e) => setSearchText(e.target.value)}
            sx={{ minWidth: 200, flex: 1 }} />

          {/* Customer Filter */}
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>{t("finishedOrdersFeature.customer")}</InputLabel>
            <Select value={customerId} label={t("finishedOrdersFeature.customer")}
              onChange={(e) => setCustomerId(e.target.value)}>
              <MenuItem value="">
                <em>{t("finishedOrdersFeature.allCustomers")}</em>
              </MenuItem>
              {customers.map((c) => (
                <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Warehouse Filter */}
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>{t("finishedOrdersFeature.warehouse")}</InputLabel>
            <Select value={warehouseId} label={t("finishedOrdersFeature.warehouse")}
              onChange={(e) => setWarehouseId(e.target.value)}>
              <MenuItem value="">
                <em>{t("finishedOrdersFeature.allWarehouses")}</em>
              </MenuItem>
              {warehouses.map((w) => (
                <MenuItem key={w.id} value={w.id}>{w.name}</MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Date From */}
          <TextField label={t("finishedOrdersFeature.dateFrom")} type="date" size="small"
            value={dateFrom} onChange={(e) => setDateFrom(e.target.value)}
            slotProps={{ inputLabel: { shrink: true } }} sx={{ minWidth: 160 }} />

          {/* Date To */}
          <TextField label={t("finishedOrdersFeature.dateTo")} type="date" size="small"
            value={dateTo} onChange={(e) => setDateTo(e.target.value)}
            slotProps={{ inputLabel: { shrink: true } }} sx={{ minWidth: 160 }} />

          {/* Clear Filters */}
          {hasActiveFilters && (
            <Button variant="outlined" color="secondary" size="small"
              startIcon={<FilterAltOffIcon />} onClick={handleClearFilters}
              sx={{ whiteSpace: "nowrap" }}>
              {t("finishedOrdersFeature.clearFilters")}
            </Button>
          )}
        </Stack>
      </Paper>

      {isError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {t("common.failedToLoad")}: {error?.message || t("common.unknownError")}
        </Alert>
      )}

      <Paper sx={{ height: 650, width: "100%" }}>
        <DataGrid
          rows={rows}
          rowCount={rowCount}
          columns={customerFinishedOrderColumns(t, (row) => setSelectedOrder(row))}
          loading={isLoading || isFetching}
          paginationMode="server"
          paginationModel={paginationModel}
          onPaginationModelChange={handlePaginationChange}
          pageSizeOptions={[10, 25, 50]}
          disableRowSelectionOnClick
          onRowClick={(params) => setSelectedOrder(params.row)}
          sx={{ width: "100%", "& .MuiDataGrid-row": { cursor: "pointer" } }}
        />
      </Paper>

      {/* Details Drawer */}
      <FinishedOrderDetailsDrawer
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
      />

      <MessageDialog
        open={messageDialog.open} title={messageDialog.title}
        message={messageDialog.message} severity={messageDialog.severity}
        onClose={closeMessageDialog}
      />
      <ScrollToTopButton />
    </Box>
  );
}
```

### J.5 `FinishedOrderDetailsDrawer.jsx`

```jsx
import {
  Drawer, Box, Typography, Stack, Divider,
  Table, TableBody, TableCell, TableHead, TableRow,
  IconButton, Chip, Paper,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import PersonIcon from "@mui/icons-material/Person";
import StorefrontIcon from "@mui/icons-material/Storefront";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import WarehouseIcon from "@mui/icons-material/Warehouse";
import InventoryIcon from "@mui/icons-material/Inventory";
import { useTranslation } from "react-i18next";

export default function FinishedOrderDetailsDrawer({ order, onClose }) {
  const { t } = useTranslation();
  if (!order) return null;

  const items = order.raw_items || [];

  return (
    <Drawer anchor="right" open={!!order} onClose={onClose}
      PaperProps={{ sx: { width: { xs: "100%", sm: 520 }, bgcolor: "background.default" } }}>
      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Typography variant="h6" fontWeight="bold" color="primary">
            {t("finishedOrdersFeature.orderDetails")} #{order.id}
          </Typography>
          <IconButton onClick={onClose} size="small"><CloseIcon /></IconButton>
        </Stack>
        <Divider sx={{ mb: 3 }} />

        {/* Info Cards */}
        <Paper variant="outlined" sx={{ p: 2, mb: 3, borderRadius: 2, bgcolor: "background.paper" }}>
          <Stack spacing={2.5}>
            <Stack direction="row" spacing={2} alignItems="center">
              <PersonIcon color="primary" />
              <Box>
                <Typography variant="caption" color="text.secondary" display="block">
                  {t("finishedOrdersFeature.customer")}
                </Typography>
                <Typography variant="body1" fontWeight="medium">{order.customer_name}</Typography>
              </Box>
            </Stack>
            <Stack direction="row" spacing={2} alignItems="center">
              <WarehouseIcon color="primary" />
              <Box>
                <Typography variant="caption" color="text.secondary" display="block">
                  {t("finishedOrdersFeature.warehouse")}
                </Typography>
                <Typography variant="body1" fontWeight="medium">{order.warehouse_name}</Typography>
              </Box>
            </Stack>
            <Stack direction="row" spacing={2} alignItems="center">
              <CalendarTodayIcon color="primary" />
              <Box>
                <Typography variant="caption" color="text.secondary" display="block">
                  {t("finishedOrdersFeature.orderDate")}
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {order.order_date ? new Date(order.order_date).toLocaleDateString() : "N/A"}
                </Typography>
              </Box>
            </Stack>
            <Stack direction="row" spacing={2} alignItems="center">
              <StorefrontIcon color="primary" />
              <Box>
                <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
                  {t("common.status")}
                </Typography>
                <Chip label={order.status_display} color="success" size="small" sx={{ fontWeight: "bold" }} />
              </Box>
            </Stack>
          </Stack>
        </Paper>

        {/* Items Table */}
        <Box sx={{ mb: 3 }}>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
            <InventoryIcon color="primary" fontSize="small" />
            <Typography variant="subtitle1" fontWeight="bold">
              {t("finishedOrdersFeature.orderedItems")} ({items.length})
            </Typography>
          </Stack>
          <Paper variant="outlined" sx={{ borderRadius: 2, overflow: "hidden" }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: "primary.main" }}>
                  <TableCell sx={{ fontWeight: "bold", color: "primary.contrastText" }}>
                    {t("finishedOrdersFeature.product")}
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: "bold", color: "primary.contrastText" }}>
                    SKU
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: "bold", color: "primary.contrastText" }}>
                    {t("finishedOrdersFeature.qty")}
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: "bold", color: "primary.contrastText" }}>
                    {t("finishedOrdersFeature.unitPrice")}
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: "bold", color: "primary.contrastText" }}>
                    {t("finishedOrdersFeature.lineTotal")}
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {items.map((item, index) => {
                  const price = item.products?.sell_price || 0;
                  const lineTotal = price * (item.quantity || 0);
                  return (
                    <TableRow key={item.id || index} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          {item.products?.name || "Unknown"}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="body2" color="text.secondary">
                          {item.products?.sku || "N/A"}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Chip label={item.quantity} size="small" color="primary" variant="outlined" />
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2">{price.toLocaleString()}</Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" fontWeight="bold">{lineTotal.toLocaleString()}</Typography>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Paper>

          {/* Grand Total */}
          {items.length > 0 && (
            <Paper variant="outlined" sx={{
              mt: 1, p: 2, borderRadius: 2, bgcolor: "success.50",
              display: "flex", justifyContent: "space-between", alignItems: "center",
            }}>
              <Typography variant="subtitle1" fontWeight="bold">
                {t("finishedOrdersFeature.grandTotal")}
              </Typography>
              <Typography variant="h6" fontWeight="bold" color="success.main">
                {items.reduce((sum, item) =>
                  sum + (item.products?.sell_price || 0) * (item.quantity || 0), 0
                ).toLocaleString()}
              </Typography>
            </Paper>
          )}
        </Box>

        {/* Notes */}
        {order.notes && (
          <Paper variant="outlined" sx={{
            p: 2, bgcolor: "warning.50", borderColor: "warning.light", borderRadius: 2,
          }}>
            <Typography variant="caption" fontWeight="bold" color="warning.dark" display="block" gutterBottom>
              {t("common.notes")}:
            </Typography>
            <Typography variant="body2" color="warning.dark">{order.notes}</Typography>
          </Paper>
        )}
      </Box>
    </Drawer>
  );
}
```

### J.6 i18n Keys (all 3 locales)

**`en.json`:**
```json
{
  "finishedOrdersFeature": {
    "title": "Finished Orders",
    "orderDate": "Order Date",
    "customer": "Customer",
    "warehouse": "Warehouse",
    "totalItems": "Total Items",
    "allCustomers": "All Customers",
    "allWarehouses": "All Warehouses",
    "dateFrom": "Date From",
    "dateTo": "Date To",
    "clearFilters": "Clear Filters",
    "orderDetails": "Order Details",
    "orderedItems": "Ordered Items",
    "product": "Product",
    "qty": "Qty",
    "unitPrice": "Unit Price",
    "lineTotal": "Line Total",
    "grandTotal": "Grand Total"
  }
}
```

**`ar.json`:**
```json
{
  "finishedOrdersFeature": {
    "title": "الطلبات المكتملة",
    "orderDate": "تاريخ الطلب",
    "customer": "العميل",
    "warehouse": "المستودع",
    "totalItems": "إجمالي العناصر",
    "allCustomers": "جميع العملاء",
    "allWarehouses": "جميع المستودعات",
    "dateFrom": "من تاريخ",
    "dateTo": "إلى تاريخ",
    "clearFilters": "مسح الفلاتر",
    "orderDetails": "تفاصيل الطلب",
    "orderedItems": "العناصر المطلوبة",
    "product": "المنتج",
    "qty": "الكمية",
    "unitPrice": "سعر الوحدة",
    "lineTotal": "إجمالي السطر",
    "grandTotal": "المجموع الكلي"
  }
}
```

**`tr.json`:**
```json
{
  "finishedOrdersFeature": {
    "title": "Tamamlanan Siparişler",
    "orderDate": "Sipariş Tarihi",
    "customer": "Müşteri",
    "warehouse": "Depo",
    "totalItems": "Toplam Ürün",
    "allCustomers": "Tüm Müşteriler",
    "allWarehouses": "Tüm Depolar",
    "dateFrom": "Başlangıç Tarihi",
    "dateTo": "Bitiş Tarihi",
    "clearFilters": "Filtreleri Temizle",
    "orderDetails": "Sipariş Detayları",
    "orderedItems": "Sipariş Edilen Ürünler",
    "product": "Ürün",
    "qty": "Adet",
    "unitPrice": "Birim Fiyat",
    "lineTotal": "Satır Toplamı",
    "grandTotal": "Genel Toplam"
  }
}
```

### J.7 Route & Sidebar

**`main.jsx`:**
```jsx
import { CustomerFinishedOrderList } from "./features/customerFinishedOrders/CustomerFinishedOrderList";

// Inside Routes:
<Route path="/finished-orders" element={<CustomerFinishedOrderList />} />
```

**`SideBar.jsx`:**
```jsx
import ReceiptOutlinedIcon from "@mui/icons-material/ReceiptOutlined";

// Add to the "Customers & Sales" group:
{ text: t("finishedOrdersFeature.title"), icon: <ReceiptOutlinedIcon />, path: "/finished-orders" },
```

---

## Appendix K — Verification Checklist (Read-Only)

### Functional

- [ ] Page loads without console errors
- [ ] Grid displays data with loading spinner
- [ ] Error Alert banner on query failure
- [ ] Server pagination works (next/prev, page size, row count)
- [ ] Server search works (debounce, page reset, clear)
- [ ] Fixed filter applied (e.g., only finished orders shown)
- [ ] FK dropdown filters work (customer, warehouse, etc.)
- [ ] Date range filters work (from, to)
- [ ] "Clear Filters" button appears when any filter is active
- [ ] "Clear Filters" resets all filters including search text
- [ ] Row click opens details drawer
- [ ] View button (VisibilityIcon) opens details drawer
- [ ] Details drawer shows all info fields with icons
- [ ] Details drawer shows related items table (if applicable)
- [ ] Grand total is calculated correctly (if applicable)
- [ ] Notes section displays when present (if applicable)
- [ ] Drawer closes via close button and clicking outside

### Negative Checks (must NOT be present)

- [ ] NO "Add" button on the page
- [ ] NO edit button in actions column
- [ ] NO delete button in actions column
- [ ] NO checkbox column
- [ ] NO "Delete Selected" button
- [ ] NO form dialog component
- [ ] NO schema file
- [ ] NO mutation hooks
- [ ] NO `ConfirmDeleteDialog` usage

### Code Quality

- [ ] `*.api.js` — no React imports, explicit columns, no `select("*")`, fixed filter applied
- [ ] `*.hooks.js` — no MUI imports, filter params in queryKey, no mutation hooks
- [ ] `*List.jsx` — no `useMutation`/`useQuery`, `paginationMode="server"`, filter states in component
- [ ] `*.columns.jsx` — `(t, onView)` signature, no checkbox, `e.stopPropagation()` on view button
- [ ] `*DetailsDrawer.jsx` — receives `(entity, onClose)` props, render guard `if (!entity) return null`
- [ ] Filter data hook has `staleTime: 1000 * 60 * 10`
- [ ] All i18n keys present in `en.json`, `ar.json`, `tr.json`
- [ ] Route added to `main.jsx`
- [ ] Sidebar entry added to `SideBar.jsx`

---

## Updated Summary (Combined)

| #   | Deliverable                       | File                                   | Pattern    |
| --- | --------------------------------- | -------------------------------------- | ---------- |
| 0   | Database table                    | Supabase dashboard                     | Both       |
| 0a  | ConfirmDeleteDialog (shared)      | `components/ConfirmDeleteDialog.jsx`   | CRUD only  |
| 0b  | MessageDialog (shared)            | `components/MessageDialog.jsx`         | Both       |
| 0c  | useMessageDialog hook (shared)    | `hooks/useMessageDialog.js`            | Both       |
| 1   | API CRUD + query key              | `<entity>.api.js`                      | CRUD       |
| 1r  | API Read + filter data            | `<entity>.api.js`                      | Read-Only  |
| 2   | Zod schema + defaults             | `<entity>.schema.js`                   | CRUD only  |
| 3   | Custom hooks (query + mutations)  | `<entity>.hooks.js`                    | CRUD       |
| 3r  | Custom hooks (query + filterData) | `<entity>.hooks.js`                    | Read-Only  |
| 4   | Column definitions (CRUD)         | `<entity>.columns.jsx`                 | CRUD       |
| 4r  | Column definitions (view only)    | `<entity>.columns.jsx`                 | Read-Only  |
| 5   | Form dialog                       | `<EntityName>Form.jsx`                 | CRUD only  |
| 5r  | Details drawer                    | `<EntityName>DetailsDrawer.jsx`        | Read-Only  |
| 6   | List page (CRUD)                  | `<EntityName>List.jsx`                 | CRUD       |
| 6r  | List page (filters + drawer)      | `<EntityName>List.jsx`                 | Read-Only  |
| 7   | Route + sidebar                   | `main.jsx` + `SideBar.jsx`            | Both       |
