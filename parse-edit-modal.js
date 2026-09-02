const fs = require('fs');
const content = fs.readFileSync('components/dashboard/MemberDirectoryView.tsx', 'utf8');
const p1 = content.indexOf('<Modal\n        id="modal-edit-member"');
const p2 = content.indexOf('<Modal\n        id="modal-delete-member"');
fs.writeFileSync('edit-modal.txt', content.substring(p1, p2));
