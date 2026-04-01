import { ChangeOfStatusFormStep } from "../steps/ChangeOfStatus/ChangeOfStatusFormStep";
import { ChangeOfStatusDocumentsStep } from "../steps/ChangeOfStatus/ChangeOfStatusDocumentsStep";
import { ChangeOfStatusOfficialFormsStep } from "../steps/ChangeOfStatus/ChangeOfStatusOfficialFormsStep";
import { ChangeOfStatusCoverLetterStep } from "../steps/ChangeOfStatus/ChangeOfStatusCoverLetterStep";
import { ChangeOfStatusI20Step } from "../steps/ChangeOfStatus/ChangeOfStatusI20Step";
import { ChangeOfStatusSevisStep } from "../steps/ChangeOfStatus/ChangeOfStatusSevisStep";
import { ChangeOfStatusFinalFormsStep } from "../steps/ChangeOfStatus/ChangeOfStatusFinalFormsStep";
import { ChangeOfStatusFinalPackageStep } from "../steps/ChangeOfStatus/ChangeOfStatusFinalPackageStep";
import { ChangeOfStatusTrackingStep } from "../steps/ChangeOfStatus/ChangeOfStatusTrackingStep";
import { StepProps, DocumentStepProps } from "../types";

export const COSRenderer = ({ stepSlugs, effectiveStep, commonProps, docProps, serviceId }: { stepSlugs: string[], effectiveStep: number, commonProps: StepProps, docProps: DocumentStepProps, serviceId: string }) => {
    const currentSlug = stepSlugs[effectiveStep];
    switch (currentSlug) {
        case "cos-form": return <ChangeOfStatusFormStep {...commonProps} control={commonProps.control!} {...docProps} />;
        case "cos-documents": return <ChangeOfStatusDocumentsStep {...commonProps} {...docProps} />;
        case "cos-official-forms": return <ChangeOfStatusOfficialFormsStep {...commonProps} serviceId={serviceId} {...docProps} />;
        case "cos-cover-letter-form": return <ChangeOfStatusCoverLetterStep {...commonProps} />;
        case "cos-i20": return <ChangeOfStatusI20Step {...commonProps} {...docProps} />;
        case "cos-sevis": return <ChangeOfStatusSevisStep {...commonProps} {...docProps} />;
        case "cos-final-forms": return <ChangeOfStatusFinalFormsStep {...commonProps} serviceId={serviceId} />;
        case "cos-review": return <ChangeOfStatusFinalPackageStep {...commonProps} {...docProps} />;
        case "cos-tracking": return <ChangeOfStatusTrackingStep {...commonProps} />;
        default: return null;
    }
};
