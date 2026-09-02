const fs = require('fs');
let content = fs.readFileSync('components/dashboard/AnalyticsView.tsx', 'utf8');

// The original import might have been different. Let's find it.
content = content.replace(
  "import { BuiltPlan, Member, AuditRecord, LockerCustomStatus, resolveMemberCategory, getMemberFullName } from '@/lib/types';",
  "import { BuiltPlan, GymMember, LockerCustomStatus } from '@/lib/types';"
);
content = content.replace(
  "import { BuiltPlan, Member, AuditRecord, LockerCustomStatus } from '@/lib/types';",
  "import { BuiltPlan, GymMember, LockerCustomStatus } from '@/lib/types';"
);

// fix GymMember usage
content = content.replace(/Member\[\]/g, "GymMember[]");
content = content.replace(/\(members: Member/g, "(members: GymMember");
content = content.replace(/\<Member\>/g, "<GymMember>");
content = content.replace(/members: GymMember,/g, "members: GymMember[],");
content = content.replace(/m: Member/g, "m: GymMember");
// Let's just fix the function signature:
content = content.replace(/function calculateTotalMembershipValue\(members: GymMember\[\], plans: BuiltPlan\[\]\): number/g, "function calculateTotalMembershipValue(members: GymMember[], plans: BuiltPlan[]): number");

// We need resolveMemberCategory and getMemberFullName? Wait, they are not exported?
// Let's implement them locally at the top of the file.
const localHelpers = `
function resolveMemberCategory(member: GymMember): 'under18' | 'over18' | 'organization' {
  if (member.isOrganization) return 'organization';
  if (member.dateOfBirth) {
    const age = new Date().getFullYear() - new Date(member.dateOfBirth).getFullYear();
    if (age < 18) return 'under18';
  }
  return 'over18';
}
function getMemberFullName(member: GymMember): string {
  if (member.isOrganization && member.organizationName) return member.organizationName;
  return \`\${member.firstName} \${member.lastName}\`.trim();
}
`;

content = content.replace("type AnalyticsTab =", localHelpers + "\ntype AnalyticsTab =");

fs.writeFileSync('components/dashboard/AnalyticsView.tsx', content);
