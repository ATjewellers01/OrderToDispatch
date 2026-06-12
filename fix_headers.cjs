const fs = require('fs');
const files = [
  'src/pages/ReceiveInStock/ReceiveInStockPending.jsx',
  'src/pages/ReceiveInStock/ReceiveInStockHistory.jsx',
  'src/pages/ReceiptDepartment/ReceiptPending.jsx',
  'src/pages/ReceiptDepartment/ReceiptHistory.jsx',
  'src/pages/QC3/QC3Pending.jsx',
  'src/pages/QC3/QC3History.jsx',
  'src/pages/Huid/Label/LabelPending.jsx',
  'src/pages/Huid/Label/LabelHistory.jsx',
  'src/pages/Delivery/DeliveryPending.jsx',
  'src/pages/Delivery/DeliveryHistory.jsx',
  'src/pages/DispatchDeparstment/DispatchPending.jsx',
  'src/pages/DispatchDeparstment/DispatchHistory.jsx'
];

let totalReplaced = 0;
files.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  // Look for the two lines to remove
  const target1 = "    { label: 'Order Date', className: 'text-center' },\r\n    { label: 'Expected Date', className: 'text-center' },\r\n";
  const target2 = "    { label: 'Order Date', className: 'text-center' },\n    { label: 'Expected Date', className: 'text-center' },\n";
  const target3 = "    { label: 'Order Date', className: 'text-center' },\r\n    { label: 'Expected Date', className: 'text-center' },";
  const target4 = "    { label: 'Order Date', className: 'text-center' },\n    { label: 'Expected Date', className: 'text-center' },";

  let newContent = content;
  if (content.includes(target1)) {
    newContent = content.replace(target1, '');
  } else if (content.includes(target2)) {
    newContent = content.replace(target2, '');
  } else if (content.includes(target3)) {
    newContent = content.replace(target3, '');
  } else if (content.includes(target4)) {
    newContent = content.replace(target4, '');
  }

  if (content !== newContent) {
    fs.writeFileSync(file, newContent, 'utf8');
    console.log('Fixed ' + file);
    totalReplaced++;
  } else {
    console.log('Target not found in ' + file);
  }
});
console.log('Total files fixed: ' + totalReplaced);
