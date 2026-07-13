const fs = require('fs');

// Read the TS file
const tsContent = fs.readFileSync('src/app/Data/activities-mock.ts', 'utf8');

// Extract the ACTIVITIES array. It should be inside `export const ACTIVITIES = [...]`
let arrayStr = tsContent.substring(tsContent.indexOf('export const ACTIVITIES'));
arrayStr = arrayStr.substring(arrayStr.indexOf('['));
// To handle the end, we can use a basic JS evaluator if we strip types, but it's easier to just use ts-node with require.
