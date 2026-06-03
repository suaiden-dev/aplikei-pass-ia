import { RiFlaskLine } from "react-icons/ri";
import { useLocale } from "@app/app/i18n";

const mode = String(import.meta.env.MODE || "").toLowerCase();
const isHomologationMode =
  mode.includes("homolog") || mode.includes("staging") || mode.includes("test") || mode.includes("sandbox");
const HOMOLOGATION_AUTOFILL_ENABLED =
  String(import.meta.env.VITE_HOMOLOGATION_AUTOFILL || "").toLowerCase() === "true" ||
  import.meta.env.DEV ||
  isHomologationMode;

function triggerInputEvent(element: Element, value: string) {
  const input = element as HTMLInputElement | HTMLTextAreaElement;
  const prototype =
    input instanceof HTMLTextAreaElement
      ? HTMLTextAreaElement.prototype
      : HTMLInputElement.prototype;
  const valueSetter = Object.getOwnPropertyDescriptor(prototype, "value")?.set;
  valueSetter?.call(input, value);
  input.dispatchEvent(new Event("input", { bubbles: true }));
  input.dispatchEvent(new Event("change", { bubbles: true }));
}

function pickValue(el: HTMLInputElement | HTMLTextAreaElement): string {
  const key = `${el.name || ""} ${el.id || ""} ${el.placeholder || ""}`.toLowerCase();
  if (key.includes("unit") || key.includes("aptsteflrnumber")) return "12B";
  if (key.includes("ssn") || key.includes("social security")) return "123-45-6789";
  if (key.includes("email")) return "homologacao+teste@aplikei.com";
  if (key.includes("phone") || key.includes("telefone") || key.includes("cel")) return "(305) 555-0199";
  if (key.includes("zip") || key.includes("cep")) return "33139";
  if (key.includes("city") || key.includes("cidade")) return "Miami";
  if (key.includes("state") || key.includes("estado")) return "FL";
  if (key.includes("passport")) return "P1234567";
  if (key.includes("alien")) return "A123456789";
  if (key.includes("uscis")) return "123456789012";
  if (key.includes("i94")) return "12345678901";
  if (key.includes("date") || key.includes("birth") || key.includes("expir")) return "01/15/2025";
  if (key.includes("name") || key.includes("nome")) return "Homologacao Teste";
  if (key.includes("address") || key.includes("street") || key.includes("endereco")) return "123 Test St";
  return "Teste Homologacao";
}

function fillForm(root: HTMLElement) {
  const fields = root.querySelectorAll("input, textarea, select");
  fields.forEach((node) => {
    if (!(node instanceof HTMLElement)) return;
    if (node.hasAttribute("disabled") || node.getAttribute("aria-disabled") === "true") return;

    if (node instanceof HTMLSelectElement) {
      if (node.value) return;
      const next = Array.from(node.options).find((opt) => opt.value && !opt.disabled);
      if (!next) return;
      node.value = next.value;
      node.dispatchEvent(new Event("change", { bubbles: true }));
      return;
    }

    if (node instanceof HTMLInputElement) {
      const type = node.type.toLowerCase();
      if (["hidden", "file", "submit", "button", "reset"].includes(type)) return;
      if (type === "checkbox" || type === "radio") return;
      if (node.value.trim().length > 0) return;
      if (type === "date") {
        triggerInputEvent(node, "2025-01-15");
        return;
      }
      triggerInputEvent(node, pickValue(node));
      return;
    }

    if (node instanceof HTMLTextAreaElement) {
      if (node.value.trim().length > 0) return;
      triggerInputEvent(
        node,
        "Texto de homologacao preenchido automaticamente para testes do fluxo.",
      );
    }
  });
}

interface HomologationAutofillButtonProps {
  rootId?: string;
}

export function HomologationAutofillButton({ rootId }: HomologationAutofillButtonProps) {
  const { lang } = useLocale();
  if (!HOMOLOGATION_AUTOFILL_ENABLED) return null;

  const handleClick = () => {
    const root = (rootId ? document.getElementById(rootId) : null) ?? document.body;
    fillForm(root);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="inline-flex items-center gap-2 rounded-xl border border-amber-300 bg-amber-50 px-3 py-2 text-[11px] font-black uppercase tracking-wider text-amber-700 transition-colors hover:bg-amber-100"
    >
      <RiFlaskLine className="text-sm" />
      {lang === "en" ? "Autofill Homologation" : lang === "es" ? "Completar Homologación" : "Preencher Homologação"}
    </button>
  );
}
