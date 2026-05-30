import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import ModalForm from '../../components/ModalForm';
import { preventInvalidDecimalChars } from '../../utils/numberUtils';

const EPolishEdit = ({ isOpen, onClose, onSave, order }) => {
  const initialFormState = {
    ePolishWeight: '',
    ePolishLoss: '',
    ePolishType: '',
  };

  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    if (isOpen && order) {
      setFormData({
        ePolishWeight: order.ePolishWeight || '',
        ePolishLoss: order.ePolishLoss || '',
        ePolishType: order.ePolishType || '',
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
    if (!formData.ePolishType) {
      toast.error('E-Polish Status is required');
      return;
    }

    onSave({
      ...order,
      ePolishStatus: 'Complete',
      ePolishWeight: formData.ePolishWeight,
      ePolishLoss: formData.ePolishLoss,
      ePolishType: formData.ePolishType,
    });

    onClose();
  };

  if (!order) return null;

  return (
    <ModalForm
      isOpen={isOpen}
      onClose={onClose}
      title={`Edit E-Polish — Order: ${order.orderNo || order.orderNumber}`}
      onSubmit={handleSubmit}
      submitText="Save Changes"
      cancelText="Cancel"
      maxWidth="max-w-xl"
      maxHeight="90vh"
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
            <span className="text-gray-900 font-bold">{order.totalWeight || order.weight || '-'}</span>
          </div>
          {order.ghatJamaWeight && (
            <div>
              <span className="text-gray-400 block font-medium uppercase text-[9px] tracking-wide">Ghat Jama Weight</span>
              <span className="text-gray-900 font-bold">{order.ghatJamaWeight} g</span>
            </div>
          )}
        </div>

        {/* Form Fields */}
        <div className="space-y-3">
          {/* E-Polish Weight */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              E-Polish Weight
            </label>
            <input
              type="number"
              step="0.001"
              name="ePolishWeight"
              value={formData.ePolishWeight}
              onChange={handleInputChange}
              onKeyDown={preventInvalidDecimalChars}
              placeholder="e.g. 12.500"
              className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none text-xs font-medium"
            />
          </div>

          {/* E-Polish Loss */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              E-Polish Loss
            </label>
            <input
              type="number"
              step="0.001"
              name="ePolishLoss"
              value={formData.ePolishLoss}
              onChange={handleInputChange}
              onKeyDown={preventInvalidDecimalChars}
              placeholder="e.g. 0.050"
              className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none text-xs font-medium"
            />
          </div>

          {/* E-Polish Status Dropdown */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              E-Polish Status <span className="text-red-500">*</span>
            </label>
            <select
              required
              name="ePolishType"
              value={formData.ePolishType}
              onChange={handleInputChange}
              className={`w-full p-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none text-xs font-medium ${
                formData.ePolishType ? 'text-gray-900 font-bold' : 'text-gray-400'
              }`}
            >
              <option value="" className="text-gray-400">Select Status</option>
              <option value="Meena Inhouse">Meena Inhouse</option>
              <option value="Meena Outside">Meena Outside</option>
              <option value="Polish Inhouse">Polish Inhouse</option>
              <option value="Polish Outside">Polish Outside</option>
              <option value="Bangle Polish">Bangle Polish</option>
            </select>
          </div>
        </div>
      </div>
    </ModalForm>
  );
};

export default EPolishEdit;
