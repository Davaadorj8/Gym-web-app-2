const fs = require('fs');
const content = fs.readFileSync('components/dashboard/inventory/LockerManagementTab.tsx', 'utf8');

let parenCount = 0;
let braceCount = 0;
let angleCount = 0;

for (let i = 0; i < content.length; i++) {
  const c = content[i];
  if (c === '(') parenCount++;
  else if (c === ')') parenCount--;
  else if (c === '{') braceCount++;
  else if (c === '}') braceCount--;
  else if (c === '<') angleCount++;
  else if (c === '>') angleCount--;
}

console.log(`Parens: ${parenCount}, Braces: ${braceCount}, Angles: ${angleCount}`);
