import fs from 'fs';
let code = fs.readFileSync('src/components/ProductCard.jsx', 'utf8');

// I can see the onClick event was accidentally wiped out in my fix-product-card.mjs script because it was matched poorly!
// Let's add it back properly!

code = code.replace(
    /<article ref=\{cardRef\} className=\{`bg-white border/,
    `<article onClick={() => { if (isAdmin) setShowFocusedEdit(true); }} ref={cardRef} className={\`bg-white border cursor-pointer`
);

fs.writeFileSync('src/components/ProductCard.jsx', code);
