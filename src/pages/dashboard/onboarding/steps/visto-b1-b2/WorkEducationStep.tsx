import { Input } from "@/presentation/components/atoms/input";
import { Label } from "@/presentation/components/atoms/label";
import { RadioGroup, RadioGroupItem } from "@/presentation/components/atoms/radio-group";
import { StepProps } from "../../types";

export const WorkEducationStep = ({ register, watch, setValue, lang, t, errors }: StepProps) => {
    const ds = t.ds160;
    const we = ds.workEducation;
    const wasPreviouslyEmployed = watch("wasPreviouslyEmployed");
    const hasSecondaryEducation = watch("hasSecondaryEducation");

    return (
        <div className="space-y-4 fade-in">
            <h2 className="font-display text-lg font-semibold text-foreground">{we.title[lang]}</h2>

            <div className="space-y-4 rounded-md border border-border p-4 bg-muted/30">
                <div className="space-y-2">
                    <Label htmlFor="primaryOccupation">{we.primaryOccupation[lang]} *</Label>
                    <Input
                        id="primaryOccupation"
                        {...register("primaryOccupation", { required: true })}
                        className={errors?.primaryOccupation ? "border-destructive" : ""}
                        onChange={(e) => setValue("primaryOccupation", e.target.value.replace(/[^a-zA-ZáéíóúàèìòùâêîôûãõçÁÉÍÓÚÀÈÌÒÙÂÊÎÔÛÃÕÇ\s]/g, ""))}
                    />
                    {errors?.primaryOccupation && <p className="text-xs text-destructive">{lang === 'pt' ? 'Campo obrigatório' : 'Required field'}</p>}
                    <p className="text-xs text-muted-foreground mt-1">{we.occHelper[lang]}</p>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="employerName">{we.employerName[lang]} *</Label>
                        <Input
                            id="employerName"
                            {...register("employerName", { required: true })}
                            className={errors?.employerName ? "border-destructive" : ""}
                            onChange={(e) => setValue("employerName", e.target.value.replace(/[^a-zA-ZáéíóúàèìòùâêîôûãõçÁÉÍÓÚÀÈÌÒÙÂÊÎÔÛÃÕÇ\s.-]/g, ""))}
                        />
                        {errors?.employerName && <p className="text-xs text-destructive">{lang === 'pt' ? 'Campo obrigatório' : 'Required field'}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="employerPhone">{we.phone[lang]} *</Label>
                        <Input
                            id="employerPhone"
                            {...register("employerPhone", { required: true })}
                            className={errors?.employerPhone ? "border-destructive" : ""}
                            onChange={(e) => setValue("employerPhone", e.target.value.replace(/[^0-9+\s-]/g, ""))}
                        />
                        {errors?.employerPhone && <p className="text-xs text-destructive">{lang === 'pt' ? 'Campo obrigatório' : 'Required field'}</p>}
                    </div>
                    <div className="md:col-span-2 space-y-2">
                        <Label htmlFor="employerAddress">{we.employerAddress[lang]} *</Label>
                        <Input 
                            id="employerAddress" 
                            {...register("employerAddress", { required: true })} 
                            className={errors?.employerAddress ? "border-destructive" : ""}
                        />
                        {errors?.employerAddress && <p className="text-xs text-destructive">{lang === 'pt' ? 'Campo obrigatório' : 'Required field'}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="employerCity">{we.city[lang]} *</Label>
                        <Input
                            id="employerCity"
                            {...register("employerCity", { required: true })}
                            className={errors?.employerCity ? "border-destructive" : ""}
                            onChange={(e) => setValue("employerCity", e.target.value.replace(/[^a-zA-ZáéíóúàèìòùâêîôûãõçÁÉÍÓÚÀÈÌÒÙÂÊÎÔÛÃÕÇ\s]/g, ""))}
                        />
                        {errors?.employerCity && <p className="text-xs text-destructive">{lang === 'pt' ? 'Campo obrigatório' : 'Required field'}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="employerState">{we.state[lang]}</Label>
                        <Input
                            id="employerState"
                            {...register("employerState")}
                            onChange={(e) => setValue("employerState", e.target.value.replace(/[^a-zA-ZáéíóúàèìòùâêîôûãõçÁÉÍÓÚÀÈÌÒÙÂÊÎÔÛÃÕÇ\s]/g, ""))}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="employerZip">{we.zip[lang]}</Label>
                        <Input
                            id="employerZip"
                            {...register("employerZip")}
                            maxLength={10}
                            onChange={(e) => setValue("employerZip", e.target.value.replace(/[^0-9-]/g, ""))}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="employerCountry">{we.country[lang]} *</Label>
                        <Input
                            id="employerCountry"
                            {...register("employerCountry", { required: true })}
                            className={errors?.employerCountry ? "border-destructive" : ""}
                            onChange={(e) => setValue("employerCountry", e.target.value.replace(/[^a-zA-ZáéíóúàèìòùâêîôûãõçÁÉÍÓÚÀÈÌÒÙÂÊÎÔÛÃÕÇ\s]/g, ""))}
                        />
                        {errors?.employerCountry && <p className="text-xs text-destructive">{lang === 'pt' ? 'Campo obrigatório' : 'Required field'}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="jobStartDate">{we.startDate[lang]} *</Label>
                        <Input 
                            id="jobStartDate" 
                            type="date" 
                            {...register("jobStartDate", { required: true })} 
                            className={errors?.jobStartDate ? "border-destructive" : ""}
                        />
                        {errors?.jobStartDate && <p className="text-xs text-destructive">{lang === 'pt' ? 'Campo obrigatório' : 'Required field'}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="monthlyIncome">{we.monthlyIncome[lang]} *</Label>
                        <Input
                            id="monthlyIncome"
                            {...register("monthlyIncome", { required: true })}
                            className={errors?.monthlyIncome ? "border-destructive" : ""}
                            onChange={(e) => setValue("monthlyIncome", e.target.value.replace(/[^0-9.\s]/g, ""))}
                        />
                        {errors?.monthlyIncome && <p className="text-xs text-destructive">{lang === 'pt' ? 'Campo obrigatório' : 'Required field'}</p>}
                        <p className="text-xs text-muted-foreground mt-1">{we.incomeHelper[lang]}</p>
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="jobDescription">{we.duties[lang]} *</Label>
                    <textarea
                        id="jobDescription"
                        {...register("jobDescription", { required: true })}
                        className={`flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${errors?.jobDescription ? "border-destructive" : ""}`}
                    />
                    {errors?.jobDescription && <p className="text-xs text-destructive">{lang === 'pt' ? 'Campo obrigatório' : 'Required field'}</p>}
                </div>
            </div>

            <div className="space-y-4 border-t border-border pt-4">
                <div className="space-y-3">
                    <Label>{we.prevEmployed[lang]} *</Label>
                    <RadioGroup
                        onValueChange={(val) => setValue("wasPreviouslyEmployed", val)}
                        value={wasPreviouslyEmployed}
                        className="flex gap-4 mt-1"
                    >
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="yes" id="prev-emp-yes" />
                            <Label htmlFor="prev-emp-yes">{we.yes[lang]}</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="no" id="prev-emp-no" />
                            <Label htmlFor="prev-emp-no">{we.no[lang]}</Label>
                        </div>
                    </RadioGroup>
                    {errors?.wasPreviouslyEmployed && <p className="text-xs text-destructive">{lang === 'pt' ? 'Campo obrigatório' : 'Required field'}</p>}
                    {wasPreviouslyEmployed === "yes" && (
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 mt-4 p-4 bg-muted/20 rounded-md border border-dashed border-border scale-in-center">
                            <div className="space-y-2">
                                <Label htmlFor="prevEmployerName">{we.prevEmployerName[lang]} *</Label>
                                <Input
                                    id="prevEmployerName"
                                    {...register("prevEmployerName", { required: wasPreviouslyEmployed === "yes" })}
                                    className={errors?.prevEmployerName ? "border-destructive" : ""}
                                    onChange={(e) => setValue("prevEmployerName", e.target.value.replace(/[^a-zA-ZáéíóúàèìòùâêîôûãõçÁÉÍÓÚÀÈÌÒÙÂÊÎÔÛÃÕÇ\s.-]/g, ""))}
                                />
                                {errors?.prevEmployerName && <p className="text-xs text-destructive">{lang === 'pt' ? 'Campo obrigatório' : 'Required field'}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="prevJobTitle">{we.jobTitle[lang]} *</Label>
                                <Input
                                    id="prevJobTitle"
                                    {...register("prevJobTitle", { required: wasPreviouslyEmployed === "yes" })}
                                    className={errors?.prevJobTitle ? "border-destructive" : ""}
                                    onChange={(e) => setValue("prevJobTitle", e.target.value.replace(/[^a-zA-ZáéíóúàèìòùâêîôûãõçÁÉÍÓÚÀÈÌÒÙÂÊÎÔÛÃÕÇ\s]/g, ""))}
                                />
                                {errors?.prevJobTitle && <p className="text-xs text-destructive">{lang === 'pt' ? 'Campo obrigatório' : 'Required field'}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="prevJobPeriod">{we.period[lang]} *</Label>
                                <Input
                                    id="prevJobPeriod"
                                    {...register("prevJobPeriod", { required: wasPreviouslyEmployed === "yes" })}
                                    className={errors?.prevJobPeriod ? "border-destructive" : ""}
                                    onChange={(e) => setValue("prevJobPeriod", e.target.value.replace(/[^0-9-]/g, ""))}
                                />
                                {errors?.prevJobPeriod && <p className="text-xs text-destructive">{lang === 'pt' ? 'Campo obrigatório' : 'Required field'}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="prevEmployerSupervisor">{we.supervisorName[lang]} *</Label>
                                <Input
                                    id="prevEmployerSupervisor"
                                    {...register("prevEmployerSupervisor", { required: wasPreviouslyEmployed === "yes" })}
                                    className={errors?.prevEmployerSupervisor ? "border-destructive" : ""}
                                    onChange={(e) => setValue("prevEmployerSupervisor", e.target.value.replace(/[^a-zA-ZáéíóúàèìòùâêîôûãõçÁÉÍÓÚÀÈÌÒÙÂÊÎÔÛÃÕÇ\s]/g, ""))}
                                />
                                {errors?.prevEmployerSupervisor && <p className="text-xs text-destructive">{lang === 'pt' ? 'Campo obrigatório' : 'Required field'}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="prevJobReasonLeft">{we.reasonLeaving[lang]} *</Label>
                                <Input 
                                    id="prevJobReasonLeft" 
                                    {...register("prevJobReasonLeft", { required: wasPreviouslyEmployed === "yes" })} 
                                    className={errors?.prevJobReasonLeft ? "border-destructive" : ""}
                                />
                                {errors?.prevJobReasonLeft && <p className="text-xs text-destructive">{lang === 'pt' ? 'Campo obrigatório' : 'Required field'}</p>}
                            </div>
                        </div>
                    )}
                </div>

                <div className="space-y-3 pb-2">
                    <Label>{we.educationLevel[lang]} *</Label>
                    <RadioGroup
                        onValueChange={(val) => setValue("hasSecondaryEducation", val)}
                        value={hasSecondaryEducation}
                        className="flex gap-4 mt-1"
                    >
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="yes" id="edu-yes" />
                            <Label htmlFor="edu-yes">{we.yes[lang]}</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="no" id="edu-no" />
                            <Label htmlFor="edu-no">{we.no[lang]}</Label>
                        </div>
                    </RadioGroup>
                    {errors?.hasSecondaryEducation && <p className="text-xs text-destructive">{lang === 'pt' ? 'Campo obrigatório' : 'Required field'}</p>}
                    {hasSecondaryEducation === "yes" && (
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 mt-4 p-4 bg-muted/20 rounded-md border border-dashed border-border scale-in-center">
                            <div className="md:col-span-2 space-y-2">
                                <Label htmlFor="educationInstitutionName">{we.institutionName[lang]} *</Label>
                                <Input
                                    id="educationInstitutionName"
                                    {...register("educationInstitutionName", { required: hasSecondaryEducation === "yes" })}
                                    className={errors?.educationInstitutionName ? "border-destructive" : ""}
                                    onChange={(e) => setValue("educationInstitutionName", e.target.value.replace(/[^a-zA-ZáéíóúàèìòùâêîôûãõçÁÉÍÓÚÀÈÌÒÙÂÊÎÔÛÃÕÇ\s.-]/g, ""))}
                                />
                                {errors?.educationInstitutionName && <p className="text-xs text-destructive">{lang === 'pt' ? 'Campo obrigatório' : 'Required field'}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="educationCompletionDate">{we.completionDate[lang]} *</Label>
                                <Input 
                                    id="educationCompletionDate" 
                                    type="date" 
                                    {...register("educationCompletionDate", { required: hasSecondaryEducation === "yes" })} 
                                    className={errors?.educationCompletionDate ? "border-destructive" : ""}
                                />
                                {errors?.educationCompletionDate && <p className="text-xs text-destructive">{lang === 'pt' ? 'Campo obrigatório' : 'Required field'}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="educationDegree">{we.degreeObtained[lang]} *</Label>
                                <Input
                                    id="educationDegree"
                                    {...register("educationDegree", { required: hasSecondaryEducation === "yes" })}
                                    className={errors?.educationDegree ? "border-destructive" : ""}
                                    onChange={(e) => setValue("educationDegree", e.target.value.replace(/[^a-zA-ZáéíóúàèìòùâêîôûãõçÁÉÍÓÚÀÈÌÒÙÂÊÎÔÛÃÕÇ\s]/g, ""))}
                                />
                                {errors?.educationDegree && <p className="text-xs text-destructive">{lang === 'pt' ? 'Campo obrigatório' : 'Required field'}</p>}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
