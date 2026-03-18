import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/presentation/components/atoms/button";
import { Input } from "@/presentation/components/atoms/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/presentation/components/atoms/select";
import { Filter, X } from "lucide-react";

export interface OrderFilters {
    status?: string;
    product?: string;
    minPrice?: string;
    maxPrice?: string;
    startDate?: string;
    endDate?: string;
}

interface AdminOrdersFiltersProps {
    onFilterChange: (filters: OrderFilters) => void;
}

export function AdminOrdersFilters({ onFilterChange }: AdminOrdersFiltersProps) {
    const [filters, setFilters] = useState<OrderFilters>({
        status: "all",
        product: "all",
        minPrice: "",
        maxPrice: "",
        startDate: "",
        endDate: "",
    });

    const [products, setProducts] = useState<{ id: string; name: string; slug: string }[]>([]);

    useEffect(() => {
        setProducts([
            { id: "1", name: "Visto Turismo (B1/B2)", slug: "visto-b1-b2" },
            { id: "2", name: "Visto Estudante (F1)", slug: "visto-f1" },
            { id: "3", name: "Extensão de Status", slug: "extensao-status" },
            { id: "4", name: "Troca de Status", slug: "troca-status" },
            { id: "5", name: "Guia Visto B1/B2", slug: "guia-visto-consular-b1b2" }
        ]);
    }, []);

    const handleChange = (key: keyof OrderFilters, value: string) => {
        const newFilters = { ...filters, [key]: value };
        setFilters(newFilters);
        onFilterChange(newFilters);
    };

    const handleReset = () => {
        const resetFilters = {
            status: "all",
            product: "all",
            minPrice: "",
            maxPrice: "",
            startDate: "",
            endDate: "",
        };
        setFilters(resetFilters);
        onFilterChange(resetFilters);
    };

    return (
        <div className="rounded-md border border-border bg-card p-4">
            <div className="mb-4 flex items-center gap-2 font-medium text-foreground">
                <Filter className="h-4 w-4" />
                Filtros Avançados
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {/* Status */}
                <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground uppercase">Status</label>
                    <Select
                        value={filters.status}
                        onValueChange={(v) => handleChange("status", v)}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Todos os Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos os Status</SelectItem>
                            <SelectItem value="pending">Pendente</SelectItem>
                            <SelectItem value="paid">Pago</SelectItem>
                            <SelectItem value="failed">Falha</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Produto */}
                <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground uppercase">Produto</label>
                    <Select
                        value={filters.product}
                        onValueChange={(v) => handleChange("product", v)}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Todos os Produtos" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos os Produtos</SelectItem>
                            {products.map((p) => (
                                <SelectItem key={p.id} value={p.slug}>
                                    {p.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Valor Min/Max */}
                <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground uppercase">Faixa de Preço (USD)</label>
                    <div className="flex items-center gap-2">
                        <Input
                            type="number"
                            placeholder="Min"
                            value={filters.minPrice}
                            onChange={(e) => handleChange("minPrice", e.target.value)}
                        />
                        <span className="text-muted-foreground">—</span>
                        <Input
                            type="number"
                            placeholder="Max"
                            value={filters.maxPrice}
                            onChange={(e) => handleChange("maxPrice", e.target.value)}
                        />
                    </div>
                </div>

                {/* Datas */}
                <div className="space-y-1.5 lg:col-span-2">
                    <label className="text-xs font-medium text-muted-foreground uppercase">Período</label>
                    <div className="flex items-center gap-2">
                        <Input
                            type="date"
                            value={filters.startDate}
                            onChange={(e) => handleChange("startDate", e.target.value)}
                        />
                        <span className="text-muted-foreground">—</span>
                        <Input
                            type="date"
                            value={filters.endDate}
                            onChange={(e) => handleChange("endDate", e.target.value)}
                        />
                    </div>
                </div>

                {/* Reset */}
                <div className="flex items-end lg:col-span-2">
                    <Button
                        variant="ghost"
                        onClick={handleReset}
                        className="text-muted-foreground hover:text-foreground"
                    >
                        <X className="mr-2 h-4 w-4" />
                        Limpar Filtros
                    </Button>
                </div>
            </div>
        </div>
    );
}
