import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/presentation/components/atoms/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/presentation/components/atoms/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/presentation/components/atoms/tabs";
import {
  ChevronLeft,
  User,
  MapPin,
  Phone,
  Mail,
  Calendar,
  CreditCard,
  FileText,
  Download,
  ExternalLink,
  Briefcase,
} from "lucide-react";
import { Skeleton } from "@/presentation/components/atoms/skeleton";
import { AdminDataTable } from "@/presentation/components/organisms/admin/AdminDataTable";
import { Badge } from "@/presentation/components/atoms/badge";

interface ClientDetail {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  country: string | null;
  nationality: string | null;
  date_of_birth: string | null;
  document_number: string | null;
  document_type: string | null;
  marital_status: string | null;
  address_line: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;
  created_at: string;
}

interface Order {
  id: string;
  order_number: string;
  product_slug: string;
  total_price_usd: number;
  payment_status: string;
  created_at: string;
}

interface IdentityFile {
  id: string;
  file_name: string;
  file_path: string;
  file_type: string;
  created_at: string;
  service_request_id: string | null;
}

export default function AdminClientDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [client, setClient] = useState<ClientDetail | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [files, setFiles] = useState<IdentityFile[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchClientData = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      // 1. Fetch Profile (formerly Client)
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", id)
        .single();

      if (profileError) throw profileError;
      
      const profile = profileData as unknown as Record<string, unknown>;
      const normalizedClient: ClientDetail = {
        id: profileData.id,
        full_name: profileData.full_name || "Sem nome",
        email: profileData.email || "",
        phone: profileData.phone || "",
        country: (profile.country as string) || null,
        nationality: (profile.nationality as string) || null,
        date_of_birth: (profile.date_of_birth as string) || null,
        document_number: (profile.document_number as string) || null,
        document_type: (profile.document_type as string) || null,
        marital_status: (profile.marital_status as string) || null,
        address_line: (profile.address_line as string) || null,
        city: (profile.city as string) || null,
        state: (profile.state as string) || null,
        postal_code: (profile.postal_code as string) || null,
        created_at: profileData.updated_at || new Date().toISOString(),
      };
      setClient(normalizedClient);

      // 2. Fetch Orders directly via user_id
      const { data: ordersData } = await supabase
        .from("visa_orders")
        .select(
          "id, order_number, product_slug, total_price_usd, payment_status, created_at",
        )
        .eq("user_id", id)
        .order("created_at", { ascending: false });

      setOrders((ordersData as unknown as Order[]) || []);

      // 3. Fetch Documents (formerly Identity Files)
      const { data: docsData } = await supabase
        .from("documents")
        .select("*")
        .eq("user_id", id)
        .order("created_at", { ascending: false });

      if (docsData) {
        setFiles(docsData.map(d => ({
          id: d.id,
          file_name: d.name,
          file_path: d.storage_path,
          file_type: d.name,
          created_at: d.created_at || new Date().toISOString(),
          service_request_id: d.user_service_id
        })));
      }
    } catch (error) {
      console.error("Erro ao carregar dados do cliente:", error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchClientData();
  }, [fetchClientData]);

  const formatDate = (date: string | null) =>
    date ? new Date(date).toLocaleDateString("pt-BR") : "—";

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!client) return <div>Cliente não encontrado.</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/admin/clientes")}
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div>
          <h2 className="font-display text-title font-bold text-foreground">
            {client.full_name}
          </h2>
          <p className="text-sm text-muted-foreground">
            Cliente desde {formatDate(client.created_at)}
          </p>
        </div>
      </div>

      <Tabs defaultValue="perfil">
        <TabsList>
          <TabsTrigger value="perfil">Perfil</TabsTrigger>
          <TabsTrigger value="documentos">
            Documentos ({files.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="perfil" className="space-y-4 mt-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  Dados Pessoais
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground uppercase">
                    E-mail
                  </p>
                  <p className="font-medium flex items-center gap-1 break-all leading-tight">
                    <Mail className="h-3 w-3 shrink-0" /> {client.email}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase">
                    Telefone
                  </p>
                  <p className="font-medium flex items-center gap-1">
                    <Phone className="h-3 w-3" /> {client.phone}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase">
                    Nascimento
                  </p>
                  <p className="font-medium">
                    {formatDate(client.date_of_birth)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase">
                    Nacionalidade
                  </p>
                  <p className="font-medium">{client.nationality || "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase">
                    {client.document_type || "Documento"}
                  </p>
                  <p className="font-medium">{client.document_number || "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase">
                    Estado Civil
                  </p>
                  <p className="font-medium capitalize">
                    {client.marital_status || "—"}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  Endereço
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2 min-w-0">
                  <p className="text-xs text-muted-foreground uppercase">
                    Rua / Complemento
                  </p>
                  <p className="font-medium break-all leading-tight">
                    {client.address_line || "—"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase">
                    Cidade
                  </p>
                  <p className="font-medium">{client.city || "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase">
                    Estado/Província
                  </p>
                  <p className="font-medium">{client.state || "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase">
                    País
                  </p>
                  <p className="font-medium">{client.country || "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase">CEP</p>
                  <p className="font-medium">{client.postal_code || "—"}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="documentos" className="mt-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {files.length === 0 ? (
              <p className="text-muted-foreground italic col-span-full py-5 text-center bg-muted/20 rounded-md border border-dashed">
                Nenhum documento enviado ainda.
              </p>
            ) : (
              files.map((file) => (
                <Card
                  key={file.id}
                  className="overflow-hidden group hover:border-primary transition-colors"
                >
                  <CardContent className="p-4 flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="mt-1 flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-semibold line-clamp-1">
                          {file.file_name || "Documento"}
                        </p>
                        <p className="text-xs text-muted-foreground capitalize">
                          {file.file_type.replace(/_/g, " ")}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {formatDate(file.created_at)}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground group-hover:text-primary"
                      onClick={() => window.open(file.file_path, "_blank")}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
