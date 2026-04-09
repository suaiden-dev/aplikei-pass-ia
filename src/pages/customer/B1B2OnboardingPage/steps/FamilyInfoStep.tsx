import { Input } from "../../../../components/ui/input";
import { Label } from "../../../../components/ui/label";
import { RadioGroup, RadioGroupItem } from "../../../../components/ui/radio-group";
import type { StepProps } from "../types";

export const FamilyInfoStep = ({ register, watch, setValue, lang, t, errors }: StepProps) => {
    const ds = t.ds160;
    const isFatherInUS = watch("isFatherInUS");
    const isMotherInUS = watch("isMotherInUS");
    const hasImmediateRelativesInUS = watch("hasImmediateRelativesInUS");
    const hasOtherRelativesInUS = watch("hasOtherRelativesInUS");

    const statusOptions = ds.family.statusOptions;

    return (
        <div className="space-y-4 fade-in">
            <h2 className="font-display text-lg font-semibold text-foreground">{ds.family.title[lang]}</h2>

            {/* Father's Info */}
            <div className="space-y-4 rounded-md border border-border p-4 bg-muted/30">
                <h3 className="text-md font-medium">{lang === 'pt' ? "Dados do Pai" : "Father's Details"}</h3>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="fatherLastName">{ds.family.fatherLast[lang]} *</Label>
                        <Input
                            id="fatherLastName"
                            {...register("fatherLastName", { required: true })}
                            className={errors?.fatherLastName ? "border-destructive" : ""}
                            onChange={(e) => setValue("fatherLastName", e.target.value.replace(/[^a-zA-ZáéíóúàèìòùâêîôûãõçÁÉÍÓÚÀÈÌÒÙÂÊÎÔÛÃÕÇ\s]/g, ""))}
                        />
                        {errors?.fatherLastName && <p className="text-xs text-destructive">{lang === 'pt' ? 'Campo obrigatório' : 'Required field'}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="fatherFirstName">{ds.family.fatherFirst[lang]} *</Label>
                        <Input
                            id="fatherFirstName"
                            {...register("fatherFirstName", { required: true })}
                            className={errors?.fatherFirstName ? "border-destructive" : ""}
                            onChange={(e) => setValue("fatherFirstName", e.target.value.replace(/[^a-zA-ZáéíóúàèìòùâêîôûãõçÁÉÍÓÚÀÈÌÒÙÂÊÎÔÛÃÕÇ\s]/g, ""))}
                        />
                        {errors?.fatherFirstName && <p className="text-xs text-destructive">{lang === 'pt' ? 'Campo obrigatório' : 'Required field'}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="fatherBirthDate">{ds.family.fatherDOB[lang]} *</Label>
                        <Input 
                            id="fatherBirthDate" 
                            type="date" 
                            {...register("fatherBirthDate", { required: true })} 
                            className={errors?.fatherBirthDate ? "border-destructive" : ""}
                        />
                        {errors?.fatherBirthDate && <p className="text-xs text-destructive">{lang === 'pt' ? 'Campo obrigatório' : 'Required field'}</p>}
                    </div>
                    <div className="space-y-3">
                        <Label>{ds.family.isFatherInUS[lang]} *</Label>
                        <RadioGroup
                            onValueChange={(val) => setValue("isFatherInUS", val)}
                            value={isFatherInUS}
                            className="flex gap-4 mt-1"
                        >
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="yes" id="father-us-yes" />
                                <Label htmlFor="father-us-yes">{lang === 'pt' ? 'Sim' : 'Yes'}</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="no" id="father-us-no" />
                                <Label htmlFor="father-us-no">{lang === 'pt' ? 'Não' : 'No'}</Label>
                            </div>
                        </RadioGroup>
                        {errors?.isFatherInUS && <p className="text-xs text-destructive">{lang === 'pt' ? 'Campo obrigatório' : 'Required field'}</p>}
                    </div>
                    {isFatherInUS === "yes" && (
                        <div className="md:col-span-2 space-y-2 mt-2 scale-in-center">
                            <Label>{ds.family.fatherStatus[lang]}</Label>
                            <select
                                {...register("fatherUSStatus", { required: isFatherInUS === "yes" })}
                                className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${errors?.fatherUSStatus ? "border-destructive" : ""}`}
                            >
                                <option value="">{lang === 'pt' ? 'Selecione...' : 'Select...'}</option>
                                <option value="citizen">{statusOptions.citizen[lang]}</option>
                                <option value="lpr">{statusOptions.lpr[lang]}</option>
                                <option value="nonImmigrant">{statusOptions.nonImmigrant[lang]}</option>
                                <option value="unknown">{statusOptions.unknown[lang]}</option>
                            </select>
                            {errors?.fatherUSStatus && <p className="text-xs text-destructive">{lang === 'pt' ? 'Campo obrigatório' : 'Required field'}</p>}
                        </div>
                    )}
                </div>
            </div>

            {/* Mother's Info */}
            <div className="space-y-4 rounded-md border border-border p-4 bg-muted/30">
                <h3 className="text-md font-medium">{lang === 'pt' ? "Dados da Mãe" : "Mother's Details"}</h3>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="motherLastName">{ds.family.motherLast[lang]} *</Label>
                        <Input
                            id="motherLastName"
                            {...register("motherLastName", { required: true })}
                            className={errors?.motherLastName ? "border-destructive" : ""}
                            onChange={(e) => setValue("motherLastName", e.target.value.replace(/[^a-zA-ZáéíóúàèìòùâêîôûãõçÁÉÍÓÚÀÈÌÒÙÂÊÎÔÛÃÕÇ\s]/g, ""))}
                        />
                        {errors?.motherLastName && <p className="text-xs text-destructive">{lang === 'pt' ? 'Campo obrigatório' : 'Required field'}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="motherFirstName">{ds.family.motherFirst[lang]} *</Label>
                        <Input
                            id="motherFirstName"
                            {...register("motherFirstName", { required: true })}
                            className={errors?.motherFirstName ? "border-destructive" : ""}
                            onChange={(e) => setValue("motherFirstName", e.target.value.replace(/[^a-zA-ZáéíóúàèìòùâêîôûãõçÁÉÍÓÚÀÈÌÒÙÂÊÎÔÛÃÕÇ\s]/g, ""))}
                        />
                        {errors?.motherFirstName && <p className="text-xs text-destructive">{lang === 'pt' ? 'Campo obrigatório' : 'Required field'}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="motherBirthDate">{ds.family.motherDOB[lang]} *</Label>
                        <Input 
                            id="motherBirthDate" 
                            type="date" 
                            {...register("motherBirthDate", { required: true })} 
                            className={errors?.motherBirthDate ? "border-destructive" : ""}
                        />
                        {errors?.motherBirthDate && <p className="text-xs text-destructive">{lang === 'pt' ? 'Campo obrigatório' : 'Required field'}</p>}
                    </div>
                    <div className="space-y-3">
                        <Label>{ds.family.isMotherInUS[lang]} *</Label>
                        <RadioGroup
                            onValueChange={(val) => setValue("isMotherInUS", val)}
                            value={isMotherInUS}
                            className="flex gap-4 mt-1"
                        >
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="yes" id="mother-us-yes" />
                                <Label htmlFor="mother-us-yes">{lang === 'pt' ? 'Sim' : 'Yes'}</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="no" id="mother-us-no" />
                                <Label htmlFor="mother-us-no">{lang === 'pt' ? 'Não' : 'No'}</Label>
                            </div>
                        </RadioGroup>
                        {errors?.isMotherInUS && <p className="text-xs text-destructive">{lang === 'pt' ? 'Campo obrigatório' : 'Required field'}</p>}
                    </div>
                    {isMotherInUS === "yes" && (
                        <div className="md:col-span-2 space-y-2 mt-2 scale-in-center">
                            <Label>{ds.family.motherStatus[lang]}</Label>
                            <select
                                {...register("motherUSStatus", { required: isMotherInUS === "yes" })}
                                className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${errors?.motherUSStatus ? "border-destructive" : ""}`}
                            >
                                <option value="">{lang === 'pt' ? 'Selecione...' : 'Select...'}</option>
                                <option value="citizen">{statusOptions.citizen[lang]}</option>
                                <option value="lpr">{statusOptions.lpr[lang]}</option>
                                <option value="nonImmigrant">{statusOptions.nonImmigrant[lang]}</option>
                                <option value="unknown">{statusOptions.unknown[lang]}</option>
                            </select>
                            {errors?.motherUSStatus && <p className="text-xs text-destructive">{lang === 'pt' ? 'Campo obrigatório' : 'Required field'}</p>}
                        </div>
                    )}
                </div>
            </div>

            {/* Maternal Grandmother Info */}
            <div className="space-y-4 rounded-md border border-border p-4 bg-muted/30">
                <h3 className="text-md font-medium">{lang === 'pt' ? 'Pergunta de Segurança (Avó)' : 'Security Question (Grandmother)'}</h3>
                <div className="space-y-2">
                    <Label htmlFor="maternalGrandmotherName">{ds.family.maternalGrandmotherName[lang]} *</Label>
                    <Input
                        id="maternalGrandmotherName"
                        {...register("maternalGrandmotherName", { required: true })}
                        className={errors?.maternalGrandmotherName ? "border-destructive" : ""}
                        onChange={(e) => setValue("maternalGrandmotherName", e.target.value.replace(/[^a-zA-ZáéíóúàèìòùâêîôûãõçÁÉÍÓÚÀÈÌÒÙÂÊÎÔÛÃÕÇ\s]/g, ""))}
                        placeholder={lang === 'pt' ? "Ex: Maria dos Santos" : "Ex: Jane Doe"}
                    />
                    {errors?.maternalGrandmotherName && <p className="text-xs text-destructive">{lang === 'pt' ? 'Campo obrigatório' : 'Required field'}</p>}
                </div>
            </div>

            <div className="space-y-4 border-t border-border pt-4">
                <div className="space-y-3">
                    <Label>{ds.family.hasImmediateRelInUS[lang]} *</Label>
                    <RadioGroup
                        onValueChange={(val) => setValue("hasImmediateRelativesInUS", val)}
                        value={hasImmediateRelativesInUS}
                        className="flex gap-4 mt-1"
                    >
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="yes" id="imm-rel-yes" />
                            <Label htmlFor="imm-rel-yes">{lang === 'pt' ? 'Sim' : 'Yes'}</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="no" id="imm-rel-no" />
                            <Label htmlFor="imm-rel-no">{lang === 'pt' ? 'Não' : 'No'}</Label>
                        </div>
                    </RadioGroup>
                    {errors?.hasImmediateRelativesInUS && <p className="text-xs text-destructive">{lang === 'pt' ? 'Campo obrigatório' : 'Required field'}</p>}
                    {hasImmediateRelativesInUS === "yes" && (
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 mt-4 p-4 bg-muted/20 rounded-md border border-dashed border-border scale-in-center">
                            <div className="space-y-2">
                                <Label htmlFor="immediateRelativeName">{lang === 'pt' ? 'Nome do parente:' : 'Relative name:'} *</Label>
                                <Input
                                    id="immediateRelativeName"
                                    {...register("immediateRelativeName", { required: hasImmediateRelativesInUS === "yes" })}
                                    className={errors?.immediateRelativeName ? "border-destructive" : ""}
                                    onChange={(e) => setValue("immediateRelativeName", e.target.value.replace(/[^a-zA-ZáéíóúàèìòùâêîôûãõçÁÉÍÓÚÀÈÌÒÙÂÊÎÔÛÃÕÇ\s]/g, ""))}
                                />
                                {errors?.immediateRelativeName && <p className="text-xs text-destructive">{lang === 'pt' ? 'Campo obrigatório' : 'Required field'}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="immediateRelativeRelationship">{lang === 'pt' ? 'Grau de parentesco:' : 'Relationship:'} *</Label>
                                <Input
                                    id="immediateRelativeRelationship"
                                    {...register("immediateRelativeRelationship", { required: hasImmediateRelativesInUS === "yes" })}
                                    className={errors?.immediateRelativeRelationship ? "border-destructive" : ""}
                                    onChange={(e) => setValue("immediateRelativeRelationship", e.target.value.replace(/[^a-zA-ZáéíóúàèìòùâêîôûãõçÁÉÍÓÚÀÈÌÒÙÂÊÎÔÛÃÕÇ\s]/g, ""))}
                                />
                                {errors?.immediateRelativeRelationship && <p className="text-xs text-destructive">{lang === 'pt' ? 'Campo obrigatório' : 'Required field'}</p>}
                            </div>
                            <div className="md:col-span-2 space-y-2">
                                <Label>{lang === 'pt' ? 'Status migratório do parente:' : "Relative's US status:"} *</Label>
                                <select
                                    {...register("immediateRelativeStatus", { required: hasImmediateRelativesInUS === "yes" })}
                                    className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${errors?.immediateRelativeStatus ? "border-destructive" : ""}`}
                                >
                                    <option value="">{lang === 'pt' ? 'Selecione...' : 'Select...'}</option>
                                    <option value="citizen">{statusOptions.citizen[lang]}</option>
                                    <option value="lpr">{statusOptions.lpr[lang]}</option>
                                    <option value="nonImmigrant">{statusOptions.nonImmigrant[lang]}</option>
                                    <option value="unknown">{statusOptions.unknown[lang]}</option>
                                </select>
                                {errors?.immediateRelativeStatus && <p className="text-xs text-destructive">{lang === 'pt' ? 'Campo obrigatório' : 'Required field'}</p>}
                            </div>
                        </div>
                    )}
                </div>

                <div className="space-y-3 pb-2">
                    <Label>{ds.family.hasOtherRelInUS[lang]} *</Label>
                    <RadioGroup
                        onValueChange={(val) => setValue("hasOtherRelativesInUS", val)}
                        value={hasOtherRelativesInUS}
                        className="flex gap-4 mt-1"
                    >
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="yes" id="oth-rel-yes" />
                            <Label htmlFor="oth-rel-yes">{lang === 'pt' ? 'Sim' : 'Yes'}</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="no" id="oth-rel-no" />
                            <Label htmlFor="oth-rel-no">{lang === 'pt' ? 'Não' : 'No'}</Label>
                        </div>
                    </RadioGroup>
                    {errors?.hasOtherRelativesInUS && <p className="text-xs text-destructive">{lang === 'pt' ? 'Campo obrigatório' : 'Required field'}</p>}
                </div>
            </div>
        </div>
    );
};
