import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { Button } from "@/components/ui/button";
import { Eye, Search, Filter, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface Client {
    id: string;
    full_name: string;
    email: string;
    phone: string;
    country: string | null;
    nationality: string | null;
    created_at: string;
}

export default function AdminClients() {
    const navigate = useNavigate();
    const [clients, setClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [countryFilter, setCountryFilter] = useState("all");
    const [countries, setCountries] = useState<string[]>([]);

    useEffect(() => {
        fetchClients();
    }, []);

    const fetchClients = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from("clients")
                .select("id, full_name, email, phone, country, nationality, created_at")
                .order("created_at", { ascending: false });

            if (error) throw error;

            setClients(data as Client[]);

            // Extract unique countries for filter
            const uniqueCountries = Array.from(new Set(data.map(c => c.country).filter(Boolean))) as string[];
            setCountries(uniqueCountries.sort());
        } catch (error) {
            console.error("Erro ao buscar clientes:", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredClients = clients.filter(client => {
        const matchesSearch =
            client.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            client.phone.includes(searchTerm);

        const matchesCountry = countryFilter === "all" || client.country === countryFilter;

        return matchesSearch && matchesCountry;
    });

    const formatDate = (date: string) =>
        new Date(date).toLocaleDateString("pt-BR");

    return (
        <div className="space-y-6">
            <div>
                <h2 className="font-display text-2xl font-bold text-foreground">Gestão de Clientes</h2>
                <p className="text-muted-foreground">Base de dados completa de usuários e investidores.</p>
            </div>

            {/* Filtros */}
            <div className="flex flex-wrap items-center gap-4 rounded-xl border border-border bg-card p-4">
                <div className="flex flex-1 items-center gap-2 min-w-[250px]">
                    <Search className="h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar por nome, e-mail ou telefone..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="h-9"
                    />
                </div>

                <div className="flex items-center gap-2 min-w-[200px]">
                    <Filter className="h-4 w-4 text-muted-foreground" />
                    <Select value={countryFilter} onValueChange={setCountryFilter}>
                        <SelectTrigger className="h-9">
                            <SelectValue placeholder="Filtrar por País" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos os Países</SelectItem>
                            {countries.map(c => (
                                <SelectItem key={c} value={c}>{c}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {(searchTerm || countryFilter !== "all") && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => { setSearchTerm(""); setCountryFilter("all"); }}
                        className="text-muted-foreground"
                    >
                        <X className="h-4 w-4 mr-2" /> Limpar
                    </Button>
                )}
            </div>

            <div className="rounded-xl bg-card">
                <AdminDataTable
                    loading={loading}
                    data={filteredClients}
                    columns={[
                        { key: "full_name", header: "Nome", className: "font-medium" },
                        { key: "email", header: "E-mail" },
                        { key: "phone", header: "WhatsApp/Telefone" },
                        { key: "country", header: "País", render: (item) => item.country || "—" },
                        { key: "created_at", header: "Cadastro", render: (item) => formatDate(item.created_at) },
                        {
                            key: "actions",
                            header: "",
                            className: "text-right",
                            render: (item) => (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => navigate(`/admin/clientes/${item.id}`)}
                                >
                                    <Eye className="h-4 w-4 mr-2" /> Detalhes
                                </Button>
                            ),
                        },
                    ]}
                />
            </div>
        </div>
    );
}
