import ServiceDetailTemplate from "@/presentation/components/templates/ServiceDetailTemplate";

export default function B1B2ServiceDetail() {
  return (
    <ServiceDetailTemplate 
      slug="visto-b1-b2"
      heroImage="https://images.unsplash.com/photo-1485738422979-f5c462d49f74?q=80&w=2070&auto=format&fit=crop"
      successRate="97.2%"
      processType={{
        en: "Consular Process",
        pt: "Processo Consular",
        es: "Proceso Consular"
      }}
      heroIcon="public"
    />
  );
}
