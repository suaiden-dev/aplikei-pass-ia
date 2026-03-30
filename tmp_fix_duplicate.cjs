const fs = require('fs');
const path = 'c:\\Users\\ander\\www\\aplikei-pass-ia\\src\\pages\\dashboard\\onboarding\\steps\\ChangeOfStatus\\ChangeOfStatusDocumentsStep.tsx';
let content = fs.readFileSync(path, 'utf8');

// The file has two identical lines:
//                 className={cn(
//                 className={cn(

const lines = content.split('\n');
const newLines = [];
let skipped = false;

for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('className={cn(') && lines[i+1] && lines[i+1].includes('className={cn(') && !skipped) {
        // Skip one of them
        skipped = true;
        continue;
    }
    newLines.push(lines[i]);
}

fs.writeFileSync(path, newLines.join('\n'), 'utf8');
console.log('Successfully removed duplicate className line.');
