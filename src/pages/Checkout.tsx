import { useParams, Navigate } from "react-router-dom";
import { useState } from "react";
import { useLanguage } from "@/i18n/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, ShieldCheck, ArrowRight, CreditCard, Landmark, Wallet } from "lucide-react";
import { motion } from "framer-motion";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    RadioGroup,
    RadioGroupItem
} from "@/components/ui/radio-group";
import { supabase } from "@/integrations/supabase/client";
import { calculateCardAmountWithFees, calculateUSDToPixFinalBRL, getExchangeRate } from "@/lib/stripe/stripeFeeCalculator";
import { useEffect } from "react";
import { ZellePaymentModal } from "@/components/checkout/ZellePaymentModal";
import { useNavigate } from "react-router-dom";


export default function Checkout() {
    const { slug } = useParams<{ slug: string }>();
    const { lang, t } = useLanguage();

    const service = t.servicesData.find((s) => s.slug === slug);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        dependents: "0",
        paymentMethod: "stripe",
        cpf: "",
        parcelowSubMethod: "credit_card",
        isAlternativePayer: false,
        payerName: "",
        payerEmail: "",
        payerCpf: "",
        payerPhone: "",
    });
    const [isProcessing, setIsProcessing] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    const [exchangeRate, setExchangeRate] = useState<number | null>(null);
    const [isZelleModalOpen, setIsZelleModalOpen] = useState(false);
    const navigate = useNavigate();


    useEffect(() => {
        const loadInitialData = async () => {
            // 1. Tentar carregar do localStorage primeiro
            const savedData = localStorage.getItem("aplikei_checkout_data");
            if (savedData) {
                try {
                    const parsed = JSON.parse(savedData);
                    setFormData(prev => ({ ...prev, ...parsed }));
                } catch (e) {
                    console.error("Erro ao carregar cache do formulário", e);
                }
            }

            // 2. Verificar sessão do usuário
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
                setIsLoggedIn(true);
                setFormData(prev => ({ ...prev, email: session.user.email || prev.email }));

                const { data: profile } = await supabase
                    .from('profiles' as any)
                    .select('full_name, phone')
                    .eq('id', session.user.id)
                    .maybeSingle();

                if (profile) {
                    const profileData = profile as any;
                    setFormData(prev => ({
                        ...prev,
                        name: profileData.full_name || prev.name,
                        phone: profileData.phone || prev.phone,
                    }));
                }
            }
        };

        const loadExchangeRate = async () => {
            const rate = await getExchangeRate();
            setExchangeRate(rate);
        };

        loadInitialData();
        loadExchangeRate();
    }, []);

    // Salvar no localStorage sempre que o formData mudar
    useEffect(() => {
        localStorage.setItem("aplikei_checkout_data", JSON.stringify(formData));
    }, [formData]);


    if (!service) return <Navigate to="/servicos" replace />;

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsProcessing(true);

        try {
            if (formData.paymentMethod === "stripe" || formData.paymentMethod === "stripe_pix") {
                console.log("Iniciando checkout Stripe para:", service.title[lang], formData);

                const { data: { session: currentSession } } = await supabase.auth.getSession();

                const { data, error } = await supabase.functions.invoke('stripe-checkout', {
                    body: {
                        slug,
                        email: formData.email,
                        fullName: formData.name,
                        phone: formData.phone,
                        dependents: parseInt(formData.dependents) || 0,
                        origin_url: window.location.origin,
                        paymentMethod: formData.paymentMethod === 'stripe_pix' ? 'pix' : 'card'
                    },
                    headers: {
                        Authorization: `Bearer ${currentSession?.access_token}`
                    }
                });

                if (error) throw error;
                if (data?.url) {
                    window.location.href = data.url;
                } else {
                    throw new Error("Não foi possível gerar a sessão de pagamento.");
                }
            } else if (formData.paymentMethod === "zelle") {
                setIsZelleModalOpen(true);
            } else if (formData.paymentMethod === "parcelow") {
                console.log("Iniciando checkout Parcelow para:", service.title[lang], formData);

                const payerInfo = formData.isAlternativePayer ? {
                    name: formData.payerName,
                    email: formData.payerEmail,
                    cpf: formData.payerCpf,
                    phone: formData.payerPhone
                } : null;

                const { data, error } = await supabase.functions.invoke('create-parcelow-checkout', {
                    body: {
                        slug,
                        email: formData.email,
                        fullName: formData.name,
                        phone: formData.phone,
                        dependents: parseInt(formData.dependents) || 0,
                        cpf: formData.cpf,
                        paymentMethod: formData.parcelowSubMethod,
                        payerInfo,
                        origin_url: window.location.origin
                    }
                });

                if (error) throw error;
                if (data?.checkoutUrl) {
                    // Opcionalmente limpar aqui, mas melhor manter se o usuário voltar
                    // localStorage.removeItem("aplikei_checkout_data");
                    window.location.href = data.checkoutUrl;
                } else {
                    throw new Error("Não foi possível gerar a sessão do Parcelow.");
                }
            }

        } catch (err) {
            console.error("Erro no checkout:", err);
            alert("Houve um erro ao processar o seu pedido. Por favor, tente novamente.");
        } finally {
            setIsProcessing(false);
        }
    };

    const numDependents = parseInt(formData.dependents) || 0;
    const basePrice = (service as any).basePrice || 0;
    const depPrice = (service as any).depPrice || 0;
    const subtotal = basePrice + (numDependents * depPrice);

    // Calculate final price with fees if Stripe is selected
    const isPix = formData.paymentMethod === 'stripe_pix';
    const isStripe = formData.paymentMethod === 'stripe' || isPix;

    // Use dynamic exchange rate or fallback 5.60
    const currentExchangeRate = exchangeRate || 5.60;

    const totalPrice = isPix
        ? calculateUSDToPixFinalBRL(subtotal, currentExchangeRate)
        : isStripe
            ? calculateCardAmountWithFees(subtotal)
            : subtotal;

    // Fees calculation
    // If it's PIX, fees = total - (subtotal_in_brl_without_markup?) 
    // BUT the documentation says we apply 4% markup TO the base rate.
    // So the "base rate" with protection is our standard.
    // Fees are actually the Stripe PIX processing fee (1.19% + 0.6% FX) + IOF (3.5%)
    const fees = totalPrice - (isPix ? (subtotal * currentExchangeRate) : subtotal);

    const formatCurrency = (value: number, currency: string = 'USD') => {
        return new Intl.NumberFormat(currency === 'BRL' ? 'pt-BR' : 'en-US', {
            style: 'currency',
            currency: currency,
        }).format(value);
    };

    return (
        <div className="min-h-screen bg-muted/30 py-12 md:py-20">
            <div className="container max-w-5xl">
                <div className="grid gap-8 lg:grid-cols-3">

                    {/* Form Side */}
                    <div className="lg:col-span-2 space-y-6">
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                            <h1 className="font-display text-3xl font-bold text-foreground">Finalizar Contratação</h1>
                            <p className="mt-2 text-muted-foreground">Complete seus dados para iniciar o processo do seu visto.</p>
                        </motion.div>

                        <Card className="border-border shadow-md">
                            <CardHeader>
                                <CardTitle className="text-xl">Informações Pessoais</CardTitle>
                                <CardDescription>Estes dados serão usados para sua conta e processamento do serviço.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form id="checkout-form" onSubmit={handleSubmit} className="space-y-4">
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="name">Nome Completo</Label>
                                            <Input
                                                id="name"
                                                name="name"
                                                required
                                                value={formData.name}
                                                onChange={handleInputChange}
                                                readOnly={isLoggedIn}
                                                className={isLoggedIn ? "bg-muted" : ""}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="email">E-mail</Label>
                                            <Input
                                                id="email"
                                                name="email"
                                                type="email"
                                                required
                                                value={formData.email}
                                                onChange={handleInputChange}
                                                readOnly={isLoggedIn}
                                                className={isLoggedIn ? "bg-muted" : ""}
                                            />
                                            {isLoggedIn && (
                                                <p className="text-[10px] text-primary font-bold">Logado como sua conta atual</p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="phone">Telefone / WhatsApp</Label>
                                            <Input
                                                id="phone"
                                                name="phone"
                                                required
                                                value={formData.phone}
                                                onChange={handleInputChange}
                                                readOnly={isLoggedIn && !!formData.phone}
                                                className={isLoggedIn && !!formData.phone ? "bg-muted" : ""}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="dependents">Número de Dependentes</Label>
                                            <Select
                                                value={formData.dependents}
                                                onValueChange={(value) => setFormData(prev => ({ ...prev, dependents: value }))}
                                            >
                                                <SelectTrigger id="dependents">
                                                    <SelectValue placeholder="Selecione a quantidade de dependentes" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="0">0</SelectItem>
                                                    <SelectItem value="1">1 Dependente</SelectItem>
                                                    <SelectItem value="2">2 Dependentes</SelectItem>
                                                    <SelectItem value="3">3 Dependentes</SelectItem>
                                                    <SelectItem value="4">4 Dependentes</SelectItem>
                                                    <SelectItem value="5">5 Dependentes</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>

                        <Card className="border-border shadow-md overflow-hidden">
                            <CardHeader className="bg-muted/30">
                                <CardTitle className="text-xl flex items-center gap-2">
                                    <Wallet className="h-5 w-5 text-accent" />
                                    Método de Pagamento
                                </CardTitle>
                                <CardDescription>Escolha como deseja realizar o pagamento seguro.</CardDescription>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <RadioGroup
                                    value={formData.paymentMethod}
                                    onValueChange={(value) => setFormData(prev => ({ ...prev, paymentMethod: value }))}
                                    className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
                                >
                                    <div>
                                        <RadioGroupItem value="stripe" id="stripe" className="peer sr-only" />
                                        <Label
                                            htmlFor="stripe"
                                            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-accent [&:has([data-state=checked])]:border-accent cursor-pointer transition-all h-full"
                                        >
                                            <CreditCard className="mb-3 h-6 w-6" />
                                            <span className="font-semibold">Stripe</span>
                                            <span className="text-[10px] text-muted-foreground mt-1 text-center">Cartão (USD)</span>
                                        </Label>
                                    </div>
                                    <div>
                                        <RadioGroupItem value="stripe_pix" id="stripe_pix" className="peer sr-only" />
                                        <Label
                                            htmlFor="stripe_pix"
                                            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-accent [&:has([data-state=checked])]:border-accent cursor-pointer transition-all h-full"
                                        >
                                            <div className="mb-3 h-6 w-6 flex items-center justify-center font-bold text-xs bg-[#32bcad] text-white rounded-sm">PIX</div>
                                            <span className="font-semibold">Stripe PIX</span>
                                            <span className="text-[10px] text-muted-foreground mt-1 text-center">Pagamento (BRL)</span>
                                        </Label>
                                    </div>
                                    <div>
                                        <RadioGroupItem value="zelle" id="zelle" className="peer sr-only" />
                                        <Label
                                            htmlFor="zelle"
                                            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-accent [&:has([data-state=checked])]:border-accent cursor-pointer transition-all h-full"
                                        >
                                            <Landmark className="mb-3 h-6 w-6" />
                                            <span className="font-semibold">Zelle</span>
                                            <span className="text-[10px] text-muted-foreground mt-1 text-center">Transfer (USD)</span>
                                        </Label>
                                    </div>
                                    <div>
                                        <RadioGroupItem value="parcelow" id="parcelow" className="peer sr-only" />
                                        <Label
                                            htmlFor="parcelow"
                                            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-accent [&:has([data-state=checked])]:border-accent cursor-pointer transition-all h-full"
                                        >
                                            <CreditCard className="mb-3 h-6 w-6 text-blue-500" />
                                            <span className="font-semibold">Parcelow</span>
                                            <span className="text-[10px] text-muted-foreground mt-1 text-center">Parcelamento (BRL)</span>
                                        </Label>
                                    </div>
                                </RadioGroup>

                                {formData.paymentMethod === 'parcelow' && (
                                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-6 space-y-4 pt-6 border-t border-border">
                                        <div className="space-y-4">
                                            <h3 className="font-semibold text-sm">Opção Parcelow</h3>
                                            <RadioGroup
                                                value={formData.parcelowSubMethod}
                                                onValueChange={(value) => setFormData(prev => ({ ...prev, parcelowSubMethod: value }))}
                                                className="flex flex-wrap gap-4"
                                            >
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="credit_card" id="pc_credit" />
                                                    <Label htmlFor="pc_credit" className="cursor-pointer">Cartão (Parcelado)</Label>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="pix" id="pc_pix" />
                                                    <Label htmlFor="pc_pix" className="cursor-pointer">PIX</Label>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="ted" id="pc_ted" />
                                                    <Label htmlFor="pc_ted" className="cursor-pointer">TED</Label>
                                                </div>
                                            </RadioGroup>
                                        </div>

                                        {formData.parcelowSubMethod === 'credit_card' && (
                                            <>
                                                <div className="space-y-3 pt-2">
                                                    <Label className="text-sm font-medium">Você vai pagar com cartão de terceiros?</Label>
                                                    <RadioGroup
                                                        value={formData.isAlternativePayer ? "yes" : "no"}
                                                        onValueChange={(value) => setFormData(prev => ({ ...prev, isAlternativePayer: value === "yes" }))}
                                                        className="flex gap-4"
                                                    >
                                                        <div className="flex items-center space-x-2">
                                                            <RadioGroupItem value="no" id="alt_no" />
                                                            <Label htmlFor="alt_no" className="cursor-pointer">Não</Label>
                                                        </div>
                                                        <div className="flex items-center space-x-2">
                                                            <RadioGroupItem value="yes" id="alt_yes" />
                                                            <Label htmlFor="alt_yes" className="cursor-pointer">Sim</Label>
                                                        </div>
                                                    </RadioGroup>
                                                </div>

                                                {formData.isAlternativePayer && (
                                                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="grid gap-4 sm:grid-cols-2 bg-muted/40 p-4 rounded-lg border border-border mt-2">
                                                        <div className="space-y-2">
                                                            <Label htmlFor="payerName">Nome Completo</Label>
                                                            <Input
                                                                id="payerName"
                                                                name="payerName"
                                                                required={formData.isAlternativePayer}
                                                                value={formData.payerName}
                                                                onChange={handleInputChange}
                                                            />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label htmlFor="payerEmail">E-mail</Label>
                                                            <Input
                                                                id="payerEmail"
                                                                name="payerEmail"
                                                                type="email"
                                                                required={formData.isAlternativePayer}
                                                                value={formData.payerEmail}
                                                                onChange={handleInputChange}
                                                            />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label htmlFor="payerCpf">CPF</Label>
                                                            <Input
                                                                id="payerCpf"
                                                                name="payerCpf"
                                                                required={formData.isAlternativePayer}
                                                                value={formData.payerCpf}
                                                                onChange={handleInputChange}
                                                            />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label htmlFor="payerPhone">Telefone</Label>
                                                            <Input
                                                                id="payerPhone"
                                                                name="payerPhone"
                                                                required={formData.isAlternativePayer}
                                                                value={formData.payerPhone}
                                                                onChange={handleInputChange}
                                                            />
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </>
                                        )}

                                        {!formData.isAlternativePayer && (
                                            <div className="space-y-2">
                                                <Label htmlFor="cpf">Seu CPF <span className="text-red-500">*</span></Label>
                                                <Input
                                                    id="cpf"
                                                    name="cpf"
                                                    required={formData.paymentMethod === 'parcelow' && !formData.isAlternativePayer}
                                                    value={formData.cpf}
                                                    onChange={handleInputChange}
                                                />
                                                <p className="text-[10px] text-muted-foreground">O CPF é estritamente necessário para pagamentos via gateway brasileiro.</p>
                                            </div>
                                        )}
                                    </motion.div>
                                )}
                            </CardContent>
                            <CardFooter className="bg-muted/10 border-t flex-col gap-3 py-6">
                                <Button
                                    form="checkout-form"
                                    type="submit"
                                    size="lg"
                                    className="w-full bg-accent text-accent-foreground shadow-button hover:bg-green-dark"
                                    disabled={isProcessing}
                                >
                                    {isProcessing ? "Processando..." : `Finalizar com ${formData.paymentMethod === 'stripe' ? 'Stripe' : formData.paymentMethod === 'stripe_pix' ? 'Stripe PIX' : formData.paymentMethod === 'zelle' ? 'Zelle' : 'Parcelow'}`} <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                                <div className="flex items-center gap-2 text-[10px] text-muted-foreground uppercase tracking-wider">
                                    <ShieldCheck className="h-3 w-3" />
                                    Ambiente 256-bit SSL Criptografado
                                </div>
                            </CardFooter>
                        </Card>
                    </div>

                    {/* Sidebar / Summary */}
                    <div className="space-y-6">
                        <Card className="border-accent/30 shadow-md">
                            <CardHeader className="bg-accent/5">
                                <CardTitle className="text-lg">Resumo do Pedido</CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6 space-y-4">
                                <div className="flex justify-between items-start gap-4">
                                    <div>
                                        <p className="font-bold text-foreground">{service.title[lang]}</p>
                                        <p className="text-xs text-muted-foreground">{service.subtitle[lang]}</p>
                                    </div>
                                    <p className="font-display font-bold text-accent">{formatCurrency(basePrice, isPix ? 'BRL' : 'USD')}</p>
                                </div>

                                <div className="border-t border-border pt-4">
                                    <div className="flex justify-between text-sm mb-2">
                                        <span className="text-muted-foreground">Plano Base</span>
                                        <span className="font-medium">{formatCurrency(isPix ? basePrice * currentExchangeRate * 1.04 : basePrice, isPix ? 'BRL' : 'USD')}</span>
                                    </div>

                                    {numDependents > 0 && (
                                        <div className="flex justify-between text-sm mb-2">
                                            <span className="text-muted-foreground">Dependentes ({numDependents}x {formatCurrency(depPrice, isPix ? 'BRL' : 'USD')})</span>
                                            <span className="font-medium">+{formatCurrency(numDependents * (isPix ? depPrice * currentExchangeRate * 1.04 : depPrice), isPix ? 'BRL' : 'USD')}</span>
                                        </div>
                                    )}

                                    {isStripe && (
                                        <div className="flex justify-between text-sm mb-2">
                                            <span className="text-muted-foreground">Taxas de Processamento</span>
                                            <span className="font-medium">+{formatCurrency(fees, isPix ? 'BRL' : 'USD')}</span>
                                        </div>
                                    )}

                                    <div className="flex justify-between text-sm text-green-600 font-medium border-t border-border mt-2 pt-2">
                                        <span>Desconto Aplicado (50%)</span>
                                        <span>-{service.originalPrice[lang]}</span>
                                    </div>
                                </div>

                                <div className="border-t border-border pt-4 flex justify-between items-baseline">
                                    <span className="font-display font-bold text-lg">Total</span>
                                    <div className="text-right">
                                        <span className="font-display font-bold text-2xl text-accent block">{formatCurrency(totalPrice, isPix ? 'BRL' : 'USD')}</span>
                                        {isPix && <span className="text-[10px] text-muted-foreground">Câmbio: {formatCurrency(currentExchangeRate, 'BRL')} (incl. spread)</span>}
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="bg-muted/30 pt-4 flex-col items-start gap-3">
                                <p className="text-xs font-semibold text-foreground uppercase tracking-tight">O que você recebe:</p>
                                <ul className="space-y-2">
                                    <li className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <CheckCircle2 className="h-3 w-3 text-accent" /> Guia Digital Passo a Passo
                                    </li>
                                    <li className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <CheckCircle2 className="h-3 w-3 text-accent" /> Organizador de Documentos com IA
                                    </li>
                                    <li className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <CheckCircle2 className="h-3 w-3 text-accent" /> Suporte Operacional Plataforma
                                    </li>
                                </ul>
                            </CardFooter>
                        </Card>

                        <div className="p-4 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-800">
                            <p className="leading-relaxed">
                                <strong>Atenção:</strong> Ao clicar em "Confirmar e Continuar", você declara estar ciente de que a Aplikei não é um escritório de advocacia e não garante a aprovação do visto.
                            </p>
                        </div>
                    </div>

                </div>
            </div>

            <ZellePaymentModal
                isOpen={isZelleModalOpen}
                onClose={() => setIsZelleModalOpen(false)}
                amount={totalPrice}
                serviceSlug={slug || "service"}
                guestName={formData.name}
                guestEmail={formData.email}
                onSuccess={(zelleData) => {
                    setIsZelleModalOpen(false);
                    // Navega instantaneamente passando o arquivo no estado da rota
                    navigate("/checkout-success?status=pending", {
                        state: { zelleData }
                    });
                }}
            />
        </div>

    );
}
