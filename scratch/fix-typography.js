const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else if (file.endsWith('.tsx')) {
            results.push(file);
        }
    });
    return results;
}

const files = walk('./src');

files.forEach(filePath => {
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;

    // Pattern for Typography with fontWeight prop
    const typographyRegex = /<Typography\b([^>]*?)>/gs;
    
    content = content.replace(typographyRegex, (fullMatch, props) => {
        if (props.includes('fontWeight={')) {
            changed = true;
            let fontWeightVal = '';
            // Extract fontWeight value
            const fwMatch = props.match(/fontWeight=\{([^}]+)\}/);
            if (fwMatch) {
                fontWeightVal = fwMatch[1];
                // Remove fontWeight prop from original props
                let newProps = props.replace(/\s*fontWeight=\{[^}]+\}/g, '');
                
                // Check if sx already exists
                if (newProps.includes('sx={{')) {
                    // Merge into existing sx
                    newProps = newProps.replace(/sx=\{\{(.*?)\}\}/s, (sxMatch, sxContent) => {
                        const separator = sxContent.trim() ? ', ' : '';
                        return `sx={{${sxContent.trim()}${separator}fontWeight: ${fontWeightVal}}}`;
                    });
                } else {
                    // Add new sx prop
                    newProps += ` sx={{fontWeight: ${fontWeightVal}}}`;
                }
                return `<Typography${newProps}>`;
            }
        }
        return fullMatch;
    });

    if (changed) {
        console.log(`Fixed: ${filePath}`);
        fs.writeFileSync(filePath, content);
    }
});
