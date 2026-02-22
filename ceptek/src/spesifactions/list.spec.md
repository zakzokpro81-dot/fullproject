# Feature Module Specification — CRUD List Section (v2)

> **Purpose:** A professional, abstract specification for building a self-contained CRUD feature module in this React + Supabase project. Designed to be followed step-by-step by an AI or developer with minimal context.
>
> **Scope:** One "section" = one database table exposed as a searchable, paginated list with add / edit / delete capabilities inside a dialog form.

---

## Table of Contents

1. [Tech Stack & Conventions](#1-tech-stack--conventions)
2. [Architecture Overview](#2-architecture-overview)
3. [Folder Structure & File Map](#3-folder-structure--file-map)
4. [Shared Infrastructure (create once)](#4-shared-infrastructure-create-once)
5. [Phase 1 — API Layer](#phase-1--api-layer)
6. [Phase 2 — Validation Schema & Defaults](#phase-2--validation-schema--defaults)
7. [Phase 3 — Custom Hooks](#phase-3--custom-hooks)
8. [Phase 4 — Column Definitions](#phase-4--column-definitions)
9. [Phase 5 — Form Component](#phase-5--form-component)
10. [Phase 6 — List (Page) Component](#phase-6--list-page-component)
11. [Phase 7 — Integration & Routing](#phase-7--integration--routing)
12. [Appendix A — Field Type Reference](#appendix-a--field-type-reference)
13. [Appendix B — Verification Checklist](#appendix-b--verification-checklist)

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

### Coding Conventions

- **Functional components only** — no class components.
- File naming: `camelCase` for logic files (`entity.api.js`, `entity.hooks.js`), **PascalCase** for component files (`EntityForm.jsx`).
- Each feature is **self-contained** under `src/features/<entityPlural>/`.
- **No Redux** inside feature modules — all server state via React Query.
- Shared / cross-feature components live in `src/componenets/` (project's existing spelling).
- Supabase client import path: `../../config/supabase`.
- Code identifiers in **English**. Comments in Arabic are acceptable (existing convention) but not required.

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

### Design Principles

| Principle                 | What it means in practice                                                                                                       |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| **Single Responsibility** | Each file does exactly one thing. API files never import React. Schema files never import MUI. Columns never call API functions. |
| **Hooks encapsulate logic** | All React Query calls, cache invalidation, and error handling live in custom hooks — not in JSX components.                   |
| **UI is a thin shell**    | The List component only wires state ↔ hooks ↔ child components. No business logic inside JSX.                                  |
| **Props down, events up** | Form receives data via props, returns validated data via callbacks. It never fetches or mutates.                                |
| **Fail loudly**           | Every mutation shows a **dialog message** on success **and** on error. Silent failures are a bug.                               |
| **Consistent naming**     | Every file, export, query key, and function follows predictable `<entity>`-based naming — no guessing.                          |

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

> **New vs. old:** The key addition is `<entity>.hooks.js`. This is where all React Query logic lives, keeping the List component lean. The old pattern of dumping 6 hooks + 6 handlers into the List component is eliminated.

### Naming Rules

| Item              | Convention                     | Example               |
| ----------------- | ------------------------------ | --------------------- |
| Folder            | plural, lowercase, no spaces   | `warehouses`          |
| Logic files       | `singular.purpose.js`          | `warehouse.api.js`    |
| Component files   | `PascalCase + Suffix.jsx`      | `WarehouseForm.jsx`   |
| Schema export     | `<entity>Schema`               | `warehouseSchema`     |
| Column export     | `<entity>Columns`              | `warehouseColumns`    |
| Query key         | `ENTITY_QUERY_KEY`             | `WAREHOUSE_QUERY_KEY` |
| Hook exports      | `use<Entity>Query`, `use<Entity>Mutations` | `useWarehouseQuery` |
| API functions     | `get<Plural>`, `create<Entity>`, `update<Entity>`, `delete<Entity>`, `delete<Plural>` | `getWarehouses`, `deleteWarehouses` |
| Component exports | `<EntityName>List` (named), `<EntityName>Form` (default) | `WarehouseList` |

---

## 4. Shared Infrastructure (create once)

Before building any feature, ensure these shared pieces exist. If they already exist, skip this phase.

### 4.1 — Generic Confirm Delete Dialog

**File:** `src/componenets/ConfirmDeleteDialog.jsx`

This replaces the product-coupled `ProductActionDialogs` for simple entity deletion.

```jsx
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
} from "@mui/material";

export default function ConfirmDeleteDialog({
  open,
  itemName,
  onClose,
  onConfirm,
  isPending = false,
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
        <Button
          variant="contained"
          color="error"
          onClick={onConfirm}
          disabled={isPending}
        >
          {isPending ? "Deleting..." : "Delete"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
```

**Props:**

| Prop        | Type             | Description                                     |
| ----------- | ---------------- | ----------------------------------------------- |
| `open`      | `boolean`        | Dialog visibility                               |
| `itemName`  | `string`         | Display name of the item being deleted           |
| `onClose`   | `() => void`     | Close handler                                   |
| `onConfirm` | `() => void`     | Executes the delete                             |
| `isPending` | `boolean`        | Disables buttons while mutation is in flight     |

### 4.2 — Message Dialog Component

**File:** `src/componenets/MessageDialog.jsx`

> **Critical rule:** Every message generated by database operations or errors must be displayed as a **dialog** — never as a browser `alert()`, `console.error()`, or a Snackbar. This ensures the user always acknowledges the outcome. The design follows the same pattern as `ConfirmDeleteDialog.jsx`.

```jsx
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
} from "@mui/material";

export default function MessageDialog({
  open,
  title = "Notification",
  message,
  severity = "info",    // "success" | "error" | "warning" | "info"
  onClose,
}) {
  const titleColor = {
    success: "success.main",
    error: "error.main",
    warning: "warning.main",
    info: undefined,
  }[severity];

  const buttonColor = severity === "error" ? "error" : severity === "warning" ? "warning" : "primary";

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ color: titleColor, fontWeight: "bold" }}>
        {title}
      </DialogTitle>
      <DialogContent>{message}</DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button variant="contained" color={buttonColor} onClick={onClose}>
          OK
        </Button>
      </DialogActions>
    </Dialog>
  );
}
```

**Props:**

| Prop        | Type             | Description                                             |
| ----------- | ---------------- | ------------------------------------------------------- |
| `open`      | `boolean`        | Dialog visibility                                       |
| `title`     | `string`         | Dialog title (defaults based on severity if omitted)     |
| `message`   | `string`         | The message body to display                             |
| `severity`  | `string`         | `"success"` / `"error"` / `"warning"` / `"info"` — controls title color |
| `onClose`   | `() => void`     | Called when the user clicks OK                          |

### 4.3 — Message Dialog Hook

**File:** `src/hooks/useMessageDialog.js`

```jsx
import { useState, useCallback } from "react";

export function useMessageDialog() {
  const [messageDialog, setMessageDialog] = useState({
    open: false,
    title: "",
    message: "",
    severity: "info",
  });

  const showMessageDialog = useCallback((message, severity = "info", title) => {
    const defaultTitles = {
      success: "Success",
      error: "Error",
      warning: "Warning",
      info: "Info",
    };
    setMessageDialog({
      open: true,
      title: title || defaultTitles[severity] || "Notification",
      message,
      severity,
    });
  }, []);

  const closeMessageDialog = useCallback(() => {
    setMessageDialog((prev) => ({ ...prev, open: false }));
  }, []);

  return { messageDialog, showMessageDialog, closeMessageDialog };
}
```

**Usage in any component:**
```jsx
import MessageDialog from "../../componenets/MessageDialog";
import { useMessageDialog } from "../../hooks/useMessageDialog";

// Inside component:
const { messageDialog, showMessageDialog, closeMessageDialog } = useMessageDialog();

// In JSX (place at bottom of component return):
<MessageDialog
  open={messageDialog.open}
  title={messageDialog.title}
  message={messageDialog.message}
  severity={messageDialog.severity}
  onClose={closeMessageDialog}
/>
```

> **Why dialogs instead of Snackbar?** Snackbar notifications auto-dismiss and can be missed. Database operation results — especially errors — are critical feedback that the user **must** acknowledge. Using a dialog (matching `ConfirmDeleteDialog.jsx` design) ensures visibility and forces explicit dismissal.

---

## Phase 1 — API Layer

**File:** `<entity>.api.js`

### Tasks

- [ ] **1.1** Create the file at `src/features/<entityPlural>/<entity>.api.js`.
- [ ] **1.2** Import the Supabase client:
  ```js
  import supabase from "../../config/supabase";
  ```
- [ ] **1.3** Export a **query key constant** (used by hooks for cache management):
  ```js
  export const ENTITY_QUERY_KEY = "<entityPlural>";
  ```
- [ ] **1.4** Implement and export the following **four async functions**:

#### 1.4.1 — Get All (Paginated)

```js
export async function get<EntitiesPlural>({ page = 0, pageSize = 10, searchText = "" } = {}) {
  const from = page * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("<table_name>")
    .select("<comma_separated_columns>", { count: "exact" })
    .order("<default_sort_column>", { ascending: true })
    .range(from, to);

  // Apply search filter (adjust columns to match your entity)
  if (searchText) {
    query = query.or(
      "<searchable_column1>.ilike.%${searchText}%,<searchable_column2>.ilike.%${searchText}%"
    );
  }

  const { data, error, count } = await query;
  if (error) throw error;
  return { data, count };   // ← return both rows and total count
}
```

- Select **only** the columns needed for display and editing — never `select("*")`.
- Always pass `{ count: "exact" }` to `.select()` so the total row count is returned for server pagination.
- Use `.range(from, to)` for offset-based pagination.
- Apply `.or()` with `.ilike` for server-side search across relevant text columns.
- Always apply `.order()` for deterministic results.
- The function returns `{ data, count }` — not just `data`.

#### 1.4.2 — Create

```js
export async function create<Entity>(payload) {
  const { data, error } = await supabase
    .from("<table_name>")
    .insert(payload)
    .select()
    .single();

  if (error) throw error;
  return data;
}
```

- Always chain `.select().single()` to return the inserted row.

#### 1.4.3 — Update

```js
export async function update<Entity>(id, payload) {
  const { data, error } = await supabase
    .from("<table_name>")
    .update(payload)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}
```

#### 1.4.4 — Delete

```js
export async function delete<Entity>(id) {
  const { error } = await supabase
    .from("<table_name>")
    .delete()
    .eq("id", id);

  if (error) throw error;
  return true;
}
```

#### 1.4.5 — Delete Multiple (Bulk)

```js
export async function delete<Plural>(ids) {
  const { error } = await supabase
    .from("<table_name>")
    .delete()
    .in("id", ids);

  if (error) throw error;
  return true;
}
```

- Accepts an **array of IDs** and deletes all matching rows in a single query using `.in("id", ids)`.
- Used by the bulk-delete flow triggered from checkbox selection.

### Rules

- **No React imports** in this file — it is a pure data-access layer.
- Every function **throws** on failure — callers (hooks) handle errors.
- The `ENTITY_QUERY_KEY` is the single source of truth for the cache key.

---

## Phase 2 — Validation Schema & Defaults

**File:** `<entity>.schema.js`

### Tasks

- [ ] **2.1** Create the file at `src/features/<entityPlural>/<entity>.schema.js`.
- [ ] **2.2** Import Zod:
  ```js
  import { z } from "zod";
  ```
- [ ] **2.3** Define and export the schema:
  ```js
  export const <entity>Schema = z.object({
    // ... fields with types, constraints, and error messages
  });
  ```
- [ ] **2.4** Export default values derived from the schema:
  ```js
  /**
   * Generates a blank object with all schema defaults applied.
   * Used by the Form component so defaults stay in sync with the schema.
   */
  export const <entity>Defaults = <entity>Schema.parse({
    // Provide the minimum required fields here so .parse() succeeds.
    // Fields with .default() will auto-populate.
  });
  ```
  > If `.parse({})` fails because of required fields, provide the minimum valid shape. The point is: **one source of truth** for defaults — not duplicated in the Form.

### Field Type Reference

| Field Type       | Zod Pattern                                                                   |
| ---------------- | ----------------------------------------------------------------------------- |
| Required text    | `z.string().min(<n>, "<msg>").trim()`                                         |
| Slug / code      | `z.string().min(<n>, "<msg>").regex(/^[a-z0-9-]+$/, "<msg>")`                 |
| Boolean toggle   | `z.boolean().default(true)`                                                   |
| Optional text    | `z.string().optional().or(z.literal(""))`                                     |
| Number           | `z.coerce.number().min(<n>).max(<n>)` (coerces string inputs from TextFields) |
| Enum             | `z.enum(["val1", "val2"])`                                                    |
| Foreign key (int)| `z.coerce.number().positive("<msg>")`                                         |
| Foreign key (uuid)| `z.string().uuid("<msg>")`                                                   |

### Rules

- **No React imports** — this is a pure validation module.
- Every constraint has a **human-readable error message**.
- `.trim()` on all string fields.
- Use `z.coerce.number()` instead of `z.number()` when the value comes from a `<TextField>` (HTML inputs return strings).
- Export name: `<entity>Schema` and `<entity>Defaults`.

---

## Phase 3 — Custom Hooks

**File:** `<entity>.hooks.js`

This is the **new layer** that did not exist in the old pattern. It encapsulates all React Query logic, cache management, and user notifications so the List component stays thin.

### Tasks

- [ ] **3.1** Create the file at `src/features/<entityPlural>/<entity>.hooks.js`.
- [ ] **3.2** Implement `use<Entity>Query`:

```js
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  get<Plural>,
  create<Entity>,
  update<Entity>,
  delete<Entity>,
  delete<Plural>,
  ENTITY_QUERY_KEY,
} from "./<entity>.api";

/**
 * Fetches the entity list with server-side pagination and debounced search.
 * Returns rows, total count, pagination controls, and search state.
 */
export function use<Entity>Query() {
  // Pagination state
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });

  // Search state with debounce
  const [searchText, setSearchText] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchText);
      // Reset to first page when search changes
      setPaginationModel((prev) => ({ ...prev, page: 0 }));
    }, 500);
    return () => clearTimeout(timer);
  }, [searchText]);

  const {
    data,
    isLoading,
    isFetching,
    isError,
    error,
  } = useQuery({
    queryKey: [ENTITY_QUERY_KEY, paginationModel, debouncedSearch],
    queryFn: () =>
      get<Plural>({
        page: paginationModel.page,
        pageSize: paginationModel.pageSize,
        searchText: debouncedSearch,
      }),
    staleTime: 1000 * 60 * 5,       // 5 minutes
    placeholderData: (prev) => prev, // keep previous data while fetching next page
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
```

- [ ] **3.3** Implement `use<Entity>Mutations`:

```js
import { useMutation, useQueryClient } from "@tanstack/react-query";

/**
 * Returns create / update / delete mutations with cache invalidation
 * and notification callbacks.
 *
 * @param {object} options
 * @param {function} options.onSuccess  - called after any successful mutation (e.g., close dialog)
 * @param {function} options.showMessageDialog - (message, severity, title?) => void — shows a dialog to the user
 */
export function use<Entity>Mutations({ onSuccess, showMessageDialog }) {
  const queryClient = useQueryClient();

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: [ENTITY_QUERY_KEY] });

  const createMutation = useMutation({
    mutationFn: create<Entity>,
    onSuccess: () => {
      invalidate();
      onSuccess?.();
      showMessageDialog?.("Created successfully", "success");
    },
    onError: (err) => {
      showMessageDialog?.(err.message || "Failed to create", "error");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => update<Entity>(id, data),
    onSuccess: () => {
      invalidate();
      onSuccess?.();
      showMessageDialog?.("Updated successfully", "success");
    },
    onError: (err) => {
      showMessageDialog?.(err.message || "Failed to update", "error");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: delete<Entity>,
    onSuccess: () => {
      invalidate();
      showMessageDialog?.("Deleted successfully", "success");
    },
    onError: (err) => {
      showMessageDialog?.(err.message || "Failed to delete", "error");
    },
  });

  const deleteMultipleMutation = useMutation({
    mutationFn: delete<Plural>,
    onSuccess: () => {
      invalidate();
      showMessageDialog?.("Deleted successfully", "success");
    },
    onError: (err) => {
      showMessageDialog?.(err.message || "Failed to delete", "error");
    },
  });

  return { createMutation, updateMutation, deleteMutation, deleteMultipleMutation };
}
```

> **Note:** `deleteMultipleMutation.mutate(arrayOfIds)` is called from the List component when the user confirms bulk deletion of checkbox-selected rows.

### Why this matters

| Before (old pattern)                                           | After (this spec)                                         |
| -------------------------------------------------------------- | --------------------------------------------------------- |
| 3 `useMutation` blocks + `useQuery` + `useQueryClient` inline  | 1 line: `const { rows, rowCount, ... } = use<Entity>Query()` |
| Pagination state + debounce logic duplicated in every List      | Managed inside the hook, exposed via return values         |
| `onSuccess` / `onError` duplicated in every List component      | Defined once in the hook, reused everywhere                |
| No snackbar — mutations fail silently                           | Every mutation notifies the user via dialog message        |
| Query key string duplicated across mutations and query          | Single `ENTITY_QUERY_KEY` constant from the API file       |
| `invalidateQueries(["string"])` — old syntax                   | `invalidateQueries({ queryKey: [...] })` — current syntax  |

### Rules

- This file imports from the API file **and** from React Query — that's its job.
- It **never** imports MUI or renders JSX.
- `staleTime` prevents unnecessary refetches. Default: 5 minutes. Adjust per entity if needed.
- `placeholderData: (prev) => prev` keeps the previous page visible while the next page loads (replaces deprecated `keepPreviousData`).
- Search debounce (500ms) prevents excessive API calls while the user types.
- Pagination resets to page 0 when the search text changes.
- `onSuccess` callback is generic (typically used to close the form dialog).

---

## Phase 4 — Column Definitions

**File:** `<entity>.columns.jsx`

### Tasks

- [ ] **4.1** Create the file at `src/features/<entityPlural>/<entity>.columns.jsx`.
- [ ] **4.2** Import MUI components (must match `product.columns.jsx` pattern):
  ```jsx
  import { IconButton, Stack, Checkbox } from "@mui/material";
  import EditNoteIcon from "@mui/icons-material/EditNote";
  import DeleteIcon from "@mui/icons-material/Delete";
  ```
- [ ] **4.3** Export a function that receives **positional parameters** (matches `product.columns.jsx`):
  ```jsx
  export const <entity>Columns = (
    onEdit,
    onDelete,
    selectedIds,
    toggleSelect,
    rows = [],
    toggleSelectAll,
  ) => [ /* ... */ ];
  ```
  > **Important:** Use positional parameters, not an options object — this matches the established `product.columns.jsx` pattern used across the project.
- [ ] **4.4** Define a **checkbox selection column** as the **first column** (see pattern below).
- [ ] **4.5** Define data columns for each displayed field.
- [ ] **4.6** Define an **actions column** as the last column.

### Column Patterns

**Checkbox selection column (always first):**
```jsx
{
  field: "select",
  headerName: "",
  width: 60,
  sortable: false,
  disableColumnMenu: true,

  renderHeader: () => {
    const allSelected =
      rows.length > 0 && rows.every((r) => selectedIds.has(r.id));

    return (
      <Checkbox
        checked={allSelected}
        indeterminate={selectedIds.size > 0 && !allSelected}
        onClick={(e) => e.stopPropagation()}
        onChange={toggleSelectAll}
      />
    );
  },

  renderCell: (params) => (
    <Checkbox
      checked={selectedIds.has(params.row.id)}
      onClick={(e) => e.stopPropagation()}
      onChange={() => toggleSelect(params.row.id)}
    />
  ),
}
```

- The header checkbox toggles **select-all / deselect-all** for the current page.
- `indeterminate` state is shown when some (but not all) rows are selected.
- `onClick={(e) => e.stopPropagation()}` prevents triggering row-click events.
- `selectedIds` is a `Set` managed by the List component.

**Standard text column:**
```jsx
{
  field: "<fieldName>",
  headerName: "<Display Label>",
  flex: 1,
}
```

**Boolean / status column:**
```jsx
{
  field: "<booleanField>",
  headerName: "<Label>",
  width: 120,
  renderCell: (params) => (params.value ? "Active" : "Inactive"),
}
```

**Actions column (always last — must match `product.columns.jsx` pattern):**
```jsx
{
  field: "actions",
  headerName: "Actions",
  width: 160,
  sortable: false,
  filterable: false,
  disableExport: true,
  renderCell: (params) => (
    <Stack direction="row" spacing={1}>
      <IconButton
        onClick={(e) => {
          e.stopPropagation();
          onEdit(params.row);
        }}
        color="error"
      >
        <EditNoteIcon />
      </IconButton>

      <IconButton
        onClick={(e) => {
          e.stopPropagation();
          onDelete(params.row);
        }}
        color="primary"
      >
        <DeleteIcon />
      </IconButton>
    </Stack>
  ),
}
```

### Rules

- The function receives **positional parameters** `(onEdit, onDelete, selectedIds, toggleSelect, rows = [], toggleSelectAll)` — matching `product.columns.jsx`.
- It **never** imports API functions.
- Actions column: `sortable: false`, `filterable: false`, `disableExport: true`, `width: 160`.
- Edit button uses `color="error"` and Delete button uses `color="primary"` — matching `product.columns.jsx`.
- Both action buttons use `e.stopPropagation()` inside the `onClick` handler to prevent row-click events.
- Icons: `EditNoteIcon` (`@mui/icons-material/EditNote`) + `DeleteIcon` (`@mui/icons-material/Delete`).
- Use `<Stack direction="row" spacing={1}>` to wrap action buttons — **not** `<Box>` and **not** `<Tooltip>`.
- Use `flex: 1` for variable-width text columns, fixed `width` for status/actions.

---

## Phase 5 — Form Component

**File:** `<EntityName>Form.jsx`

### Tasks

- [ ] **5.1** Create the file at `src/features/<entityPlural>/<EntityName>Form.jsx`.
- [ ] **5.2** Import dependencies:
  ```jsx
  import { useEffect } from "react";
  import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, Button, Switch, FormControlLabel,
    CircularProgress,
  } from "@mui/material";
  import { useForm } from "react-hook-form";
  import { zodResolver } from "@hookform/resolvers/zod";
  import { <entity>Schema, <entity>Defaults } from "./<entity>.schema";
  ```
- [ ] **5.3** Define the component with the following props:

| Prop          | Type                        | Description                                            |
| ------------- | --------------------------- | ------------------------------------------------------ |
| `open`        | `boolean`                   | Controls dialog visibility                             |
| `mode`        | `"add" \| "edit"`           | Determines title text and reset behavior               |
| `initialData` | `object \| null`            | Row data for edit mode; `null` for add                 |
| `onClose`     | `() => void`                | Called to close the dialog                             |
| `onSubmit`    | `(data: object) => void`    | Called with **validated** form data                    |
| `isPending`   | `boolean`                   | When `true`, Save button shows spinner and is disabled |

- [ ] **5.4** Initialize react-hook-form:
  ```jsx
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(<entity>Schema),
    defaultValues: <entity>Defaults,    // ← from schema file, single source of truth
  });
  ```

- [ ] **5.5** Implement reset logic:
  ```jsx
  useEffect(() => {
    if (mode === "edit" && initialData) {
      reset(initialData);
    } else {
      reset(<entity>Defaults);
    }
  }, [mode, initialData, reset]);
  ```

- [ ] **5.6** (If applicable) Implement derived fields via `useEffect` (e.g., auto-slug).

- [ ] **5.7** Build Dialog JSX:

```
Dialog (open, onClose, fullWidth, maxWidth="sm")
├── DialogTitle → "Add <Entity>" or "Edit <Entity>" based on mode
├── DialogContent (dividers)
│   ├── TextField per text field (register + error + helperText)
│   ├── FormControlLabel + Switch per boolean field
│   └── ... other field types (see Appendix A)
└── DialogActions
    ├── Button "Cancel" → onClose (disabled when isPending)
    └── Button "Save" → handleSubmit(onSubmit)
         - disabled={isPending}
         - shows <CircularProgress size={20} /> when isPending
```

### Save Button Implementation

```jsx
<Button
  variant="contained"
  onClick={handleSubmit(onSubmit)}
  disabled={isPending}
  startIcon={isPending ? <CircularProgress size={20} color="inherit" /> : null}
>
  {isPending ? "Saving..." : "Save"}
</Button>
```

### Field Rendering Patterns

| Field Type      | MUI Pattern                                                                                            |
| --------------- | ------------------------------------------------------------------------------------------------------ |
| Text input      | `<TextField {...register("<field>")} error={!!errors.<field>} helperText={errors.<field>?.message} fullWidth margin="normal" label="<Label>" />` |
| Read-only text  | Add `InputProps={{ readOnly: true }}` to above                                                         |
| Boolean toggle  | `<FormControlLabel control={<Switch checked={watch("<field>")} onChange={(e) => setValue("<field>", e.target.checked)} />} label="<Label>" />` |
| Select dropdown | `<TextField select label="<Label>" {...register("<field>")} fullWidth margin="normal"> {options.map(o => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)} </TextField>` |
| Number input    | `<TextField type="number" {...register("<field>")} label="<Label>" fullWidth margin="normal" />`        |

### Rules

- **Default export.**
- The form **never** fetches data and **never** calls API functions.
- Default values come from `<entity>Defaults` (schema file) — not hardcoded in the form.
- `isPending` is passed from the parent to block double-submission.
- `onSubmit` receives **validated** data only — Zod resolver ensures this.

---

## Phase 6 — List (Page) Component

**File:** `<EntityName>List.jsx`

This component is a **thin UI shell**. All logic lives in custom hooks.

### Tasks

- [ ] **6.1** Create the file at `src/features/<entityPlural>/<EntityName>List.jsx`.
- [ ] **6.2** Import dependencies:
  ```jsx
  import { useState } from "react";
  import { Box, Button, Typography, Alert, TextField, Paper } from "@mui/material";
  import { DataGrid } from "@mui/x-data-grid";

  import { use<Entity>Query, use<Entity>Mutations } from "./<entity>.hooks";
  import { <entity>Columns } from "./<entity>.columns";
  import <EntityName>Form from "./<EntityName>Form";
  import ConfirmDeleteDialog from "../../componenets/ConfirmDeleteDialog";
  import MessageDialog from "../../componenets/MessageDialog";
  import ScrollToTopButton from "../../componenets/ScrollToTopButton";
  import { useMessageDialog } from "../../hooks/useMessageDialog";
  ```

- [ ] **6.3** Define state — only **UI state**, no data logic:
  ```jsx
  const [selectedItem, setSelectedItem] = useState(null);
  const [openForm, setOpenForm] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [openDeleteSelected, setOpenDeleteSelected] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [mode, setMode] = useState("add");        // "add" | "edit"
  ```

- [ ] **6.4** Define `handleCloseForm` **before** wiring hooks (it is referenced by `use<Entity>Mutations`):
  ```jsx
  function handleCloseForm() {
    setOpenForm(false);
    setSelectedItem(null);
  }
  ```

- [ ] **6.5** Wire hooks:
  ```jsx
  const { messageDialog, showMessageDialog, closeMessageDialog } = useMessageDialog();
  const {
    rows,
    rowCount,
    isLoading,
    isFetching,
    isError,
    error,
    paginationModel,
    setPaginationModel,
    searchText,
    setSearchText,
  } = use<Entity>Query();
  const { createMutation, updateMutation, deleteMutation, deleteMultipleMutation } = use<Entity>Mutations({
    onSuccess: handleCloseForm,
    showMessageDialog,
  });
  ```

- [ ] **6.6** Implement handler functions:

  ```jsx
  // ── Open / Close ──
  const handleOpenAdd = () => {
    setMode("add");
    setSelectedItem(null);
    setOpenForm(true);
  };

  const handleOpenEdit = (row) => {
    setMode("edit");
    setSelectedItem(row);
    setOpenForm(true);
  };

  // ── Submit ──
  const handleFormSubmit = (data) => {
    if (mode === "add") {
      createMutation.mutate(data);
    } else {
      updateMutation.mutate({ id: selectedItem.id, data });
    }
  };

  // ── Delete ──
  const handleDeleteClick = (row) => {
    setSelectedItem(row);
    setOpenDelete(true);
  };

  const handleDeleteConfirm = () => {
    if (!selectedItem) return;
    deleteMutation.mutate(selectedItem.id, {
      onSettled: () => {
        setOpenDelete(false);
        setSelectedItem(null);
      },
    });
  };

  // ── Pagination (clear selection on page change) ──
  const handlePaginationChange = (newModel) => {
    setSelectedIds(new Set());   // prevent deleting invisible rows from other pages
    setPaginationModel(newModel);
  };

  // ── Checkbox Selection ──
  const toggleSelectAll = () => {
    const allSelected =
      rows.length > 0 && rows.every((r) => selectedIds.has(r.id));
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(rows.map((r) => r.id)));
    }
  };

  const toggleSelect = (id) => {
    const newSet = new Set(selectedIds);
    newSet.has(id) ? newSet.delete(id) : newSet.add(id);
    setSelectedIds(newSet);
  };

  // ── Bulk Delete ──
  const handleDeleteSelectedConfirm = () => {
    if (selectedIds.size === 0) return;
    deleteMultipleMutation.mutate(Array.from(selectedIds), {
      onSettled: () => {
        setOpenDeleteSelected(false);
        setSelectedIds(new Set());
      },
    });
  };
  ```

- [ ] **6.7** Build the JSX:

  ```jsx
  return (
    <Box>
      {/* ── Header ── */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5"><Entity Plural Title></Typography>
        <Box display="flex" gap={1}>
          {selectedIds.size > 0 && (
            <Button
              variant="contained"
              color="error"
              onClick={() => setOpenDeleteSelected(true)}
            >
              Delete Selected ({selectedIds.size})
            </Button>
          )}
          <Button variant="contained" onClick={handleOpenAdd}>
            Add <Entity>
          </Button>
        </Box>
      </Box>

      {/* ── Search Field ── */}
      <Box mb={2}>
        <TextField
          label="Search"
          variant="outlined"
          size="small"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          fullWidth
          sx={{ maxWidth: 400 }}
        />
      </Box>

      {/* ── Error Banner (if query fails) ── */}
      {isError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Failed to load data: {error?.message || "Unknown error"}
        </Alert>
      )}

      {/* ── Data Grid (server-side pagination) ── */}
      <Paper sx={{ height: 650, width: "100%" }}>
        <DataGrid
          rows={rows}
          rowCount={rowCount}
          columns={<entity>Columns(handleOpenEdit, handleDeleteClick, selectedIds, toggleSelect, rows, toggleSelectAll)}
          loading={isLoading || isFetching}
          paginationMode="server"
          paginationModel={paginationModel}
          onPaginationModelChange={handlePaginationChange}
          pageSizeOptions={[10, 25, 50]}
          disableSelectionOnClick
          sx={{ width: "100%" }}
        />
      </Paper>

      {/* ── Form Dialog ── */}
      <<EntityName>Form
        open={openForm}
        mode={mode}
        initialData={selectedItem}
        onClose={handleCloseForm}
        onSubmit={handleFormSubmit}
        isPending={createMutation.isPending || updateMutation.isPending}
      />

      {/* ── Delete Confirmation (single) ── */}
      <ConfirmDeleteDialog
        open={openDelete}
        itemName={selectedItem?.name || ""}
        onClose={() => { setOpenDelete(false); setSelectedItem(null); }}
        onConfirm={handleDeleteConfirm}
        isPending={deleteMutation.isPending}
      />

      {/* ── Delete Confirmation (bulk / selected rows) ── */}
      <ConfirmDeleteDialog
        open={openDeleteSelected}
        itemName={`${selectedIds.size} selected items`}
        onClose={() => setOpenDeleteSelected(false)}
        onConfirm={handleDeleteSelectedConfirm}
        isPending={deleteMultipleMutation.isPending}
      />

      {/* ── Message Dialog (all database operation feedback) ── */}
      <MessageDialog
        open={messageDialog.open}
        title={messageDialog.title}
        message={messageDialog.message}
        severity={messageDialog.severity}
        onClose={closeMessageDialog}
      />

      <ScrollToTopButton />
    </Box>
  );
  ```

### DataGrid Configuration Notes

| Prop                       | Purpose                                                          |
| -------------------------- | ---------------------------------------------------------------- |
| `paginationMode="server"`  | Tells DataGrid that pagination is handled server-side            |
| `rowCount`                 | Total row count from the API — lets DataGrid render page controls |
| `paginationModel`          | Controlled state `{ page, pageSize }` from the custom hook       |
| `onPaginationModelChange`  | Wrapped in `handlePaginationChange` which clears `selectedIds` first, then delegates to `setPaginationModel` |
| `pageSizeOptions`          | User can pick 10, 25, or 50 rows per page                        |
| `loading`                  | Shows spinner; set to `isLoading \|\| isFetching` for page transitions |
| `disableSelectionOnClick`  | Prevents row selection on click (avoids interfering with row actions) |

### Search Implementation Notes

| Aspect              | Detail                                                              |
| ------------------- | ------------------------------------------------------------------- |
| Debounce delay      | 500ms — balances responsiveness with API call reduction              |
| Page reset          | Search text change resets `paginationModel.page` to 0 automatically |
| Server-side filter  | The search text is sent to the API which uses Supabase `.ilike`     |
| Managed in hook     | `searchText` and `setSearchText` are returned from `use<Entity>Query` |

### Rules

- **Named export:** `export function <EntityName>List()`.
- The List component contains **zero** `useMutation` or `useQuery` calls — those live in hooks.
- Error state from the query is rendered as an `<Alert>` banner above the grid.
- `isPending` is passed to both the Form (Save button) and ConfirmDeleteDialog (Delete button).
- Uses **`ConfirmDeleteDialog`** (generic) — not `ProductActionDialogs`.
- Uses **`MessageDialog`** for all mutation success/error feedback — **no Snackbar, no browser `alert()`, no `console.error()`**.
- Columns function is called with **positional arguments** (matching `product.columns.jsx`): `<entity>Columns(handleOpenEdit, handleDeleteClick, selectedIds, toggleSelect, rows, toggleSelectAll)`.

---

## Phase 7 — Integration & Routing

### Tasks

- [ ] **7.1** Add a route in `src/main.jsx`:
  ```jsx
  import { <EntityName>List } from "./features/<entityPlural>/<EntityName>List";

  // Inside the router's <Route> tree:
  <Route path="/<EntityName>List" element={<<EntityName>List />} />
  ```
  > Match existing routing convention: `path="/<EntityName>List"` (PascalCase, no slashes between words).

- [ ] **7.2** Add a sidebar entry in `src/componenets/SideBar.jsx`:
  Find the appropriate `menuGroups` section and add:
  ```jsx
  { text: "<EntityName>List", path: "/<EntityName>List", icon: <SomeIcon /> },
  ```

- [ ] **7.3** Verify the Supabase table exists with expected columns and RLS policies enabled.

- [ ] **7.4** Run the full verification checklist (Appendix B).

---

## Appendix A — Field Type Reference

Comprehensive mapping from data type → schema → form component → column config:

| Data Type        | Zod Schema                               | Form Component                                  | Column Config                                    |
| ---------------- | ---------------------------------------- | ----------------------------------------------- | ------------------------------------------------ |
| Required text    | `z.string().min(n).trim()`               | `<TextField fullWidth margin="normal" />`        | `{ field, headerName, flex: 1 }`                 |
| Optional text    | `z.string().optional().or(z.literal(""))` | `<TextField fullWidth margin="normal" />`        | `{ field, headerName, flex: 1 }`                 |
| Slug / code      | `z.string().regex(/^[a-z0-9-]+$/)`       | `<TextField InputProps={{ readOnly: true }} />`   | `{ field, headerName, flex: 1 }`                 |
| Boolean          | `z.boolean().default(true)`              | `<Switch>` inside `<FormControlLabel>`           | `renderCell: (p) => p.value ? "Yes" : "No"`      |
| Integer          | `z.coerce.number().int().min(0)`         | `<TextField type="number" />`                    | `{ field, headerName, width: 100 }`              |
| Decimal          | `z.coerce.number().min(0)`               | `<TextField type="number" />`                    | `{ field, headerName, width: 120 }`              |
| Enum / status    | `z.enum(["a", "b"])`                     | `<TextField select>` + `<MenuItem>` list         | `renderCell` with status mapping                  |
| FK (int)         | `z.coerce.number().positive()`           | `<TextField select>` loaded from a parent query  | `renderCell` showing the related entity's name    |
| FK (uuid)        | `z.string().uuid()`                      | `<TextField select>` loaded from a parent query  | `renderCell` showing the related entity's name    |
| Date             | `z.string().date()` or `z.coerce.date()` | `<TextField type="date" InputLabelProps={{ shrink: true }} />` | `renderCell` with date formatting    |

---

## Appendix B — Verification Checklist

Run through every item before marking the feature complete:

### Functional

- [ ] Page loads without console errors.
- [ ] Grid displays data and shows a loading spinner while fetching.
- [ ] Grid shows an error `<Alert>` banner if the query fails (e.g., network off). Additionally, the error message is never shown as a browser `alert()` — always rendered in-page or via `MessageDialog`.
- [ ] **Server pagination:** Clicking next/previous page fetches new data from the API (network request visible in DevTools).
- [ ] **Server pagination:** Changing page size refetches with the new size.
- [ ] **Server pagination:** Total row count displays correctly in the DataGrid footer.
- [ ] **Server search:** Typing in the search field filters results server-side after a 500ms debounce.
- [ ] **Server search:** Changing search text resets pagination to page 0.
- [ ] **Server search:** Clearing the search field shows all results again.
- [ ] "Add" button opens the form in add mode with default values.
- [ ] Submitting the add form creates a row, shows "Created successfully" dialog message, closes form dialog, and refreshes the grid.
- [ ] Clicking the Edit icon opens the form pre-filled with row data.
- [ ] Submitting the edit form updates the row, shows "Updated successfully" dialog message, closes form dialog, and refreshes the grid.
- [ ] Clicking the Delete icon opens the confirmation dialog showing the item's name.
- [ ] Confirming delete removes the row, shows "Deleted successfully" dialog message, and refreshes the grid.
- [ ] Cancelling add/edit/delete closes the dialog without side effects.
- [ ] Validation errors appear inline under form fields for invalid inputs.
- [ ] **Checkbox select:** Each row has a checkbox; clicking it toggles selection.
- [ ] **Checkbox select-all:** The header checkbox selects/deselects all rows on the current page.
- [ ] **Checkbox indeterminate:** The header checkbox shows an indeterminate state when some (but not all) rows are selected.
- [ ] **Delete Selected button:** A "Delete Selected (N)" button appears in the header only when `selectedIds.size > 0`.
- [ ] **Bulk delete:** Clicking "Delete Selected" opens a confirmation dialog showing the count; confirming deletes all selected rows, shows a dialog message, and clears the selection.
- [ ] **Bulk delete cancel:** Cancelling the bulk-delete dialog does not delete anything and keeps the selection intact.
- [ ] **Selection clears on page change:** Navigating to a different page clears `selectedIds` so users cannot bulk-delete rows they can no longer see.

### Robustness

- [ ] Save button shows spinner and is disabled while mutation is pending — no double-click.
- [ ] Delete button shows "Deleting..." and is disabled while mutation is pending.
- [ ] A failed create/update/delete shows an error dialog message with the error details.
- [ ] Rapid open/close of the form doesn't leave stale data in the fields.
- [ ] Previous page data remains visible while the next page is loading (`placeholderData`).

### Accessibility

- [ ] Edit button uses `color="error"` and Delete button uses `color="primary"` (matching `product.columns.jsx`).
- [ ] Both action `IconButton`s use `e.stopPropagation()` in their `onClick` handler.
- [ ] Form fields have proper `label` props.
- [ ] Dialog has a visible title.

### Code Quality

- [ ] `<entity>.api.js` has zero React imports.
- [ ] `<entity>.schema.js` has zero React imports.
- [ ] `<entity>.hooks.js` has zero MUI imports.
- [ ] `<EntityName>Form.jsx` has zero API imports and zero React Query imports.
- [ ] `<EntityName>List.jsx` has zero direct `useMutation` / `useQuery` calls.
- [ ] `<EntityName>List.jsx` uses `paginationMode="server"` on DataGrid.
- [ ] `<entity>.columns.jsx` receives **positional parameters** `(onEdit, onDelete, selectedIds, toggleSelect, rows, toggleSelectAll)` and includes a checkbox selection column as the first column.
- [ ] `<entity>.hooks.js` exposes `deleteMultipleMutation` alongside the other mutations.
- [ ] `<EntityName>List.jsx` manages `selectedIds` as a `Set` state and passes selection props to columns.
- [ ] `<EntityName>List.jsx` shows a "Delete Selected" button only when items are selected.
- [ ] API `getAll` function returns `{ data, count }` with `{ count: "exact" }` in `.select()`.
- [ ] Query key includes `paginationModel` and `debouncedSearch`.
- [ ] Query key is imported from `ENTITY_QUERY_KEY` — not hardcoded.
- [ ] Form default values use `<entity>Defaults` — not duplicated.
- [ ] `invalidateQueries` uses object syntax: `{ queryKey: [...] }`.
- [ ] All mutation success/error messages are displayed via `MessageDialog` — no Snackbar, no browser `alert()`, no silent failures.
- [ ] `<entity>.columns.jsx` uses `<Stack direction="row" spacing={1}>` for the actions wrapper (matching `product.columns.jsx`).

---

## Summary

| #  | Deliverable                         | File                        | Phase |
| -- | ----------------------------------- | --------------------------- | ----- |
| 0a | Confirm delete dialog (shared)      | `componenets/ConfirmDeleteDialog.jsx` | Infra |
| 0b | Message dialog (shared)              | `componenets/MessageDialog.jsx`  | Infra  |
| 0c | Message dialog hook (shared)         | `hooks/useMessageDialog.js`      | Infra  |
| 1  | API CRUD functions + query key      | `<entity>.api.js`           | 1      |
| 2  | Zod schema + exported defaults      | `<entity>.schema.js`        | 2      |
| 3  | Custom hooks (query + mutations)    | `<entity>.hooks.js`         | 3      |
| 4  | DataGrid column definitions         | `<entity>.columns.jsx`      | 4      |
| 5  | Add / Edit dialog form              | `<EntityName>Form.jsx`      | 5      |
| 6  | List page (thin UI shell)           | `<EntityName>List.jsx`      | 6      |
| 7  | Route + sidebar entry               | `main.jsx` + `SideBar.jsx`  | 7      |

**Execution order:** Shared infra (if missing) → Phase 1 → 2 → 3 → 4 → 5 → 6 → 7 → Verify (Appendix B).
