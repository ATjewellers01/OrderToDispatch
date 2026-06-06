const fs = require('fs');
const path = require('path');

const baseDir = path.resolve(__dirname, '..');

const targets = [
  { file: 'src/pages/DispatchDeparstment/DispatchHistory.jsx', stage: 'Dispatch' },
  { file: 'src/pages/Delivery/DeliveryHistory.jsx', stage: 'Delivery' },
  { file: 'src/pages/BanglePolish/BanglePolishHistory.jsx', stage: 'Bangle Polish' },
  { file: 'src/pages/MetalIssue/MetalIssueHistory.jsx', stage: 'Metal Issue' },
  { file: 'src/pages/ReceiptDepartment/ReceiptHistory.jsx', stage: 'Receipt' },
  { file: 'src/pages/ReceiveInStock/ReceiveInStockHistory.jsx', stage: 'ReceiveInStock' },
  { file: 'src/pages/QC3/QC3History.jsx', stage: 'QC3' },
  { file: 'src/pages/QC2/QC2History.jsx', stage: 'QC2' },
  { file: 'src/pages/QC1/QC1History.jsx', stage: 'QC1' },
  { file: 'src/pages/PolishInhouse/PolishInhouseHistory.jsx', stage: 'Polish Inhouse' },
  { file: 'src/pages/PolishOutside/PolishOutsideHistory.jsx', stage: 'Polish Outside' },
  { file: 'src/pages/MeenaOutside/MeenaOutsideHistory.jsx', stage: 'Meena Outside' },
  { file: 'src/pages/MeenaInhouse/MeenaInhouseHistory.jsx', stage: 'Meena Inhouse' },
  { file: 'src/pages/Huid/Label/LabelHistory.jsx', stage: 'Label' },
  { file: 'src/pages/GhatJama/GhatJamaHistory.jsx', stage: 'Ghat Jama' },
  { file: 'src/pages/EPolish/EPolishHistory.jsx', stage: 'EPolish' }
];

targets.forEach(({ file, stage }) => {
  const filePath = path.join(baseDir, file);
  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');

  // Replace import
  content = content.replace(
    /import\s*\{\s*calculateDelay\s*\}\s*from\s*['"](.*)utils\/tatCalculator['"];/g,
    "import { calculateDelay, formatTargetDate } from '$1utils/tatCalculator';"
  );

  // Replace plannedDates formatting
  const pattern = new RegExp(`formatDateTime\\(\\s*order\\.plannedDates\\?\\.\\[['"]${stage}['"]\\]\\s*\\)`, 'g');
  content = content.replace(pattern, `formatTargetDate(order.plannedDates?.['${stage}'], '${stage}')`);

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Refactored ${file}`);
});
