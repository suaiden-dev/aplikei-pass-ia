import ServiceDetailTemplate from "@/presentation/components/templates/ServiceDetailTemplate";

export default function I539VisaDetail() {
  return (
    <ServiceDetailTemplate 
      slug="changeofstatus"
      heroImage="https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=2070&auto=format&fit=crop"
      successRate="97.1%"
      processType={{
        en: "Internal Process (I-539)",
        pt: "Processo Interno (I-539)",
        es: "Proceso Interno (I-539)"
      }}
      heroIcon="task_alt"
    />
  );
}
