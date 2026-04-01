import { PersonalInfo1Step } from "../steps/visto-b1-b2/PersonalInfo1Step";
import { PersonalInfo2Step } from "../steps/visto-b1-b2/PersonalInfo2Step";
import { TravelInfoStep } from "../steps/visto-b1-b2/TravelInfoStep";
import { CompanionsStep } from "../steps/visto-b1-b2/CompanionsStep";
import { PreviousTravelStep } from "../steps/visto-b1-b2/PreviousTravelStep";
import { AddressPhoneStep } from "../steps/visto-b1-b2/AddressPhoneStep";
import { SocialMediaStep } from "../steps/visto-b1-b2/SocialMediaStep";
import { PassportStep } from "../steps/visto-b1-b2/PassportStep";
import { USContactStep } from "../steps/visto-b1-b2/USContactStep";
import { FamilyInfoStep } from "../steps/visto-b1-b2/FamilyInfoStep";
import { WorkEducationStep } from "../steps/visto-b1-b2/WorkEducationStep";
import { AdditionalInfoStep } from "../steps/visto-b1-b2/AdditionalInfoStep";
import { DocumentsStep } from "../steps/DocumentsStep";
import { ReviewStep } from "../steps/ReviewStep";
import { StepProps, DocumentStepProps } from "../types";

export const B1B2Renderer = ({ effectiveStep, commonProps, docProps }: { effectiveStep: number, commonProps: StepProps, docProps: DocumentStepProps }) => {
    switch (effectiveStep) {
        case 0: return <PersonalInfo1Step {...commonProps} />;
        case 1: return <PersonalInfo2Step {...commonProps} />;
        case 2: return <TravelInfoStep {...commonProps} />;
        case 3: return <CompanionsStep {...commonProps} />;
        case 4: return <PreviousTravelStep {...commonProps} />;
        case 5: return <AddressPhoneStep {...commonProps} />;
        case 6: return <SocialMediaStep {...commonProps} />;
        case 7: return <PassportStep {...commonProps} />;
        case 8: return <USContactStep {...commonProps} />;
        case 9: return <FamilyInfoStep {...commonProps} />;
        case 10: return <WorkEducationStep {...commonProps} />;
        case 11: return <AdditionalInfoStep {...commonProps} />;
        case 12: return <DocumentsStep {...docProps} handleSkip={docProps.handleSkip!} />;
        case 13: return <ReviewStep {...commonProps} />;
        default: return null;
    }
};
