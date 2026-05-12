import { useEffect, useState, useCallback } from "react";
import { RiMoneyDollarCircleLine, RiLinkM, RiCheckLine, RiLoader4Line, RiShoppingCartLine, RiCalendarLine } from "react-icons/ri";
import { supabase } from "../../../shared/lib/supabase";
import { useAuth } from "../../../hooks/useAuth";
import { encodeCheckoutToken } from "../../../utils/checkoutToken";
import { toast } from "sonner";

interface Service {
  id: string;
  name: string;
  slug: string;
  category: string;
  price: number;
}

interface OrderRow {
  id: string;
  total_price_usd: number;
  payment_status: string;
  created_at: string;
  client_name: string | null;
  product_slug: string;
}

interface OfficeInfo {
  id: string;
  slug: string;
  name: string;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    void navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <button
      type="button"
      onClick={copy}
      className="flex items-center gap-1.5 rounded-xl border border-border bg-bg-subtle px-3 py-1.5 text-xs font-semibold text-text-muted transition-colors hover:border-primary/40 hover:text-primary"
    >
      {copied ? <RiCheckLine className="text-success" /> : <RiLinkM />}
      {copied ? "Copiado!" : "Copiar link"}
    </button>
  );
}

const PAID_STATUSES = ["paid", "approved", "complete", "completed", "succeeded"];

export default function EarningsPage() {
  const { user } = useAuth();
  const [office, setOffice] = useState<OfficeInfo | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user?.id) return;
    setIsLoading(true);
    try {
      // 1. Office vem direto do user já carregado pelo auth (sem query extra)
      const officeId = user.officeId;
      let officeData: OfficeInfo | null = null;

      if (officeId) {
        const { data: officeRow } = await supabase
          .from("offices")
          .select("id, slug, name")
          .eq("id", officeId)
          .maybeSingle();

        officeData = officeRow as OfficeInfo | null;
      }

      setOffice(officeData);

      // 2. Preços reais da office (user_service_prices ⟶ services)
      if (officeId) {
        const { data: priceRows } = await supabase
          .from("user_service_prices")
          .select("price, services(id, name, slug, category)")
          .eq("office_id", officeId)
          .eq("is_active", true);

        const mapped: Service[] = ((priceRows ?? []) as Array<{
          price: number;
          services: { id: string; name: string; slug: string; category: string } | null;
        }>)
          .filter((r) => r.services?.category === "main_visa")
          .map((r) => ({
            id: r.services!.id,
            name: r.services!.name,
            slug: r.services!.slug,
            category: r.services!.category,
            price: r.price,
          }));

        setServices(mapped);
      }

      // 3. Orders pagos referenciados por este seller
      const { data: ordersData } = await supabase
        .from("orders")
        .select("id, total_price_usd, payment_status, created_at, client_name, product_slug")
        .eq("seller_id", user.id)
        .in("payment_status", PAID_STATUSES)
        .order("created_at", { ascending: false });

      setOrders((ordersData as OrderRow[]) ?? []);
    } catch (err: unknown) {
      toast.error("Erro ao carregar dados.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => { void load(); }, [load]);

  const totalEarned = orders.reduce((sum, o) => sum + (Number(o.total_price_usd) || 0), 0);

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const monthEarned = orders
    .filter((o) => {
      const d = new Date(o.created_at);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    })
    .reduce((sum, o) => sum + (Number(o.total_price_usd) || 0), 0);

  const checkoutBase = typeof window !== "undefined" ? window.location.origin : "";
  const checkoutUrl = (slug: string) => {
    if (!office || !user?.id) return "";
    const token = encodeCheckoutToken({ office: office.slug, product: slug, ref: user.id });
    return `${checkoutBase}/l/${token}`;
  };

  // Group services by category
  const grouped = services.reduce<Record<string, Service[]>>((acc, s) => {
    const cat = s.category || "other";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(s);
    return acc;
  }, {});

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <RiLoader4Line className="animate-spin text-3xl text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6 pb-20 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-black tracking-tight text-text">Meus Ganhos</h1>
        <p className="mt-1 text-sm text-text-muted">
          Acompanhe suas vendas e compartilhe links de pagamento com clientes.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label="Total acumulado"
          value={`US$ ${totalEarned.toFixed(2)}`}
          icon={<RiMoneyDollarCircleLine className="text-xl" />}
          color="bg-success/10 text-success"
        />
        <StatCard
          label="Este mês"
          value={`US$ ${monthEarned.toFixed(2)}`}
          icon={<RiCalendarLine className="text-xl" />}
          color="bg-primary/10 text-primary"
        />
        <StatCard
          label="Vendas realizadas"
          value={String(orders.length)}
          icon={<RiShoppingCartLine className="text-xl" />}
          color="bg-info/10 text-info"
        />
      </div>

      {/* Payment links */}
      <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="border-b border-border px-6 py-4">
          <h2 className="text-sm font-black uppercase tracking-widest text-text">Links de Pagamento</h2>
          <p className="mt-0.5 text-xs text-text-muted">
            Compartilhe com seus clientes para que eles comprem diretamente.
          </p>
        </div>

        {!office ? (
          <div className="px-6 py-10 text-center text-sm text-text-muted">
            Você ainda não está vinculado a um escritório. Solicite ao administrador.
          </div>
        ) : services.length === 0 ? (
          <div className="px-6 py-10 text-center text-sm text-text-muted">Nenhum produto disponível.</div>
        ) : (
          <div className="divide-y divide-border">
            {Object.entries(grouped).map(([category, items]) => (
              <div key={category}>
                <div className="bg-bg-subtle px-6 py-2">
                  <p className="text-[10px] font-black uppercase tracking-widest text-text-muted">{category}</p>
                </div>
                {items.map((svc) => (
                  <div key={svc.id} className="flex items-center justify-between gap-4 px-6 py-4 hover:bg-bg-subtle/50 transition-colors">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-text truncate">{svc.name}</p>
                      <p className="mt-0.5 truncate font-mono text-[11px] text-text-muted">
                        {checkoutUrl(svc.slug)}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <span className="text-sm font-black text-primary">
                        US$ {Number(svc.price).toFixed(2)}
                      </span>
                      <CopyButton text={checkoutUrl(svc.slug)} />
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent orders */}
      {orders.length > 0 && (
        <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
          <div className="border-b border-border px-6 py-4">
            <h2 className="text-sm font-black uppercase tracking-widest text-text">Últimas Vendas</h2>
          </div>
          <div className="divide-y divide-border">
            {orders.slice(0, 20).map((order) => (
              <div key={order.id} className="flex items-center justify-between gap-4 px-6 py-4">
                <div>
                  <p className="text-sm font-semibold text-text">{order.client_name || "Cliente"}</p>
                  <p className="text-xs text-text-muted mt-0.5">
                    {order.product_slug} · {new Date(order.created_at).toLocaleDateString("pt-BR")}
                  </p>
                </div>
                <span className="text-sm font-black text-success">
                  US$ {Number(order.total_price_usd).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, icon, color }: { label: string; value: string; icon: React.ReactNode; color: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl ${color}`}>
        {icon}
      </div>
      <p className="text-2xl font-black text-text">{value}</p>
      <p className="mt-1 text-xs font-semibold text-text-muted uppercase tracking-wider">{label}</p>
    </div>
  );
}
