import ServiceDetailTemplate from "@/presentation/components/templates/ServiceDetailTemplate";

export default function F1ServiceDetail() {
  return (
    <ServiceDetailTemplate 
      slug="visto-f1"
      heroImage="https://images.unsplash.com/photo-1508433957232-3107f5fd5995?q=80&w=1486&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
      successRate="98.4%"
      processType={{
        en: "Consular Process",
        pt: "Processo Consular",
        es: "Proceso Consular"
      }}
      heroIcon="verified"
    />
  );
}
