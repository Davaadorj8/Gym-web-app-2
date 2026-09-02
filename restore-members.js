const fs = require('fs');
const content = fs.readFileSync('components/dashboard/member-directory/MemberModals.tsx', 'utf8');

// Strip out the MemberModals prefix
const originalContent = content.split('<>\'use client\';')[1];
const restored = "'use client';" + originalContent + '</div>\n  );\n}\n';

fs.writeFileSync('components/dashboard/MemberDirectoryView.tsx', restored);
console.log("Restored!");
