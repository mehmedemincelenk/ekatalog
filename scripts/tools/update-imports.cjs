const fs = require('fs');
const path = require('path');

const folders = ['ui', 'modals', 'layout'];

const componentMap = {};
folders.forEach(f => {
    const dir = path.join('src/components', f);
    if (fs.existsSync(dir)) {
        fs.readdirSync(dir).forEach(file => {
            if (file.endsWith('.tsx') || file.endsWith('.ts')) {
                const name = file.replace(/\.tsx?$/, '');
                componentMap[name] = f;
            }
        });
    }
});

function updateFile(filePath, currentFolder) {
    if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) return;
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;

    const lines = content.split('\n');
    const newLines = lines.map(line => {
        if (currentFolder && line.includes("from '../") && !line.includes("from '../../")) {
            changed = true;
            return line.replace("from '../", "from '../../");
        }

        const match = line.match(/from '\.\/([^']+)'/);
        if (match) {
            const imported = match[1];
            if (componentMap[imported]) {
                const targetFolder = componentMap[imported];
                if (currentFolder === targetFolder || (currentFolder && currentFolder.startsWith(targetFolder + '/'))) {
                    return line;
                } else if (!currentFolder) {
                    changed = true;
                    return line.replace("from './", `from './${targetFolder}/`);
                } else {
                    changed = true;
                    return line.replace("from './", `from '../${targetFolder}/`);
                }
            } else if (currentFolder) {
                // If importing something that was NOT moved (shouldn't happen now), go up
                // But wait, if it's a test importing from parent, it's correct
                if (currentFolder.includes('__tests__') && !componentMap[imported]) {
                     // Leave it?
                } else if (!componentMap[imported]) {
                     // changed = true;
                     // return line.replace("from './", "from '../");
                }
            }
        }
        
        const appMatch = line.match(/from '\.\/components\/([^']+)'/);
        if (appMatch) {
            const imported = appMatch[1];
            if (componentMap[imported]) {
                changed = true;
                return line.replace("from './components/", `from './components/${componentMap[imported]}/`);
            }
        }

        return line;
    });

    content = newLines.join('\n');

    if (changed) {
        fs.writeFileSync(filePath, content);
        console.log(`Updated: ${filePath}`);
    }
}

folders.forEach(f => {
    const dir = path.join('src/components', f);
    if (fs.existsSync(dir)) {
        fs.readdirSync(dir).forEach(file => {
            updateFile(path.join(dir, file), f);
        });
    }
});

folders.forEach(f => {
    const testDir = path.join('src/components', f, '__tests__');
    if (fs.existsSync(testDir)) {
        fs.readdirSync(testDir).forEach(file => {
            updateFile(path.join(testDir, file), f + '/__tests__');
        });
    }
});

updateFile('src/App.tsx', null);
