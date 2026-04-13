const fs = require('fs');
const https = require('https');
const { PDFDocument } = require('pdf-lib');

const url = 'https://www.uscis.gov/sites/default/files/document/forms/i-539a.pdf';
const path = 'src/forms/i539a_template.pdf';

const download = (url, dest) => {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    const request = https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    }, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        return download(response.headers.location, dest).then(resolve).catch(reject);
      }
      if (response.statusCode !== 200) {
        return reject(new Error(`Failed to get '${url}' (${response.statusCode})`));
      }
      response.pipe(file);
      file.on('finish', () => {
        file.close(resolve);
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => reject(err));
    });
  });
};

async function listFields() {
  try {
    console.log('Downloading I-539A...');
    await download(url, path);
    console.log('Download complete.');

    const bytes = fs.readFileSync(path);
    const pdfDoc = await PDFDocument.load(bytes, { ignoreEncryption: true });
    const form = pdfDoc.getForm();
    const fields = form.getFields();

    console.log('--- FIELD NAMES ---');
    fields.forEach(f => {
      console.log(f.getName());
    });
    console.log('--- END ---');
  } catch (err) {
    console.error('Error:', err.message);
  }
}

listFields();
