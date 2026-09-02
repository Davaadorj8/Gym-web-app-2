const fs = require('fs');
const content = fs.readFileSync('components/dashboard/MemberDirectoryView.tsx', 'utf8');

const modalStart = content.indexOf('{/* ---------------- MODALS ---------------- */}');
const end = content.lastIndexOf('</div>');

console.log('Modals size:', (content.substring(modalStart, end).match(/\n/g) || []).length, 'lines');
