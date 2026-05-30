import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Clock, Plus, Trash2, Edit, Save, Sliders, CalendarDays, CheckCircle, RotateCcw } from 'lucide-react';
import { TabSwitcher } from '../../components/StandardButtons';
import ModalForm from '../../components/ModalForm';

const TatSetup = () => {
  const [activeTab, setActiveTab] = useState('shift'); // 'shift', 'tat'
  const [shifts, setShifts] = useState([]);
  const [tatStages, setTatStages] = useState([]);

  // Modal control for adding/editing shift
  const [isShiftModalOpen, setIsShiftModalOpen] = useState(false);
  const [editingShift, setEditingShift] = useState(null);
  const [shiftForm, setShiftForm] = useState({
    name: '',
    startTime: '09:00',
    endTime: '18:00',
    isDefault: 'No'
  });

  // Load configuration from local storage
  useEffect(() => {
    const savedShifts = localStorage.getItem('companyShiftsDataV3');
    if (savedShifts) {
      setShifts(JSON.parse(savedShifts));
    } else {
      const defaultShifts = [
        { id: 'shift-1', name: 'General Shift', startTime: '09:00', endTime: '18:00', isDefault: 'Yes' }
      ];
      setShifts(defaultShifts);
      localStorage.setItem('companyShiftsDataV3', JSON.stringify(defaultShifts));
    }

    const savedTats = localStorage.getItem('tatSetupDataV3');
    if (savedTats) {
      setTatStages(JSON.parse(savedTats));
    } else {
      const defaultTats = [
        { id: 'tat-1', stageName: 'Order', value: 1, type: 'day' },
        { id: 'tat-2', stageName: 'Metal Issue', value: 2, type: 'day' },
        { id: 'tat-3', stageName: 'Follow Up', value: 2, type: 'day' },
        { id: 'tat-4', stageName: 'QC1', value: 1, type: 'day' },
        { id: 'tat-5', stageName: 'Ghat Jama', value: 1, type: 'day' },
        { id: 'tat-6', stageName: 'Meena Inhouse', value: 1, type: 'day' },
        { id: 'tat-7', stageName: 'Meena Outside', value: 2, type: 'day' },
        { id: 'tat-8', stageName: 'Polish Inhouse', value: 1, type: 'day' },
        { id: 'tat-9', stageName: 'Polish Outside', value: 2, type: 'day' },
        { id: 'tat-10', stageName: 'Bangle Polish', value: 1, type: 'day' },
        { id: 'tat-11', stageName: 'E-Polish', value: 1, type: 'day' },
        { id: 'tat-12', stageName: 'QC2', value: 1, type: 'day' },
        { id: 'tat-13', stageName: 'Dispatch', value: 1, type: 'day' },
        { id: 'tat-14', stageName: 'RD (Receipt Department)', value: 1, type: 'day' },
        { id: 'tat-15', stageName: 'QC3', value: 1, type: 'day' },
        { id: 'tat-16', stageName: 'HUID/Label', value: 1, type: 'day' },
        { id: 'tat-17', stageName: 'Receive In Stock', value: 1, type: 'day' },
        { id: 'tat-18', stageName: 'Delivery', value: 1, type: 'day' }
      ];
      setTatStages(defaultTats);
      localStorage.setItem('tatSetupDataV3', JSON.stringify(defaultTats));
    }

  }, []);

  // ── SHIFT FUNCTIONS ───────────────────────────────────────
  const handleOpenShiftModal = (shift = null) => {
    if (shift) {
      setEditingShift(shift);
      setShiftForm({
        name: shift.name,
        startTime: shift.startTime,
        endTime: shift.endTime,
        isDefault: shift.isDefault
      });
    } else {
      setEditingShift(null);
      setShiftForm({
        name: '',
        startTime: '09:00',
        endTime: '18:00',
        isDefault: shifts.length === 0 ? 'Yes' : 'No'
      });
    }
    setIsShiftModalOpen(true);
  };

  const handleSaveShift = (e) => {
    e.preventDefault();
    if (!shiftForm.name.trim()) {
      toast.error('Shift Name is required');
      return;
    }

    let updatedShifts;
    if (editingShift) {
      // Edit
      updatedShifts = shifts.map(s => {
        if (s.id === editingShift.id) {
          return { ...s, ...shiftForm };
        }
        // If editing this shift to be Default, set others to No
        if (shiftForm.isDefault === 'Yes') {
          return { ...s, isDefault: 'No' };
        }
        return s;
      });
    } else {
      // Add
      const newShift = {
        id: `shift-${Date.now()}`,
        ...shiftForm
      };
      
      if (newShift.isDefault === 'Yes') {
        updatedShifts = shifts.map(s => ({ ...s, isDefault: 'No' })).concat(newShift);
      } else {
        updatedShifts = [...shifts, newShift];
      }
    }

    // Ensure at least one shift is default if any shifts exist
    if (updatedShifts.length > 0 && !updatedShifts.some(s => s.isDefault === 'Yes')) {
      updatedShifts[0].isDefault = 'Yes';
    }

    setShifts(updatedShifts);
    localStorage.setItem('companyShiftsDataV3', JSON.stringify(updatedShifts));
    toast.success(editingShift ? 'Shift updated successfully' : 'Shift added successfully');
    setIsShiftModalOpen(false);
  };

  const handleDeleteShift = (id) => {
    const shiftToDelete = shifts.find(s => s.id === id);
    if (shiftToDelete?.isDefault === 'Yes' && shifts.length > 1) {
      toast.error('Cannot delete the default shift. Please mark another shift as default first.');
      return;
    }

    const updated = shifts.filter(s => s.id !== id);
    if (updated.length > 0 && !updated.some(s => s.isDefault === 'Yes')) {
      updated[0].isDefault = 'Yes';
    }

    setShifts(updated);
    localStorage.setItem('companyShiftsDataV3', JSON.stringify(updated));
    toast.success('Shift deleted successfully');
  };

  // ── TAT STAGES FUNCTIONS ──────────────────────────────────
  const handleTatValueChange = (id, val) => {
    const numeric = val === '' ? '' : Math.max(0, parseInt(val, 10));
    setTatStages(prev => prev.map(t => t.id === id ? { ...t, value: numeric } : t));
  };

  const handleTatTypeChange = (id, type) => {
    setTatStages(prev => prev.map(t => t.id === id ? { ...t, type } : t));
  };

  const handleSaveTats = () => {
    // Validate
    const invalid = tatStages.some(t => t.value === '' || isNaN(t.value));
    if (invalid) {
      toast.error('Please enter valid numeric TAT values for all stages');
      return;
    }

    localStorage.setItem('tatSetupDataV3', JSON.stringify(tatStages));
    toast.success('TAT stage configurations saved successfully');
  };



  return (
    <div className="p-0 sm:p-2 md:p-6 space-y-4 flex flex-col h-full min-h-0 overflow-y-auto custom-scrollbar">
      
      {/* Title Header - Tab Switcher and Dynamic Action Button in one row */}
      <div className="px-2 sm:px-0 flex-shrink-0 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 w-full">
        <TabSwitcher
          activeTab={activeTab}
          onTabChange={setActiveTab}
          tabs={[
            { id: 'shift', label: 'Shift Hours' },
            { id: 'tat', label: 'Stage TAT Settings' }
          ]}
        />

        <div className="flex justify-end w-full sm:w-auto">
          {activeTab === 'shift' && (
            <button
              onClick={() => handleOpenShiftModal()}
              className="w-full sm:w-auto h-[32px] md:h-[38px] px-4 bg-amber-600 hover:bg-amber-700 active:scale-95 text-white rounded-lg font-black text-xs shadow-md transition-all shrink-0 flex items-center justify-center gap-1.5"
            >
              <Plus size={14} />
              <span>Add Shift</span>
            </button>
          )}
          {activeTab === 'tat' && (
            <button
              onClick={handleSaveTats}
              className="w-full sm:w-auto h-[32px] md:h-[38px] px-4 bg-amber-600 hover:bg-amber-700 active:scale-95 text-white rounded-lg font-black text-xs shadow-md transition-all shrink-0 flex items-center justify-center gap-1.5"
            >
              <Save size={14} />
              <span>Save TAT Setup</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Configurations Container */}
      <div className="flex-1 bg-white border border-slate-200 rounded-2xl shadow-sm p-4 sm:p-6 min-h-0 overflow-y-auto custom-scrollbar">

        {/* ── TAB 1: SHIFT SETTINGS ─────────────────────────── */}
        {activeTab === 'shift' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <Sliders className="text-amber-500 shrink-0" size={16} />
                <span>Company Shifts Registry</span>
              </h3>
            </div>

            {/* Shifts list */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {shifts.map(shift => (
                <div 
                  key={shift.id} 
                  className={`border rounded-xl p-4 shadow-sm space-y-4 relative overflow-hidden transition-all ${
                    shift.isDefault === 'Yes' 
                      ? 'border-amber-500 bg-amber-50/15' 
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  {/* Default Tag */}
                  {shift.isDefault === 'Yes' && (
                    <div className="absolute right-0 top-0 bg-amber-500 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-bl-lg tracking-wider">
                      Default Shift
                    </div>
                  )}

                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block leading-none">Shift Name</span>
                    <span className="text-sm font-black text-slate-800 uppercase tracking-tight block">{shift.name}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-slate-50 border border-slate-100 rounded-lg p-2 font-mono">
                      <span className="text-[8px] font-bold text-slate-400 block uppercase leading-none mb-1">Start Time</span>
                      <span className="text-slate-800 font-extrabold text-sm">{shift.startTime}</span>
                    </div>
                    <div className="bg-slate-50 border border-slate-100 rounded-lg p-2 font-mono">
                      <span className="text-[8px] font-bold text-slate-400 block uppercase leading-none mb-1">End Time</span>
                      <span className="text-slate-800 font-extrabold text-sm">{shift.endTime}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100/50">
                    <button
                      onClick={() => handleOpenShiftModal(shift)}
                      className="p-1 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                      title="Edit Shift"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteShift(shift.id)}
                      className="p-1 text-slate-500 hover:text-red-650 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete Shift"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}

              {shifts.length === 0 && (
                <div className="col-span-full py-12 text-center text-slate-400 font-bold uppercase tracking-widest text-xs border border-dashed border-slate-200 rounded-2xl">
                  No shifts defined. Click Add Shift to create one.
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── TAB 2: STAGE TAT SETTINGS ─────────────────────── */}
        {activeTab === 'tat' && (
          <div className="space-y-6">

            {/* Stages Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {tatStages.map(stage => (
                <div key={stage.id} className="border border-slate-200 rounded-xl p-3.5 flex items-center justify-between gap-4 bg-slate-50/10 hover:border-slate-350 transition-colors">
                  <div className="min-w-0">
                    <span className="text-xs font-black text-slate-800 uppercase tracking-tight truncate block">{stage.stageName}</span>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide block mt-0.5">Duration SLA</span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <input 
                      type="number"
                      min={0}
                      value={stage.value}
                      onChange={(e) => handleTatValueChange(stage.id, e.target.value)}
                      placeholder="0"
                      className="w-16 h-[34px] px-2 text-center bg-white border border-gray-300 rounded-lg text-xs font-bold text-slate-850 outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20"
                    />

                    <select
                      value={stage.type}
                      onChange={(e) => handleTatTypeChange(stage.id, e.target.value)}
                      className="h-[34px] px-2 bg-white border border-gray-300 rounded-lg text-xs font-bold text-slate-800 outline-none focus:border-amber-500"
                    >
                      <option value="day">Days</option>
                      <option value="hours">Hours</option>
                      <option value="minute">Minutes</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>


          </div>
        )}



      </div>

      {/* ── SHIFT CREATION / EDIT MODAL ────────────────────── */}
      <ModalForm
        isOpen={isShiftModalOpen}
        onClose={() => setIsShiftModalOpen(false)}
        title={editingShift ? 'Edit Company Shift' : 'Add Company Shift'}
        onSubmit={handleSaveShift}
        submitText={editingShift ? 'Update Shift' : 'Create Shift'}
        cancelText="Cancel"
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1">
              Shift Name <span className="text-red-500">*</span>
            </label>
            <input 
              type="text"
              required
              placeholder="e.g. Day Shift, General Shift"
              value={shiftForm.name}
              onChange={(e) => setShiftForm({ ...shiftForm, name: e.target.value })}
              className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none text-xs font-bold text-slate-800"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1">
                Start Time <span className="text-red-500">*</span>
              </label>
              <input 
                type="time"
                required
                value={shiftForm.startTime}
                onChange={(e) => setShiftForm({ ...shiftForm, startTime: e.target.value })}
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none text-xs font-bold text-slate-800"
              />
            </div>
            <div>
              <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1">
                End Time <span className="text-red-500">*</span>
              </label>
              <input 
                type="time"
                required
                value={shiftForm.endTime}
                onChange={(e) => setShiftForm({ ...shiftForm, endTime: e.target.value })}
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none text-xs font-bold text-slate-800"
              />
            </div>
          </div>

          <div>
            <label className="flex items-center justify-between p-3 rounded-lg border border-slate-200 cursor-pointer select-none">
              <div>
                <span className="text-xs font-black text-slate-700 uppercase tracking-wider block">Set as Default Shift</span>
                <span className="text-[9px] font-bold text-slate-400 block mt-0.5">This shift will be used for standard TAT calculations</span>
              </div>
              <input 
                type="checkbox"
                checked={shiftForm.isDefault === 'Yes'}
                onChange={(e) => setShiftForm({ ...shiftForm, isDefault: e.target.checked ? 'Yes' : 'No' })}
                disabled={editingShift?.isDefault === 'Yes' && shifts.length > 1}
                className="w-4 h-4 accent-amber-600 cursor-pointer rounded"
              />
            </label>
          </div>
        </div>
      </ModalForm>

    </div>
  );
};

export default TatSetup;
