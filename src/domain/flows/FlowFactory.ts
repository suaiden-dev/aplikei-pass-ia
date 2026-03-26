import { IProductFlow } from "./interfaces/IProductFlow";
import { B1ProductFlow } from "./strategies/B1ProductFlow";
import { F1ProductFlow } from "./strategies/F1ProductFlow";
import { COSProductFlow } from "./strategies/COSProductFlow";

export class FlowFactory {
  static getFlow(productSlug: string): IProductFlow {
    switch (productSlug) {
      case "visto-b1-b2":
        return new B1ProductFlow();
      case "visa-f1f2":
      case "visto-f1":
        return new F1ProductFlow();
      case "troca-status":
      case "extensao-status":
        return new COSProductFlow();
      default:
        // Default to B1 if unknown to maintain backward compatibility
        return new B1ProductFlow();
    }
  }
}
