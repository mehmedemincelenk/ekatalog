const fs = require('fs');
const path = require('path');

const aiUtils = [
  'ai', 'geminiMetadata', 'hfStudio', 'openaiStudio', 'photoroomStudio', 
  'replicateStudio', 'vertexStudio'
];

function updateFile(filePath, isNowInAi) {
  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) return;
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  // 1. Fix relative imports from moved files to parent folder
  if (isNowInAi) {
    const lines = content.split('\n');
    const newLines = lines.map(line => {
      // e.g. import { ... } from './core' -> from '../core'
      if (line.includes("from './") && !aiUtils.some(u => line.includes(`from './${u}'`))) {
          const match = line.match(/from '\.\/([^']+)'/);
          if (match && !aiUtils.includes(match[1])) {
              changed = true;
              return line.replace("from './", "from '../");
          }
      }
      return line;
    });
    content = newLines.join('\n');
  }

  // 2. Update imports OF the moved utils
  aiUtils.forEach(u => {
    // Files in src/ (not in utils/ai)
    const fromRel = `from './utils/${u}'`;
    const toRel = `from './utils/ai/${u}'`;
    if (content.includes(fromRel)) { content = content.split(fromRel).join(toRel); changed = true; }

    const fromDeep = `from '../utils/${u}'`;
    const toDeep = `from '../utils/ai/${u}'`;
    if (content.includes(fromDeep)) { content = content.split(fromDeep).join(toDeep); changed = true; }
    
    // Files in src/utils/ (root)
    if (!isNowInAi) {
        const fromRoot = `from './${u}'`;
        const toRoot = `from './ai/${u}'`;
        if (content.includes(fromRoot)) { content = content.split(fromRoot).join(toRoot); changed = true; }
    }
  });

  if (changed) {
    fs.writeFileSync(filePath, content);
    console.log(`Updated: ${filePath}`);
  }
}

// 1. Update moved files in src/utils/ai
const aiDir = 'src/utils/ai';
if (fs.existsSync(aiDir)) {
    fs.readdirSync(aiDir).forEach(file => {
      updateFile(path.join(aiDir, file), true);
    });
}

// 2. Update remaining files in src/utils
const utilsDir = 'src/utils';
if (fs.existsSync(utilsDir)) {
    fs.readdirSync(utilsDir).forEach(file => {
      updateFile(path.join(utilsDir, file), false);
    });
}

// 3. Update all components/modals/layout
const baseDir = 'src';
function walkDir(dir) {
    fs.readdirSync(dir).forEach(file => {
        const filePath = path.join(dir, file);
        if (fs.statSync(filePath).isDirectory()) {
            if (file !== 'utils') walkDir(filePath);
        } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
            updateFile(filePath, false);
        }
    });
}
walkDir(baseDir);
