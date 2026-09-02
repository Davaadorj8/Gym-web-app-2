const fs = require('fs');
const content = fs.readFileSync('components/dashboard/member-directory/MemberModals.tsx', 'utf8');
const parts = content.split("<>'use client';");
console.log(parts.length);
