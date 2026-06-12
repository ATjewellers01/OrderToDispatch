const fs = require('fs');

let content = fs.readFileSync('c:/Users/prata/Downloads/At Order To Dispatch/src/pages/MetalIssue/MetalIssuePending.jsx', 'utf8');

const tdRegex = /(<td[^>]*>\{?order\.company[^<]*<\/td>(\r?\n)*)/i;
if (tdRegex.test(content)) {
    const newTd = `        <td className="px-4 py-3 text-center text-xs text-gray-600 whitespace-nowrap">{order.category || '-'}</td>\n`;
    content = content.replace(tdRegex, `$1${newTd}`);
    console.log('TD replaced');
} else {
    console.log('TD NOT found');
}

const divRegex = /(<div>\s*<span[^>]*>[^<]*Customer[^<]*<\/span>\s*<span[^>]*>\{?order\.company[^<]*<\/span>\s*<\/div>(\r?\n)*)/i;
if (divRegex.test(content)) {
    const newDiv = `          <div>\n            <span className="text-gray-400 block uppercase text-[8px] tracking-tight">Category</span>\n            <span className="text-gray-700 font-bold">{order.category || '-'}</span>\n          </div>\n`;
    content = content.replace(divRegex, `$1${newDiv}`);
    console.log('DIV replaced');
} else {
    console.log('DIV NOT found');
}

fs.writeFileSync('c:/Users/prata/Downloads/At Order To Dispatch/test_out.jsx', content, 'utf8');
