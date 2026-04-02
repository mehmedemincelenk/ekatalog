import fs from 'fs';
let code = fs.readFileSync('src/components/SearchFilter.jsx', 'utf8');
code = code.replace(/CATEGORY_EMOJIS\[cat\] \|\| '📦'/g, '(cat === "Tümü" ? "🔍" : "📦")');
code = code.replace(/CATEGORY_EMOJIS\[cat\]/g, '(cat === "Tümü" ? "🔍" : "📦")');
fs.writeFileSync('src/components/SearchFilter.jsx', code);
