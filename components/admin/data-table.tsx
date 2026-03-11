"use client";

import * as React from "react";
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Search,
  Plus,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export interface ColumnDef<T> {
  key: keyof T & string;
  id?: string;
  label: string;
  sortable?: boolean;
  render?: (value: T[keyof T], row: T) => React.ReactNode;
  sortValue?: (value: T[keyof T], row: T) => string | number;
}

export interface FieldDef {
  key: string;
  label: string;
  type?: "text" | "email" | "select" | "date";
  options?: string[];
  placeholder?: string;
}

interface DataTableProps<T extends { id: string | number }> {
  title: string;
  description?: string;
  columns: ColumnDef<T>[];
  data: T[];
  onAdd?: (item: Record<string, string>) => void;
  onDelete?: (ids: (string | number)[]) => void;
  addFields?: FieldDef[];
  disableAdd?: boolean;
  searchableKeys?: (keyof T & string)[];
  pageSize?: number;
}

export function DataTable<T extends { id: string | number }>({
  title,
  description,
  columns,
  data: initialData,
  onAdd,
  onDelete,
  addFields,
  disableAdd = false,
  searchableKeys,
  pageSize: defaultPageSize = 10,
}: DataTableProps<T>) {
  const [data, setData] = React.useState(initialData);
  const [search, setSearch] = React.useState("");
  const [sortKey, setSortKey] = React.useState<string | null>(null);
  const [sortDir, setSortDir] = React.useState<"asc" | "desc">("asc");
  const [page, setPage] = React.useState(0);
  const [pageSize, setPageSize] = React.useState(defaultPageSize);
  const [selected, setSelected] = React.useState<Set<string | number>>(
    new Set(),
  );
  const [addOpen, setAddOpen] = React.useState(false);
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [formValues, setFormValues] = React.useState<Record<string, string>>(
    {},
  );

  // Sync with external data changes
  React.useEffect(() => {
    setData(initialData);
  }, [initialData]);

  // Filter
  const filtered = React.useMemo(() => {
    if (!search.trim()) return data;
    const q = search.toLowerCase();
    const keys = searchableKeys ?? columns.map((c) => c.key);
    return data.filter((row) =>
      keys.some((key) => String(row[key]).toLowerCase().includes(q)),
    );
  }, [data, search, searchableKeys, columns]);

  // Sort
  const sorted = React.useMemo(() => {
    if (!sortKey) return filtered;
    const col = columns.find((c) => (c.id ?? c.key) === sortKey);
    const dataKey = col?.key ?? (sortKey as keyof T & string);
    return [...filtered].sort((a, b) => {
      const aVal = col?.sortValue ? col.sortValue(a[dataKey], a) : a[dataKey];
      const bVal = col?.sortValue ? col.sortValue(b[dataKey], b) : b[dataKey];
      if (aVal == null) return 1;
      if (bVal == null) return -1;
      const cmp = String(aVal).localeCompare(String(bVal), undefined, {
        numeric: true,
      });
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [filtered, sortKey, sortDir, columns]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const paginated = sorted.slice(page * pageSize, (page + 1) * pageSize);

  // Reset page when filter/sort changes
  React.useEffect(() => {
    setPage(0);
  }, [search, sortKey, sortDir, pageSize]);

  function handleSort(key: string) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  function toggleSelectAll() {
    if (selected.size === paginated.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(paginated.map((r) => r.id)));
    }
  }

  function toggleRow(id: string | number) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleAdd() {
    if (onAdd) {
      onAdd(formValues);
    }
    setFormValues({});
    setAddOpen(false);
  }

  function handleDelete() {
    const ids = Array.from(selected);
    if (onDelete) {
      onDelete(ids);
    }
    setData((prev) => prev.filter((row) => !selected.has(row.id)));
    setSelected(new Set());
    setDeleteOpen(false);
  }

  const SortIcon = ({ col }: { col: ColumnDef<T> }) => {
    const colId = col.id ?? col.key;
    if (sortKey !== colId)
      return <ArrowUpDown className="size-3.5 ml-1 text-muted-foreground/50" />;
    return sortDir === "asc" ? (
      <ArrowUp className="size-3.5 ml-1" />
    ) : (
      <ArrowDown className="size-3.5 ml-1" />
    );
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold font-sans tracking-tight">{title}</h1>
        {description && (
          <p className="text-muted-foreground text-sm mt-1">{description}</p>
        )}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-2">
          {selected.size > 0 && (
            <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
              <DialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  <Trash2 className="size-4 mr-1.5" />
                  Delete ({selected.size})
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Confirm Deletion</DialogTitle>
                  <DialogDescription>
                    Are you sure you want to delete {selected.size} row
                    {selected.size > 1 ? "s" : ""}? This action cannot be
                    undone.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setDeleteOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button variant="destructive" onClick={handleDelete}>
                    Delete
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
          {addFields && !disableAdd && (
            <Dialog open={addOpen} onOpenChange={setAddOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="size-4 mr-1.5" />
                  Add Row
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Row</DialogTitle>
                  <DialogDescription>
                    Fill in the fields below to add a new entry.
                  </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col gap-4 py-4">
                  {addFields.map((field) => (
                    <div key={field.key} className="flex flex-col gap-2">
                      <Label htmlFor={field.key}>{field.label}</Label>
                      {field.type === "select" && field.options ? (
                        <Select
                          value={formValues[field.key] || ""}
                          onValueChange={(v) =>
                            setFormValues((prev) => ({
                              ...prev,
                              [field.key]: v,
                            }))
                          }
                        >
                          <SelectTrigger id={field.key}>
                            <SelectValue
                              placeholder={
                                field.placeholder ||
                                `Select ${field.label.toLowerCase()}`
                              }
                            />
                          </SelectTrigger>
                          <SelectContent>
                            {field.options.map((opt) => (
                              <SelectItem key={opt} value={opt}>
                                {opt}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <Input
                          id={field.key}
                          type={field.type || "text"}
                          placeholder={field.placeholder || field.label}
                          value={formValues[field.key] || ""}
                          onChange={(e) =>
                            setFormValues((prev) => ({
                              ...prev,
                              [field.key]: e.target.value,
                            }))
                          }
                        />
                      )}
                    </div>
                  ))}
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setAddOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAdd}>Add</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-12">
                <input
                  type="checkbox"
                  checked={
                    paginated.length > 0 && selected.size === paginated.length
                  }
                  onChange={toggleSelectAll}
                  className="rounded border-input"
                  aria-label="Select all rows"
                />
              </TableHead>
              {columns.map((col) => (
                <TableHead key={col.key}>
                  {col.sortable !== false ? (
                    <button
                      onClick={() => handleSort(col.id ?? col.key)}
                      className="flex items-center font-medium hover:text-foreground transition-colors"
                    >
                      {col.label}
                      <SortIcon col={col} />
                    </button>
                  ) : (
                    col.label
                  )}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length + 1}
                  className="h-24 text-center text-muted-foreground"
                >
                  No results found.
                </TableCell>
              </TableRow>
            ) : (
              paginated.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={selected.has(row.id) ? "selected" : undefined}
                  className="data-[state=selected]:bg-muted/50"
                >
                  <TableCell>
                    <input
                      type="checkbox"
                      checked={selected.has(row.id)}
                      onChange={() => toggleRow(row.id)}
                      className="rounded border-input"
                      aria-label={`Select row ${row.id}`}
                    />
                  </TableCell>
                  {columns.map((col) => (
                    <TableCell key={col.key}>
                      {col.render
                        ? col.render(row[col.key], row)
                        : String(row[col.key] ?? "")}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Rows per page</span>
          <Select
            value={String(pageSize)}
            onValueChange={(v) => setPageSize(Number(v))}
          >
            <SelectTrigger className="w-[70px] h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5</SelectItem>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            Page {page + 1} of {totalPages}
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="size-8"
              onClick={() => setPage(0)}
              disabled={page === 0}
              aria-label="First page"
            >
              <ChevronsLeft className="size-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="size-8"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              aria-label="Previous page"
            >
              <ChevronLeft className="size-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="size-8"
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              aria-label="Next page"
            >
              <ChevronRight className="size-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="size-8"
              onClick={() => setPage(totalPages - 1)}
              disabled={page >= totalPages - 1}
              aria-label="Last page"
            >
              <ChevronsRight className="size-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
