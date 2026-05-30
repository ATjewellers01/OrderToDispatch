import React, { useState, useEffect, useMemo } from 'react';
import { Search, Filter, RotateCcw } from 'lucide-react';
import toast from 'react-hot-toast';
import SearchableDropdown from '../../components/SearchableDropdown';
import { TabSwitcher } from '../../components/StandardButtons';
import DeliveryPending from './DeliveryPending';
import DeliveryHistory from './DeliveryHistory';
import DeliveryForm from './DeliveryForm';
import DeliveryEdit from './DeliveryEdit';
import { saveOrderAndSyncPlannedDates } from '../../utils/orderWorkflowManager';

export const Delivery = () => {
  const [activeTab, setActiveTab] = useState('pending');
  const [orders, setOrders] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editOrder, setEditOrder] = useState(null);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const [filters, setFilters] = useState({
    searchQuery: '',
    category: '',
    karigar: '',
    melting: '',
    orderType: ''
  });

  // Load from localStorage
  useEffect(() => {
    const savedOrders = localStorage.getItem('ordersDataV3');
    if (savedOrders) {
      setOrders(JSON.parse(savedOrders));
    }
  }, []);

  const handleSaveDelivery = (updatedOrder) => {
    saveOrderAndSyncPlannedDates(orders, updatedOrder, setOrders);
    toast.success('Delivery status updated successfully');
  };

  const handleClearFilters = () => {
    setFilters({
      searchQuery: '',
      category: '',
      karigar: '',
      melting: '',
      orderType: ''
    });
    toast.success('Filters cleared');
  };

  const categoriesList = useMemo(() => Array.from(new Set(orders.map(o => o.category || o.categoryName))).filter(Boolean).sort(), [orders]);
  const karigarsList = useMemo(() => Array.from(new Set(orders.map(o => o.karigar || o.karigarName))).filter(Boolean).sort(), [orders]);
  const meltingList = useMemo(() => Array.from(new Set(orders.map(o => o.melting))).filter(Boolean).sort(), [orders]);
  const typesList = useMemo(() => Array.from(new Set(orders.map(o => o.orderType))).filter(Boolean).sort(), [orders]);

  // Filtered base orders
  const filteredOrdersBase = useMemo(() => {
    return orders.filter(o => {
      const categoryVal = o.category || o.categoryName || '';
      const karigarVal = o.karigar || o.karigarName || '';
      
      if (filters.category && categoryVal !== filters.category) return false;
      if (filters.karigar && karigarVal !== filters.karigar) return false;
      if (filters.melting && o.melting !== filters.melting) return false;
      if (filters.orderType && o.orderType !== filters.orderType) return false;

      if (filters.searchQuery) {
        const q = filters.searchQuery.toLowerCase();
        return Object.values(o).some(val => String(val).toLowerCase().includes(q));
      }
      return true;
    });
  }, [orders, filters]);

  // Split orders based on Delivery stage
  // 1. Pending: Complete in Stock stage (receiveInStockStatus is 'Received' or status14 is 'Received') AND not yet delivered/cancelled
  const pendingOrders = useMemo(() => {
    return filteredOrdersBase.filter(o => 
      (o.receiveInStockStatus === 'Received' || o.status14 === 'Received') &&
      o.deliveryStatus !== 'Complete' &&
      o.deliveryStatus !== 'Cancel' &&
      o.status15 !== 'Complete' &&
      o.status15 !== 'Cancel'
    );
  }, [filteredOrdersBase]);

  // 2. History: processed Delivery orders with status 'Complete' or 'Cancel'
  const historyOrders = useMemo(() => {
    return filteredOrdersBase.filter(o => 
      o.deliveryStatus === 'Complete' ||
      o.deliveryStatus === 'Cancel' ||
      o.status15 === 'Complete' ||
      o.status15 === 'Cancel'
    );
  }, [filteredOrdersBase]);

  // Counts
  const pendingCount = pendingOrders.length;
  const historyCount = historyOrders.length;

  return (
    <div className="p-0 sm:p-2 md:p-6 space-y-2 md:space-y-6 flex flex-col h-full min-h-0">
      
      {/* Combined Tab Switcher & Filter Row */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3 xl:gap-4 w-full px-2 sm:px-0">
        
        {/* Left: Tab Selection */}
        <div className="flex-shrink-0">
          <TabSwitcher
            activeTab={activeTab}
            onTabChange={setActiveTab}
            tabs={[
              { id: 'pending', label: `Pending (${pendingCount})` },
              { id: 'history', label: `History (${historyCount})` }
            ]}
          />
        </div>

        {/* Right: Filters Group */}
        <div className="flex-1 flex flex-col lg:flex-row w-full gap-2 lg:gap-3 items-center overflow-visible">
          
          {/* Search bar input */}
          <div className="flex items-center gap-2 w-full lg:w-auto lg:flex-[1.5]">
            <div className="flex-1 w-full relative">
              <Search className="absolute left-2.5 top-[9px] lg:top-[11px] text-gray-400" size={14} />
              <input
                type="text"
                placeholder="Search orders..."
                value={filters.searchQuery}
                onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
                className="w-full bg-white border border-gray-300 rounded-lg pl-8 pr-2 py-1.5 focus:outline-none focus:border-amber-500 text-xs md:text-sm h-[32px] md:h-[38px]"
              />
            </div>
            <button
               onClick={() => setShowMobileFilters(!showMobileFilters)}
               className={`lg:hidden flex items-center justify-center rounded-lg shadow-sm h-[32px] w-[32px] flex-shrink-0 transition ${showMobileFilters ? 'bg-amber-100 text-amber-700 border-amber-200' : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50'}`}
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

          {/* Expanded dropdowns */}
          <div className={`${showMobileFilters ? 'flex' : 'hidden'} lg:flex flex-col lg:grid lg:grid-cols-4 gap-2 w-full lg:w-auto lg:flex-[6] overflow-visible`}>
            
            {/* Category Dropdown */}
            <div className="w-full relative">
              <SearchableDropdown
                options={categoriesList.map(c => ({ value: c, label: c }))}
                value={filters.category}
                onChange={(val) => setFilters({ ...filters, category: val })}
                placeholder="All Categories"
                className="h-[32px] md:h-[38px]"
                height="h-[32px] md:h-[38px]"
                rounded="rounded-lg"
              />
            </div>

            {/* Karigar Dropdown */}
            <div className="w-full relative">
              <SearchableDropdown
                options={karigarsList.map(c => ({ value: c, label: c }))}
                value={filters.karigar}
                onChange={(val) => setFilters({ ...filters, karigar: val })}
                placeholder="All Karigars"
                className="h-[32px] md:h-[38px]"
                height="h-[32px] md:h-[38px]"
                rounded="rounded-lg"
              />
            </div>

            {/* Melting Dropdown */}
            <div className="w-full relative">
              <SearchableDropdown
                options={meltingList.map(c => ({ value: c, label: c }))}
                value={filters.melting}
                onChange={(val) => setFilters({ ...filters, melting: val })}
                placeholder="All Melting"
                className="h-[32px] md:h-[38px]"
                height="h-[32px] md:h-[38px]"
                rounded="rounded-lg"
              />
            </div>

            {/* Order Type Dropdown */}
            <div className="w-full relative">
              <SearchableDropdown
                options={typesList.map(c => ({ value: c, label: c }))}
                value={filters.orderType}
                onChange={(val) => setFilters({ ...filters, orderType: val })}
                placeholder="All Types"
                className="h-[32px] md:h-[38px]"
                height="h-[32px] md:h-[38px]"
                rounded="rounded-lg"
              />
            </div>

          </div>
          
          <button
            onClick={handleClearFilters}
            className="hidden lg:flex items-center justify-center bg-gray-50 text-gray-500 border border-gray-200 rounded-lg w-[38px] h-[38px] flex-shrink-0 hover:bg-gray-100 transition-colors shadow-sm ml-1"
            title="Clear Filters"
          >
            <RotateCcw size={16} />
          </button>
        </div>
      </div>

      {/* Main Table view */}
      <div className="flex-1 min-h-0 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
        {activeTab === 'pending' ? (
          <DeliveryPending
            orders={pendingOrders}
            onActionClick={(order) => {
              setSelectedOrder(order);
              setIsFormOpen(true);
            }}
          />
        ) : (
          <DeliveryHistory
            orders={historyOrders}
            onEditClick={(order) => {
              setEditOrder(order);
              setIsEditOpen(true);
            }}
          />
        )}
      </div>

      {/* Process Modal (Pending) */}
      <DeliveryForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setSelectedOrder(null);
        }}
        onSave={handleSaveDelivery}
        order={selectedOrder}
      />

      {/* Edit Modal (History) */}
      <DeliveryEdit
        isOpen={isEditOpen}
        onClose={() => {
          setIsEditOpen(false);
          setEditOrder(null);
        }}
        onSave={handleSaveDelivery}
        order={editOrder}
      />
    </div>
  );
};

export default Delivery;
