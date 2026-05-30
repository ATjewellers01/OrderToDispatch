import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import ModalForm from '../../components/ModalForm';

const GhatJamaEdit = ({ isOpen, onClose, onSave, order }) => {
  const initialFormState = {
    ghatJamaStatus: '',
    ghatJamaWeight: '',
    voucherNumber: '',
    pcs: '',
    ghatJamaRemarks: '',
  };

  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    if (isOpen && order) {
      setFormData({
        ghatJamaStatus: order.ghatJamaType || order.ghatJamaStatus || '',
        ghatJamaWeight: order.ghatJamaWeight || '',
        voucherNumber: order.voucherNumber || '',
        pcs: order.pcs || '',
        ghatJamaRemarks: order.ghatJamaRemarks || '',
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
    if (!formData.ghatJamaStatus) {
      toast.error('Ghat Status is required');
      return;
    }

    onSave({
      ...order,
      ghatJamaStatus: 'Complete',
      ghatJamaType: formData.ghatJamaStatus,
      ghatJamaWeight: formData.ghatJamaWeight,
      voucherNumber: formData.voucherNumber,
      pcs: formData.pcs,
      ghatJamaRemarks: formData.ghatJamaRemarks,
      ghatJamaTimestamp: new Date().toISOString(),
    });

    onClose();
  };

  if (!order) return null;

  return (
    <ModalForm
      isOpen={isOpen}
      onClose={onClose}
      title={`Edit Ghat Jama — Order: ${order.orderNo}`}
      onSubmit={handleSubmit}
      submitText="Update Ghat Jama"
      cancelText="Cancel"
      maxWidth="max-w-xl"
      maxHeight="90vh"
    >
      <div className="space-y-4">
        {/* Pre-filled Order Info */}
        <div className="bg-amber-50/60 rounded-xl p-3 border border-amber-100 grid grid-cols-2 gap-y-2 gap-x-4 text-xs">
          <div>
            <span className="text-gray-400 block font-medium uppercase text-[9px] tracking-wide">Order No</span>
            <span className="text-gray-900 font-bold">{order.orderNo || '-'}</span>
          </div>
          <div>
            <span className="text-gray-400 block font-medium uppercase text-[9px] tracking-wide">Customer Name</span>
            <span className="text-gray-900 font-bold">{order.company || '-'}</span>
          </div>
          <div>
            <span className="text-gray-400 block font-medium uppercase text-[9px] tracking-wide">Karigar Name</span>
            <span className="text-gray-900 font-bold">{order.karigar || '-'}</span>
          </div>
          <div>
            <span className="text-gray-400 block font-medium uppercase text-[9px] tracking-wide">Category / Product</span>
            <span className="text-gray-900 font-bold">{order.category || '-'}</span>
          </div>
          <div>
            <span className="text-gray-400 block font-medium uppercase text-[9px] tracking-wide">Melting</span>
            <span className="text-gray-900 font-bold">{order.melting || '-'}</span>
          </div>
          <div>
            <span className="text-gray-400 block font-medium uppercase text-[9px] tracking-wide">Total Weight</span>
            <span className="text-gray-900 font-bold">{order.totalWeight ? `${order.totalWeight} g` : '-'}</span>
          </div>
          <div>
            <span className="text-gray-400 block font-medium uppercase text-[9px] tracking-wide">QC1 Status</span>
            <span className="text-emerald-700 font-bold">{order.status3 || '-'}</span>
          </div>
          <div>
            <span className="text-gray-400 block font-medium uppercase text-[9px] tracking-wide">QC1 Type</span>
            <span className="text-gray-900 font-bold">{order.qc1Type || '-'}</span>
          </div>
        </div>

        {/* Edit Note */}
        <div className="bg-blue-50 border border-blue-100 rounded-lg px-3 py-2 text-xs text-blue-700 font-medium">
          ✏️ Editing a completed Ghat Jama record. Changes will be saved immediately.
        </div>

        {/* Form Fields */}
        <div className="space-y-3">

          {/* Ghat Status */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Ghat Status <span className="text-red-500">*</span>
            </label>
            <select
              required
              name="ghatJamaStatus"
              value={formData.ghatJamaStatus}
              onChange={handleInputChange}
              className={`w-full p-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none text-xs font-medium ${
                formData.ghatJamaStatus ? 'text-gray-900 font-bold' : 'text-gray-400'
              }`}
            >
              <option value="" className="text-gray-400">Select Status</option>
              <option value="Meena Inhouse">Meena Inhouse</option>
              <option value="Meena Outside">Meena Outside</option>
              <option value="Polish Inhouse">Polish Inhouse</option>
              <option value="Polish Outside">Polish Outside</option>
              <option value="Bangle Polish">Bangle Polish</option>
              <option value="E-Polish">E-Polish</option>
            </select>
          </div>

          {/* Ghat Jama Weight & Voucher Number */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Ghat Jama Weight
              </label>
              <input
                type="text"
                inputMode="decimal"
                name="ghatJamaWeight"
                value={formData.ghatJamaWeight}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === '' || /^\d*\.?\d{0,3}$/.test(val)) {
                    setFormData(prev => ({ ...prev, ghatJamaWeight: val }));
                  }
                }}
                placeholder="e.g. 12.500"
                className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none text-xs font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Voucher Number
              </label>
              <input
                type="text"
                name="voucherNumber"
                value={formData.voucherNumber}
                onChange={handleInputChange}
                placeholder="e.g. VCH-001"
                className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none text-xs font-medium"
              />
            </div>
          </div>

          {/* Pcs */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Pcs
            </label>
            <input
              type="text"
              name="pcs"
              value={formData.pcs}
              onChange={handleInputChange}
              placeholder="e.g. 2 PCS"
              className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none text-xs font-medium"
            />
          </div>

          {/* Remarks */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Remarks
            </label>
            <textarea
              name="ghatJamaRemarks"
              rows="3"
              value={formData.ghatJamaRemarks}
              onChange={handleInputChange}
              placeholder="Enter remarks or observations..."
              className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none text-xs font-medium resize-none"
            />
          </div>

        </div>
      </div>
    </ModalForm>
  );
};

export default GhatJamaEdit;
