import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { StepProps } from "../../types";

export const AddressPhoneStep = ({
  register,
  watch,
  setValue,
  lang,
  t,
}: StepProps) => {
  const ds = t.ds160;
  const isMailingSameAsHome = watch("isMailingSameAsHome");
  const hasOtherPhoneLast5Years = watch("hasOtherPhoneLast5Years");
  const hasOtherEmailLast5Years = watch("hasOtherEmailLast5Years");

  return (
    <div className="space-y-4 fade-in">
      <h2 className="font-display text-lg font-semibold text-foreground">
        {ds.addressPhone.title[lang]}
      </h2>

      <div className="space-y-4 rounded-md border border-border p-4 bg-muted/30">
        <h3 className="text-md font-medium">
          {ds.addressPhone.homeAddress[lang]}
        </h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="md:col-span-2 space-y-2">
            <Label htmlFor="homeAddress">
              {lang === "pt" ? "Endereço:" : "Address:"} *
            </Label>
            <Input id="homeAddress" {...register("homeAddress")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="homeCity">{ds.addressPhone.city[lang]} *</Label>
            <Input
              id="homeCity"
              {...register("homeCity")}
              onChange={(e) =>
                setValue(
                  "homeCity",
                  e.target.value.replace(
                    /[^a-zA-ZáéíóúàèìòùâêîôûãõçÁÉÍÓÚÀÈÌÒÙÂÊÎÔÛÃÕÇ\s]/g,
                    "",
                  ),
                )
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="homeState">{ds.addressPhone.state[lang]} *</Label>
            <Input
              id="homeState"
              {...register("homeState")}
              onChange={(e) =>
                setValue(
                  "homeState",
                  e.target.value.replace(
                    /[^a-zA-ZáéíóúàèìòùâêîôûãõçÁÉÍÓÚÀÈÌÒÙÂÊÎÔÛÃÕÇ\s]/g,
                    "",
                  ),
                )
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="homeZip">{ds.addressPhone.zip[lang]} *</Label>
            <Input
              id="homeZip"
              {...register("homeZip")}
              maxLength={10}
              onChange={(e) => {
                const value = e.target.value.replace(/[^0-9-]/g, "");
                setValue("homeZip", value);
              }}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="homeCountry">
              {ds.addressPhone.country[lang]} *
            </Label>
            <Input
              id="homeCountry"
              {...register("homeCountry")}
              onChange={(e) =>
                setValue(
                  "homeCountry",
                  e.target.value.replace(
                    /[^a-zA-ZáéíóúàèìòùâêîôûãõçÁÉÍÓÚÀÈÌÒÙÂÊÎÔÛÃÕÇ\s]/g,
                    "",
                  ),
                )
              }
            />
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <Label>{ds.addressPhone.mailingSame[lang]} *</Label>
        <RadioGroup
          onValueChange={(val) => setValue("isMailingSameAsHome", val)}
          value={isMailingSameAsHome}
          className="flex gap-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="yes" id="mailing-yes" />
            <Label htmlFor="mailing-yes">{lang === "pt" ? "Sim" : "Yes"}</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="no" id="mailing-no" />
            <Label htmlFor="mailing-no">{lang === "pt" ? "Não" : "No"}</Label>
          </div>
        </RadioGroup>
        {isMailingSameAsHome === "no" && (
          <div className="mt-2 space-y-4 bg-muted/20 p-4 rounded-md border border-dashed border-border scale-in-center">
            <div className="space-y-2">
              <Label htmlFor="mailingAddress">
                {lang === "pt"
                  ? "Endereço de correspondência:"
                  : "Mailing address:"}{" "}
                *
              </Label>
              <Input id="mailingAddress" {...register("mailingAddress")} />
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="mailingCity">
                  {ds.addressPhone.city[lang]} *
                </Label>
                <Input
                  id="mailingCity"
                  {...register("mailingCity")}
                  onChange={(e) =>
                    setValue(
                      "mailingCity",
                      e.target.value.replace(
                        /[^a-zA-ZáéíóúàèìòùâêîôûãõçÁÉÍÓÚÀÈÌÒÙÂÊÎÔÛÃÕÇ\s]/g,
                        "",
                      ),
                    )
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mailingState">
                  {ds.addressPhone.state[lang]} *
                </Label>
                <Input
                  id="mailingState"
                  {...register("mailingState")}
                  onChange={(e) =>
                    setValue(
                      "mailingState",
                      e.target.value.replace(
                        /[^a-zA-ZáéíóúàèìòùâêîôûãõçÁÉÍÓÚÀÈÌÒÙÂÊÎÔÛÃÕÇ\s]/g,
                        "",
                      ),
                    )
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mailingZip">
                  {ds.addressPhone.zip[lang]} *
                </Label>
                <Input id="mailingZip" {...register("mailingZip")} />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 border-t border-border pt-4">
        <div className="space-y-2">
          <Label htmlFor="mobilePhone">
            {ds.addressPhone.mobilePhone[lang]} *
          </Label>
          <Input
            id="mobilePhone"
            {...register("mobilePhone")}
            onChange={(e) =>
              setValue("mobilePhone", e.target.value.replace(/[^0-9+\s-]/g, ""))
            }
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="homePhone">{ds.addressPhone.homePhone[lang]}</Label>
          <Input
            id="homePhone"
            {...register("homePhone")}
            onChange={(e) =>
              setValue("homePhone", e.target.value.replace(/[^0-9+\s-]/g, ""))
            }
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="workPhone">{ds.addressPhone.workPhone[lang]}</Label>
          <Input
            id="workPhone"
            {...register("workPhone")}
            onChange={(e) =>
              setValue("workPhone", e.target.value.replace(/[^0-9+\s-]/g, ""))
            }
          />
        </div>
      </div>

      <div className="space-y-4 border-t border-border pt-4">
        <div className="space-y-3">
          <Label>{ds.addressPhone.otherPhone5Years[lang]} *</Label>
          <RadioGroup
            onValueChange={(val) => setValue("hasOtherPhoneLast5Years", val)}
            value={hasOtherPhoneLast5Years}
            className="flex gap-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="yes" id="other-phone-yes" />
              <Label htmlFor="other-phone-yes">
                {lang === "pt" ? "Sim" : "Yes"}
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="no" id="other-phone-no" />
              <Label htmlFor="other-phone-no">
                {lang === "pt" ? "Não" : "No"}
              </Label>
            </div>
          </RadioGroup>
          {hasOtherPhoneLast5Years === "yes" && (
            <div className="mt-2 space-y-2 scale-in-center">
              <Label htmlFor="otherPhonesDetails">
                {lang === "pt"
                  ? "Informe os outros números de telefone:"
                  : "Enter other phone numbers:"}{" "}
                *
              </Label>
              <Input
                id="otherPhonesDetails"
                {...register("otherPhonesDetails")}
                onChange={(e) =>
                  setValue(
                    "otherPhonesDetails",
                    e.target.value.replace(/[^0-9+\s,-]/g, ""),
                  )
                }
              />
            </div>
          )}
        </div>

        <div className="space-y-3">
          <Label>{ds.addressPhone.otherEmail5Years[lang]} *</Label>
          <RadioGroup
            onValueChange={(val) => setValue("hasOtherEmailLast5Years", val)}
            value={hasOtherEmailLast5Years}
            className="flex gap-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="yes" id="other-email-yes" />
              <Label htmlFor="other-email-yes">
                {lang === "pt" ? "Sim" : "Yes"}
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="no" id="other-email-no" />
              <Label htmlFor="other-email-no">
                {lang === "pt" ? "Não" : "No"}
              </Label>
            </div>
          </RadioGroup>
          {hasOtherEmailLast5Years === "yes" && (
            <div className="mt-2 space-y-2 scale-in-center">
              <Label htmlFor="otherEmailsDetails">
                {lang === "pt"
                  ? "Informe os outros endereços de email:"
                  : "Enter other email addresses:"}{" "}
                *
              </Label>
              <Input
                id="otherEmailsDetails"
                {...register("otherEmailsDetails")}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
