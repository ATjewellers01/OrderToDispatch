export const getSidebarPendingCounts = (orders, metalIssues, followUpLogs) => {
  if (!orders || orders.length === 0) return {};

  const metalIssuesMap = new Map();
  if (metalIssues) {
    metalIssues.forEach(issue => {
      metalIssuesMap.set(issue.orderId, issue);
    });
  }

  const latestFollowUpMap = new Map();
  if (followUpLogs) {
    const sorted = [...followUpLogs].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    sorted.forEach(log => {
      latestFollowUpMap.set(log.orderId || log.orderNo, log);
    });
  }

  const issuedIds = new Set(metalIssues?.map(issue => issue.orderId) || []);

  const counts = {
    'Order Management': 0,
    'On Time Delivery': 0,
    'Master': 0,
    'Settings': 0,
    'TAT-DAYS Setup': 0,
  };

  // 1. Metal Issue
  counts['Metal Issue'] = orders.filter(o => !issuedIds.has(o.id)).length;

  // 2. Follow Up
  counts['Follow Up'] = orders.filter(o => {
    const s = o.orderStage?.toLowerCase() || '';
    const isDeliveredOrQC = s === 'delivered' || s === 'order cancel' || s === 'qc';
    const log = latestFollowUpMap.get(o.id) || latestFollowUpMap.get(o.orderNo);
    const isCompletedStatus = log?.status === 'Ghat Jama Flw-up Done' || log?.status === 'Finished Jama';
    return !isDeliveredOrQC && issuedIds.has(o.id) && !isCompletedStatus;
  }).length;

  // 3. QC1
  counts['QC1'] = orders.filter(o => {
    if (o.status3 === 'QC Okay' && o.qc1Type === 'Complete') return false;
    const followUpLog = latestFollowUpMap.get(o.id) || latestFollowUpMap.get(o.orderNo);
    const isGhatJamaDone = followUpLog?.status === 'Ghat Jama Flw-up Done';
    return o.orderStage === 'QC' && isGhatJamaDone;
  }).length;

  // 4. Ghat Jama
  counts['Ghat Jama'] = orders.filter(o => 
    o.status3 === 'QC Okay' && 
    o.qc1Type === 'Complete' && 
    o.ghatJamaStatus !== 'Complete'
  ).length;

  // 5. Meena Inhouse
  counts['Meena Inhouse'] = orders.filter(o => 
    o.ghatJamaStatus === 'Complete' && 
    o.ghatJamaType === 'Meena Inhouse' &&
    (!o.meenaInhouseStatus || o.meenaInhouseStatus === '' || o.meenaInhouseStatus === 'Pending')
  ).length;

  // 6. Meena Outside
  counts['Meena Outside'] = orders.filter(o => 
    o.ghatJamaStatus === 'Complete' && 
    o.ghatJamaType === 'Meena Outside' &&
    (!o.meenaOutsideStatus || o.meenaOutsideStatus === '' || o.meenaOutsideStatus === 'Pending')
  ).length;

  // 7. Polish Inhouse
  counts['Polish Inhouse'] = orders.filter(o => 
    o.ghatJamaStatus === 'Complete' && 
    (
      o.ghatJamaType === 'Polish Inhouse' || 
      (o.ghatJamaType === 'Meena Inhouse' && o.meenaInhouseStatus === 'Complete' && o.meenaInhouseType === 'Polish Inhouse') ||
      (o.ghatJamaType === 'Meena Outside' && o.meenaOutsideStatus === 'Complete' && o.meenaOutsideType === 'Polish Inhouse')
    ) &&
    (!o.polishInhouseStatus || o.polishInhouseStatus === '' || o.polishInhouseStatus === 'Pending')
  ).length;

  // 8. Polish Outside
  counts['Polish Outside'] = orders.filter(o => 
    o.ghatJamaStatus === 'Complete' && 
    (
      o.ghatJamaType === 'Polish Outside' || 
      (o.ghatJamaType === 'Meena Inhouse' && o.meenaInhouseStatus === 'Complete' && o.meenaInhouseType === 'Polish Outside') ||
      (o.ghatJamaType === 'Meena Outside' && o.meenaOutsideStatus === 'Complete' && o.meenaOutsideType === 'Polish Outside')
    ) &&
    (!o.polishOutsideStatus || o.polishOutsideStatus === '' || o.polishOutsideStatus === 'Pending')
  ).length;

  // 9. Bangle Polish
  counts['Bangle Polish'] = orders.filter(o => 
    o.ghatJamaStatus === 'Complete' && 
    (
      o.ghatJamaType === 'Bangle Polish' || 
      (o.ghatJamaType === 'Meena Inhouse' && o.meenaInhouseStatus === 'Complete' && o.meenaInhouseType === 'Bangle Polish') ||
      (o.ghatJamaType === 'Meena Outside' && o.meenaOutsideStatus === 'Complete' && o.meenaOutsideType === 'Bangle Polish')
    ) &&
    (!o.banglePolishStatus || o.banglePolishStatus === '' || o.banglePolishStatus === 'Pending')
  ).length;

  // 10. E-Polish
  counts['E-Polish'] = orders.filter(o => 
    o.ghatJamaStatus === 'Complete' && 
    (
      o.ghatJamaType === 'E-Polish' || 
      (o.ghatJamaType === 'Meena Inhouse' && o.meenaInhouseStatus === 'Complete' && o.meenaInhouseType === 'E-Polish')
    ) &&
    (!o.ePolishStatus || o.ePolishStatus === '' || o.ePolishStatus === 'Pending')
  ).length;

  // 11. QC2
  counts['QC2'] = orders.filter(o => 
    (o.polishInhouseStatus === 'Complete' ||
     o.meenaOutsideStatus === 'Complete' ||
     o.polishOutsideStatus === 'Complete' ||
     o.banglePolishStatus === 'Complete' ||
     o.ePolishStatus === 'Complete') &&
    o.qc2Status !== 'QC Okay' &&
    o.status12 !== 'QC Okay'
  ).length;

  // 12. Dispatch
  counts['Dispatch'] = orders.filter(o => 
    (o.qc2Status === 'QC Okay' || o.status12 === 'QC Okay') &&
    o.dispatchStatus !== 'Done'
  ).length;

  // 13. Receipt (RD)
  counts['Receipt'] = orders.filter(o => {
    if (o.receiptStatus === 'Done') return false;
    const isDispatched = o.dispatchStatus === 'Done';
    const followUpLog = latestFollowUpMap.get(o.id) || latestFollowUpMap.get(o.orderNo || o.orderNo);
    const isFinishedJama = followUpLog?.status === 'Finished Jama';
    return isDispatched || isFinishedJama;
  }).length;

  // 14. QC3
  counts['QC3'] = orders.filter(o => 
    o.receiptStatus === 'Done' &&
    o.qc3Status !== 'QC Ok' &&
    o.qc3Status !== 'QC Okay'
  ).length;

  // 15. HUID/Label
  counts['Huid/Label'] = orders.filter(o => 
    (o.qc3Status === 'QC Ok' || o.qc3Status === 'QC Okay' || o.status15 === 'Complete') &&
    !o.huidStatus
  ).length;

  // 16. Receive In Stock
  counts['Receive In Stock'] = orders.filter(o => 
    (o.huidStatus === 'Huid Complete' || o.huidStatus === 'Sent In Huid' || o.huidStatus === 'No Huid' || o.status15 === 'Complete') &&
    !o.receiveInStockStatus
  ).length;

  // 17. Delivery
  counts['Delivery'] = orders.filter(o => 
    (o.receiveInStockStatus === 'Received' || o.status14 === 'Received') &&
    o.deliveryStatus !== 'Complete' &&
    o.deliveryStatus !== 'Cancel' &&
    o.status15 !== 'Complete' &&
    o.status15 !== 'Cancel'
  ).length;

  return counts;
};
