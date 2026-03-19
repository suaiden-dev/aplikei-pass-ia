import ServiceDetailTemplate from "@/presentation/components/templates/ServiceDetailTemplate";

export default function ChangeOfStatusDetail() {
  return (
    <ServiceDetailTemplate 
      slug="troca-status"
      heroImage="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=2070&auto=format&fit=crop"
      successRate="96.5%"
      processType={{
        en: "Internal Process (I-539)",
        pt: "Processo Interno (I-539)",
        es: "Proceso Interno (I-539)"
      }}
      heroIcon="swap_horiz"
    />
  );
}
