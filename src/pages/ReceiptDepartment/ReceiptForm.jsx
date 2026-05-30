import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import ModalForm from '../../components/ModalForm';

const ReceiptForm = ({ isOpen, onClose, onSave, order }) => {
  const initialFormState = {
    receiptType: '',
    receiptPersonCourier: '',
    receiptGrossWeight: '',
    receiptRemarks: '',
  };

  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    if (isOpen && order) {
      setFormData({
        receiptType: order.receiptType || '',
        receiptPersonCourier: order.receiptPersonCourier || '',
        receiptGrossWeight: order.receiptGrossWeight || '',
        receiptRemarks: order.receiptRemarks || '',
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
    e.preventDefault();
    if (!formData.receiptType) {
      toast.error('Receipt Type is required');
      return;
    }
    if (!formData.receiptPersonCourier.trim()) {
      toast.error('Person/Courier Name is required');
      return;
    }
    if (!formData.receiptGrossWeight) {
      toast.error('Gross Weight is required');
      return;
    }

    onSave({
      ...order,
      receiptType: formData.receiptType,
      receiptPersonCourier: formData.receiptPersonCourier,
      receiptGrossWeight: formData.receiptGrossWeight,
      receiptRemarks: formData.receiptRemarks,
      receiptStatus: 'Done',
      receiptTimestamp: new Date().toISOString(),
    });

    onClose();
  };

  if (!order) return null;

  return (
    <ModalForm
      isOpen={isOpen}
      onClose={onClose}
      title={`Process Receipt — Order: ${order.orderNo || order.orderNumber}`}
      onSubmit={handleSubmit}
      submitText="Save Receipt Details"
      cancelText="Cancel"
      maxWidth="max-w-xl"
      maxHeight="85vh"
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
            <span className="text-gray-400 block font-medium uppercase text-[9px] tracking-wide">Expected Date</span>
            <span className="text-gray-900 font-bold">{order.expectedDeliveryDate || order.deliveryDate || '-'}</span>
          </div>
          <div>
            <span className="text-gray-400 block font-medium uppercase text-[9px] tracking-wide">Total Weight</span>
            <span className="text-gray-900 font-bold">{order.totalWeight || order.weight || '-'} g</span>
          </div>
        </div>

        {/* Inputs */}
        <div className="space-y-3">
          {/* Receipt Type */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Receipt Type <span className="text-red-500">*</span>
            </label>
            <select
              required
              name="receiptType"
              value={formData.receiptType}
              onChange={handleInputChange}
              className={`w-full p-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none text-xs font-medium ${
                formData.receiptType ? 'text-gray-900 font-bold' : 'text-gray-400'
              }`}
            >
              <option value="" className="text-gray-400">Select Receipt Type</option>
              <option value="By Hand" className="text-gray-900 font-medium">By Hand</option>
              <option value="Courier" className="text-gray-900 font-medium">Courier</option>
            </select>
          </div>

          {/* Person/Courier Name */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Person/Courier Name <span className="text-red-500">*</span>
            </label>
            <input
              required
              type="text"
              name="receiptPersonCourier"
              value={formData.receiptPersonCourier}
              onChange={handleInputChange}
              placeholder="Enter name of person or courier service"
              className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none text-xs font-medium"
            />
          </div>

          {/* Gross Weight */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Gross Weight (g) <span className="text-red-500">*</span>
            </label>
            <input
              required
              type="number"
              step="0.001"
              name="receiptGrossWeight"
              value={formData.receiptGrossWeight}
              onChange={handleInputChange}
              placeholder="0.00"
              className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none text-xs font-medium"
            />
          </div>

          {/* Remarks */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Remarks
            </label>
            <input
              type="text"
              name="receiptRemarks"
              value={formData.receiptRemarks}
              onChange={handleInputChange}
              placeholder="Enter additional collection remarks"
              className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none text-xs font-medium"
            />
          </div>
        </div>
      </div>
    </ModalForm>
  );
};

export default ReceiptForm;
