import React, { useState, useEffect, useMemo } from 'react';
import toast from 'react-hot-toast';
import { Search, Filter, RotateCcw } from 'lucide-react';
import { TabSwitcher } from '../../components/StandardButtons';
import SearchableDropdown from '../../components/SearchableDropdown';
import FollowUpPendingToday from './FollowUpPendingToday';
import FollowUpPendingTotal from './FollowUpPendingTotal';
import FollowUpHistory from './FollowUpHistory';
import FollowUpForm from './FollowUpForm';
import { syncOrderPlannedDates } from '../../utils/orderWorkflowManager';

const FollowUp = () => {
  const [activeTab, setActiveTab] = useState('today');
  const [orders, setOrders] = useState([]);
  const [historyLogs, setHistoryLogs] = useState([]);
  const [metalIssues, setMetalIssues] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const [filters, setFilters] = useState({
    searchQuery: '',
    customer: '',
    category: '',
    stage: '',
    karigar: '',
    flwStatus: ''
  });

  const [historyFilters, setHistoryFilters] = useState({
    searchQuery: '',
    orderNo: ''
  });

  // Load datasets on mount
  useEffect(() => {
    const savedOrders = localStorage.getItem('ordersDataV3');
    if (savedOrders) setOrders(JSON.parse(savedOrders));
    const savedLogs = localStorage.getItem('followUpHistoryDataV3');
    if (savedLogs) setHistoryLogs(JSON.parse(savedLogs));
    const savedIssues = localStorage.getItem('metalIssuesDataV3');
    if (savedIssues) setMetalIssues(JSON.parse(savedIssues));
  }, []);

  const handleClearFilters = () => {
    setFilters({ searchQuery: '', customer: '', category: '', stage: '', karigar: '', flwStatus: '' });
    toast.success('Filters cleared');
  };

  const handleClearHistoryFilters = () => {
    setHistoryFilters({ searchQuery: '', orderNo: '' });
    toast.success('Filters cleared');
  };

  // Build latest-log map for quick lookup
  const latestLogMap = useMemo(() => {
    const map = new Map();
    historyLogs.forEach(log => {
      const existing = map.get(log.orderId);
      if (!existing || new Date(log.timestamp) > new Date(existing.timestamp)) {
        map.set(log.orderId, log);
      }
    });
    return map;
  }, [historyLogs]);

  // Active orders (not Delivered, QC, or Order Cancel, AND Metal Issue is complete, AND follow-up status is not completed)
  const activeOrders = useMemo(() => {
    const issuedIds = new Set(metalIssues.map(issue => issue.orderId));
    return orders.filter(o => {
      const s = o.orderStage?.toLowerCase() || '';
      const isDeliveredOrQC = s === 'delivered' || s === 'order cancel' || s === 'qc';
      
      const log = latestLogMap.get(o.id);
      const isCompletedStatus = log?.status === 'Ghat Jama Flw-up Done' || log?.status === 'Finished Jama';

      return !isDeliveredOrQC && issuedIds.has(o.id) && !isCompletedStatus;
    });
  }, [orders, metalIssues, latestLogMap]);

  // Today count: active orders with no log OR nextCallDate <= today
  const todayCount = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return activeOrders.filter(o => {
      const log = latestLogMap.get(o.id);
      if (!log) return true;
      const nextCall = log.nextDate || log.nextCallDate;
      if (!nextCall) return false;
      const d = new Date(nextCall);
      return !isNaN(d.getTime()) && d <= today;
    }).length;
  }, [activeOrders, latestLogMap]);

  // Total count: all active orders
  const totalCount = useMemo(() => activeOrders.length, [activeOrders]);

  // Dropdown option lists (from all orders, not filtered, for stable lists)
  const customersList = useMemo(() => Array.from(new Set(activeOrders.map(o => o.company))).filter(Boolean).sort(), [activeOrders]);
  const categoriesList = useMemo(() => Array.from(new Set(activeOrders.map(o => o.category))).filter(Boolean).sort(), [activeOrders]);
  const stagesList = useMemo(() => Array.from(new Set(activeOrders.map(o => o.orderStage))).filter(Boolean).sort(), [activeOrders]);
  const karigarsList = useMemo(() => Array.from(new Set(activeOrders.map(o => o.karigar))).filter(Boolean).sort(), [activeOrders]);
  const flwStatusesList = useMemo(() => {
    const statuses = historyLogs.map(l => l.status).filter(Boolean);
    return Array.from(new Set(statuses)).sort();
  }, [historyLogs]);

  // History: order numbers list for dropdown
  const orderNosList = useMemo(() =>
    Array.from(new Set(historyLogs.map(l => l.orderNo))).filter(Boolean).sort()
  , [historyLogs]);

  // History count (total logs)
  const historyCount = historyLogs.length;

  const handleSaveFollowUpLog = (newLog) => {
    const logEntry = { id: `flw-${Date.now()}`, ...newLog };
    const updatedLogs = [logEntry, ...historyLogs];
    setHistoryLogs(updatedLogs);
    localStorage.setItem('followUpHistoryDataV3', JSON.stringify(updatedLogs));

    const updatedOrders = orders.map(o => {
      if (o.id === newLog.orderId || o.orderNo === newLog.orderNo) {
        let updatedFields = { ...o };
        if (newLog.status === 'Change Karigar And Dates') {
          updatedFields.karigar = newLog.karigarName;
          updatedFields.karigarDeliveryDate = newLog.karigarDate;
          updatedFields.expectedDeliveryDate = newLog.expectedDate;
        }
        if (newLog.status === 'Order Cancel') {
          updatedFields.orderStage = 'Order Cancel';
        }
        if (newLog.status === 'Ghat Jama Flw-up Done') {
          updatedFields.orderStage = 'QC';
        }
        if (newLog.status === 'Finished Jama') {
          updatedFields.orderStage = 'Delivered';
        }
        return syncOrderPlannedDates(o, updatedFields);
      }
      return o;
    });

    setOrders(updatedOrders);
    localStorage.setItem('ordersDataV3', JSON.stringify(updatedOrders));
    toast.success('Follow-up call logged successfully');
  };

  return (
    <div className={`p-0 sm:p-2 md:p-6 space-y-2 md:space-y-4 flex flex-col min-h-0 ${
      activeTab === 'history' 
        ? 'h-full overflow-hidden' 
        : 'h-auto md:h-full overflow-y-auto md:overflow-hidden'
    } custom-scrollbar`}>

      {/* Combined Tab Switcher & Filter Row — matches MetalIssue.jsx */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3 xl:gap-4 w-full px-2 sm:px-0 flex-shrink-0">

        {/* Left: Tab Switcher */}
        <div className="flex-shrink-0 w-full sm:w-auto">
          <TabSwitcher
            activeTab={activeTab}
            onTabChange={(tab) => { setActiveTab(tab); handleClearFilters(); }}
            tabs={[
              { id: 'today', label: `Today (${todayCount})` },
              { id: 'total', label: `Total (${totalCount})` },
              { id: 'history', label: `History (${historyCount})` }
            ]}
          />
        </div>

        {/* Right: Filters Group — Today & Total */}
        {(activeTab === 'today' || activeTab === 'total') && (
          <div className="flex-1 flex flex-col lg:flex-row w-full gap-2 lg:gap-3 items-center overflow-visible">

            {/* Search + Mobile toggle */}
            <div className="flex items-center gap-2 w-full lg:w-auto lg:flex-[1.5]">
              <div className="flex-1 w-full relative">
                <Search className="absolute left-2.5 top-[9px] lg:top-[11px] text-gray-400" size={14} />
                <input
                  type="text"
                  placeholder={activeTab === 'today' ? 'Search today\'s list...' : 'Search active orders...'}
                  value={filters.searchQuery}
                  onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
                  className="w-full bg-white border border-gray-300 rounded-lg pl-8 pr-2 py-1.5 focus:outline-none focus:border-amber-500 text-xs md:text-sm h-[32px] md:h-[38px]"
                />
              </div>
              <button
                onClick={() => setShowMobileFilters(!showMobileFilters)}
                className={`lg:hidden flex items-center justify-center rounded-lg shadow-sm h-[32px] w-[32px] flex-shrink-0 transition ${showMobileFilters ? 'bg-amber-100 text-amber-700 border border-amber-200' : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50'}`}
                title="Toggle Filters"
              >
                <Filter size={14} />
              </button>
              <button
                onClick={handleClearFilters}
                className="lg:hidden flex items-center justify-center bg-gray-50 text-gray-500 border border-gray-200 rounded-lg h-[32px] w-[32px] flex-shrink-0 shadow-sm active:scale-95"
                title="Clear Filters"
              >
                <RotateCcw size={14} />
              </button>
            </div>

            {/* Dropdowns grid */}
            <div className={`${showMobileFilters ? 'flex' : 'hidden'} lg:flex flex-col lg:grid ${activeTab === 'today' ? 'lg:grid-cols-4' : 'lg:grid-cols-5'} gap-2 w-full lg:w-auto lg:flex-[6] overflow-visible`}>

              <div className="w-full relative">
                <SearchableDropdown
                  options={customersList.map(c => ({ value: c, label: c }))}
                  value={filters.customer}
                  onChange={(val) => setFilters({ ...filters, customer: val })}
                  placeholder="All Customers"
                  height="h-[32px] md:h-[38px]"
                  rounded="rounded-lg"
                />
              </div>

              <div className="w-full relative">
                <SearchableDropdown
                  options={categoriesList.map(c => ({ value: c, label: c }))}
                  value={filters.category}
                  onChange={(val) => setFilters({ ...filters, category: val })}
                  placeholder="All Categories"
                  height="h-[32px] md:h-[38px]"
                  rounded="rounded-lg"
                />
              </div>

              <div className="w-full relative">
                <SearchableDropdown
                  options={stagesList.map(c => ({ value: c, label: c }))}
                  value={filters.stage}
                  onChange={(val) => setFilters({ ...filters, stage: val })}
                  placeholder="All Stages"
                  height="h-[32px] md:h-[38px]"
                  rounded="rounded-lg"
                />
              </div>

              {/* Karigar — only in Total tab (5 cols) */}
              {activeTab === 'total' && (
                <div className="w-full relative">
                  <SearchableDropdown
                    options={karigarsList.map(c => ({ value: c, label: c }))}
                    value={filters.karigar}
                    onChange={(val) => setFilters({ ...filters, karigar: val })}
                    placeholder="All Karigars"
                    height="h-[32px] md:h-[38px]"
                    rounded="rounded-lg"
                  />
                </div>
              )}

              <div className="w-full relative">
                <SearchableDropdown
                  options={flwStatusesList.map(c => ({ value: c, label: c }))}
                  value={filters.flwStatus}
                  onChange={(val) => setFilters({ ...filters, flwStatus: val })}
                  placeholder="All Follow-ups"
                  height="h-[32px] md:h-[38px]"
                  rounded="rounded-lg"
                />
              </div>

            </div>

            {/* Desktop clear */}
            <button
              onClick={handleClearFilters}
              className="hidden lg:flex items-center justify-center bg-gray-50 text-gray-500 border border-gray-200 rounded-lg w-[38px] h-[38px] flex-shrink-0 hover:bg-gray-100 transition-colors shadow-sm ml-1"
              title="Clear Filters"
            >
              <RotateCcw size={16} />
            </button>
          </div>
        )}

        {/* Right: History Filters */}
        {activeTab === 'history' && (
          <div className="flex-1 flex flex-col lg:flex-row w-full gap-2 lg:gap-3 items-center overflow-visible">

            {/* Search */}
            <div className="flex items-center gap-2 w-full lg:w-auto lg:flex-[2]">
              <div className="flex-1 w-full relative">
                <Search className="absolute left-2.5 top-[9px] lg:top-[11px] text-gray-400" size={14} />
                <input
                  type="text"
                  placeholder="Search historical logs..."
                  value={historyFilters.searchQuery}
                  onChange={(e) => setHistoryFilters({ ...historyFilters, searchQuery: e.target.value })}
                  className="w-full bg-white border border-gray-300 rounded-lg pl-8 pr-2 py-1.5 focus:outline-none focus:border-amber-500 text-xs md:text-sm h-[32px] md:h-[38px]"
                />
              </div>
              <button
                onClick={handleClearHistoryFilters}
                className="lg:hidden flex items-center justify-center bg-gray-50 text-gray-500 border border-gray-200 rounded-lg h-[32px] w-[32px] flex-shrink-0 shadow-sm active:scale-95"
                title="Clear Filters"
              >
                <RotateCcw size={14} />
              </button>
            </div>

            {/* Order No dropdown */}
            <div className="w-full lg:w-[220px] relative overflow-visible">
              <SearchableDropdown
                options={orderNosList.map(o => ({ value: o, label: o }))}
                value={historyFilters.orderNo}
                onChange={(val) => setHistoryFilters({ ...historyFilters, orderNo: val })}
                placeholder="All Order Numbers"
                height="h-[32px] md:h-[38px]"
                rounded="rounded-lg"
              />
            </div>

            {/* Desktop clear */}
            <button
              onClick={handleClearHistoryFilters}
              className="hidden lg:flex items-center justify-center bg-gray-50 text-gray-500 border border-gray-200 rounded-lg w-[38px] h-[38px] flex-shrink-0 hover:bg-gray-100 transition-colors shadow-sm ml-1"
              title="Clear Filters"
            >
              <RotateCcw size={16} />
            </button>
          </div>
        )}
      </div>

      {/* Main Tab Content */}
      <div className="flex-1 min-h-0 overflow-visible">
        {activeTab === 'today' && (
          <FollowUpPendingToday
            orders={activeOrders}
            historyLogs={historyLogs}
            filters={filters}
            metalIssues={metalIssues}
            onUpdateClick={(order) => { setSelectedOrder(order); setIsFormOpen(true); }}
          />
        )}

        {activeTab === 'total' && (
          <FollowUpPendingTotal
            orders={activeOrders}
            historyLogs={historyLogs}
            filters={filters}
            metalIssues={metalIssues}
            onUpdateClick={(order) => { setSelectedOrder(order); setIsFormOpen(true); }}
          />
        )}

        {activeTab === 'history' && (
          <FollowUpHistory historyLogs={historyLogs} filters={historyFilters} metalIssues={metalIssues} />
        )}
      </div>

      {/* Update Follow-up Log Popup Modal Form */}
      <FollowUpForm
        isOpen={isFormOpen}
        onClose={() => { setIsFormOpen(false); setSelectedOrder(null); }}
        onSave={handleSaveFollowUpLog}
        order={selectedOrder}
      />

    </div>
  );
};

export default FollowUp;
