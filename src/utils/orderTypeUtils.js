// ─────────────────────────────────────────────────────────────────────────────
//  orderTypeUtils.js — Shared Order Type color coding utility
//  Used across all Pending and History pages in the system.
//
//  Order Types & Color Map:
//    Customer Order  →  White  (trusted, regular client work)
//    Stock Order     →  Blue   (internal stock replenishment)
//    Urgent Order    →  Red    (high priority, needs fast turnaround)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Returns Tailwind CSS classes for the Order Type badge.
 * @param {string} orderType - The order type string value
 * @returns {string} - Tailwind class string for bg, text, and border
 */
export const getOrderTypeColor = (orderType) => {
  switch (orderType?.trim()) {
    case 'Customer Order':
      return 'bg-white text-slate-800 border-slate-300';
    case 'Stock Order':
      return 'bg-blue-100 text-blue-800 border-blue-300';
    case 'Urgent Order':
      return 'bg-red-100 text-red-800 border-red-300';
    default:
      return 'bg-gray-100 text-gray-600 border-gray-200';
  }
};
