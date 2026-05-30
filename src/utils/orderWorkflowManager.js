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

  // Check key transitions
  const stageChanged = prevStage !== nextStage;
  const qc1Changed = prevOrder.status3 !== nextOrder.status3;
  const ghatChanged = prevOrder.ghatJamaStatus !== nextOrder.ghatJamaStatus;

  // Polish / Meena completed
  const polishInhouseDone = prevOrder.polishInhouseStatus !== 'Complete' && nextOrder.polishInhouseStatus === 'Complete';
  const polishOutsideDone = prevOrder.polishOutsideStatus !== 'Complete' && nextOrder.polishOutsideStatus === 'Complete';
  const banglePolishDone = prevOrder.banglePolishStatus !== 'Complete' && nextOrder.banglePolishStatus === 'Complete';
  const ePolishDone = prevOrder.ePolishStatus !== 'Complete' && nextOrder.ePolishStatus === 'Complete';
  const meenaInhouseDone = prevOrder.meenaInhouseStatus !== 'Complete' && nextOrder.meenaInhouseStatus === 'Complete';
  const meenaOutsideDone = prevOrder.meenaOutsideStatus !== 'Complete' && nextOrder.meenaOutsideStatus === 'Complete';
  const polishOrMeenaCompleted = polishInhouseDone || polishOutsideDone || banglePolishDone || ePolishDone || meenaInhouseDone || meenaOutsideDone;

  // QC2 completed
  const qc2Done = (prevOrder.qc2Status !== 'QC Okay' && nextOrder.qc2Status === 'QC Okay') || 
                  (prevOrder.status12 !== 'QC Okay' && nextOrder.status12 === 'QC Okay');

  // Dispatch completed
  const dispatchDone = prevOrder.dispatchStatus !== 'Done' && nextOrder.dispatchStatus === 'Done';

  // Receipt completed
  const receiptDone = prevOrder.receiptStatus !== 'Done' && nextOrder.receiptStatus === 'Done';

  // QC3 completed
  const qc3Done = (prevOrder.qc3Status !== 'QC Ok' && nextOrder.qc3Status === 'QC Ok') ||
                  (prevOrder.qc3Status !== 'QC Okay' && nextOrder.qc3Status === 'QC Okay') ||
                  (prevOrder.status15 !== 'Complete' && nextOrder.status15 === 'Complete');

  // HUID completed
  const huidDone = !prevOrder.huidStatus && !!nextOrder.huidStatus;

  // Receive In Stock completed
  const stockDone = prevOrder.receiveInStockStatus !== 'Received' && nextOrder.receiveInStockStatus === 'Received';

  if (
    stageChanged || 
    qc1Changed || 
    ghatChanged || 
    polishOrMeenaCompleted || 
    qc2Done || 
    dispatchDone || 
    receiptDone || 
    qc3Done || 
    huidDone || 
    stockDone
  ) {
    let targetStage = nextStage;

    // Normalizing transitions
    if (nextStage === 'Follow Up') {
      targetStage = 'Follow Up';
    } else if (nextStage === 'QC' && prevStage !== 'QC') {
      targetStage = 'QC1';
    } else if (nextOrder.status3 === 'QC Okay' && nextOrder.qc1Type === 'Complete' && prevOrder.status3 !== 'QC Okay') {
      targetStage = 'Ghat Jama';
    } else if (nextOrder.ghatJamaStatus === 'Complete' && prevOrder.ghatJamaStatus !== 'Complete') {
      targetStage = nextOrder.ghatJamaType || 'Polish Inhouse';
    } else if (polishOrMeenaCompleted) {
      targetStage = 'QC2';
    } else if (qc2Done) {
      targetStage = 'Dispatch';
    } else if (dispatchDone) {
      targetStage = 'RD (Receipt Department)';
    } else if (receiptDone) {
      targetStage = 'QC3';
    } else if (qc3Done) {
      targetStage = 'HUID/Label';
    } else if (huidDone) {
      targetStage = 'Receive In Stock';
    } else if (stockDone) {
      targetStage = 'Delivery';
    } else if (nextStage?.toLowerCase() === 'delivered') {
      targetStage = 'Delivery';
    }

    if (targetStage) {
      const plannedDate = calculatePlannedDate(new Date(), targetStage);
      updatedOrder.plannedDates = {
        ...updatedOrder.plannedDates,
        [targetStage]: plannedDate
      };
      updatedOrder.currentStagePlannedDate = plannedDate;
    }
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
