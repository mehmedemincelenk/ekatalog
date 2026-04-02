import fs from 'fs';

// If PublishBar is covered by Navbar due to z-index let's check it. Navbar might have higher z-index.
let appCode = fs.readFileSync('src/components/PublishBar.jsx', 'utf8');
appCode = appCode.replace(/z-50/, 'z-[100]');
fs.writeFileSync('src/components/PublishBar.jsx', appCode);

// Also the button has onClick, but in the test it seems the modal wasn't opened?
// Let's look at publish_modal_debug.png to see what it shows using our script manually.
