const fs = require('fs');
const path = './src/app/(pages)/dashboard/admin/samam/page.tsx';
let content = fs.readFileSync(path, 'utf8');

const quickAwardsStart = content.indexOf('{/* Quick award buttons */}');
if (quickAwardsStart !== -1) {
    const quickAwardsEndStr = '</div>';
    let endIdx = content.indexOf(quickAwardsEndStr, quickAwardsStart);
    // Find the closing div of the flex container containing the buttons
    endIdx = content.indexOf(quickAwardsEndStr, endIdx + quickAwardsEndStr.length);
    endIdx = content.indexOf(quickAwardsEndStr, endIdx + quickAwardsEndStr.length);
    if (endIdx !== -1) {
        content = content.substring(0, quickAwardsStart) + content.substring(endIdx + quickAwardsEndStr.length);
        fs.writeFileSync(path, content);
        console.log("Removed quick awards buttons");
    }
}
