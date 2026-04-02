const fs = require('fs');
let code = fs.readFileSync('src/components/SearchFilter.jsx', 'utf8');

// The file relies on CATEGORY_EMOJIS but we removed it from config. Let's provide a fallback.
code = code.replace(/CATEGORY_EMOJIS\[cat\]/g, '(cat === "Tümü" ? "🔍" : "📦")');

fs.writeFileSync('src/components/SearchFilter.jsx', code);
