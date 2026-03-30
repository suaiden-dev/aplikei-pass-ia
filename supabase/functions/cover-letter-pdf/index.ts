import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";
import { PDFDocument, rgb, StandardFonts } from "https://esm.sh/pdf-lib@1.17.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function respond(payload: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(payload), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    status,
  });
}

// Simple HTML → plain text extractor
function htmlToText(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<\/h[1-6]>/gi, '\n')
    .replace(/<\/li>/gi, '\n')
    .replace(/<li[^>]*>/gi, '• ')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  let step = 'init';
  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    step = 'auth';
    const token = (req.headers.get('Authorization') ?? '').replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !user) return respond({ error: 'Usuário não autenticado.' }, 401);

    const { html, userServiceId, clientUserId } = await req.json();
    if (!html || !userServiceId || !clientUserId) {
      return respond({ error: 'Parâmetros obrigatórios: html, userServiceId, clientUserId.' }, 400);
    }

    console.log(`[cover-letter-pdf] ServiceID: ${userServiceId}`);

    // ── Convert HTML → PDF with pdf-lib ────────
    step = 'build_pdf';
    const doc = await PDFDocument.create();
    const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);
    const fontReg  = await doc.embedFont(StandardFonts.Helvetica);

    const plainText = htmlToText(html);
    const lines = plainText.split('\n');

    const pageWidth = 612;
    const pageHeight = 792;
    const margin = 72; // 1 inch
    const maxWidth = pageWidth - margin * 2;
    const lineHeight = 14;
    const fontSize = 10;

    let page = doc.addPage([pageWidth, pageHeight]);
    let y = pageHeight - margin;

    // Title
    page.drawText('Cover Letter – Change of Status Application', {
      x: margin, y,
      font: fontBold, size: 13,
      color: rgb(0.05, 0.15, 0.5),
      maxWidth,
    });
    y -= 20;
    page.drawLine({
      start: { x: margin, y },
      end: { x: margin + maxWidth, y },
      thickness: 0.5, color: rgb(0.7, 0.7, 0.7),
    });
    y -= 18;

    for (const rawLine of lines) {
      const line = rawLine.trimEnd();

      // Word wrap
      const words = line.split(' ');
      let currentLine = '';

      for (const word of words) {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        const testWidth = fontReg.widthOfTextAtSize(testLine, fontSize);

        if (testWidth > maxWidth && currentLine) {
          if (y < margin + lineHeight) {
            page = doc.addPage([pageWidth, pageHeight]);
            y = pageHeight - margin;
          }
          page.drawText(currentLine, {
            x: margin, y,
            font: fontReg, size: fontSize,
            color: rgb(0.1, 0.1, 0.1),
          });
          y -= lineHeight;
          currentLine = word;
        } else {
          currentLine = testLine;
        }
      }

      // Draw remaining text
      if (currentLine) {
        if (y < margin + lineHeight) {
          page = doc.addPage([pageWidth, pageHeight]);
          y = pageHeight - margin;
        }
        page.drawText(currentLine, {
          x: margin, y,
          font: fontReg, size: fontSize,
          color: rgb(0.1, 0.1, 0.1),
        });
        y -= lineHeight;
      } else {
        // Empty line = paragraph break
        y -= lineHeight / 2;
      }
    }

    step = 'save_pdf';
    const pdfBytes = await doc.save();

    // ── Upload to storage ───────────────────────
    step = 'upload';
    const bucket = 'process-documents';
    const fileName = `cos_cover_letter_${userServiceId}_${Date.now()}.pdf`;

    const { error: uploadErr } = await supabaseAdmin.storage
      .from(bucket)
      .upload(fileName, pdfBytes, { contentType: 'application/pdf', upsert: true });
    if (uploadErr) return respond({ error: `Erro no upload: ${uploadErr.message}` });

    // ── Save to documents table ─────────────────
    step = 'db';
    const { error: dbErr } = await supabaseAdmin
      .from('documents')
      .upsert({
        user_id: clientUserId,
        user_service_id: userServiceId,
        name: 'cos_cover_letter',
        storage_path: fileName,
        bucket_id: bucket,
        status: 'approved', // already approved by admin
      }, { onConflict: 'user_id,name' });
    if (dbErr) return respond({ error: `Erro no banco: ${dbErr.message}` });

    console.log(`[cover-letter-pdf] OK: ${fileName}`);
    return respond({ success: true, fileName });

  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[cover-letter-pdf] erro em "${step}":`, msg);
    return respond({ error: `[${step}] ${msg}` }, 500);
  }
});
