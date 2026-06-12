const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

let modifiedFiles = 0;
walkDir('c:/Users/prata/Downloads/At Order To Dispatch/src/pages', function(filePath) {
  if (filePath.endsWith('Pending.jsx') || filePath.endsWith('History.jsx')) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    let modified = false;

    if (!content.includes('{order.category ||')) {
      const tdRegex = /(<td[^>]*>\{?order\.company[^<]*<\/td>(\r?\n)*)/i;
      if (tdRegex.test(content)) {
        const newTd = `        <td className="px-4 py-3 text-center text-xs text-gray-600 whitespace-nowrap">{order.category || '-'}</td>\n`;
        content = content.replace(tdRegex, `$1${newTd}`);
        modified = true;
      }
      
      const divRegex = /(<div>\s*<span[^>]*>[^<]*Customer[^<]*<\/span>\s*<span[^>]*>\{?order\.company[^<]*<\/span>\s*<\/div>(\r?\n)*)/i;
      if (divRegex.test(content)) {
        const newDiv = `          <div>\n            <span className="text-gray-400 block uppercase text-[8px] tracking-tight">Category</span>\n            <span className="text-gray-700 font-bold">{order.category || '-'}</span>\n          </div>\n`;
        content = content.replace(divRegex, `$1${newDiv}`);
        modified = true;
      }

      if (modified) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log('Updated', filePath);
        modifiedFiles++;
      }
    }
  }
});
console.log(`Total files modified: ${modifiedFiles}`);
