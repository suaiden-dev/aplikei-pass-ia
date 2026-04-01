import { Navigate, Link } from "react-router-dom";
import { useLanguage } from "@/i18n/LanguageContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/presentation/components/atoms/card";
import {
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
  CreditCard,
  Landmark,
  Wallet,
  FileText,
} from "lucide-react";
import { motion } from "framer-motion";
import { RadioGroup, RadioGroupItem } from "@/presentation/components/atoms/radio-group";
import { useNavigate } from "react-router-dom";
import { ZellePaymentModal } from "@/presentation/components/organisms/checkout/ZellePaymentModal";
import UrgencyBanner from "@/presentation/components/molecules/UrgencyBanner";
import CheckoutSummary from "@/presentation/components/molecules/CheckoutSummary";
import { Button } from "@/presentation/components/atoms/button";
import { Label } from "@/presentation/components/atoms/label";
import { 
  FormInput, 
  FormSelect, 
  FormCheckbox, 
  FormPhoneInput 
} from "@/presentation/components/atoms/form/FormFields";
import { useCheckout } from "@/presentation/hooks/useCheckout";

export default function Checkout() {
  const navigate = useNavigate();
  const { lang, t } = useLanguage();
  
  const {
    slug,
    service,
    formData,
    handleInputChange,
    handleSubmit,
    isProcessing,
    isLoggedIn,
    totalPrice,
    setTotalPrice,
    isZelleModalOpen,
    setIsZelleModalOpen,
    zelleOrderId,
    contractAccepted,
    setContractAccepted,
    uploadedDocsUrls,
    isUploadingDocs,
    selectedIds,
    setPaymentMethod,
    setDependents,
    amountOverride
  } = useCheckout();

  if (!service) return <Navigate to="/servicos" replace />;

  return (
    <div className="min-h-screen bg-muted/30 pb-12 md:pb-20">
      <UrgencyBanner />
      <div className="container max-w-5xl pt-12 md:pt-20">
        <div className="grid gap-5 lg:grid-cols-3">
          {/* Form Side */}
          <div className="lg:col-span-2 space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h1 className="font-display text-title-xl font-bold text-foreground">
                Finalizar Contratação
              </h1>
              <p className="mt-2 text-muted-foreground">
                Complete seus dados para iniciar o processo do seu visto.
              </p>
            </motion.div>

            <Card className="border-border shadow-md">
              <CardHeader>
                <CardTitle className="text-subtitle">Informações Pessoais</CardTitle>
                <CardDescription>
                  Estes dados serão usados para sua conta e processamento do
                  serviço.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form
                  id="checkout-form"
                  onSubmit={handleSubmit}
                  className="space-y-4"
                >
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormInput 
                      label="Nome Completo"
                      id="name"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                      readOnly={isLoggedIn}
                      className={isLoggedIn ? "bg-muted" : ""}
                    />
                    
                    <FormInput 
                      label="E-mail"
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      readOnly={isLoggedIn}
                      className={isLoggedIn ? "bg-muted" : ""}
                      hint={isLoggedIn ? "Logado como sua conta atual" : undefined}
                    />

                    <FormPhoneInput 
                      label="Telefone / WhatsApp"
                      id="phone"
                      value={formData.phone}
                      onChange={(value) =>
                        handleInputChange({ target: { name: "phone", value } } as any)
                      }
                      required
                    />

                    <FormSelect 
                      label="Número de Dependentes"
                      id="dependents"
                      value={formData.dependents}
                      onValueChange={setDependents}
                      placeholder="Selecione a quantidade"
                      options={[
                        { value: "0", label: "0" },
                        { value: "1", label: "1 Dependente" },
                        { value: "2", label: "2 Dependentes" },
                        { value: "3", label: "3 Dependentes" },
                        { value: "4", label: "4 Dependentes" },
                        { value: "5", label: "5 Dependentes" },
                      ]}
                    />
                  </div>
                </form>
              </CardContent>
            </Card>

            <Card className="border-border shadow-md overflow-hidden">
              <CardHeader className="bg-muted/30">
                <CardTitle className="text-subtitle flex items-center gap-2">
                  <FileText className="h-5 w-5 text-accent" />
                  Assinatura e Termos de Contrato
                </CardTitle>
                <CardDescription>
                  Para prosseguir, aceite os termos do contrato.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                <FormCheckbox 
                  id="terms"
                  checked={contractAccepted}
                  onCheckedChange={(checked) => setContractAccepted(checked === true)}
                  className="bg-muted/20 p-4 rounded-md border border-border/50"
                  label="Li e concordo com a comprovação de identidade e com os Termos e Condições do serviço."
                  description="Ao confirmar, declaro que as imagens enviadas são autênticas e atestam a veracidade desta assinatura eletrônica. O envio compõe o aceite dos termos legais do contrato de prestação de serviços."
                />
              </CardContent>
            </Card>

            <Card className="border-border shadow-md overflow-hidden">
              <CardHeader className="bg-muted/30">
                <CardTitle className="text-subtitle flex items-center gap-2">
                  <Wallet className="h-5 w-5 text-accent" />
                  Método de Pagamento
                </CardTitle>
                <CardDescription>
                  Escolha como deseja realizar o pagamento seguro.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <RadioGroup
                  value={formData.paymentMethod}
                  onValueChange={setPaymentMethod}
                  className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
                >
                  <PaymentMethodOption 
                    id="stripe" 
                    value="stripe" 
                    icon={<CreditCard className="mb-3 h-6 w-6" />} 
                    label="Stripe" 
                    sub="Cartão (USD)" 
                  />
                  <PaymentMethodOption 
                    id="stripe_pix" 
                    value="stripe_pix" 
                    icon={<div className="mb-3 h-6 w-6 flex items-center justify-center font-bold text-xs bg-primary text-white rounded-sm">PIX</div>} 
                    label="Stripe PIX" 
                    sub="Pagamento (BRL)" 
                  />
                  <PaymentMethodOption 
                    id="zelle" 
                    value="zelle" 
                    icon={<Landmark className="mb-3 h-6 w-6" />} 
                    label="Zelle" 
                    sub="Transfer (USD)" 
                  />
                  <PaymentMethodOption 
                    id="parcelow" 
                    value="parcelow" 
                    icon={<CreditCard className="mb-3 h-6 w-6 text-blue-500" />} 
                    label="Parcelow" 
                    sub="Parcelamento (BRL)" 
                  />
                </RadioGroup>

                {formData.paymentMethod === "parcelow" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="mt-4 space-y-4 pt-4 border-t border-border"
                  >
                    <div className="space-y-4">
                      <h3 className="font-semibold text-sm">Opção Parcelow</h3>
                      <RadioGroup
                        value={formData.parcelowSubMethod}
                        onValueChange={(value) =>
                          handleInputChange({ target: { name: "parcelowSubMethod", value } } as any)
                        }
                        className="flex flex-wrap gap-4"
                      >
                        <RadioOption id="pc_credit" value="credit_card" label="Cartão (Parcelado)" />
                        <RadioOption id="pc_pix" value="pix" label="PIX" />
                        <RadioOption id="pc_ted" value="ted" label="TED" />
                      </RadioGroup>
                    </div>

                    {formData.parcelowSubMethod === "credit_card" && (
                      <>
                        <div className="space-y-3 pt-2">
                          <Label className="text-sm font-medium">
                            Você vai pagar com cartão de terceiros?
                          </Label>
                          <RadioGroup
                            value={formData.isAlternativePayer ? "yes" : "no"}
                            onValueChange={(value) =>
                              handleInputChange({ target: { name: "isAlternativePayer", value: value === "yes" } } as any)
                            }
                            className="flex gap-4"
                          >
                            <RadioOption id="alt_no" value="no" label="Não" />
                            <RadioOption id="alt_yes" value="yes" label="Sim" />
                          </RadioGroup>
                        </div>

                        {formData.isAlternativePayer && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="grid gap-4 sm:grid-cols-2 bg-muted/40 p-4 rounded-md border border-border mt-2"
                          >
                            <FormInput 
                              label="Nome Completo"
                              id="payerName"
                              name="payerName"
                              required
                              value={formData.payerName}
                              onChange={handleInputChange}
                            />
                            <FormInput 
                              label="E-mail"
                              id="payerEmail"
                              name="payerEmail"
                              type="email"
                              required
                              value={formData.payerEmail}
                              onChange={handleInputChange}
                            />
                            <FormInput 
                              label="CPF"
                              id="payerCpf"
                              name="payerCpf"
                              required
                              value={formData.payerCpf}
                              onChange={handleInputChange}
                            />
                            <FormPhoneInput 
                              label="Telefone"
                              id="payerPhone"
                              value={formData.payerPhone}
                              onChange={(value) =>
                                handleInputChange({ target: { name: "payerPhone", value } } as any)
                              }
                              required
                            />
                          </motion.div>
                        )}
                      </>
                    )}

                    {!formData.isAlternativePayer && (
                      <FormInput 
                        label="Seu CPF"
                        id="cpf"
                        name="cpf"
                        required
                        value={formData.cpf}
                        onChange={handleInputChange}
                        hint="O CPF é estritamente necessário para pagamentos via gateway brasileiro."
                      />
                    )}
                  </motion.div>
                )}
              </CardContent>
              <CardFooter className="bg-muted/10 border-t flex-col gap-3 py-4">
                <Button
                  form="checkout-form"
                  type="submit"
                  size="lg"
                  className="w-full bg-accent text-accent-foreground shadow-button hover:bg-green-dark"
                  disabled={isProcessing || !contractAccepted}
                >
                  {isProcessing
                    ? isUploadingDocs
                      ? "Enviando Documentos..."
                      : "Processando..."
                    : `Finalizar com ${formData.paymentMethod === "stripe" ? "Stripe" : formData.paymentMethod === "stripe_pix" ? "Stripe PIX" : formData.paymentMethod === "zelle" ? "Zelle" : "Parcelow"}`}{" "}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <div className="flex items-center gap-2 text-[10px] text-muted-foreground uppercase tracking-wider">
                  <ShieldCheck className="h-3 w-3" />
                  Ambiente 256-bit SSL Criptografado
                </div>
              </CardFooter>
            </Card>
          </div>

          {/* Sidebar / Summary */}
          <div className="lg:col-span-1 space-y-4">
            <CheckoutSummary 
              selectedIds={selectedIds}
              lang={lang}
              onPriceVerified={setTotalPrice}
              overrideTotal={amountOverride}
            />

            <div className="p-4 rounded-md bg-amber-50 border border-amber-200 text-xs text-amber-800">
              <p className="leading-relaxed">
                <strong>Atenção:</strong> Ao clicar em "Confirmar e Continuar",
                você declara estar ciente de que a Aplikei não é um escritório
                de advocacia e não garante a aprovação do visto.
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
        contractSelfieUrl={uploadedDocsUrls.selfie}
        termsAcceptedAt={uploadedDocsUrls.termsAcceptedAt}
        visaOrderId={zelleOrderId ?? undefined}
        onSuccess={(zelleData) => {
          setIsZelleModalOpen(false);
          navigate("/checkout-success?status=pending", {
            state: { zelleData },
          });
        }}
      />
    </div>
  );
}

function PaymentMethodOption({ id, value, icon, label, sub }: { id: string; value: string; icon: React.ReactNode; label: string; subText?: string; sub?: string }) {
  return (
    <div>
      <RadioGroupItem value={value} id={id} className="peer sr-only" />
      <Label
        htmlFor={id}
        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-accent [&:has([data-state=checked])]:border-accent cursor-pointer transition-all h-full"
      >
        {icon}
        <span className="font-semibold">{label}</span>
        <span className="text-[10px] text-muted-foreground mt-1 text-center">
          {sub}
        </span>
      </Label>
    </div>
  );
}

function RadioOption({ id, value, label }: { id: string; value: string; label: string }) {
  return (
    <div className="flex items-center space-x-2">
      <RadioGroupItem value={value} id={id} />
      <Label htmlFor={id} className="cursor-pointer">
        {label}
      </Label>
    </div>
  );
}
