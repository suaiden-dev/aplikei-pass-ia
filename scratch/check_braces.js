
const fs = require('fs');
const content = fs.readFileSync('src/i18n/locales/pt/visas.ts', 'utf8');
const lines = content.split('\n');
let depth = 0;
for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const opens = (line.match(/{/g) || []).length;
    const closes = (line.match(/}/g) || []).length;
    depth += opens;
    depth -= closes;
    if (depth === 0) {
        console.log(`Depth reached 0 at line ${i + 1}: ${line}`);
    }
}
