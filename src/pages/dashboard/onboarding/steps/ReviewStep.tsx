
import { StepProps } from "../types";

export const ReviewStep = ({ formData, o, lang }: StepProps) => {
    const sections = [
        {
            title: o.personalData[lang],
            fields: [
                { label: o.fullName[lang], value: formData.fullName },
                { label: o.dob[lang], value: formData.dob },
                { label: o.passportNumber[lang], value: formData.passportNumber },
                { label: o.nationality[lang], value: formData.nationality },
                { label: o.currentAddress[lang], value: formData.currentAddress },
            ]
        },
        {
            title: o.travelHistory[lang],
            fields: [
                { label: o.travelledBefore[lang], value: formData.travelledBefore === 'yes' ? o.yes[lang] : o.no[lang] },
                { label: o.hadVisa[lang], value: formData.hadVisa === 'yesApproved' ? o.yesApproved[lang] : formData.hadVisa === 'yesDenied' ? o.yesDenied[lang] : o.no[lang] },
                { label: o.countriesVisited[lang], value: formData.countriesVisited },
            ]
        },
        {
            title: o.processInfo[lang],
            fields: [
                { label: o.travelPurpose[lang], value: formData.travelPurpose },
                { label: o.expectedDate[lang], value: formData.expectedDate },
                { label: o.expectedDuration[lang], value: formData.expectedDuration },
                { label: o.consulateCity[lang], value: formData.consulateCity },
            ]
        }
    ];

    return (
        <div className="space-y-6">
            <h2 className="font-display text-lg font-semibold text-foreground">{o.finalReview[lang]}</h2>
            <p className="text-sm text-muted-foreground">{o.finalReviewDesc[lang]}</p>

            <div className="space-y-6 rounded-lg border border-border bg-card p-4">
                {sections.map((section, idx) => (
                    <div key={idx} className="space-y-2">
                        <h3 className="font-medium text-accent">{section.title}</h3>
                        <div className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
                            {section.fields.map((field, fIdx) => (
                                <div key={fIdx} className="flex flex-col">
                                    <span className="text-muted-foreground">{field.label}</span>
                                    <span className="font-medium text-foreground">{field.value || "-"}</span>
                                </div>
                            ))}
                        </div>
                        {idx < sections.length - 1 && <hr className="border-border/50" />}
                    </div>
                ))}
            </div>
        </div>
    );
};
