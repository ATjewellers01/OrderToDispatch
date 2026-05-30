import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import ModalForm from '../../../components/ModalForm';

const LabelForm = ({ isOpen, onClose, onSave, order }) => {
  const initialFormState = {
    huidStatus: '',
    labelingStatus: '',
    sentCompanyName: '',
    sentHuidLabelPcs: '',
    huidRemarks: '',
  };

  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    if (isOpen && order) {
      setFormData({
        huidStatus: order.huidStatus || '',
        labelingStatus: order.labelingStatus || '',
        sentCompanyName: order.sentCompanyName || '',
        sentHuidLabelPcs: order.sentHuidLabelPcs || '',
        huidRemarks: order.huidRemarks || '',
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
    if (!formData.huidStatus) {
      toast.error('HUID Status is required');
      return;
    }
    if (!formData.labelingStatus) {
      toast.error('Labeling Status is required');
      return;
    }
    if (!formData.sentCompanyName) {
      toast.error('Sent Company Name is required');
      return;
    }
    if (formData.sentHuidLabelPcs === '' || isNaN(formData.sentHuidLabelPcs)) {
      toast.error('Sent Huid/Label Pcs must be a valid number');
      return;
    }

    onSave({
      ...order,
      huidStatus: formData.huidStatus,
      labelingStatus: formData.labelingStatus,
      sentCompanyName: formData.sentCompanyName,
      sentHuidLabelPcs: Number(formData.sentHuidLabelPcs),
      huidRemarks: formData.huidRemarks,
      huidTimestamp: new Date().toISOString(),
    });

    onClose();
  };

  if (!order) return null;

  return (
    <ModalForm
      isOpen={isOpen}
      onClose={onClose}
      title={`Process Huid/Label — Order: ${order.orderNo || order.orderNumber}`}
      onSubmit={handleSubmit}
      submitText="Save Huid/Label"
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
          {/* Huid Status */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Huid Status <span className="text-red-500">*</span>
            </label>
            <select
              required
              name="huidStatus"
              value={formData.huidStatus}
              onChange={handleInputChange}
              className={`w-full p-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none text-xs font-medium ${
                formData.huidStatus ? 'text-gray-900 font-bold' : 'text-gray-400'
              }`}
            >
              <option value="" className="text-gray-400">Select Huid Status</option>
              <option value="Huid Complete" className="text-gray-900 font-medium">Huid Complete</option>
              <option value="Sent In Huid" className="text-gray-900 font-medium">Sent In Huid</option>
              <option value="No Huid" className="text-gray-900 font-medium">No Huid</option>
            </select>
          </div>

          {/* Labeling Status */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Labeling Status <span className="text-red-500">*</span>
            </label>
            <select
              required
              name="labelingStatus"
              value={formData.labelingStatus}
              onChange={handleInputChange}
              className={`w-full p-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none text-xs font-medium ${
                formData.labelingStatus ? 'text-gray-900 font-bold' : 'text-gray-400'
              }`}
            >
              <option value="" className="text-gray-400">Select Labeling Status</option>
              <option value="Yes" className="text-gray-900 font-medium">Yes</option>
              <option value="No" className="text-gray-900 font-medium">No</option>
            </select>
          </div>

          {/* Sent Company Name */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Sent Company Name <span className="text-red-500">*</span>
            </label>
            <select
              required
              name="sentCompanyName"
              value={formData.sentCompanyName}
              onChange={handleInputChange}
              className={`w-full p-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none text-xs font-medium ${
                formData.sentCompanyName ? 'text-gray-900 font-bold' : 'text-gray-400'
              }`}
            >
              <option value="" className="text-gray-400">Select Sent Company Name</option>
              <option value="Nakoda" className="text-gray-900 font-medium">Nakoda</option>
              <option value="Vinayaka" className="text-gray-900 font-medium">Vinayaka</option>
              <option value="Raipur" className="text-gray-900 font-medium">Raipur</option>
              <option value="No Huid" className="text-gray-900 font-medium">No Huid</option>
            </select>
          </div>

          {/* Sent Huid/Label Pcs */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Sent Huid/Label Pcs <span className="text-red-500">*</span>
            </label>
            <input
              required
              type="number"
              name="sentHuidLabelPcs"
              value={formData.sentHuidLabelPcs}
              onChange={handleInputChange}
              placeholder="e.g. 2"
              min="0"
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
              name="huidRemarks"
              value={formData.huidRemarks}
              onChange={handleInputChange}
              placeholder="e.g. Complete, awaiting verification, etc."
              className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none text-xs font-medium"
            />
          </div>
        </div>
      </div>
    </ModalForm>
  );
};

export default LabelForm;
