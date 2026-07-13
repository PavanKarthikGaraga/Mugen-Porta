const fs = require('fs');
const oldFile = fs.readFileSync('/tmp/old-activities-mock.ts', 'utf-8').split('\n');

const missing = [
  ...oldFile.slice(76, 98),   // ACTIVITY_PACKS and FACULTIES
  ...oldFile.slice(273)       // JOURNEY_STAGES to end of file
].join('\n');

fs.appendFileSync('/Users/nischalsingana/DEV/Mugen-Porta/my-app/src/app/Data/activities-mock.ts', '\n' + missing);
console.log('Appended missing exports.');
