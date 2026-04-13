import { PDFDocument } from "pdf-lib";
import fs from "fs";
import path from "path";

async function listFields(fileName: string) {
  const filePath = path.join(process.cwd(), "src/forms", fileName);
  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    return;
  }
  const bytes = fs.readFileSync(filePath);
  const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
  const form = doc.getForm();
  const fields = form.getFields();

  console.log(`--- Fields for ${fileName} ---`);
  fields.forEach(f => {
    console.log(`Name: ${f.getName()}, Type: ${f.constructor.name}`);
  });
}

async function main() {
  await listFields("g1145_template.pdf");
  await listFields("g1450_template.pdf");
}

main().catch(console.error);
