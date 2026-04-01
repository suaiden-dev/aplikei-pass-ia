import { FormInput, FormRadioGroup, FormPhoneInput } from "@/presentation/components/atoms/form/FormFields";
import { StepProps } from "../../types";
import { Home, Mail, Phone, Smartphone, Briefcase, Globe, MapPin } from "lucide-react";

export const F1F2AddressPhoneStep = ({
  register,
  watch,
  setValue,
  lang,
  t,
}: StepProps) => {
  const ds = t.ds160;
  const ap = ds.addressPhone;
  const isMailingSameAsHome = watch("isMailingSameAsHome");
  const hasOtherPhoneLast5Years = watch("hasOtherPhoneLast5Years");
  const hasOtherEmailLast5Years = watch("hasOtherEmailLast5Years");

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col space-y-1.5 border-b border-border/50 pb-4">
        <h2 className="font-display text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <Home className="h-6 w-6 text-primary" />
          {t.f1f2.steps[lang][4]}
        </h2>
      </div>

      <div className="space-y-10">
        {/* Home Address Section */}
        <div className="space-y-6 rounded-3xl border border-border/50 p-6 bg-muted/20 relative overflow-hidden">
          <div className="absolute left-0 top-0 w-1 h-full bg-primary/30" />
          <h3 className="text-sm font-bold flex items-center gap-2 text-foreground mb-4">
            <MapPin className="h-4 w-4 text-primary" />
            {ap.homeAddress[lang]}
          </h3>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="md:col-span-2">
              <FormInput
                label={ap.addressLabel[lang]}
                {...register("homeAddress")}
                required
              />
            </div>
            <FormInput label={ap.city[lang]} {...register("homeCity")} required />
            <FormInput label={ap.state[lang]} {...register("homeState")} required />
            <FormInput
              label={ap.zip[lang]}
              {...register("homeZip")}
              required
              onChange={(e) => setValue("homeZip", e.target.value.replace(/[^0-9-]/g, ""))}
            />
            <FormInput label={ap.country[lang]} {...register("homeCountry")} required icon={<Globe className="h-4 w-4" />} />
          </div>
        </div>

        {/* Mailing Address Section */}
        <div className="space-y-6">
          <FormRadioGroup
            label={ap.mailingSame[lang]}
            value={isMailingSameAsHome}
            onValueChange={(val) => setValue("isMailingSameAsHome", val)}
            options={[
              { label: ap.yes[lang], value: "yes" },
              { label: ap.no[lang], value: "no" }
            ]}
            required
          />

          {isMailingSameAsHome === "no" && (
            <div className="p-6 bg-muted/20 rounded-3xl border border-border/50 animate-in slide-in-from-top-2 duration-300 space-y-6 relative overflow-hidden">
              <div className="absolute left-0 top-0 w-1 h-full bg-primary/30" />
              <h3 className="text-sm font-bold flex items-center gap-2 text-foreground mb-4">
                <Mail className="h-4 w-4 text-primary" />
                {ap.mailingAddressLabel[lang]}
              </h3>
              <FormInput label={ap.mailingAddressLabel[lang]} {...register("mailingAddress")} required />
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <FormInput label={ap.city[lang]} {...register("mailingCity")} required />
                <FormInput label={ap.state[lang]} {...register("mailingState")} required />
                <FormInput label={ap.zip[lang]} {...register("mailingZip")} required />
              </div>
            </div>
          )}
        </div>

        {/* Phone Section */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 pt-8 border-t border-border/50">
          <FormInput
            label={ap.mobilePhone[lang]}
            {...register("mobilePhone")}
            required
            icon={<Smartphone className="h-4 w-4" />}
            onChange={(e) => setValue("mobilePhone", e.target.value.replace(/[^0-9+\s-]/g, ""))}
          />
          <FormInput
            label={ap.homePhone[lang]}
            {...register("homePhone")}
            icon={<Phone className="h-4 w-4" />}
            onChange={(e) => setValue("homePhone", e.target.value.replace(/[^0-9+\s-]/g, ""))}
          />
          <FormInput
            label={ap.workPhone[lang]}
            {...register("workPhone")}
            icon={<Briefcase className="h-4 w-4" />}
            onChange={(e) => setValue("workPhone", e.target.value.replace(/[^0-9+\s-]/g, ""))}
          />
        </div>

        {/* Other Phone/Email Section */}
        <div className="space-y-10 pt-8 border-t border-border/50">
          <div className="space-y-6">
            <FormRadioGroup
              label={ap.otherPhone5Years[lang]}
              value={hasOtherPhoneLast5Years}
              onValueChange={(val) => setValue("hasOtherPhoneLast5Years", val)}
              options={[
                { label: ap.yes[lang], value: "yes" },
                { label: ap.no[lang], value: "no" }
              ]}
              required
            />
            {hasOtherPhoneLast5Years === "yes" && (
              <FormInput
                label={ap.otherPhonesLabel[lang]}
                {...register("otherPhonesDetails")}
                className="animate-in slide-in-from-top-2 duration-300"
                required
              />
            )}
          </div>

          <div className="space-y-6">
            <FormRadioGroup
              label={ap.otherEmail5Years[lang]}
              value={hasOtherEmailLast5Years}
              onValueChange={(val) => setValue("hasOtherEmailLast5Years", val)}
              options={[
                { label: ap.yes[lang], value: "yes" },
                { label: ap.no[lang], value: "no" }
              ]}
              required
            />
            {hasOtherEmailLast5Years === "yes" && (
              <FormInput
                label={ap.otherEmailsLabel[lang]}
                {...register("otherEmailsDetails")}
                className="animate-in slide-in-from-top-2 duration-300"
                required
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
