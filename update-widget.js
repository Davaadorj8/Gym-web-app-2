const fs = require('fs');
let content = fs.readFileSync('components/dashboard/StaffClockInOutWidget.tsx', 'utf8');

content = content.replace(/<select[\s\S]*?<\/select>\s*<select[\s\S]*?<\/select>/, `<Select value={effectiveStaffId} onValueChange={(val) => setSelectedStaffId(val)}>
            <SelectTrigger className="w-[150px] h-7 text-xs bg-background">
              <SelectValue placeholder="Select Staff" />
            </SelectTrigger>
            <SelectContent>
              {staffList.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.fullName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedShiftId} onValueChange={(val) => setSelectedShiftId(val)}>
            <SelectTrigger className="w-[150px] h-7 text-xs bg-background">
              <SelectValue placeholder="Select Shift" />
            </SelectTrigger>
            <SelectContent>
              {shifts.map((sh) => (
                <SelectItem key={sh.id} value={sh.id}>
                  {sh.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>`);

// Add imports
content = content.replace("import { Clock } from 'lucide-react';", "import { Clock } from 'lucide-react';\nimport { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';");

fs.writeFileSync('components/dashboard/StaffClockInOutWidget.tsx', content);
