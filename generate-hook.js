const fs = require('fs');
const content = fs.readFileSync('analytics-hook-content.txt', 'utf8');

const lines = content.split('\n');
const vars = [];

for(const line of lines) {
  if (line.startsWith('  const [') || line.startsWith('  const {') || (line.startsWith('  const ') && line.includes('='))) {
    // Extract var name
    let match = line.match(/^  const (\[.*?\]|\{.*?\}|[a-zA-Z0-9_]+)\s*[:=]/);
    if (match) {
      let v = match[1];
      if (v.startsWith('[')) {
        v = v.replace('[', '').replace(']', '').split(',').map(s => s.trim())[0];
        vars.push(v);
      } else if (v.startsWith('{')) {
        // let's ignore destructured for return, they are usually not needed, wait they might be.
      } else {
        vars.push(v);
      }
    }
  }
}

// Write the hook file
let hookCode = `
import { useState, useMemo } from 'react';
import { useDashboard } from '@/lib/orchestration';
import { BuiltPlan, Member, AuditRecord, LockerCustomStatus } from '@/lib/types';
import { useAppLocale } from '@/components/I18nProvider';
import { useTranslations } from 'next-intl';

export function useAnalyticsData() {
${content}

  return {
    ${vars.join(',\n    ')}
  };
}
`;

fs.writeFileSync('components/dashboard/analytics/useAnalyticsData.ts', hookCode);
console.log("Hook generated with vars:", vars.length);
