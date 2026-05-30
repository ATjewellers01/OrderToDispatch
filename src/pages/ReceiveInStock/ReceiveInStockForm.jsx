import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import ModalForm from '../../components/ModalForm';

const ReceiveInStockForm = ({ isOpen, onClose, onSave, order }) => {
  const initialFormState = {
    receiveInStockStatus: '',
    informToCustomer: '',
    receiveRemarks: '',
  };

  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    if (isOpen && order) {
      setFormData({
        receiveInStockStatus: order.receiveInStockStatus || '',
        informToCustomer: order.informToCustomer || '',
        receiveRemarks: order.receiveRemarks || '',
      });
    } else if (!isOpen) {
      setFormData(initialFormState);
    }
  }, [isOpen, order]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    preventDefaultAndSave(e);
  };

  const preventDefaultAndSave = (e) => {
    e.preventDefault();
    if (!formData.receiveInStockStatus) {
      toast.error('Receive Status is required');
      return;
    }
    if (!formData.informToCustomer) {
      toast.error('Inform To Customer is required');
      return;
    }

    onSave({
      ...order,
      receiveInStockStatus: formData.receiveInStockStatus,
      informToCustomer: formData.informToCustomer,
      receiveRemarks: formData.receiveRemarks,
      receiveInStockTimestamp: new Date().toISOString(),
    });

    onClose();
  };

  if (!order) return null;

  return (
    <ModalForm
      isOpen={isOpen}
      onClose={onClose}
      title={`Process Receive In Stock — Order: ${order.orderNo || order.orderNumber}`}
      onSubmit={handleSubmit}
      submitText="Receive In Stock"
      cancelText="Cancel"
      maxWidth="max-w-xl"
      maxHeight="80vh"
    >
      <div className="space-y-4">
        {/* Pre-filled Order Info */}
        <div className="bg-amber-50/60 rounded-xl p-3 border border-amber-100 grid grid-cols-2 gap-y-2 gap-x-4 text-xs">
          <div>
            <span className="text-gray-400 block font-medium uppercase text-[9px] tracking-wide">Order No</span>
            <span className="text-gray-900 font-bold">{order.orderNo || order.orderNumber || '-'}</span>
          </div>
          <div>
            <span className="text-gray-400 block font-medium uppercase text-[9px] tracking-wide">Customer Name</span>
            <span className="text-gray-900 font-bold">{order.company || order.customerName || '-'}</span>
          </div>
          <div>
            <span className="text-gray-400 block font-medium uppercase text-[9px] tracking-wide">Karigar Name</span>
            <span className="text-gray-900 font-bold">{order.karigar || order.karigarName || '-'}</span>
          </div>
          <div>
            <span className="text-gray-400 block font-medium uppercase text-[9px] tracking-wide">Category / Product</span>
            <span className="text-gray-900 font-bold">{order.category || order.categoryName || '-'}</span>
          </div>
          <div>
            <span className="text-gray-400 block font-medium uppercase text-[9px] tracking-wide">Melting</span>
            <span className="text-gray-900 font-bold">{order.melting || '-'}</span>
          </div>
          <div>
            <span className="text-gray-400 block font-medium uppercase text-[9px] tracking-wide">Total Weight</span>
            <span className="text-gray-900 font-bold">{order.totalWeight || order.weight || '-'} g</span>
          </div>
        </div>

        {/* Inputs */}
        <div className="space-y-3">
          {/* Receive Status */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Receive Status <span className="text-red-500">*</span>
            </label>
            <select
              required
              name="receiveInStockStatus"
              value={formData.receiveInStockStatus}
              onChange={handleInputChange}
              className={`w-full p-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none text-xs font-medium ${
                formData.receiveInStockStatus ? 'text-gray-900 font-bold' : 'text-gray-400'
              }`}
            >
              <option value="" className="text-gray-400">Select Status</option>
              <option value="Received" className="text-gray-900 font-medium">Received</option>
            </select>
          </div>

          {/* Inform To Customer */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Inform To Customer <span className="text-red-500">*</span>
            </label>
            <select
              required
              name="informToCustomer"
              value={formData.informToCustomer}
              onChange={handleInputChange}
              className={`w-full p-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none text-xs font-medium ${
                formData.informToCustomer ? 'text-gray-900 font-bold' : 'text-gray-400'
              }`}
            >
              <option value="" className="text-gray-400">Select Status</option>
              <option value="Informed" className="text-gray-900 font-medium">Informed</option>
              <option value="Not Informed" className="text-gray-900 font-medium">Not Informed</option>
            </select>
          </div>

          {/* Remarks */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Remarks
            </label>
            <input
              type="text"
              name="receiveRemarks"
              value={formData.receiveRemarks}
              onChange={handleInputChange}
              placeholder="e.g. Received in vault, customer notified, etc."
              className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none text-xs font-medium"
            />
          </div>
        </div>
      </div>
    </ModalForm>
  );
};

export default ReceiveInStockForm;
