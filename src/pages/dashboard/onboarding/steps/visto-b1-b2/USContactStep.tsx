import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { StepProps } from "../../types";
import { Checkbox } from "@/components/ui/checkbox";

export const USContactStep = ({ register, watch, setValue, lang, t }: StepProps) => {
    const ds = t.ds160;
    const hasUSContact = watch("hasUSContact");

    return (
        <div className="space-y-4 fade-in">
            <h2 className="font-display text-lg font-semibold text-foreground">{ds.contact.title[lang]}</h2>

            <div className="space-y-3">
                <Label>{ds.contact.hasContact[lang]} *</Label>
                <RadioGroup
                    onValueChange={(val) => setValue("hasUSContact", val)}
                    value={hasUSContact}
                    className="flex gap-4"
                >
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="yes" id="contact-yes" />
                        <Label htmlFor="contact-yes">{t.common.yes[lang]}</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="no" id="contact-no" />
                        <Label htmlFor="contact-no">{t.common.no[lang]}</Label>
                    </div>
                </RadioGroup>
                <p className="text-xs text-muted-foreground mt-1">{ds.contact.contactHelper[lang]}</p>
            </div>

            <div className="space-y-4 rounded-md border border-border p-4 bg-muted/30">
                <div className="bg-primary/10 p-4 rounded-md border border-primary/20 text-xs text-primary leading-relaxed">
                    <strong>{ds.contact.guidanceTitle[lang]}</strong>
                    <ul className="list-disc ml-4 mt-2 space-y-1">
                        <li>{ds.contact.guidance1[lang]}</li>
                        <li>{ds.contact.guidance2[lang]}</li>
                        <li>{ds.contact.guidance3[lang]}</li>
                    </ul>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="contactName" className="font-medium text-sm">
                                {ds.contact.nameLabel[lang]}
                            </Label>
                            <div className="flex items-center space-x-2 bg-background/50 px-2 py-1 rounded border border-border/50">
                                <Checkbox
                                    id="contactNameDoesNotApply"
                                    checked={watch("contactNameDoesNotApply")}
                                    onCheckedChange={(checked) => setValue("contactNameDoesNotApply", checked === true)}
                                />
                                <label htmlFor="contactNameDoesNotApply" className="text-[10px] font-semibold uppercase text-muted-foreground cursor-pointer">
                                    {t.common.doNotKnow[lang]}
                                </label>
                            </div>
                        </div>
                        <Input
                            id="contactName"
                            {...register("contactName")}
                            disabled={watch("contactNameDoesNotApply")}
                            className="bg-background"
                            onChange={(e) => setValue("contactName", e.target.value.replace(/[^a-zA-ZáéíóúàèìòùâêîôûãõçÁÉÍÓÚÀÈÌÒÙÂÊÎÔÛÃÕÇ\s]/g, ""))}
                        />
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="contactOrganization" className="font-medium text-sm">
                                {ds.contact.orgName[lang]}
                            </Label>
                            <div className="flex items-center space-x-2 bg-background/50 px-2 py-1 rounded border border-border/50">
                                <Checkbox
                                    id="contactOrganizationDoesNotApply"
                                    checked={watch("contactOrganizationDoesNotApply")}
                                    onCheckedChange={(checked) => setValue("contactOrganizationDoesNotApply", checked === true)}
                                />
                                <label htmlFor="contactOrganizationDoesNotApply" className="text-[10px] font-semibold uppercase text-muted-foreground cursor-pointer">
                                    {t.common.doNotKnow[lang]}
                                </label>
                            </div>
                        </div>
                        <Input
                            id="contactOrganization"
                            {...register("contactOrganization")}
                            disabled={watch("contactOrganizationDoesNotApply")}
                            className="bg-background"
                        />
                        <p className="text-[10px] text-muted-foreground italic leading-tight">
                            {ds.contact.orgHelper[lang]}
                        </p>
                    </div>

                    <div className="md:col-span-2 space-y-2 pt-2 border-t border-border/40 mt-2">
                        <Label htmlFor="contactRelationship" className="font-medium text-sm">{ds.contact.relationship[lang]}</Label>
                        <select
                            {...register("contactRelationship")}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <option value="">{t.common.select[lang]}</option>
                            <option value="relative">{ds.contact.relOptions.relative[lang]}</option>
                            <option value="spouse">{ds.contact.relOptions.spouse[lang]}</option>
                            <option value="friend">{ds.contact.relOptions.friend[lang]}</option>
                            <option value="business">{ds.contact.relOptions.business[lang]}</option>
                            <option value="employer">{ds.contact.relOptions.employer[lang]}</option>
                            <option value="school">{ds.contact.relOptions.school[lang]}</option>
                            <option value="other">{ds.contact.relOptions.other[lang]}</option>
                        </select>
                        <div className="bg-amber-50 dark:bg-amber-950/20 p-2 rounded border border-amber-200/50 dark:border-amber-900/50 text-[10px] text-amber-800 dark:text-amber-400">
                            <strong>{t.common.tip[lang]}</strong> {ds.contact.relHelper[lang]}
                        </div>
                    </div>
                </div>
            </div>

            <div className="space-y-4 border-t border-border pt-4">
                <h3 className="text-md font-medium">{ds.contact.addressPhone[lang]}</h3>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="md:col-span-2 space-y-2">
                        <Label htmlFor="contactAddress">{ds.contact.address[lang]} *</Label>
                        <Input id="contactAddress" {...register("contactAddress")} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="contactCity">{ds.contact.city[lang]} *</Label>
                        <Input
                            id="contactCity"
                            {...register("contactCity")}
                            onChange={(e) => setValue("contactCity", e.target.value.replace(/[^a-zA-ZáéíóúàèìòùâêîôûãõçÁÉÍÓÚÀÈÌÒÙÂÊÎÔÛÃÕÇ\s]/g, ""))}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="contactState">{ds.contact.state[lang]} *</Label>
                        <Input
                            id="contactState"
                            {...register("contactState")}
                            onChange={(e) => setValue("contactState", e.target.value.replace(/[^a-zA-ZáéíóúàèìòùâêîôûãõçÁÉÍÓÚÀÈÌÒÙÂÊÎÔÛÃÕÇ\s]/g, ""))}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="contactZip">{ds.contact.zip[lang]}</Label>
                        <Input id="contactZip" {...register("contactZip")} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="contactPhone">{ds.contact.phone[lang]} *</Label>
                        <Input
                            id="contactPhone"
                            {...register("contactPhone")}
                            onChange={(e) => setValue("contactPhone", e.target.value.replace(/[^0-9+\s-]/g, ""))}
                        />
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="contactEmail">{ds.contact.email[lang]}</Label>
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="contactEmailDoesNotApply"
                                    checked={watch("contactEmailDoesNotApply")}
                                    onCheckedChange={(checked) => setValue("contactEmailDoesNotApply", checked === true)}
                                />
                                <label htmlFor="contactEmailDoesNotApply" className="text-xs text-muted-foreground cursor-pointer">
                                    {t.common.doesNotApply[lang]}
                                </label>
                            </div>
                        </div>
                        <Input
                            id="contactEmail"
                            {...register("contactEmail")}
                            disabled={watch("contactEmailDoesNotApply")}
                        />
                        <p className="text-xs text-muted-foreground mt-1">{ds.contact.emailHelper[lang]}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};
