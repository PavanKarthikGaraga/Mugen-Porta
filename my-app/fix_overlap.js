const fs = require('fs');
const path = './src/app/(pages)/dashboard/student/passport/page.tsx';
let content = fs.readFileSync(path, 'utf8');

// The overlapping happens because of flex-wrap combined with -mt-10.
// Let's change the layout of the avatar and actions so they are more robust.
// Instead of flex-wrap on the parent, let's keep the avatar floating or absolutely positioned, or fix the flex layout.
// Original:
// <div className="flex items-end justify-between -mt-10 mb-4 flex-wrap gap-3">
// Let's replace it with:
// <div className="flex flex-col sm:flex-row sm:items-end justify-between -mt-12 sm:-mt-10 mb-4 gap-4 relative z-10">
// Also the avatar:
// className="w-20 h-20 rounded-2xl border-4 border-white flex items-center justify-center text-3xl font-bold text-white shadow-md bg-white overflow-hidden relative"
// 
// Let's find the exact string
const searchStr = `          <div className="flex items-end justify-between -mt-10 mb-4 flex-wrap gap-3">
            {/* Avatar */}
            <div
              className="w-20 h-20 rounded-2xl border-4 border-white flex items-center justify-center text-3xl font-bold text-white shadow-md"
              style={{ backgroundColor: BRAND }}
            >
              AS
            </div>`;

const replaceStr = `          <div className="flex flex-col sm:flex-row sm:items-end justify-between -mt-12 sm:-mt-10 mb-4 gap-4 relative z-10">
            {/* Avatar */}
            <div className="relative group">
              <div
                className="w-24 h-24 rounded-2xl border-4 border-white flex items-center justify-center text-3xl font-bold text-white shadow-md bg-white overflow-hidden relative"
                style={{ backgroundColor: BRAND }}
              >
                AS
              </div>
            </div>`;

content = content.replace(searchStr, replaceStr);
fs.writeFileSync(path, content);
console.log("Fixed overlap UI");
