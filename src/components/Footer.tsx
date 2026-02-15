import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="border-t border-border bg-primary text-primary-foreground">
      <div className="container py-12">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <span className="font-display text-lg font-bold">Aplikei</span>
            <p className="mt-2 text-sm text-primary-foreground/70">
              Guia passo a passo + IA para processos imigratórios simples.
            </p>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-primary-foreground/50">
              Serviços
            </h4>
            <ul className="space-y-2 text-sm text-primary-foreground/70">
              <li><Link to="/servicos/visto-b1-b2" className="hover:text-accent transition-colors">Visto B1/B2</Link></li>
              <li><Link to="/servicos/visto-f1" className="hover:text-accent transition-colors">Visto F-1</Link></li>
              <li><Link to="/servicos/extensao-status" className="hover:text-accent transition-colors">Extensão de Status</Link></li>
              <li><Link to="/servicos/troca-status" className="hover:text-accent transition-colors">Troca de Status</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-primary-foreground/50">
              Plataforma
            </h4>
            <ul className="space-y-2 text-sm text-primary-foreground/70">
              <li><Link to="/como-funciona" className="hover:text-accent transition-colors">Como funciona</Link></li>
              <li><Link to="/disclaimers" className="hover:text-accent transition-colors">Disclaimers</Link></li>
              <li><Link to="/ajuda" className="hover:text-accent transition-colors">Central de Ajuda (N1)</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-primary-foreground/50">
              Legal
            </h4>
            <ul className="space-y-2 text-sm text-primary-foreground/70">
              <li><Link to="/termos" className="hover:text-accent transition-colors">Termos de Uso</Link></li>
              <li><Link to="/privacidade" className="hover:text-accent transition-colors">Política de Privacidade</Link></li>
              <li><Link to="/reembolso" className="hover:text-accent transition-colors">Política de Reembolso</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-primary-foreground/10 pt-6">
          <p className="text-center text-xs text-primary-foreground/40">
            © {new Date().getFullYear()} Aplikei. Todos os direitos reservados. Aplikei não é escritório de advocacia, não oferece aconselhamento jurídico e não garante aprovação de vistos ou petições.
          </p>
        </div>
      </div>
    </footer>
  );
}
