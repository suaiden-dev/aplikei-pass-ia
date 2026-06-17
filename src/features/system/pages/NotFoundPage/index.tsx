import { Link } from "react-router-dom";
import { PublicButton } from "@shared/components/atoms/PublicButton";

export default function NotFoundPage() {
  return (
    <div className="public-page flex min-h-screen flex-col items-center justify-center px-6 text-center sm:px-8 lg:px-16">
      <p className="text-8xl font-black text-primary/10 mb-4">404</p>
      <h1 className="text-3xl font-black text-primary mb-4">Página não encontrada</h1>
      <p className="text-text-muted mb-10 max-w-sm">
        A página que você procura não existe ou foi movida.
      </p>
      <PublicButton asChild tone="solid" size="lg">
        <Link to="/">Voltar para o início</Link>
      </PublicButton>
    </div>
  );
}
