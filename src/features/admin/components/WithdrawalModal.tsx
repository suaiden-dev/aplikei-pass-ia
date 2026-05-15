import { useState, useEffect } from "react";
import { Loader2, AlertCircle, DollarSign } from "lucide-react";
import { useT } from "../../../i18n";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
  Button, 
  Input, 
  Label, 
  Badge 
} from "../../../components/atoms";
import { useOfficePaymentSettings } from "../hooks/useOfficePaymentSettings";
import { useWithdrawals } from "../hooks/useWithdrawals";
import { toast } from "sonner";

interface WithdrawalModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableBalance: number;
  officeId: string;
  userId: string;
}

export function WithdrawalModal({
  isOpen,
  onClose,
  availableBalance,
  officeId,
  userId
}: WithdrawalModalProps) {
  const t = useT("admin");
  const { data: settings, isLoading: loadingSettings } = useOfficePaymentSettings(officeId);
  const { createWithdrawal, isCreating } = useWithdrawals(officeId);
  
  const [amount, setAmount] = useState<string>("");
  const [method, setMethod] = useState<'stripe' | 'zelle'>('stripe');
  const [paymentLink, setPaymentLink] = useState("");
  const [error, setError] = useState<string | null>(null);

  const validateAmount = (rawValue: string): string | null => {
    if (!rawValue.trim()) return null;
    const val = Number(rawValue);
    if (!Number.isFinite(val)) return "Please enter a valid amount.";
    if (val <= 0) return "Amount must be greater than zero.";
    if (val > availableBalance) return `Amount cannot be greater than available ($${availableBalance.toFixed(2)}).`;
    return null;
  };

  useEffect(() => {
    if (settings) {
      setMethod(settings.default_payout_method || 'stripe');
    }
  }, [settings]);

  const handleSubmit = async () => {
    const val = parseFloat(amount);
    const amountError = validateAmount(amount);
    if (amountError) {
      setError(amountError);
      return;
    }
    if (method === 'stripe' && !paymentLink) {
        toast.error("Please provide a Stripe payment link for this withdrawal.");
        return;
    }

    try {
      await createWithdrawal({
        office_id: officeId,
        amount: val,
        method,
        payment_link: method === 'stripe' ? paymentLink : undefined,
        status: 'pending'
      });
      onClose();
      setAmount("");
      setPaymentLink("");
    } catch (err) {
      // Error handled by hook
    }
  };

  const canWithdraw = !!settings;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden border-none bg-card shadow-2xl rounded-3xl">
        <div className="bg-primary/5 p-8 border-b border-border/50">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <DollarSign className="w-6 h-6" />
              </div>
              <DialogTitle className="text-2xl font-black uppercase tracking-tight text-text">
                {t?.overview?.admin_lawyer?.modals?.withdrawal?.title}
              </DialogTitle>
            </div>
            <DialogDescription className="text-sm font-medium text-text-muted leading-relaxed">
              {t?.overview?.admin_lawyer?.modals?.withdrawal?.description}
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-8 space-y-6 min-h-[300px]">
          {loadingSettings ? (
            <div className="flex flex-col items-center justify-center h-full py-12 gap-4">
              <Loader2 className="w-8 h-8 animate-spin text-primary opacity-20" />
              <p className="text-[10px] font-black uppercase tracking-widest text-text-muted opacity-40 italic">Verifying payout settings...</p>
            </div>
          ) : !canWithdraw ? (
            <div className="p-6 rounded-2xl bg-danger/5 border border-danger/20 flex flex-col items-center text-center gap-4 animate-in fade-in zoom-in duration-300">
              <div className="w-12 h-12 rounded-full bg-danger/10 flex items-center justify-center text-danger">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-black uppercase tracking-tight text-text">Payout Configuration Missing</p>
                <p className="text-xs font-medium text-text-muted leading-relaxed max-w-[280px]">
                  Please configure your **Payout Method** in your settings to request withdrawals.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="space-y-2">
                <div className="flex justify-between items-end">
                    <Label className="text-xs font-black uppercase tracking-widest text-text-muted opacity-60">
                        {t.overview.admin_lawyer.modals.withdrawal.amountLabel}
                    </Label>
                    <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full uppercase">
                        Available: ${availableBalance.toFixed(2)}
                    </span>
                </div>
                <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted font-bold">$</span>
                    <Input
                        type="number"
                        placeholder="0.00"
                        value={amount}
                        onChange={(e) => {
                            const nextValue = e.target.value;
                            setAmount(nextValue);
                            setError(validateAmount(nextValue));
                        }}
                        min={0}
                        max={availableBalance}
                        step="0.01"
                        className={`pl-8 h-14 text-lg font-bold rounded-2xl bg-bg-subtle border-border focus:ring-primary/20 ${error ? 'border-danger focus:ring-danger/20' : ''}`}
                    />
                </div>
                {error && (
                    <p className="text-[10px] text-danger font-black uppercase tracking-tight flex items-center gap-1 mt-1">
                        <AlertCircle className="w-3 h-3" /> {error}
                    </p>
                )}
              </div>

              <div className="space-y-3">
                <Label className="text-xs font-black uppercase tracking-widest text-text-muted opacity-60">
                    {t.overview.admin_lawyer.modals.withdrawal.methodLabel}
                </Label>
                <div className="grid grid-cols-1 gap-3">
                    {method === 'stripe' ? (
                        <div
                            className="p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 border-primary bg-primary/5 shadow-lg shadow-primary/10"
                        >
                            <Badge className="uppercase text-[9px] tracking-widest font-black bg-primary text-white">Stripe</Badge>
                            <p className="text-xs font-bold text-primary">Credit Card / PIX</p>
                        </div>
                    ) : (
                        <div
                            className="p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 border-info bg-info/5 shadow-lg shadow-info/10"
                        >
                            <Badge className="uppercase text-[9px] tracking-widest font-black bg-info text-white">Zelle</Badge>
                            <p className="text-xs font-bold text-info">Direct Transfer</p>
                        </div>
                    )}
                </div>
              </div>

              {method === 'stripe' && (
                <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                    <Label className="text-xs font-black uppercase tracking-widest text-text-muted opacity-60">
                        {t.overview.admin_lawyer.modals.withdrawal.paymentLinkLabel}
                    </Label>
                    <Input
                        placeholder="https://buy.stripe.com/..."
                        value={paymentLink}
                        onChange={(e) => setPaymentLink(e.target.value)}
                        className="h-12 text-sm font-medium rounded-xl bg-bg-subtle border-border focus:ring-primary/20"
                    />
                    <p className="text-[10px] text-text-muted font-medium italic opacity-70 leading-tight">
                        {t.overview.admin_lawyer.modals.withdrawal.paymentLinkHint}
                    </p>
                </div>
              )}

              {method === 'zelle' && (
                <div className="p-4 rounded-xl bg-info/5 border border-info/10 space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="flex items-center gap-2 text-info">
                    <AlertCircle className="w-4 h-4" />
                    <p className="text-xs font-bold uppercase tracking-tight">
                        {t.overview.admin_lawyer.modals.withdrawal.zelleConfirmation}
                    </p>
                  </div>
                  <p className="text-[11px] text-text-muted font-medium leading-relaxed">
                    {t.overview.admin_lawyer.modals.withdrawal.zelleRecipientHint} <br/>
                    <span className="text-text font-bold">
                        {settings.zelle_name || t.overview.admin_lawyer.modals.withdrawal.zelleNameNotSet}
                    </span><br/>
                    <span className="text-text font-bold">
                        {settings.zelle_identifier || t.overview.admin_lawyer.modals.withdrawal.zelleIdNotSet}
                    </span>
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="p-8 bg-bg-subtle/50 border-t border-border/50 gap-3 sm:justify-between items-center">
          <Button
            variant="ghost"
            onClick={onClose}
            className="font-bold uppercase text-xs tracking-widest text-text-muted hover:text-text"
          >
            {t.shared.cancel}
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loadingSettings || !canWithdraw || isCreating || !amount || parseFloat(amount) <= 0 || !!error || (method === 'stripe' && !paymentLink)}
            className="h-12 px-8 rounded-xl font-black uppercase text-xs tracking-widest shadow-xl shadow-primary/20"
          >
            {isCreating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            {t.overview.admin_lawyer.modals.withdrawal.confirmBtn}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
