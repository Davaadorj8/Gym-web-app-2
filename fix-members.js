const fs = require('fs');
let content = fs.readFileSync('components/dashboard/MemberDirectoryView.tsx', 'utf8');

const replacement = `          </div>
        )}
      </Modal>
    </div>
  );
}
`;
// Let's replace the last occurrence of "          </div>  );}" with replacement
if (content.endsWith('          </div>  );}')) {
  content = content.substring(0, content.length - '          </div>  );}'.length) + replacement;
  fs.writeFileSync('components/dashboard/MemberDirectoryView.tsx', content);
  console.log('Fixed end of file.');
} else {
  // try regex
  content = content.replace(/          <\/div>\s*}\)\s*}\s*<\/Modal>\s*<\/div>\s*\)\s*;\s*}\s*$/, replacement);
  content = content.replace(/          <\/div>\s*\}\)\s*\}\s*\)\s*;\s*\}\s*$/, replacement);
  content = content.replace(/          <\/div>\s*  \);\n}/, replacement);
  fs.writeFileSync('components/dashboard/MemberDirectoryView.tsx', content);
  console.log('regex applied');
}
