import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { StepProps } from "../../types";

export const WorkEducationStep = ({ register, watch, setValue, lang, t }: StepProps) => {
    const ds = t.ds160;
    const wasPreviouslyEmployed = watch("wasPreviouslyEmployed");
    const hasSecondaryEducation = watch("hasSecondaryEducation");

    return (
        <div className="space-y-4 fade-in">
            <h2 className="font-display text-lg font-semibold text-foreground">{ds.workEducation.title[lang]}</h2>

            <div className="space-y-4 rounded-md border border-border p-4 bg-muted/30">
                <div className="space-y-2">
                    <Label htmlFor="primaryOccupation">{ds.workEducation.primaryOccupation[lang]} *</Label>
                    <Input
                        id="primaryOccupation"
                        {...register("primaryOccupation")}
                        onChange={(e) => setValue("primaryOccupation", e.target.value.replace(/[^a-zA-ZáéíóúàèìòùâêîôûãõçÁÉÍÓÚÀÈÌÒÙÂÊÎÔÛÃÕÇ\s]/g, ""))}
                    />
                    <p className="text-xs text-muted-foreground mt-1">{ds.workEducation.occHelper[lang]}</p>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="employerName">{ds.workEducation.employerName[lang]} *</Label>
                        <Input
                            id="employerName"
                            {...register("employerName")}
                            onChange={(e) => setValue("employerName", e.target.value.replace(/[^a-zA-ZáéíóúàèìòùâêîôûãõçÁÉÍÓÚÀÈÌÒÙÂÊÎÔÛÃÕÇ\s.-]/g, ""))}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="employerPhone">{ds.workEducation.phone[lang]} *</Label>
                        <Input
                            id="employerPhone"
                            {...register("employerPhone")}
                            onChange={(e) => setValue("employerPhone", e.target.value.replace(/[^0-9+\s-]/g, ""))}
                        />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                        <Label htmlFor="employerAddress">{ds.workEducation.employerAddress[lang]} *</Label>
                        <Input id="employerAddress" {...register("employerAddress")} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="employerCity">{ds.workEducation.city[lang]} *</Label>
                        <Input
                            id="employerCity"
                            {...register("employerCity")}
                            onChange={(e) => setValue("employerCity", e.target.value.replace(/[^a-zA-ZáéíóúàèìòùâêîôûãõçÁÉÍÓÚÀÈÌÒÙÂÊÎÔÛÃÕÇ\s]/g, ""))}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="employerState">{ds.workEducation.state[lang]}</Label>
                        <Input
                            id="employerState"
                            {...register("employerState")}
                            onChange={(e) => setValue("employerState", e.target.value.replace(/[^a-zA-ZáéíóúàèìòùâêîôûãõçÁÉÍÓÚÀÈÌÒÙÂÊÎÔÛÃÕÇ\s]/g, ""))}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="employerZip">{ds.workEducation.zip[lang]}</Label>
                        <Input
                            id="employerZip"
                            {...register("employerZip")}
                            maxLength={10}
                            onChange={(e) => setValue("employerZip", e.target.value.replace(/[^0-9-]/g, ""))}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="employerCountry">{ds.workEducation.country[lang]} *</Label>
                        <Input
                            id="employerCountry"
                            {...register("employerCountry")}
                            onChange={(e) => setValue("employerCountry", e.target.value.replace(/[^a-zA-ZáéíóúàèìòùâêîôûãõçÁÉÍÓÚÀÈÌÒÙÂÊÎÔÛÃÕÇ\s]/g, ""))}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="jobStartDate">{ds.workEducation.startDate[lang]} *</Label>
                        <Input id="jobStartDate" type="date" {...register("jobStartDate")} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="monthlyIncome">{ds.workEducation.monthlyIncome[lang]} *</Label>
                        <Input
                            id="monthlyIncome"
                            {...register("monthlyIncome")}
                            onChange={(e) => setValue("monthlyIncome", e.target.value.replace(/[^0-9.\s]/g, ""))}
                        />
                        <p className="text-xs text-muted-foreground mt-1">{ds.workEducation.incomeHelper[lang]}</p>
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="jobDescription">{ds.workEducation.duties[lang]} *</Label>
                    <textarea
                        id="jobDescription"
                        {...register("jobDescription")}
                        className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                </div>
            </div>

            <div className="space-y-4 border-t border-border pt-4">
                <div className="space-y-3">
                    <Label>{ds.workEducation.prevEmployed[lang]} *</Label>
                    <RadioGroup
                        onValueChange={(val) => setValue("wasPreviouslyEmployed", val)}
                        value={wasPreviouslyEmployed}
                        className="flex gap-4 mt-1"
                    >
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="yes" id="prev-emp-yes" />
                            <Label htmlFor="prev-emp-yes">{lang === 'pt' ? 'Sim' : 'Yes'}</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="no" id="prev-emp-no" />
                            <Label htmlFor="prev-emp-no">{lang === 'pt' ? 'Não' : 'No'}</Label>
                        </div>
                    </RadioGroup>
                    {wasPreviouslyEmployed === "yes" && (
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 mt-4 p-4 bg-muted/20 rounded-md border border-dashed border-border scale-in-center">
                            <div className="space-y-2">
                                <Label htmlFor="prevEmployerName">{lang === 'pt' ? 'Nome do empregador anterior:' : 'Previous employer name:'} *</Label>
                                <Input
                                    id="prevEmployerName"
                                    {...register("prevEmployerName")}
                                    onChange={(e) => setValue("prevEmployerName", e.target.value.replace(/[^a-zA-ZáéíóúàèìòùâêîôûãõçÁÉÍÓÚÀÈÌÒÙÂÊÎÔÛÃÕÇ\s.-]/g, ""))}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="prevJobTitle">{lang === 'pt' ? 'Cargo:' : 'Job title:'} *</Label>
                                <Input
                                    id="prevJobTitle"
                                    {...register("prevJobTitle")}
                                    onChange={(e) => setValue("prevJobTitle", e.target.value.replace(/[^a-zA-ZáéíóúàèìòùâêîôûãõçÁÉÍÓÚÀÈÌÒÙÂÊÎÔÛÃÕÇ\s]/g, ""))}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="prevJobPeriod">{lang === 'pt' ? 'Período (ex: 2018-2022):' : 'Period (ex: 2018-2022):'} *</Label>
                                <Input
                                    id="prevJobPeriod"
                                    {...register("prevJobPeriod")}
                                    onChange={(e) => setValue("prevJobPeriod", e.target.value.replace(/[^0-9-]/g, ""))}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="prevEmployerSupervisor">{lang === 'pt' ? 'Nome do supervisor:' : 'Supervisor name:'} *</Label>
                                <Input
                                    id="prevEmployerSupervisor"
                                    {...register("prevEmployerSupervisor")}
                                    onChange={(e) => setValue("prevEmployerSupervisor", e.target.value.replace(/[^a-zA-ZáéíóúàèìòùâêîôûãõçÁÉÍÓÚÀÈÌÒÙÂÊÎÔÛÃÕÇ\s]/g, ""))}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="prevJobReasonLeft">{lang === 'pt' ? 'Motivo de saída:' : 'Reason for leaving:'} *</Label>
                                <Input id="prevJobReasonLeft" {...register("prevJobReasonLeft")} />
                            </div>
                        </div>
                    )}
                </div>

                <div className="space-y-3 pb-2">
                    <Label>{ds.workEducation.educationLevel[lang]} *</Label>
                    <RadioGroup
                        onValueChange={(val) => setValue("hasSecondaryEducation", val)}
                        value={hasSecondaryEducation}
                        className="flex gap-4 mt-1"
                    >
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="yes" id="edu-yes" />
                            <Label htmlFor="edu-yes">{lang === 'pt' ? 'Sim' : 'Yes'}</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="no" id="edu-no" />
                            <Label htmlFor="edu-no">{lang === 'pt' ? 'Não' : 'No'}</Label>
                        </div>
                    </RadioGroup>
                    {hasSecondaryEducation === "yes" && (
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 mt-4 p-4 bg-muted/20 rounded-md border border-dashed border-border scale-in-center">
                            <div className="md:col-span-2 space-y-2">
                                <Label htmlFor="educationInstitutionName">{lang === 'pt' ? 'Nome da instituição de ensino:' : 'Institution name:'} *</Label>
                                <Input
                                    id="educationInstitutionName"
                                    {...register("educationInstitutionName")}
                                    onChange={(e) => setValue("educationInstitutionName", e.target.value.replace(/[^a-zA-ZáéíóúàèìòùâêîôûãõçÁÉÍÓÚÀÈÌÒÙÂÊÎÔÛÃÕÇ\s.-]/g, ""))}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="educationCompletionDate">{lang === 'pt' ? 'Data de conclusão:' : 'Completion date:'} *</Label>
                                <Input id="educationCompletionDate" type="date" {...register("educationCompletionDate")} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="educationDegree">{lang === 'pt' ? 'Grau obtido:' : 'Degree obtained:'} *</Label>
                                <Input
                                    id="educationDegree"
                                    {...register("educationDegree")}
                                    onChange={(e) => setValue("educationDegree", e.target.value.replace(/[^a-zA-ZáéíóúàèìòùâêîôûãõçÁÉÍÓÚÀÈÌÒÙÂÊÎÔÛÃÕÇ\s]/g, ""))}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
