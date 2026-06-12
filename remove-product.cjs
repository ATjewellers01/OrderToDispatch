const fs = require('fs');
const path = require('path');

const walkSync = (dir, filelist = []) => {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const dirFile = path.join(dir, file);
    const dirent = fs.statSync(dirFile);
    if (dirent.isDirectory()) {
      filelist = walkSync(dirFile, filelist);
    } else {
      if (dirFile.endsWith('Pending.jsx') || dirFile.endsWith('History.jsx')) {
        filelist.push(dirFile);
      }
    }
  }
  return filelist;
};

const files = walkSync('./src/pages');
let modifiedCount = 0;

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;

  // Remove header { label: 'Product', ... }
  content = content.replace(/\n\s*\{\s*label:\s*['"]Product['"][^}]*\},?/g, '');
  
  // Remove string header "Product",
  content = content.replace(/\n\s*['"]Product['"],?/g, '');

  // Remove td for category (it maps to order.category or order.categoryName)
  // Example: <td className="px-4 py-3 text-center text-xs text-gray-600 whitespace-nowrap">{order.category || order.categoryName || '-'}</td>
  content = content.replace(/\n\s*<td[^>]*>\{order\.category[^}]*\}<\/td>/g, '');

  if (content !== originalContent) {
    fs.writeFileSync(file, content, 'utf8');
    modifiedCount++;
    console.log('Modified: ' + file);
  }
}
console.log('Total files modified: ' + modifiedCount);
