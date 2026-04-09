import { Link } from "react-router-dom";
import { Button } from "../../components/Button";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-8 text-center">
      <p className="text-8xl font-black text-primary/10 mb-4">404</p>
      <h1 className="text-3xl font-black text-primary mb-4">Página não encontrada</h1>
      <p className="text-slate-500 mb-10 max-w-sm">
        A página que você procura não existe ou foi movida.
      </p>
      <Link to="/">
        <Button className="px-8 py-5 font-bold">Voltar para o início</Button>
      </Link>
    </div>
  );
}
