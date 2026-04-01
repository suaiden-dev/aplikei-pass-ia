import { F1F2Personal1Step } from "../steps/F1F2/F1F2Personal1Step";
import { F1F2Personal2Step } from "../steps/F1F2/F1F2Personal2Step";
import { F1F2TravelInfoStep } from "../steps/F1F2/F1F2TravelInfoStep";
import { F1F2HistoryStep } from "../steps/F1F2/F1F2HistoryStep";
import { F1F2AddressPhoneStep } from "../steps/F1F2/F1F2AddressPhoneStep";
import { F1F2SocialMediaStep } from "../steps/F1F2/F1F2SocialMediaStep";
import { F1F2PassportStep } from "../steps/F1F2/F1F2PassportStep";
import { F1F2UploadDocumentsStep } from "../steps/F1F2/F1F2UploadDocumentsStep";
import { ReviewStep } from "../steps/ReviewStep";
import { StepProps, DocumentStepProps } from "../types";

export const F1F2Renderer = ({ effectiveStep, commonProps, docProps }: { effectiveStep: number, commonProps: StepProps, docProps: DocumentStepProps }) => {
    switch (effectiveStep) {
        case 0: return <F1F2Personal1Step {...commonProps} />;
        case 1: return <F1F2Personal2Step {...commonProps} />;
        case 2: return <F1F2TravelInfoStep {...commonProps} />;
        case 3: return <F1F2HistoryStep {...commonProps} />;
        case 4: return <F1F2AddressPhoneStep {...commonProps} />;
        case 5: return <F1F2SocialMediaStep {...commonProps} />;
        case 6: return <F1F2PassportStep {...commonProps} />;
        case 7: return <F1F2UploadDocumentsStep 
          uploadedDocs={docProps.uploadedDocs} 
          handleUpload={docProps.handleUpload} 
          handleRemove={docProps.handleRemove} 
          uploading={docProps.uploading} 
          fileInputRef={docProps.fileInputRef} 
          setSelectedDoc={docProps.setSelectedDoc} 
          lang={docProps.lang} 
          t={docProps.t} 
          o={docProps.o} 
        />;
        case 8: return <ReviewStep {...commonProps} />;
        default: return null;
    }
};
