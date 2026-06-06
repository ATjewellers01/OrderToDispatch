import React, { useState, useMemo, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Plus, Search, RotateCcw, Building, Phone, Mail, MapPin, Trash2, Edit2, Filter } from 'lucide-react';
import DataTable from '../../components/DataTable';
import ModalForm from '../../components/ModalForm';
import SearchableDropdown from '../../components/SearchableDropdown';
import { generateFilterOptions } from '../../utils/filterUtils';

const companyNames = [
  "Kalyan Jewellers", "Malabar Gold", "Tanishq", "Joyalukkas", "Bhima Jewellers", 
  "Senco Gold", "PC Jeweller", "TBZ Jewellers", "Thangamayil", "Kirtilals", 
  "Vaibhav Jewellers", "GRT Jewellers", "Lalithaa Jewellery", "Khosla Jewellers", "Reliance Jewels", 
  "Orra", "CaratLane", "BlueStone", "Amrapali", "Gitanjali Gems", 
  "Jos Alukkas", "Karan Kothari", "Manubhai Jewellers", "Neelkanth Jewellers", "Ranka Jewellers", 
  "Tara Jewels", "WHP Jewellers", "Zaveri Bros", "Chandukaka Saraf", "Chintamanis", 
  "D P Jewellers", "PNG Jewellers", "Laxmi Ratan", "Shubh Jewellers", "Garg Jewellers", 
  "Madanlal Jewellers", "Navkar Jewellers", "Surana Jewellers", "Bafna Jewellers", "Kothari Gold", 
  "Mehta Jewellery", "Soni Jewellers", "Bhatia Gems", "Rajesh Exports", "Pukhraj Jewellers", 
  "Kundan Jewellers", "Heera Jewellers", "Moti Jewellers", "Swarna Jewellers", "Ganga Jewellers"
];

const SEEDED_COMPANIES = companyNames.map((name, index) => ({
  id: `CO-${String(index + 1).padStart(3, '0')}`,
  name: name,
  number: `98${String(index + 1).padStart(2, '0')}123456`,
  gmail: `${name.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '')}@gmail.com`,
  address: `${index + 12}, Gold Plaza, Zaveri Bazaar, Mumbai`
}));

// CompanyDetails — v2 (embedded + standalone mode)

export default function CompanyDetails({
  externalSearch,
  externalFilters,
  onExternalFiltersChange,
  showMobileFilters: externalShowMobileFilters,
  onClearFilters,
  filtersOnly = false
}) {
  const isEmbedded = externalSearch !== undefined;

  const [companies, setCompanies] = useState(() => {
    const saved = localStorage.getItem('master_companies');
    if (saved) return JSON.parse(saved);
    localStorage.setItem('master_companies', JSON.stringify(SEEDED_COMPANIES));
    return SEEDED_COMPANIES;
  });

  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [showEditItemModal, setShowEditItemModal] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);

  // Local filter state (used only in standalone mode)
  const [localFilters, setLocalFilters] = useState({
    searchQuery: '',
    companyName: [],
    location: [],
    emailDomain: []
  });
  const [localShowMobileFilters, setLocalShowMobileFilters] = useState(false);

  // Form State
  const [newCompany, setNewCompany] = useState({ name: '', number: '', gmail: '', address: '' });
  const [editCompany, setEditCompany] = useState({ id: '', name: '', number: '', gmail: '', address: '' });

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(50);

  // Resolved values (embedded vs standalone)
  const effectiveSearch = isEmbedded ? externalSearch : localFilters.searchQuery;
  const effectiveFilters = isEmbedded ? externalFilters : { companyName: localFilters.companyName, location: localFilters.location, emailDomain: localFilters.emailDomain };
  const showMobileFilters = isEmbedded ? externalShowMobileFilters : localShowMobileFilters;

  const setFilterField = (field, val) => {
    if (isEmbedded) {
      onExternalFiltersChange?.({ ...externalFilters, [field]: val });
    } else {
      setLocalFilters(p => ({ ...p, [field]: val }));
    }
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    if (isEmbedded) {
      onExternalFiltersChange?.({ companyName: [], location: [], emailDomain: [] });
      onClearFilters?.();
    } else {
      setLocalFilters({ searchQuery: '', companyName: [], location: [], emailDomain: [] });
      setLocalShowMobileFilters(false);
      toast.success('Filters cleared');
    }
    setCurrentPage(1);
  };

  // CRUD handlers
  const handleAddCompanySubmit = (e) => {
    e.preventDefault();
    if (!newCompany.name.trim() || !newCompany.number.trim()) { toast.error('Company Name and Number are required!'); return; }
    const nameExists = companies.some(c => c.name.trim().toLowerCase() === newCompany.name.trim().toLowerCase());
    if (nameExists) { toast.error('A company with this name already exists!'); return; }
    const nextIdNumber = companies.length > 0 ? Math.max(...companies.map(c => parseInt(c.id.replace('CO-', ''), 10) || 0)) + 1 : 1;
    const newId = `CO-${String(nextIdNumber).padStart(3, '0')}`;
    const updated = [...companies, { id: newId, name: newCompany.name.trim(), number: newCompany.number.trim(), gmail: newCompany.gmail.trim() || `${newCompany.name.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '')}@gmail.com`, address: newCompany.address.trim() || 'Zaveri Bazaar, Mumbai' }];
    setCompanies(updated);
    localStorage.setItem('master_companies', JSON.stringify(updated));
    window.dispatchEvent(new StorageEvent('storage', { key: 'master_companies', newValue: JSON.stringify(updated) }));
    setNewCompany({ name: '', number: '', gmail: '', address: '' });
    setShowAddItemModal(false);
    toast.success('New company added successfully!');
  };

  const handleEditCompanySubmit = (e) => {
    e.preventDefault();
    if (!editCompany.name.trim() || !editCompany.number.trim()) { toast.error('Company Name and Number are required!'); return; }
    const nameExists = companies.some(c => c.id !== editCompany.id && c.name.trim().toLowerCase() === editCompany.name.trim().toLowerCase());
    if (nameExists) { toast.error('Another company with this name already exists!'); return; }
    const updated = companies.map(c => c.id === editCompany.id ? { ...editCompany } : c);
    setCompanies(updated);
    localStorage.setItem('master_companies', JSON.stringify(updated));
    window.dispatchEvent(new StorageEvent('storage', { key: 'master_companies', newValue: JSON.stringify(updated) }));
    setShowEditItemModal(false);
    setSelectedCompany(null);
    toast.success('Company details updated successfully!');
  };

  const handleDeleteCompany = (id, name) => {
    if (confirm(`Are you sure you want to delete ${name}?`)) {
      const updated = companies.filter(c => c.id !== id);
      setCompanies(updated);
      localStorage.setItem('master_companies', JSON.stringify(updated));
      window.dispatchEvent(new StorageEvent('storage', { key: 'master_companies', newValue: JSON.stringify(updated) }));
      toast.success('Company deleted successfully!');
    }
  };

  // Sync when another instance persists
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === 'master_companies' && e.newValue) {
        try { setCompanies(JSON.parse(e.newValue)); } catch {}
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const handleOpenEditModal = (company) => {
    setEditCompany({ ...company });
    setShowEditItemModal(true);
  };

  // Dropdown option lists
  const companyNamesList = useMemo(() => generateFilterOptions(companies, c => c.name), [companies]);
  const locationsList = useMemo(() => generateFilterOptions(companies, c => { const parts = c.address.split(','); return parts[parts.length - 1]?.trim() || parts[0]?.trim(); }), [companies]);
  const emailDomainsList = useMemo(() => generateFilterOptions(companies, c => { const parts = c.gmail.split('@'); return parts[1] || ''; }), [companies]);

  // Apply filters
  const filteredCompanies = useMemo(() => {
    return companies.filter(c => {
      if (effectiveFilters.companyName && effectiveFilters.companyName.length > 0 && !effectiveFilters.companyName.includes(c.name)) return false;
      
      if (effectiveFilters.location && effectiveFilters.location.length > 0) {
        const parts = c.address.split(',');
        const loc = parts[parts.length - 1]?.trim() || parts[0]?.trim();
        if (!effectiveFilters.location.includes(loc)) return false;
      }
      
      if (effectiveFilters.emailDomain && effectiveFilters.emailDomain.length > 0) {
        const domain = c.gmail.split('@')[1] || '';
        if (!effectiveFilters.emailDomain.includes(domain)) return false;
      }
      
      if (effectiveSearch) {
        const q = effectiveSearch.toLowerCase();
        return c.name.toLowerCase().includes(q) || c.number.toLowerCase().includes(q) || c.gmail.toLowerCase().includes(q) || c.address.toLowerCase().includes(q);
      }
      return true;
    }).reverse();
  }, [companies, effectiveFilters, effectiveSearch]);

  const totalPages = Math.ceil(filteredCompanies.length / itemsPerPage);
  const paginatedCompanies = filteredCompanies.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const tableHeaders = ["Serial No", "Company Name", "Number", "Gmail", "Address", "Actions"];

  const renderRow = (company, idx) => {
    const globalIdx = (currentPage - 1) * itemsPerPage + idx + 1;
    return (
      <tr key={company.id} className="hover:bg-amber-50/30 transition-colors border-b border-gray-100">
        <td className="px-4 py-3 text-center text-xs text-gray-600 whitespace-nowrap">{globalIdx}</td>
        <td className="px-4 py-3 text-center text-xs font-bold text-gray-900 whitespace-nowrap uppercase">{company.name}</td>
        <td className="px-4 py-3 text-center text-xs text-amber-600 font-bold whitespace-nowrap">{company.number}</td>
        <td className="px-4 py-3 text-center text-[11px] text-gray-700 whitespace-nowrap">{company.gmail}</td>
        <td className="px-4 py-3 text-center text-[11px] text-gray-600 whitespace-nowrap max-w-[250px] truncate" title={company.address}>{company.address}</td>
        <td className="px-4 py-3 text-center text-xs whitespace-nowrap">
          <div className="flex justify-center items-center gap-2">
            <button onClick={() => handleOpenEditModal(company)} className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors" title="Edit"><Edit2 size={14} /></button>
            <button onClick={() => handleDeleteCompany(company.id, company.name)} className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors" title="Delete"><Trash2 size={14} /></button>
          </div>
        </td>
      </tr>
    );
  };

  const renderCard = (company, idx) => {
    const globalIdx = (currentPage - 1) * itemsPerPage + idx + 1;
    return (
      <div key={company.id} className="bg-white rounded-xl border border-amber-50 shadow-sm p-4 space-y-3 transition-all hover:shadow-md hover:border-amber-100">
        <div className="flex justify-between items-center pb-2 border-b border-slate-50">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-[10px] font-black text-slate-500">{globalIdx}</span>
            <span className="text-xs font-bold text-gray-900 uppercase truncate max-w-[180px]">{company.name}</span>
          </div>
          <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded text-[8px] font-black uppercase">{company.id}</span>
        </div>
        <div className="space-y-1.5 text-[11px] bg-slate-50 rounded-lg p-2 border border-slate-100/50">
          <div className="flex items-center gap-1.5 text-gray-700"><Phone size={12} className="text-gray-400" /><span className="font-semibold">{company.number}</span></div>
          <div className="flex items-center gap-1.5 text-gray-700"><Mail size={12} className="text-gray-400" /><span className="truncate">{company.gmail}</span></div>
          <div className="flex items-center gap-1.5 text-gray-700"><MapPin size={12} className="text-gray-400" /><span className="truncate">{company.address}</span></div>
        </div>
        <div className="pt-2 border-t border-slate-100 flex justify-end gap-2">
          <button onClick={() => handleOpenEditModal(company)} className="flex-1 flex items-center justify-center gap-1 py-1 px-2 border border-blue-200 text-blue-700 rounded-md text-[10px] font-bold hover:bg-blue-50 transition-all shadow-sm"><Edit2 size={10} /> Edit</button>
          <button onClick={() => handleDeleteCompany(company.id, company.name)} className="flex-1 flex items-center justify-center gap-1 py-1 px-2 border border-red-200 text-red-700 rounded-md text-[10px] font-bold hover:bg-red-50 transition-all shadow-sm"><Trash2 size={10} /> Delete</button>
        </div>
      </div>
    );
  };

  // Shared modal JSX
  const modals = (
    <>
      <ModalForm isOpen={showAddItemModal} onClose={() => setShowAddItemModal(false)} title="Add New Company" onSubmit={handleAddCompanySubmit} submitText="Add Company" maxWidth="max-w-md">
        <div className="space-y-4">
          <div className="space-y-1"><label className="block text-[11px] md:text-[13px] text-gray-700 uppercase tracking-tight">Company Name *</label><div className="relative"><Building className="absolute left-2.5 top-[9px] text-gray-400" size={14} /><input type="text" value={newCompany.name} onChange={e => setNewCompany({ ...newCompany, name: e.target.value })} placeholder="Enter company name" className="w-full pl-8 pr-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-amber-500 text-xs h-[32px] md:h-[36px]" required /></div></div>
          <div className="space-y-1"><label className="block text-[11px] md:text-[13px] text-gray-700 uppercase tracking-tight">Number *</label><div className="relative"><Phone className="absolute left-2.5 top-[9px] text-gray-400" size={14} /><input type="text" value={newCompany.number} onChange={e => setNewCompany({ ...newCompany, number: e.target.value })} placeholder="Enter contact number" className="w-full pl-8 pr-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-amber-500 text-xs h-[32px] md:h-[36px]" required /></div></div>
          <div className="space-y-1"><label className="block text-[11px] md:text-[13px] text-gray-700 uppercase tracking-tight">Gmail (Optional)</label><div className="relative"><Mail className="absolute left-2.5 top-[9px] text-gray-400" size={14} /><input type="email" value={newCompany.gmail} onChange={e => setNewCompany({ ...newCompany, gmail: e.target.value })} placeholder="e.g. contact@company.com" className="w-full pl-8 pr-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-amber-500 text-xs h-[32px] md:h-[36px]" /></div></div>
          <div className="space-y-1"><label className="block text-[11px] md:text-[13px] text-gray-700 uppercase tracking-tight">Address (Optional)</label><div className="relative"><MapPin className="absolute left-2.5 top-[9px] text-gray-400" size={14} /><input type="text" value={newCompany.address} onChange={e => setNewCompany({ ...newCompany, address: e.target.value })} placeholder="Enter company address" className="w-full pl-8 pr-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-amber-500 text-xs h-[32px] md:h-[36px]" /></div></div>
        </div>
      </ModalForm>

      <ModalForm isOpen={showEditItemModal} onClose={() => setShowEditItemModal(false)} title="Edit Company Details" onSubmit={handleEditCompanySubmit} submitText="Save Changes" maxWidth="max-w-md">
        <div className="space-y-4">
          <div className="space-y-1"><label className="block text-[11px] md:text-[13px] text-gray-700 uppercase tracking-tight">Company Name *</label><div className="relative"><Building className="absolute left-2.5 top-[9px] text-gray-400" size={14} /><input type="text" value={editCompany.name} onChange={e => setEditCompany({ ...editCompany, name: e.target.value })} placeholder="Enter company name" className="w-full pl-8 pr-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-amber-500 text-xs h-[32px] md:h-[36px]" required /></div></div>
          <div className="space-y-1"><label className="block text-[11px] md:text-[13px] text-gray-700 uppercase tracking-tight">Number *</label><div className="relative"><Phone className="absolute left-2.5 top-[9px] text-gray-400" size={14} /><input type="text" value={editCompany.number} onChange={e => setEditCompany({ ...editCompany, number: e.target.value })} placeholder="Enter contact number" className="w-full pl-8 pr-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-amber-500 text-xs h-[32px] md:h-[36px]" required /></div></div>
          <div className="space-y-1"><label className="block text-[11px] md:text-[13px] text-gray-700 uppercase tracking-tight">Gmail</label><div className="relative"><Mail className="absolute left-2.5 top-[9px] text-gray-400" size={14} /><input type="email" value={editCompany.gmail} onChange={e => setEditCompany({ ...editCompany, gmail: e.target.value })} placeholder="e.g. contact@company.com" className="w-full pl-8 pr-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-amber-500 text-xs h-[32px] md:h-[36px]" /></div></div>
          <div className="space-y-1"><label className="block text-[11px] md:text-[13px] text-gray-700 uppercase tracking-tight">Address</label><div className="relative"><MapPin className="absolute left-2.5 top-[9px] text-gray-400" size={14} /><input type="text" value={editCompany.address} onChange={e => setEditCompany({ ...editCompany, address: e.target.value })} placeholder="Enter company address" className="w-full pl-8 pr-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-amber-500 text-xs h-[32px] md:h-[36px]" /></div></div>
        </div>
      </ModalForm>
    </>
  );

  // ── filtersOnly mode: render filter dropdowns + modals only (used in Master toolbar) ──
  if (filtersOnly) {
    return (
      <>
        <div className="flex-1 min-w-0 lg:min-w-[150px]">
          <SearchableDropdown options={companyNamesList}
                isMulti={true} value={effectiveFilters.companyName} onChange={val => setFilterField('companyName', val)} placeholder="All Companies" height="h-[32px] md:h-[38px]" rounded="rounded-lg" />
        </div>
        <div className="flex-1 min-w-0 lg:min-w-[150px]">
          <SearchableDropdown options={locationsList}
                isMulti={true} value={effectiveFilters.location} onChange={val => setFilterField('location', val)} placeholder="All Locations" height="h-[32px] md:h-[38px]" rounded="rounded-lg" />
        </div>
        <div className="flex-1 min-w-0 lg:min-w-[150px]">
          <SearchableDropdown options={emailDomainsList}
                isMulti={true} value={effectiveFilters.emailDomain} onChange={val => setFilterField('emailDomain', val)} placeholder="All Domains" height="h-[32px] md:h-[38px]" rounded="rounded-lg" />
        </div>
        <button onClick={handleClearFilters} className="hidden lg:flex items-center justify-center bg-gray-50 text-gray-500 border border-gray-200 rounded-lg w-[38px] h-[38px] hover:bg-gray-100 transition-colors shadow-sm" title="Clear Filters">
          <RotateCcw size={16} />
        </button>
      </>
    );
  }

  // ── Full page mode ──
  return (
    <div className={`${isEmbedded ? '' : 'p-0 sm:p-2 md:p-6 '}space-y-2 md:space-y-6 flex flex-col h-full min-h-0`}>

      {/* Hidden trigger (for standalone add button) */}
      <div className="hidden" id="company-add-trigger" onClick={() => setShowAddItemModal(true)} />

      {/* Standalone Header Toolbar — only shown when NOT embedded */}
      {!isEmbedded && (
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-2 lg:gap-4 w-full px-2 sm:px-0">
          <div className="flex flex-col lg:flex-row w-full gap-2 lg:gap-3 items-center">
            <div className="flex items-center gap-2 w-full lg:w-auto lg:flex-[1.5]">
              <div className="flex-1 w-full relative">
                <Search className="absolute left-2.5 top-[9px] lg:top-[11px] text-gray-400" size={14} />
                <input type="text" placeholder="Search companies..." value={localFilters.searchQuery} onChange={e => setLocalFilters(p => ({ ...p, searchQuery: e.target.value }))} className="w-full bg-white border border-gray-300 rounded-lg lg:rounded pl-8 pr-2 py-1.5 focus:outline-none focus:border-amber-500 text-xs md:text-sm h-[32px] md:h-[38px]" />
              </div>
              <button onClick={() => setLocalShowMobileFilters(p => !p)} className={`lg:hidden flex items-center justify-center rounded-lg shadow-sm h-[32px] w-[32px] flex-shrink-0 transition ${localShowMobileFilters ? 'bg-amber-100 text-amber-700 border-amber-200' : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50'}`} title="Toggle Filters"><Filter size={14} /></button>
              {!localShowMobileFilters && <button onClick={() => setShowAddItemModal(true)} className="lg:hidden flex items-center justify-center bg-amber-600 text-white rounded-lg h-[32px] w-[32px] flex-shrink-0 shadow-sm active:scale-95"><Plus size={16} /></button>}
              <button onClick={handleClearFilters} className="lg:hidden flex items-center justify-center bg-gray-50 text-gray-500 border border-gray-200 rounded-lg h-[32px] w-[32px] flex-shrink-0 shadow-sm active:scale-95"><RotateCcw size={14} /></button>
            </div>
            <div className={`${localShowMobileFilters ? 'flex' : 'hidden'} lg:flex flex-col lg:flex-row lg:flex-nowrap gap-2 w-full lg:w-auto lg:flex-[6] overflow-visible`}>
              <div className="flex-1 min-w-0 lg:min-w-[150px]"><SearchableDropdown options={companyNamesList}
                isMulti={true} value={localFilters.companyName} onChange={val => { setLocalFilters(p => ({ ...p, companyName: val })); setCurrentPage(1); }} placeholder="All Companies" height="h-[32px] md:h-[38px]" rounded="rounded-lg" /></div>
              <div className="flex-1 min-w-0 lg:min-w-[150px]"><SearchableDropdown options={locationsList}
                isMulti={true} value={localFilters.location} onChange={val => { setLocalFilters(p => ({ ...p, location: val })); setCurrentPage(1); }} placeholder="All Locations" height="h-[32px] md:h-[38px]" rounded="rounded-lg" /></div>
              <div className="flex-1 min-w-0 lg:min-w-[150px]"><SearchableDropdown options={emailDomainsList}
                isMulti={true} value={localFilters.emailDomain} onChange={val => { setLocalFilters(p => ({ ...p, emailDomain: val })); setCurrentPage(1); }} placeholder="All Domains" height="h-[32px] md:h-[38px]" rounded="rounded-lg" /></div>
              <button onClick={handleClearFilters} className="hidden lg:flex items-center justify-center bg-gray-50 text-gray-500 border border-gray-200 rounded-lg w-[38px] h-[38px] hover:bg-gray-100 transition-colors shadow-sm"><RotateCcw size={16} /></button>
            </div>
          </div>
          <button onClick={() => setShowAddItemModal(true)} className="hidden lg:flex bg-amber-600 hover:bg-amber-700 text-white rounded-lg items-center justify-center transition shadow-sm w-[38px] h-[38px] flex-shrink-0"><Plus size={18} /></button>
        </div>
      )}

      {/* Table */}
      <div className="flex-1 min-h-0 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
        <DataTable
          headers={tableHeaders}
          data={paginatedCompanies}
          renderRow={renderRow}
          renderCard={renderCard}
          minWidth="1000px"
          currentPage={currentPage}
          totalPages={totalPages}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={(val) => { setItemsPerPage(val); setCurrentPage(1); }}
          totalResults={filteredCompanies.length}
          itemsPerPageOptions={[50, 100, 200, 500, 1000]}
        />
      </div>

      {modals}
    </div>
  );
}
