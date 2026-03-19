import { Input } from "@/presentation/components/atoms/input";
import { Label } from "@/presentation/components/atoms/label";
import { RadioGroup, RadioGroupItem } from "@/presentation/components/atoms/radio-group";
import { StepProps } from "../../types";

export const AddressPhoneStep = ({
  register,
  watch,
  setValue,
  lang,
  t,
  errors,
}: StepProps) => {
  const ds = t.ds160;
  const ap = ds.addressPhone;
  const isMailingSameAsHome = watch("isMailingSameAsHome");
  const hasOtherPhoneLast5Years = watch("hasOtherPhoneLast5Years");
  const hasOtherEmailLast5Years = watch("hasOtherEmailLast5Years");

  return (
    <div className="space-y-4 fade-in">
      <h2 className="font-display text-lg font-semibold text-foreground">
        {ap.title[lang]}
      </h2>

      <div className="space-y-4 rounded-md border border-border p-4 bg-muted/30">
        <h3 className="text-md font-medium">
          {ap.homeAddress[lang]}
        </h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="md:col-span-2 space-y-2">
            <Label htmlFor="homeAddress">
              {ap.addressLabel[lang]} *
            </Label>
            <Input 
              id="homeAddress" 
              {...register("homeAddress", { required: true })} 
              className={errors?.homeAddress ? "border-destructive" : ""}
            />
            {errors?.homeAddress && <p className="text-xs text-destructive">{lang === 'pt' ? 'Campo obrigatório' : 'Required field'}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="homeCity">{ap.city[lang]} *</Label>
             <Input
              id="homeCity"
              {...register("homeCity", { required: true })}
              className={errors?.homeCity ? "border-destructive" : ""}
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
            {errors?.homeCity && <p className="text-xs text-destructive">{lang === 'pt' ? 'Campo obrigatório' : 'Required field'}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="homeState">{ap.state[lang]} *</Label>
             <Input
              id="homeState"
              {...register("homeState", { required: true })}
              className={errors?.homeState ? "border-destructive" : ""}
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
            {errors?.homeState && <p className="text-xs text-destructive">{lang === 'pt' ? 'Campo obrigatório' : 'Required field'}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="homeZip">{ap.zip[lang]} *</Label>
             <Input
              id="homeZip"
              {...register("homeZip", { required: true })}
              className={errors?.homeZip ? "border-destructive" : ""}
              maxLength={10}
              onChange={(e) => {
                const value = e.target.value.replace(/[^0-9-]/g, "");
                setValue("homeZip", value);
              }}
            />
            {errors?.homeZip && <p className="text-xs text-destructive">{lang === 'pt' ? 'Campo obrigatório' : 'Required field'}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="homeCountry">
              {ap.country[lang]} *
            </Label>
             <Input
              id="homeCountry"
              {...register("homeCountry", { required: true })}
              className={errors?.homeCountry ? "border-destructive" : ""}
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
            {errors?.homeCountry && <p className="text-xs text-destructive">{lang === 'pt' ? 'Campo obrigatório' : 'Required field'}</p>}
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <Label>{ap.mailingSame[lang]} *</Label>
        <RadioGroup
          onValueChange={(val) => setValue("isMailingSameAsHome", val)}
          value={isMailingSameAsHome}
          className="flex gap-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="yes" id="mailing-yes" />
            <Label htmlFor="mailing-yes">{ap.yes[lang]}</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="no" id="mailing-no" />
            <Label htmlFor="mailing-no">{ap.no[lang]}</Label>
          </div>
        </RadioGroup>
        {errors?.isMailingSameAsHome && <p className="text-xs text-destructive">{lang === 'pt' ? 'Selecione uma opção' : 'Select an option'}</p>}
        {isMailingSameAsHome === "no" && (
          <div className="mt-2 space-y-4 bg-muted/20 p-4 rounded-md border border-dashed border-border scale-in-center">
            <div className="space-y-2">
              <Label htmlFor="mailingAddress">
                {ap.mailingAddressLabel[lang]} *
              </Label>
               <Input 
                id="mailingAddress" 
                {...register("mailingAddress", { required: true })} 
                className={errors?.mailingAddress ? "border-destructive" : ""}
              />
              {errors?.mailingAddress && <p className="text-xs text-destructive">{lang === 'pt' ? 'Campo obrigatório' : 'Required field'}</p>}
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="mailingCity">
                  {ap.city[lang]} *
                </Label>
                 <Input
                  id="mailingCity"
                  {...register("mailingCity", { required: true })}
                  className={errors?.mailingCity ? "border-destructive" : ""}
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
                {errors?.mailingCity && <p className="text-xs text-destructive">{lang === 'pt' ? 'Campo obrigatório' : 'Required field'}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="mailingState">
                  {ap.state[lang]} *
                </Label>
                 <Input
                  id="mailingState"
                  {...register("mailingState", { required: true })}
                  className={errors?.mailingState ? "border-destructive" : ""}
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
                {errors?.mailingState && <p className="text-xs text-destructive">{lang === 'pt' ? 'Campo obrigatório' : 'Required field'}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="mailingZip">
                  {ap.zip[lang]} *
                </Label>
                 <Input 
                  id="mailingZip" 
                  {...register("mailingZip", { required: true })} 
                  className={errors?.mailingZip ? "border-destructive" : ""}
                />
                {errors?.mailingZip && <p className="text-xs text-destructive">{lang === 'pt' ? 'Campo obrigatório' : 'Required field'}</p>}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 border-t border-border pt-4">
        <div className="space-y-2">
          <Label htmlFor="mobilePhone">
            {ap.mobilePhone[lang]} *
          </Label>
           <Input
            id="mobilePhone"
            {...register("mobilePhone", { required: true })}
            className={errors?.mobilePhone ? "border-destructive" : ""}
            onChange={(e) =>
              setValue("mobilePhone", e.target.value.replace(/[^0-9+\s-]/g, ""))
            }
          />
          {errors?.mobilePhone && <p className="text-xs text-destructive">{lang === 'pt' ? 'Campo obrigatório' : 'Required field'}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="homePhone">{ap.homePhone[lang]}</Label>
           <Input
            id="homePhone"
            {...register("homePhone", { required: true })}
            className={errors?.homePhone ? "border-destructive" : ""}
            onChange={(e) =>
              setValue("homePhone", e.target.value.replace(/[^0-9+\s-]/g, ""))
            }
          />
          {errors?.homePhone && <p className="text-xs text-destructive">{lang === 'pt' ? 'Campo obrigatório' : 'Required field'}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="workPhone">{ap.workPhone[lang]}</Label>
           <Input
            id="workPhone"
            {...register("workPhone", { required: true })}
            className={errors?.workPhone ? "border-destructive" : ""}
            onChange={(e) =>
              setValue("workPhone", e.target.value.replace(/[^0-9+\s-]/g, ""))
            }
          />
          {errors?.workPhone && <p className="text-xs text-destructive">{lang === 'pt' ? 'Campo obrigatório' : 'Required field'}</p>}
        </div>
      </div>

      <div className="space-y-4 border-t border-border pt-4">
        <div className="space-y-3">
          <Label>{ap.otherPhone5Years[lang]} *</Label>
          <RadioGroup
            onValueChange={(val) => setValue("hasOtherPhoneLast5Years", val)}
            value={hasOtherPhoneLast5Years}
            className="flex gap-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="yes" id="other-phone-yes" />
              <Label htmlFor="other-phone-yes">
                {ap.yes[lang]}
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="no" id="other-phone-no" />
              <Label htmlFor="other-phone-no">
                {ap.no[lang]}
              </Label>
            </div>
          </RadioGroup>
          {errors?.hasOtherPhoneLast5Years && <p className="text-xs text-destructive">{lang === 'pt' ? 'Selecione uma opção' : 'Select an option'}</p>}
          {hasOtherPhoneLast5Years === "yes" && (
            <div className="mt-2 space-y-2 scale-in-center">
              <Label htmlFor="otherPhonesDetails">
                {ap.otherPhonesLabel[lang]} *
              </Label>
               <Input
                id="otherPhonesDetails"
                {...register("otherPhonesDetails", { required: true })}
                className={errors?.otherPhonesDetails ? "border-destructive" : ""}
                onChange={(e) =>
                  setValue(
                    "otherPhonesDetails",
                    e.target.value.replace(/[^0-9+\s,-]/g, ""),
                  )
                }
              />
              {errors?.otherPhonesDetails && <p className="text-xs text-destructive">{lang === 'pt' ? 'Campo obrigatório' : 'Required field'}</p>}
            </div>
          )}
        </div>

        <div className="space-y-3">
          <Label>{ap.otherEmail5Years[lang]} *</Label>
          <RadioGroup
            onValueChange={(val) => setValue("hasOtherEmailLast5Years", val)}
            value={hasOtherEmailLast5Years}
            className="flex gap-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="yes" id="other-email-yes" />
              <Label htmlFor="other-email-yes">
                {ap.yes[lang]}
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="no" id="other-email-no" />
              <Label htmlFor="other-email-no">
                {ap.no[lang]}
              </Label>
            </div>
          </RadioGroup>
          {errors?.hasOtherEmailLast5Years && <p className="text-xs text-destructive">{lang === 'pt' ? 'Selecione uma opção' : 'Select an option'}</p>}
          {hasOtherEmailLast5Years === "yes" && (
            <div className="mt-2 space-y-2 scale-in-center">
              <Label htmlFor="otherEmailsDetails">
                {ap.otherEmailsLabel[lang]} *
              </Label>
               <Input
                id="otherEmailsDetails"
                {...register("otherEmailsDetails", { required: true })}
                className={errors?.otherEmailsDetails ? "border-destructive" : ""}
              />
              {errors?.otherEmailsDetails && <p className="text-xs text-destructive">{lang === 'pt' ? 'Campo obrigatório' : 'Required field'}</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
