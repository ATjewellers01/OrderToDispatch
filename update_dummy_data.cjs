const fs = require('fs');
const p = 'c:/Users/prata/Downloads/At Order To Dispatch/src/pages/Master/masterdata.js';
let content = fs.readFileSync(p, 'utf8');
content = content.replace(/("aadharNumber":\s*"[^"]*")/g, '$1,\n    "verifyBy": "Admin"');
fs.writeFileSync(p, content);
console.log('Done!');
