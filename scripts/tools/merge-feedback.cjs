const fs = require('fs');
const path = require('path');

function updateFile(filePath) {
    if (!fs.existsSync(filePath)) return;
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;

    // 1. Change import
    const oldImport = "import { useGlobalFeedback } from '../../hooks/useGlobalFeedback';";
    const oldImportApp = "import { useGlobalFeedback } from './hooks/useGlobalFeedback';";
    
    if (content.includes(oldImport)) {
        content = content.replace(oldImport, "");
        changed = true;
    }
    if (content.includes(oldImportApp)) {
        content = content.replace(oldImportApp, "");
        changed = true;
    }

    // Ensure useStore is imported
    if (changed && !content.includes("from '../../store'") && !content.includes("from '../store'") && !content.includes("from './store'")) {
        // Need to find where to add import
        // Usually after React
        content = "import { useStore } from '../../store';\n" + content;
    }

    // 2. Change hook usage
    // const { showFeedback } = useGlobalFeedback(); -> const showFeedback = useStore(s => s.showFeedback);
    const hookRegex = /const\s+\{\s*([^}]+)\s*\}\s*=\s*useGlobalFeedback\(\);/g;
    content = content.replace(hookRegex, (match, p1) => {
        const vars = p1.split(',').map(v => v.trim());
        const mapping = vars.map(v => {
            if (v === 'status') return 'feedbackStatus: status';
            if (v === 'message') return 'feedbackMessage: message';
            return v;
        }).join(', ');
        
        // Actually, it's easier to just use useStore and pick what's needed
        // But for simplicity in this script:
        let newHook = `const { ${mapping.replace('feedbackStatus: status', 'feedbackStatus').replace('feedbackMessage: message', 'feedbackMessage')} } = useStore();`;
        // Handle renaming if needed
        if (mapping.includes('feedbackStatus')) newHook = newHook.replace('feedbackStatus', 'feedbackStatus: status');
        if (mapping.includes('feedbackMessage')) newHook = newHook.replace('feedbackMessage', 'feedbackMessage: message');
        
        return newHook;
    });

    if (changed) {
        fs.writeFileSync(filePath, content);
        console.log(`Updated: ${filePath}`);
    }
}

const files = [
    'src/components/layout/HeroCarousel.tsx',
    'src/components/modals/DisplaySettingsModal.tsx',
    'src/components/modals/CouponModal.tsx',
    'src/App.tsx'
];

files.forEach(f => updateFile(f));
