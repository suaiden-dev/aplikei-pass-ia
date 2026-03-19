import ServiceDetailTemplate from "@/presentation/components/templates/ServiceDetailTemplate";

export default function StatusExtensionDetail() {
  return (
    <ServiceDetailTemplate 
      slug="extensao-status"
      heroImage="https://images.unsplash.com/photo-1523217582562-09d0def993a6?q=80&w=2080&auto=format&fit=crop"
      successRate="97.8%"
      processType={{
        en: "Internal Process (I-539)",
        pt: "Processo Interno (I-539)",
        es: "Proceso Interno (I-539)"
      }}
      heroIcon="history_edu"
    />
  );
}
