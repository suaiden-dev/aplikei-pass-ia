import { PDFDocument, StandardFonts, rgb } from "npm:pdf-lib@1.17.1";

interface TermEntry { title: string; content: string; category: string; }

export interface PdfInput {
  docId: string;
  name: string;
  email: string;
  role: string;
  acceptedAt: string;
  ip: string;
  userAgent: string;
  terms: TermEntry[];
}

function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<\/h[1-6]>/gi, "\n")
    .replace(/<li[^>]*>/gi, "• ")
    .replace(/<\/li>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ").replace(/&#39;/g, "'").replace(/&quot;/g, '"')
    .replace(/\n{3,}/g, "\n\n").trim();
}

function wrapText(text: string, maxWidth: number, size: number, font: ReturnType<PDFDocument["embedStandardFont"]> extends Promise<infer T> ? T : never): string[] {
  const lines: string[] = [];
  for (const paragraph of text.split("\n")) {
    if (!paragraph.trim()) { lines.push(""); continue; }
    const words = paragraph.split(" ");
    let line = "";
    for (const word of words) {
      const candidate = line ? `${line} ${word}` : word;
      if ((font as any).widthOfTextAtSize(candidate, size) > maxWidth && line) {
        lines.push(line); line = word;
      } else { line = candidate; }
    }
    if (line) lines.push(line);
  }
  return lines;
}

export async function generateAcceptancePdf(input: PdfInput): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);
  const fontReg = await doc.embedFont(StandardFonts.Helvetica);

  const W = 595.28, H = 841.89; // A4
  const margin = 50, contentW = W - margin * 2;
  const black = rgb(0, 0, 0), grey = rgb(0.4, 0.4, 0.4), light = rgb(0.7, 0.7, 0.7);
  const primary = rgb(0.09, 0.37, 0.93);

  let page = doc.addPage([W, H]);
  let y = H - margin;

  const newPage = () => { page = doc.addPage([W, H]); y = H - margin; };

  const text = (str: string, x: number, size: number, font = fontReg, color = black) => {
    if (y < margin + 20) newPage();
    page.drawText(str, { x, y, size, font, color });
    y -= size + 4;
  };

  const line = (thickness = 0.5, color = light) => {
    if (y < margin + 20) newPage();
    page.drawLine({ start: { x: margin, y }, end: { x: W - margin, y }, thickness, color });
    y -= 10;
  };

  // Header
  text("APLIKEI PASSAPORTE", margin, 18, fontBold, primary);
  y -= 4;
  text("Comprovante de Aceite de Termos e Condições", margin, 11, fontReg, grey);
  y -= 8;
  line(1, primary);
  y -= 4;

  // Metadata table
  const meta: [string, string][] = [
    ["Identificador do Documento", input.docId],
    ["Data e Hora", new Date(input.acceptedAt).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" })],
    ["Nome", input.name],
    ["E-mail", input.email],
    ["Perfil", input.role === "lawyer" ? "Advogado / Escritório" : "Cliente"],
    ["Endereço IP", input.ip],
    ["Navegador / Dispositivo", input.userAgent.slice(0, 90)],
  ];
  for (const [label, value] of meta) {
    if (y < margin + 20) newPage();
    page.drawText(`${label}:`, { x: margin, y, size: 9, font: fontBold, color: grey });
    page.drawText(value, { x: margin + 170, y, size: 9, font: fontReg, color: black });
    y -= 14;
  }
  y -= 8;
  line(1, light);

  // Terms sections
  for (const term of input.terms) {
    if (y < margin + 60) newPage();
    y -= 10;
    const catLabel = term.category.includes("privacy") ? "POLÍTICA DE PRIVACIDADE" : "TERMOS DE USO";
    text(catLabel, margin, 11, fontBold, primary);
    line(0.5);
    text(term.title, margin, 10, fontBold);
    y -= 4;

    const bodyLines = wrapText(stripHtml(term.content), contentW, 9, fontReg as any);
    for (const l of bodyLines) {
      if (y < margin + 15) newPage();
      if (l) page.drawText(l, { x: margin, y, size: 9, font: fontReg, color: black });
      y -= 13;
    }
    y -= 8;
  }

  // Footer
  y -= 10;
  line(0.5);
  text("Este documento é gerado automaticamente e constitui prova legal do aceite dos termos.", margin, 8, fontReg, grey);
  text("Aplicado sobre as condições vigentes na data de aceite registrada acima.", margin, 8, fontReg, grey);

  return doc.save();
}
