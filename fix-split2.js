const fs = require('fs');
const content = fs.readFileSync('components/dashboard/member-directory/MemberModals.tsx', 'utf8');

const target = "'use client';\nimport React, { useState";
const idx = content.indexOf(target);

if (idx !== -1) {
  const original = content.substring(idx);
  const endIdx = original.lastIndexOf('</div>');
  const restored = original.substring(0, endIdx) + '</div>\n  );\n}\n';
  fs.writeFileSync('components/dashboard/MemberDirectoryView.tsx', restored);
  console.log("Restored!");
} else {
  console.log("Still not found");
}
