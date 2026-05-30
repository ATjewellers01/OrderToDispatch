const fs = require('fs');
const path = require('path');

// 1. Update SearchableDropdown.jsx
const dropdownPath = 'src/components/SearchableDropdown.jsx';
let dropdownContent = fs.readFileSync(dropdownPath, 'utf8');

// Replace imports
dropdownContent = dropdownContent.replace(
  "import { Search, ChevronDown, Check, Plus } from 'lucide-react';",
  "import { Search, ChevronDown, Check, Plus, Square, CheckSquare } from 'lucide-react';"
);

// Add isMulti prop
dropdownContent = dropdownContent.replace(
  'rounded = "rounded"',
  'rounded = "rounded",\n  isMulti = false'
);

// Replace selectedOption logic
dropdownContent = dropdownContent.replace(
  'const selectedOption = allOptions.find(opt => opt.value === value);',
  `const selectedOption = allOptions.find(opt => opt.value === value);
  const selectedOptions = isMulti && Array.isArray(value) ? allOptions.filter(opt => value.includes(opt.value)) : [];
  
  const getTriggerText = () => {
    if (isMulti) {
      if (!value || value.length === 0) return placeholder;
      if (value.length === 1) return selectedOptions[0]?.label || value[0];
      return \`\${value.length} Selected\`;
    }
    return selectedOption ? selectedOption.label : value ? value : placeholder;
  };
  
  const isSelected = (optValue) => {
    if (isMulti) return Array.isArray(value) && value.includes(optValue);
    return value === optValue;
  };`
);

// Replace trigger text span
dropdownContent = dropdownContent.replace(
  /<span className=\{\`text-xs truncate \$\{selectedOption.*?\<\/span>/s,
  `<span className={\`text-xs truncate \${(isMulti ? (value && value.length > 0) : (selectedOption && selectedOption.value !== '' || value)) ? 'text-gray-900 font-medium' : 'text-gray-400 font-medium'}\`}>
          {getTriggerText()}
        </span>`
);

// Replace option click handler
dropdownContent = dropdownContent.replace(
  /onClick=\{\(e\) => \{\s*e\.stopPropagation\(\);\s*onChange\(opt\.value\);\s*setIsOpen\(false\);\s*setSearchTerm\(\"\"\);\s*\}\}/s,
  `onClick={(e) => {
                    e.stopPropagation();
                    if (isMulti) {
                      const currentVal = Array.isArray(value) ? value : [];
                      if (currentVal.includes(opt.value)) {
                        onChange(currentVal.filter(v => v !== opt.value));
                      } else {
                        onChange([...currentVal, opt.value]);
                      }
                    } else {
                      onChange(opt.value);
                      setIsOpen(false);
                      setSearchTerm("");
                    }
                  }}`
);

// Replace Check icon with Checkbox logic
dropdownContent = dropdownContent.replace(
  /\{value === opt\.value && \(\s*<Check size=\{12\} className=\"text-amber-600 flex-shrink-0\" \/>\s*\)\}/s,
  `{isMulti ? (
                    isSelected(opt.value) ? (
                      <CheckSquare size={14} className="text-amber-600 flex-shrink-0" />
                    ) : (
                      <Square size={14} className="text-gray-300 flex-shrink-0" />
                    )
                  ) : (
                    isSelected(opt.value) && (
                      <Check size={12} className="text-amber-600 flex-shrink-0" />
                    )
                  )}`
);

// Replace group styles logic
dropdownContent = dropdownContent.replace(
  /className=\{\`px-3 py-1\.5 text-xs cursor-pointer flex justify-between items-center hover:bg-amber-50 transition-colors group \$\{value === opt\.value\s*\?\s*'bg-amber-50\/50 text-amber-700 font-semibold'\s*:\s*'text-gray-700'\s*\}\`\}/s,
  `className={\`px-3 py-1.5 text-xs cursor-pointer flex justify-between items-center hover:bg-amber-50 transition-colors group \${isSelected(opt.value)
                      ? 'bg-amber-50/50 text-amber-700 font-semibold'
                      : 'text-gray-700'
                    }\`}`
);

fs.writeFileSync(dropdownPath, dropdownContent, 'utf8');
console.log('Updated SearchableDropdown.jsx');

// 2. Walk directories and process 21 pages
function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else if (file.endsWith('.jsx')) {
      results.push(file);
    }
  });
  return results;
}

const files = walk('src/pages');
const targetFiles = files.filter(f => {
  const c = fs.readFileSync(f, 'utf8');
  return c.includes('SearchableDropdown') && c.includes('filters');
});

console.log(`Found ${targetFiles.length} target files to update.`);

let updatedCount = 0;

targetFiles.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  // Find the state dataset name used in the file (e.g. orders, records, deliveries)
  // Usually it's mapped like `const categoriesList = useMemo(() => Array.from(new Set(orders.map...`
  const datasetMatch = content.match(/useMemo\(\(\) => Array\.from\(new Set\(([a-zA-Z0-9_]+)\.map/);
  const datasetName = datasetMatch ? datasetMatch[1] : 'orders';

  // Rule 1: Change filter state initialization from '' to [] for dropdown keys
  // It looks like: category: '', karigar: '', etc.
  // We'll replace keys that match typical dropdowns
  const filterKeysToChange = ['category', 'karigar', 'melting', 'orderType', 'customer', 'stage', 'location', 'companyName', 'emailDomain'];
  filterKeysToChange.forEach(key => {
    const regex = new RegExp(`(${key}\\s*:\\s*)['"]['"]`, 'g');
    content = content.replace(regex, `$1[]`);
  });

  // Rule 2: Change filtering logic `if (filters.X && o.X !== filters.X)` to `!filters.X.includes(o.X)`
  const filterIfRegex = /if\s*\(\s*filters\.([a-zA-Z0-9_]+)\s*&&\s*([a-zA-Z0-9_]+)\.([a-zA-Z0-9_]+)\s*!==\s*filters\.\1\s*\)\s*return false;/g;
  content = content.replace(filterIfRegex, 'if (filters.$1 && filters.$1.length > 0 && !filters.$1.includes($2.$3)) return false;');

  // Rule 3: Add `isMulti={true}` to SearchableDropdowns and modify the options prop to include counts
  // e.g. options={categoriesList.map(c => ({ value: c, label: c }))}
  // to: isMulti={true} options={categoriesList.map(c => ({ value: c, label: \`\${c} (\${datasetName.filter(d => d.category === c).length})\` }))}
  
  // To know which property to count, we look at what property generated the list. 
  // Wait, the options map just uses the string `c`.
  // The prop name is usually the filter key. Let's parse `<SearchableDropdown ... />` elements.
  
  content = content.replace(/<SearchableDropdown\s+([^>]+)>/g, (match, propsString) => {
    // Check if it's already multi
    if (propsString.includes('isMulti=')) return match;
    
    // Find the value prop to know the filter key (e.g. value={filters.category} or value={effectiveFilters.category})
    const valueMatch = propsString.match(/value=\{.*?filters\.([a-zA-Z0-9_]+)\}/);
    const filterKey = valueMatch ? valueMatch[1] : null;

    if (!filterKey) return match; // If we can't figure out the key, skip it

    // Replace options mapping
    // options={xyzList.map(c => ({ value: c, label: c }))}
    // We want to calculate the count dynamically
    let newPropsString = propsString.replace(
      /options=\{([a-zA-Z0-9_]+)\.map\(([a-zA-Z0-9_]+)\s*=>\s*\(\{\s*value:\s*\2,\s*label:\s*\2\s*\}\)\)\}/,
      (optMatch, listVar, itemVar) => {
        // e.g., datasetName = orders, filterKey = category
        // options={xyzList.map(c => { const count = orders.filter(d => d.category === c).length; return { value: c, label: \`\${c} (\${count})\` }; })}
        return `options={${listVar}.map(${itemVar} => { const count = ${datasetName}.filter(d => d.${filterKey} === ${itemVar}).length; return { value: ${itemVar}, label: \`\${${itemVar}} (\${count})\` }; })}`;
      }
    );

    // Some pages use specific prop spacing
    return `<SearchableDropdown isMulti={true} ${newPropsString}>`;
  });

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    updatedCount++;
    console.log(`Updated ${file}`);
  }
});

console.log(`Total files updated: ${updatedCount}`);
