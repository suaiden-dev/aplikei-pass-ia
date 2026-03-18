import { ReactNode, useState } from "react";
import { Input } from "@/presentation/components/atoms/input";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/presentation/components/atoms/button";
import { Skeleton } from "@/presentation/components/atoms/skeleton";

interface Column<T> {
    key: string;
    header: string;
    render?: (item: T) => ReactNode;
    className?: string;
}

interface AdminDataTableProps<T> {
    columns: Column<T>[];
    data: T[];
    loading?: boolean;
    searchPlaceholder?: string;
    searchKeys?: string[];
    pageSize?: number;
    onRowClick?: (item: T) => void;
}

export function AdminDataTable<T extends Record<string, unknown>>({
    columns,
    data,
    loading = false,
    searchPlaceholder = "Buscar...",
    searchKeys = [],
    pageSize = 15,
    onRowClick,
}: AdminDataTableProps<T>) {
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(0);

    const filtered = search.trim()
        ? data.filter((item) =>
            searchKeys.some((key) => {
                const val = item[key];
                return (
                    val &&
                    String(val).toLowerCase().includes(search.toLowerCase())
                );
            })
        )
        : data;

    const totalPages = Math.ceil(filtered.length / pageSize);
    const paginated = filtered.slice(page * pageSize, (page + 1) * pageSize);

    if (loading) {
        return (
            <div className="space-y-3">
                <Skeleton className="h-10 w-full max-w-sm" />
                <div className="rounded-md border border-border">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="flex gap-4 border-b border-border p-4">
                            {columns.map((_, j) => (
                                <Skeleton key={j} className="h-4 flex-1" />
                            ))}
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div>
            {/* Search */}
            {searchKeys.length > 0 && (
                <div className="relative mb-4 max-w-sm">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setPage(0);
                        }}
                        placeholder={searchPlaceholder}
                        className="pl-9"
                    />
                </div>
            )}

            {/* Table */}
            <div className="overflow-x-auto rounded-md border border-border bg-card">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-border bg-muted/50">
                            {columns.map((col) => (
                                <th
                                    key={col.key}
                                    className={`px-4 py-3 text-left font-medium text-muted-foreground ${col.className || ""}`}
                                >
                                    {col.header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {paginated.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={columns.length}
                                    className="px-4 py-5 text-center text-muted-foreground"
                                >
                                    Nenhum registro encontrado.
                                </td>
                            </tr>
                        ) : (
                            paginated.map((item, i) => (
                                <tr
                                    key={i}
                                    onClick={() => onRowClick?.(item)}
                                    className={`border-b border-border last:border-0 transition-colors ${onRowClick
                                            ? "cursor-pointer hover:bg-muted/30"
                                            : ""
                                        }`}
                                >
                                    {columns.map((col) => (
                                        <td
                                            key={col.key}
                                            className={`px-4 py-3 text-foreground ${col.className || ""}`}
                                        >
                                            {col.render
                                                ? col.render(item)
                                                : (item[col.key] as ReactNode ?? "—")}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="mt-4 flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">
                        {filtered.length} registro{filtered.length !== 1 ? "s" : ""} •
                        Página {page + 1} de {totalPages}
                    </p>
                    <div className="flex gap-1">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage((p) => Math.max(0, p - 1))}
                            disabled={page === 0}
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                            disabled={page >= totalPages - 1}
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
