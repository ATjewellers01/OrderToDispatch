import React, { useState, useMemo } from 'react';
import toast from 'react-hot-toast';
import { Plus, Search, RotateCcw, User, Phone, MapPin, Trash2, Edit2, Filter, Briefcase, Factory } from 'lucide-react';
import DataTable from '../../components/DataTable';
import ModalForm from '../../components/ModalForm';
import SearchableDropdown from '../../components/SearchableDropdown';
import { generateFilterOptions } from '../../utils/filterUtils';
import { SEEDED_KARIGARS } from './masterdata';

const KARIGAR_TYPES = ['Office', 'Factory'];
const EMPTY_FORM = { name: '', number: '', address: '', type: 'Office' };


export default function KarigarDetails({
  // Embedded mode props (from Master.jsx)
  searchQuery: externalSearch,
  typeFilter: externalTypeFilter,
  onTypeFilterChange,
  onClearFilters,
  filtersOnly = false
}) {
  const isEmbedded = externalSearch !== undefined;

  const [karigars, setKarigars] = useState(() => {
    const saved = localStorage.getItem('master_karigars');
    if (saved) return JSON.parse(saved);
    localStorage.setItem('master_karigars', JSON.stringify(SEEDED_KARIGARS));
    return SEEDED_KARIGARS;
  });

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const [newKarigar, setNewKarigar] = useState({ ...EMPTY_FORM });
  const [editKarigar, setEditKarigar] = useState({ id: '', ...EMPTY_FORM });

  // Local state (used in standalone mode only)
  const [localSearch, setLocalSearch] = useState('');
  const [localTypeFilter, setLocalTypeFilter] = useState([]);
  const [localShowMobileFilters, setLocalShowMobileFilters] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(50);

  // Resolved values
  const effectiveSearch = isEmbedded ? (externalSearch || '') : localSearch;
  const effectiveTypeFilter = isEmbedded ? (externalTypeFilter || []) : localTypeFilter;

  const setTypeFilter = (val) => {
    if (isEmbedded) onTypeFilterChange?.(val);
    else setLocalTypeFilter(val);
    setCurrentPage(1);
  };

  const persist = (data) => {
    setKarigars(data);
    localStorage.setItem('master_karigars', JSON.stringify(data));
  };

  const handleAdd = (e) => {
    e.preventDefault();
    if (!newKarigar.name.trim() || !newKarigar.number.trim()) { toast.error('Karigar Name and Number are required!'); return; }
    const exists = karigars.some(k => k.name.trim().toLowerCase() === newKarigar.name.trim().toLowerCase());
    if (exists) { toast.error('A karigar with this name already exists!'); return; }
    const nextId = karigars.length > 0 ? Math.max(...karigars.map(k => parseInt(k.id.replace('KR-', ''), 10) || 0)) + 1 : 1;
    persist([...karigars, { id: `KR-${String(nextId).padStart(3, '0')}`, name: newKarigar.name.trim(), number: newKarigar.number.trim(), address: newKarigar.address.trim() || '-', type: newKarigar.type || 'Office' }]);
    setNewKarigar({ ...EMPTY_FORM });
    setShowAddModal(false);
    toast.success('Karigar added successfully!');
  };

  const handleEdit = (e) => {
    e.preventDefault();
    if (!editKarigar.name.trim() || !editKarigar.number.trim()) { toast.error('Karigar Name and Number are required!'); return; }
    const exists = karigars.some(k => k.id !== editKarigar.id && k.name.trim().toLowerCase() === editKarigar.name.trim().toLowerCase());
    if (exists) { toast.error('Another karigar with this name already exists!'); return; }
    persist(karigars.map(k => k.id === editKarigar.id ? { ...editKarigar } : k));
    setShowEditModal(false);
    toast.success('Karigar details updated!');
  };

  const handleDelete = (id, name) => {
    if (confirm(`Are you sure you want to delete ${name}?`)) {
      persist(karigars.filter(k => k.id !== id));
      toast.success('Karigar deleted successfully!');
    }
  };

  const handleClearFilters = () => {
    setLocalSearch('');
    setLocalTypeFilter([]);
    setLocalShowMobileFilters(false);
    if (isEmbedded) { onTypeFilterChange?.([]); onClearFilters?.(); }
    else toast.success('Filters cleared');
    setCurrentPage(1);
  };

  // Filtered list
  const filtered = useMemo(() => karigars.filter(k => {
    if (effectiveTypeFilter && effectiveTypeFilter.length > 0 && !effectiveTypeFilter.includes(k.type)) return false;
    if (effectiveSearch) {
      const q = effectiveSearch.toLowerCase();
      return k.name.toLowerCase().includes(q) || k.number.toLowerCase().includes(q) || k.address.toLowerCase().includes(q) || k.type.toLowerCase().includes(q);
    }
    return true;
  }), [karigars, effectiveTypeFilter, effectiveSearch]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const tableHeaders = ['Serial No', 'Karigar Name', 'Karigar Number', 'Karigar Address', 'Karigar Type', 'Action'];

  const renderRow = (k, idx) => {
    const globalIdx = (currentPage - 1) * itemsPerPage + idx + 1;
    const isFactory = k.type === 'Factory';
    return (
      <tr key={k.id} className="hover:bg-amber-50/30 transition-colors border-b border-gray-100">
        <td className="px-4 py-3 text-center text-xs text-gray-600 whitespace-nowrap">{globalIdx}</td>
        <td className="px-4 py-3 text-center text-xs font-bold text-gray-900 whitespace-nowrap uppercase">{k.name}</td>
        <td className="px-4 py-3 text-center text-xs text-amber-600 font-bold whitespace-nowrap">{k.number}</td>
        <td className="px-4 py-3 text-center text-[11px] text-gray-600 whitespace-nowrap max-w-[220px] truncate" title={k.address}>{k.address}</td>
        <td className="px-4 py-3 text-center whitespace-nowrap">
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${isFactory ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-green-50 text-green-700 border-green-200'}`}>
            {isFactory ? <Factory size={9} /> : <Briefcase size={9} />}{k.type}
          </span>
        </td>
        <td className="px-4 py-3 text-center text-xs whitespace-nowrap">
          <div className="flex justify-center items-center gap-2">
            <button onClick={() => { setEditKarigar({ ...k }); setShowEditModal(true); }} className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"><Edit2 size={14} /></button>
            <button onClick={() => handleDelete(k.id, k.name)} className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"><Trash2 size={14} /></button>
          </div>
        </td>
      </tr>
    );
  };

  const renderCard = (k, idx) => {
    const globalIdx = (currentPage - 1) * itemsPerPage + idx + 1;
    const isFactory = k.type === 'Factory';
    return (
      <div key={k.id} className="bg-white rounded-xl border border-amber-50 shadow-sm p-4 space-y-3 hover:shadow-md hover:border-amber-100 transition-all">
        <div className="flex justify-between items-center pb-2 border-b border-slate-50">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-[10px] font-black text-slate-500">{globalIdx}</span>
            <span className="text-xs font-bold text-gray-900 uppercase truncate max-w-[180px]">{k.name}</span>
          </div>
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold border ${isFactory ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-green-50 text-green-700 border-green-200'}`}>
            {isFactory ? <Factory size={8} /> : <Briefcase size={8} />}{k.type}
          </span>
        </div>
        <div className="space-y-1.5 text-[11px] bg-slate-50 rounded-lg p-2 border border-slate-100/50">
          <div className="flex items-center gap-1.5 text-gray-700"><Phone size={12} className="text-gray-400" /><span className="font-semibold">{k.number}</span></div>
          <div className="flex items-center gap-1.5 text-gray-700"><MapPin size={12} className="text-gray-400" /><span className="truncate">{k.address}</span></div>
        </div>
        <div className="pt-2 border-t border-slate-100 flex justify-end gap-2">
          <button onClick={() => { setEditKarigar({ ...k }); setShowEditModal(true); }} className="flex-1 flex items-center justify-center gap-1 py-1 px-2 border border-blue-200 text-blue-700 rounded-md text-[10px] font-bold hover:bg-blue-50 transition-all shadow-sm"><Edit2 size={10} /> Edit</button>
          <button onClick={() => handleDelete(k.id, k.name)} className="flex-1 flex items-center justify-center gap-1 py-1 px-2 border border-red-200 text-red-700 rounded-md text-[10px] font-bold hover:bg-red-50 transition-all shadow-sm"><Trash2 size={10} /> Delete</button>
        </div>
      </div>
    );
  };

  // Shared modals
  const modals = (
    <>
      <ModalForm isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add New Karigar" onSubmit={handleAdd} submitText="Add Karigar" maxWidth="max-w-md">
        <div className="space-y-4">
          <div className="space-y-1"><label className="block text-[11px] md:text-[13px] text-gray-700 uppercase tracking-tight">Karigar Name *</label><div className="relative"><User className="absolute left-2.5 top-[9px] text-gray-400" size={14} /><input type="text" value={newKarigar.name} onChange={e => setNewKarigar({ ...newKarigar, name: e.target.value })} placeholder="Enter karigar name" className="w-full pl-8 pr-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-amber-500 text-xs h-[32px] md:h-[36px]" required /></div></div>
          <div className="space-y-1"><label className="block text-[11px] md:text-[13px] text-gray-700 uppercase tracking-tight">Karigar Number *</label><div className="relative"><Phone className="absolute left-2.5 top-[9px] text-gray-400" size={14} /><input type="text" value={newKarigar.number} onChange={e => setNewKarigar({ ...newKarigar, number: e.target.value })} placeholder="Enter contact number" className="w-full pl-8 pr-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-amber-500 text-xs h-[32px] md:h-[36px]" required /></div></div>
          <div className="space-y-1"><label className="block text-[11px] md:text-[13px] text-gray-700 uppercase tracking-tight">Karigar Address (Optional)</label><div className="relative"><MapPin className="absolute left-2.5 top-[9px] text-gray-400" size={14} /><input type="text" value={newKarigar.address} onChange={e => setNewKarigar({ ...newKarigar, address: e.target.value })} placeholder="Enter address" className="w-full pl-8 pr-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-amber-500 text-xs h-[32px] md:h-[36px]" /></div></div>
          <div className="space-y-1"><label className="block text-[11px] md:text-[13px] text-gray-700 uppercase tracking-tight">Karigar Type *</label>
            <div className="flex gap-3">{KARIGAR_TYPES.map(t => (<label key={t} className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg border-2 cursor-pointer text-xs font-bold transition-all ${newKarigar.type === t ? (t === 'Factory' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-green-500 bg-green-50 text-green-700') : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'}`}><input type="radio" name="new-karigar-type" value={t} checked={newKarigar.type === t} onChange={() => setNewKarigar({ ...newKarigar, type: t })} className="sr-only" />{t === 'Factory' ? <Factory size={13} /> : <Briefcase size={13} />}{t}</label>))}</div>
          </div>
        </div>
      </ModalForm>
      <ModalForm isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Edit Karigar Details" onSubmit={handleEdit} submitText="Save Changes" maxWidth="max-w-md">
        <div className="space-y-4">
          <div className="space-y-1"><label className="block text-[11px] md:text-[13px] text-gray-700 uppercase tracking-tight">Karigar Name *</label><div className="relative"><User className="absolute left-2.5 top-[9px] text-gray-400" size={14} /><input type="text" value={editKarigar.name} onChange={e => setEditKarigar({ ...editKarigar, name: e.target.value })} placeholder="Enter karigar name" className="w-full pl-8 pr-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-amber-500 text-xs h-[32px] md:h-[36px]" required /></div></div>
          <div className="space-y-1"><label className="block text-[11px] md:text-[13px] text-gray-700 uppercase tracking-tight">Karigar Number *</label><div className="relative"><Phone className="absolute left-2.5 top-[9px] text-gray-400" size={14} /><input type="text" value={editKarigar.number} onChange={e => setEditKarigar({ ...editKarigar, number: e.target.value })} placeholder="Enter contact number" className="w-full pl-8 pr-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-amber-500 text-xs h-[32px] md:h-[36px]" required /></div></div>
          <div className="space-y-1"><label className="block text-[11px] md:text-[13px] text-gray-700 uppercase tracking-tight">Karigar Address</label><div className="relative"><MapPin className="absolute left-2.5 top-[9px] text-gray-400" size={14} /><input type="text" value={editKarigar.address} onChange={e => setEditKarigar({ ...editKarigar, address: e.target.value })} placeholder="Enter address" className="w-full pl-8 pr-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-amber-500 text-xs h-[32px] md:h-[36px]" /></div></div>
          <div className="space-y-1"><label className="block text-[11px] md:text-[13px] text-gray-700 uppercase tracking-tight">Karigar Type *</label>
            <div className="flex gap-3">{KARIGAR_TYPES.map(t => (<label key={t} className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg border-2 cursor-pointer text-xs font-bold transition-all ${editKarigar.type === t ? (t === 'Factory' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-green-500 bg-green-50 text-green-700') : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'}`}><input type="radio" name="edit-karigar-type" value={t} checked={editKarigar.type === t} onChange={() => setEditKarigar({ ...editKarigar, type: t })} className="sr-only" />{t === 'Factory' ? <Factory size={13} /> : <Briefcase size={13} />}{t}</label>))}</div>
          </div>
        </div>
      </ModalForm>
    </>
  );

  // ── filtersOnly mode: render Type dropdown + modals only (used in Master toolbar) ──
  if (filtersOnly) {
    return (
      <>
        <div className="flex-1 min-w-0 lg:min-w-[160px]">
          <SearchableDropdown
            options={KARIGAR_TYPES.map(t => ({ value: t, label: t, count: karigars.filter(k => k.type === t).length }))}
            isMulti={true}
            value={effectiveTypeFilter}
            onChange={setTypeFilter}
            placeholder="All Types"
            height="h-[32px] md:h-[38px]"
            rounded="rounded-lg"
          />
        </div>
        <button onClick={handleClearFilters} className="hidden lg:flex items-center justify-center bg-gray-50 text-gray-500 border border-gray-200 rounded-lg w-[38px] h-[38px] hover:bg-gray-100 transition-colors shadow-sm" title="Clear Filters">
          <RotateCcw size={16} />
        </button>
      </>
    );
  }

  // ── Full page (table + modals, standalone or embedded) ──
  return (
    <div className={`${isEmbedded ? '' : 'p-0 sm:p-2 md:p-6 '}space-y-2 md:space-y-6 flex flex-col h-full min-h-0`}>

      {/* Hidden add trigger */}
      <div className="hidden" id="karigar-add-trigger" onClick={() => setShowAddModal(true)} />

      {/* Standalone toolbar */}
      {!isEmbedded && (
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-2 lg:gap-4 w-full px-2 sm:px-0">
          <div className="flex flex-col lg:flex-row w-full gap-2 lg:gap-3 items-center">
            <div className="flex items-center gap-2 w-full lg:w-auto lg:flex-[1.5]">
              <div className="flex-1 w-full relative">
                <Search className="absolute left-2.5 top-[9px] lg:top-[11px] text-gray-400" size={14} />
                <input type="text" placeholder="Search karigars..." value={localSearch} onChange={e => setLocalSearch(e.target.value)} className="w-full bg-white border border-gray-300 rounded-lg pl-8 pr-2 py-1.5 focus:outline-none focus:border-amber-500 text-xs md:text-sm h-[32px] md:h-[38px]" />
              </div>
              <button onClick={() => setLocalShowMobileFilters(p => !p)} className={`lg:hidden flex items-center justify-center rounded-lg shadow-sm h-[32px] w-[32px] flex-shrink-0 transition ${localShowMobileFilters ? 'bg-amber-100 text-amber-700 border-amber-200' : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50'}`}><Filter size={14} /></button>
              {!localShowMobileFilters && <button onClick={() => setShowAddModal(true)} className="lg:hidden flex items-center justify-center bg-amber-600 text-white rounded-lg h-[32px] w-[32px] flex-shrink-0 shadow-sm active:scale-95"><Plus size={16} /></button>}
              <button onClick={handleClearFilters} className="lg:hidden flex items-center justify-center bg-gray-50 text-gray-500 border border-gray-200 rounded-lg h-[32px] w-[32px] flex-shrink-0 shadow-sm active:scale-95"><RotateCcw size={14} /></button>
            </div>
            <div className={`${localShowMobileFilters ? 'flex' : 'hidden'} lg:flex flex-col lg:flex-row lg:flex-nowrap gap-2 w-full lg:w-auto lg:flex-[6] overflow-visible`}>
              <div className="flex-1 min-w-0 lg:min-w-[160px]"><SearchableDropdown options={KARIGAR_TYPES.map(t => ({ value: t, label: t, count: karigars.filter(k => k.type === t).length }))} isMulti={true} value={localTypeFilter} onChange={val => { setLocalTypeFilter(val); setCurrentPage(1); }} placeholder="All Types" height="h-[32px] md:h-[38px]" rounded="rounded-lg" /></div>
              <button onClick={handleClearFilters} className="hidden lg:flex items-center justify-center bg-gray-50 text-gray-500 border border-gray-200 rounded-lg w-[38px] h-[38px] hover:bg-gray-100 transition-colors shadow-sm"><RotateCcw size={16} /></button>
            </div>
          </div>
          <button onClick={() => setShowAddModal(true)} className="hidden lg:flex bg-amber-600 hover:bg-amber-700 text-white rounded-lg items-center justify-center transition shadow-sm w-[38px] h-[38px] flex-shrink-0"><Plus size={18} /></button>
        </div>
      )}

      {/* Table */}
      <div className="flex-1 min-h-0 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
        <DataTable
          headers={tableHeaders}
          data={paginated}
          renderRow={renderRow}
          renderCard={renderCard}
          minWidth="900px"
          currentPage={currentPage}
          totalPages={totalPages}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={(val) => { setItemsPerPage(val); setCurrentPage(1); }}
          totalResults={filtered.length}
          itemsPerPageOptions={[50, 100, 200, 500]}
        />
      </div>

      {modals}
    </div>
  );
}
