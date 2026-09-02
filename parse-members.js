const fs = require('fs');

const content = fs.readFileSync('components/dashboard/MemberDirectoryView.tsx', 'utf8');
const tableStart = content.indexOf('<Card id="card-member-directory-table"');
const tableEnd = content.indexOf('</Card>', tableStart) + 7;

console.log('Table size:', (content.substring(tableStart, tableEnd).match(/\n/g) || []).length, 'lines');
