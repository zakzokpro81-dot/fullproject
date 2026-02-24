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
17. [Appendix E — Complete Worked Example](#appendix-e--complete-worked-example)
18. [Appendix F — Verification Checklist](#appendix-f--verification-checklist)

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

**Execution order:** Phase 0 → Shared infra → 1 → 2 → 3 → 4 → 5 → 6 → 7 → Verify (Appendix F).
