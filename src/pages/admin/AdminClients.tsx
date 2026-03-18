import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { AdminDataTable } from "@/presentation/components/organisms/admin/AdminDataTable";
import { Button } from "@/presentation/components/atoms/button";
import { Eye, Search, Filter, X } from "lucide-react";
import { Input } from "@/presentation/components/atoms/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/presentation/components/atoms/select";

interface Client {
    id: string;
    full_name: string;
    email: string;
    phone: string;
    updated_at: string;
}

export default function AdminClients() {
    const navigate = useNavigate();
    const [clients, setClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        fetchClients();
    }, []);

    const fetchClients = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from("profiles")
                .select("id, full_name, email, phone, updated_at")
                .order("updated_at", { ascending: false });

            if (error) throw error;

            setClients(data as Client[]);
        } catch (error) {
            console.error("Erro ao buscar clientes:", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredClients = clients.filter(client => {
        const matchesSearch =
            (client.full_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
            (client.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
            (client.phone || "").includes(searchTerm);

        return matchesSearch;
    });

    const formatDate = (date: string) =>
        new Date(date).toLocaleDateString("pt-BR");

    return (
        <div className="space-y-4">
            <div>
                <h2 className="font-display text-title font-bold text-foreground">Gestão de Clientes</h2>
                <p className="text-muted-foreground">Base de dados completa de usuários e investidores.</p>
            </div>

            {/* Filtros */}
            <div className="flex flex-wrap items-center gap-4 rounded-md border border-border bg-card p-4">
                <div className="flex flex-1 items-center gap-2 min-w-[250px]">
                    <Search className="h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar por nome, e-mail ou telefone..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="h-9"
                    />
                </div>

                {searchTerm && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => { setSearchTerm(""); }}
                        className="text-muted-foreground"
                    >
                        <X className="h-4 w-4 mr-2" /> Limpar
                    </Button>
                )}
            </div>

            <div className="rounded-md bg-card">
                <AdminDataTable
                    loading={loading}
                    data={filteredClients}
                    columns={[
                        { key: "full_name", header: "Nome", className: "font-medium" },
                        { key: "email", header: "E-mail" },
                        { key: "phone", header: "Telefone" },
                        { key: "updated_at", header: "Cadastro/Atualização", render: (item) => formatDate(item.updated_at) },
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
