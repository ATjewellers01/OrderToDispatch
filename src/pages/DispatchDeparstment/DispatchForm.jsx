import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import ModalForm from '../../components/ModalForm';

const DispatchForm = ({ isOpen, onClose, onSave, order }) => {
  const initialFormState = {
    dispatchStatus: '',
    dispatchRemarks: '',
  };

  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    if (isOpen && order) {
      setFormData({
        dispatchStatus: order.dispatchStatus || '',
        dispatchRemarks: order.dispatchRemarks || '',
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
    if (!formData.dispatchStatus) {
      toast.error('Dispatch Status is required');
      return;
    }

    onSave({
      ...order,
      dispatchStatus: formData.dispatchStatus,
      dispatchRemarks: formData.dispatchRemarks,
      dispatchTimestamp: new Date().toISOString(),
    });

    onClose();
  };

  if (!order) return null;

  return (
    <ModalForm
      isOpen={isOpen}
      onClose={onClose}
      title={`Process Dispatch — Order: ${order.orderNo || order.orderNumber}`}
      onSubmit={handleSubmit}
      submitText="Save Dispatch Status"
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
          {/* Dispatch Status */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Dispatch Status <span className="text-red-500">*</span>
            </label>
            <select
              required
              name="dispatchStatus"
              value={formData.dispatchStatus}
              onChange={handleInputChange}
              className={`w-full p-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none text-xs font-medium ${
                formData.dispatchStatus ? 'text-gray-900 font-bold' : 'text-gray-400'
              }`}
            >
              <option value="" className="text-gray-400">Select Dispatch Status</option>
              <option value="Done" className="text-gray-900 font-medium">Done</option>
              <option value="Not Done" className="text-gray-900 font-medium">Not Done</option>
            </select>
          </div>

          {/* Dispatch Remarks */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Dispatch Remarks
            </label>
            <input
              type="text"
              name="dispatchRemarks"
              value={formData.dispatchRemarks}
              onChange={handleInputChange}
              placeholder="e.g. Sent via logistics courier, self collection, etc."
              className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none text-xs font-medium"
            />
          </div>
        </div>
      </div>
    </ModalForm>
  );
};

export default DispatchForm;
