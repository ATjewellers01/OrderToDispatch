import { calculatePlannedDate } from './tatCalculator';

/**
 * Automatically computes and assigns the next stage planned completion date
 * based on the stage transition of the order.
 * 
 * @param {object} prevOrder The order object before the transition (can be null/undefined for new orders).
 * @param {object} nextOrder The order object after the transition.
 * @returns {object} The order object with updated planned completion dates.
 */
export const syncOrderPlannedDates = (prevOrder, nextOrder) => {
  if (!nextOrder) return nextOrder;

  // Clone nextOrder to prevent direct mutation
  const updatedOrder = { ...nextOrder };
  if (!updatedOrder.plannedDates) {
    updatedOrder.plannedDates = {};
  }

  // Base dates initialization if new order
  if (!prevOrder) {
    // If it's a new order, the next active stage is "Metal Issue"
    const plannedDate = calculatePlannedDate(new Date(), 'Metal Issue');
    updatedOrder.plannedDates = { 'Metal Issue': plannedDate };
    updatedOrder.currentStagePlannedDate = plannedDate;
    return updatedOrder;
  }

  const prevStage = prevOrder.orderStage || '';
  const nextStage = nextOrder.orderStage || '';

  let targetStage = nextStage;

  // Normalizing Follow Up
  if (nextStage === 'Follow Up') {
    targetStage = 'Follow Up';
  } else if (nextStage === 'QC' && prevStage !== 'QC') {
    targetStage = 'QC1';
  }

  // Determine the furthest completed stage
  if (nextOrder.deliveryStatus === 'Cancel') {
    targetStage = 'Order Cancel';
  } else if (nextOrder.deliveryStatus === 'Complete' || nextStage?.toLowerCase() === 'delivered') {
    targetStage = 'Delivered';
  } else if (nextOrder.receiveInStockStatus === 'Received') {
    targetStage = 'Delivery';
  } else if (nextOrder.huidStatus) {
    targetStage = 'Receive In Stock';
  } else if (nextOrder.qc3Status === 'QC Ok' || nextOrder.qc3Status === 'QC Okay' || nextOrder.status15 === 'Complete') {
    targetStage = 'HUID/Label';
  } else if (nextOrder.receiptStatus === 'Done') {
    targetStage = 'QC3';
  } else if (nextOrder.dispatchStatus === 'Done') {
    targetStage = 'RD (Receipt Department)';
  } else if (nextOrder.qc2Status === 'QC Okay' || nextOrder.status12 === 'QC Okay') {
    targetStage = 'Dispatch';
  } else if (
    nextOrder.polishInhouseStatus === 'Complete' || 
    nextOrder.polishOutsideStatus === 'Complete' || 
    nextOrder.banglePolishStatus === 'Complete' || 
    nextOrder.ePolishStatus === 'Complete' || 
    nextOrder.meenaInhouseStatus === 'Complete' || 
    nextOrder.meenaOutsideStatus === 'Complete'
  ) {
    targetStage = 'QC2';
  } else if (nextOrder.ghatJamaStatus === 'Complete') {
    targetStage = nextOrder.ghatJamaType || 'Polish Inhouse';
  } else if (nextOrder.status3 === 'QC Okay' && (nextOrder.qc1Type === 'Complete' || nextOrder.qc1Type === 'Partly Clear')) {
    targetStage = 'Ghat Jama';
  }

  if (targetStage && targetStage !== prevStage) {
    const plannedDate = calculatePlannedDate(new Date(), targetStage);
    updatedOrder.plannedDates = {
      ...updatedOrder.plannedDates,
      [targetStage]: plannedDate
    };
    updatedOrder.currentStagePlannedDate = plannedDate;
  }
  
  // Always ensure orderStage reflects the true calculated targetStage
  if (targetStage) {
    updatedOrder.orderStage = targetStage;
  }

  return updatedOrder;
};

/**
 * Helper to update an order in a list, recalculate TAT planned dates,
 * update component state, and persist to localStorage.
 * 
 * @param {Array} ordersList Existing list of orders.
 * @param {object} nextOrder The modified order object to save.
 * @param {function} setOrdersState State setter function for the orders list.
 * @returns {object} The updated order object with computed planned dates.
 */
export const saveOrderAndSyncPlannedDates = (ordersList, nextOrder, setOrdersState) => {
  const prevOrder = ordersList.find(o => o.id === nextOrder.id);
  const updatedOrder = syncOrderPlannedDates(prevOrder, nextOrder);
  const updatedList = ordersList.map(o => o.id === nextOrder.id ? updatedOrder : o);
  if (setOrdersState) {
    setOrdersState(updatedList);
  }
  localStorage.setItem('ordersDataV3', JSON.stringify(updatedList));
  return updatedOrder;
};
