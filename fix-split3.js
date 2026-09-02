const fs = require('fs');
const content = fs.readFileSync('components/dashboard/member-directory/MemberModals.tsx', 'utf8');

const target = "return (\n    <>\n";
let idx = content.indexOf("'use client';", 500);

if (idx !== -1) {
  const original = content.substring(idx);
  const endIdx = original.lastIndexOf('</div>');
  const restored = original.substring(0, endIdx) + '</div>\n  );\n}\n';
  fs.writeFileSync('components/dashboard/MemberDirectoryView.tsx', restored);
  console.log("Restored!");
} else {
  console.log("Still not found");
}
