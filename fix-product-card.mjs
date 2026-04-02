import fs from 'fs';
let code = fs.readFileSync('src/components/ProductCard.jsx', 'utf8');

if (!code.includes("import FocusedEditModal")) {
    code = `import FocusedEditModal from "./FocusedEditModal";\n` + code;
}

if (!code.includes("const [showFocusedEdit, setShowFocusedEdit] = useState(false);")) {
    code = code.replace(
        /export default function ProductCard\(\{[^}]+\}\) \{/,
        `$&
  const [showFocusedEdit, setShowFocusedEdit] = useState(false);`
    );
}

if (!code.includes("onClick={() => isAdmin && setShowFocusedEdit(true)}")) {
    code = code.replace(
        /<article\s+ref=\{cardRef\}\s+className=\{`group relative flex flex-col/,
        `<article\n      onClick={() => isAdmin && setShowFocusedEdit(true)}\n      ref={cardRef}\n      className={\`group relative flex flex-col`
    );
}

code = code.replace(/return \(\s*<article/, "return (\n    <>\n      <article");
code = code.replace(/<\/article>\s*\);\s*\}/, `</article>\n      {showFocusedEdit && <FocusedEditModal product={product} onClose={() => setShowFocusedEdit(false)} onUpdate={onUpdate} />}\n    </>\n  );\n}`);

fs.writeFileSync('src/components/ProductCard.jsx', code);
