const fs = require('fs');
let code = fs.readFileSync('src/components/ProductCard.jsx', 'utf8');

// Ensure import exists
if (!code.includes("import FocusedEditModal")) {
    code = `import FocusedEditModal from "./FocusedEditModal";\n` + code;
}

// Ensure state exists
if (!code.includes("const [showFocusedEdit, setShowFocusedEdit] = useState(false);")) {
    code = code.replace(
        /export default function ProductCard\(\{[^}]+\}\) \{/,
        `$&
  const [showFocusedEdit, setShowFocusedEdit] = useState(false);`
    );
}

// Ensure onClick exists on <article
if (!code.includes("onClick={() => isAdmin && setShowFocusedEdit(true)}")) {
    code = code.replace(
        /<article\s+ref=\{cardRef\}\s+className=\{`group relative flex flex-col/,
        `<article\n      onClick={() => isAdmin && setShowFocusedEdit(true)}\n      ref={cardRef}\n      className={\`group relative flex flex-col`
    );
}

// Add the fragment wrapper to the return statement of ProductCard
code = code.replace(/return \(\s*<article/, "return (\n    <>\n      <article");
code = code.replace(/<\/article>\s*\);\s*\}/, `</article>
      {showFocusedEdit && <FocusedEditModal product={product} onClose={() => setShowFocusedEdit(false)} onUpdate={onUpdate} />}
    </>
  );
}`);

fs.writeFileSync('src/components/ProductCard.jsx', code);
