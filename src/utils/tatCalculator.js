/**
 * Turnaround Time (TAT) Calculation Engine
 * Calculates stage deadlines taking shift hours and weekend list into account.
 */

export const calculatePlannedDate = (startVal, stageName) => {
  const start = startVal ? new Date(startVal) : new Date();
  if (isNaN(start.getTime())) return new Date().toISOString();

  // 1. Load settings from localStorage
  const savedShifts = localStorage.getItem('companyShiftsDataV3');
  const savedTats = localStorage.getItem('tatSetupDataV3');
  const savedWeekends = localStorage.getItem('weekendSetupDataV3');

  const shifts = savedShifts ? JSON.parse(savedShifts) : [
    { id: 'shift-1', name: 'General Shift', startTime: '09:00', endTime: '18:00', isDefault: 'Yes' }
  ];
  
  const tats = savedTats ? JSON.parse(savedTats).filter(t => t.stageName !== 'Follow Up') : [
    { id: 'tat-1', stageName: 'Order', value: 1, type: 'day' },
    { id: 'tat-2', stageName: 'Metal Issue', value: 2, type: 'day' },

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
  
  const weekends = savedWeekends ? JSON.parse(savedWeekends) : ['Sunday'];

  // Find active/default shift
  const defaultShift = shifts.find(s => s.isDefault === 'Yes') || shifts[0] || { startTime: '09:00', endTime: '18:00' };
  const [startHour, startMin] = defaultShift.startTime.split(':').map(Number);
  const [endHour, endMin] = defaultShift.endTime.split(':').map(Number);

  // Normalize stageName for matching (replace dash, spaces, casing)
  const normStageName = (name) => name?.toLowerCase().replace(/[\s\-_]/g, '') || '';
  const searchName = normStageName(stageName);

  // Find TAT stage setting (matches "Meena Inhouse", "MeenaOutside", etc.)
  const tat = tats.find(t => normStageName(t.stageName) === searchName) || { value: 1, type: 'day' };
  const tatValue = Number(tat.value);
  const tatType = tat.type; // 'day', 'hours', 'minute'

  // Helper to check if a date falls on a weekend (Disabled - Weekends are treated as working days)
  const isWeekend = (date) => {
    return false;
  };

  // Helper to get next working day (skips weekends)
  const getNextWorkingDay = (date) => {
    let next = new Date(date);
    do {
      next.setDate(next.getDate() + 1);
    } while (isWeekend(next));
    return next;
  };

  let current = new Date(start);

  // If starting date falls on a weekend, move to next working day shift start
  if (isWeekend(current)) {
    current = getNextWorkingDay(current);
    current.setHours(startHour, startMin, 0, 0);
  }

  // Snapping start time to active shift hours on working day
  const shiftStartToday = new Date(current);
  shiftStartToday.setHours(startHour, startMin, 0, 0);
  const shiftEndToday = new Date(current);
  shiftEndToday.setHours(endHour, endMin, 0, 0);

  if (current < shiftStartToday) {
    current = shiftStartToday;
  } else if (current > shiftEndToday) {
    current = getNextWorkingDay(current);
    current.setHours(startHour, startMin, 0, 0);
  }

  if (tatType === 'day') {
    // Add days one-by-one, skipping weekends
    let daysAdded = 0;
    while (daysAdded < tatValue) {
      current.setDate(current.getDate() + 1);
      if (!isWeekend(current)) {
        daysAdded++;
      }
    }
    // Set to shift start time of that day
    current.setHours(startHour, startMin, 0, 0);
  } else if (tatType === 'hours' || tatType === 'minute') {
    let minsToAdd = tatType === 'hours' ? tatValue * 60 : tatValue;

    while (minsToAdd > 0) {
      const todayStart = new Date(current);
      todayStart.setHours(startHour, startMin, 0, 0);
      const todayEnd = new Date(current);
      todayEnd.setHours(endHour, endMin, 0, 0);

      if (current < todayStart) {
        current = todayStart;
      }

      const remainingMinsToday = Math.max(0, Math.floor((todayEnd - current) / 60000));

      if (minsToAdd <= remainingMinsToday) {
        current = new Date(current.getTime() + minsToAdd * 60000);
        minsToAdd = 0;
      } else {
        minsToAdd -= remainingMinsToday;
        current = getNextWorkingDay(current);
        current.setHours(startHour, startMin, 0, 0);
      }
    }
  }

  return current.toISOString();
};


/**
 * Calculate delay between Planned Date and Done Date.
 * Uses the default shift to convert excess minutes into meaningful units.
 *
 * @param {string|null} targetDateISO  - The planned/target date (ISO string)
 * @param {string|null} doneDateISO    - The actual done/completion date (ISO string)
 * @returns {{ isDelayed: boolean, display: string, minutes: number }}
 */
export const calculateDelay = (targetDateISO, doneDateISO) => {
  if (!targetDateISO || !doneDateISO) {
    return { isDelayed: false, display: '-', minutes: 0 };
  }

  const target = new Date(targetDateISO);
  const done = new Date(doneDateISO);

  if (isNaN(target.getTime()) || isNaN(done.getTime())) {
    return { isDelayed: false, display: '-', minutes: 0 };
  }

  const diffMs = done.getTime() - target.getTime();
  if (diffMs <= 0) {
    // Done on time or early
    const earlyMins = Math.abs(Math.round(diffMs / 60000));
    return { isDelayed: false, display: `On Time`, minutes: Math.round(diffMs / 60000) };
  }

  // Load shift to compute shift hours per day
  const savedShifts = localStorage.getItem('companyShiftsDataV3');
  const shifts = savedShifts ? JSON.parse(savedShifts) : [
    { id: 'shift-1', name: 'General Shift', startTime: '09:00', endTime: '18:00', isDefault: 'Yes' }
  ];
  const defaultShift = shifts.find(s => s.isDefault === 'Yes') || shifts[0] || { startTime: '09:00', endTime: '18:00' };

  const [startHour, startMin] = defaultShift.startTime.split(':').map(Number);
  const [endHour, endMin] = defaultShift.endTime.split(':').map(Number);
  const shiftMinsPerDay = (endHour * 60 + endMin) - (startHour * 60 + startMin);

  const totalMins = Math.round(diffMs / 60000);

  if (shiftMinsPerDay > 0 && totalMins >= shiftMinsPerDay) {
    const days = Math.floor(totalMins / shiftMinsPerDay);
    const remMins = totalMins % shiftMinsPerDay;
    const hrs = Math.floor(remMins / 60);
    const mins = remMins % 60;
    let display = `+${days}d`;
    if (hrs > 0) display += ` ${hrs}h`;
    if (mins > 0 && days === 0) display += ` ${mins}m`;
    return { isDelayed: true, display, minutes: totalMins };
  } else {
    const hrs = Math.floor(totalMins / 60);
    const mins = totalMins % 60;
    let display = hrs > 0 ? `+${hrs}h ${mins}m` : `+${mins}m`;
    return { isDelayed: true, display, minutes: totalMins };
  }
};

const getStageFromPath = (path) => {
  if (!path) return '';
  const p = path.toLowerCase();
  if (p.includes('/metal-issue')) return 'Metal Issue';
  if (p.includes('/follow-up')) return 'Follow Up';
  if (p.includes('/qc1')) return 'QC1';
  if (p.includes('/ghat-jama')) return 'Ghat Jama';
  if (p.includes('/meena-inhouse')) return 'Meena Inhouse';
  if (p.includes('/meena-outside')) return 'Meena Outside';
  if (p.includes('/polish-inhouse')) return 'Polish Inhouse';
  if (p.includes('/polish-outside')) return 'Polish Outside';
  if (p.includes('/bangle-polish')) return 'Bangle Polish';
  if (p.includes('/e-polish')) return 'E-Polish';
  if (p.includes('/qc2')) return 'QC2';
  if (p.includes('/dispatch')) return 'Dispatch';
  if (p.includes('/receipt')) return 'RD (Receipt Department)';
  if (p.includes('/qc3')) return 'QC3';
  if (p.includes('/huid-label')) return 'HUID/Label';
  if (p.includes('/receive-in-stock')) return 'Receive In Stock';
  if (p.includes('/delivery')) return 'Delivery';
  return '';
};

const getTatTypeForStage = (stageName) => {
  if (!stageName) return 'day';
  try {
    const savedTats = localStorage.getItem('tatSetupDataV3');
    const tats = savedTats ? JSON.parse(savedTats).filter(t => t.stageName !== 'Follow Up') : [
      { id: 'tat-1', stageName: 'Order', value: 1, type: 'day' },
      { id: 'tat-2', stageName: 'Metal Issue', value: 2, type: 'day' },

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
    
    const normStageName = (name) => {
      let n = name?.toLowerCase().replace(/[\s\-_/]/g, '') || '';
      if (n === 'label') return 'huidlabel';
      if (n === 'receiveinstock') return 'receiveinstock';
      if (n === 'rd') return 'rdreceiptdepartment';
      if (n === 'receipt') return 'rdreceiptdepartment';
      return n;
    };
    
    const searchName = normStageName(stageName);
    const tat = tats.find(t => normStageName(t.stageName) === searchName);
    return tat ? tat.type : 'day';
  } catch {
    return 'day';
  }
};

export const formatTargetDate = (dateStr, stageName) => {
  if (!dateStr) return '-';
  const parsed = new Date(dateStr);
  if (isNaN(parsed.getTime())) return dateStr;

  const dd = String(parsed.getDate()).padStart(2, '0');
  const mm = String(parsed.getMonth() + 1).padStart(2, '0');
  const yyyy = parsed.getFullYear();

  let resolvedStage = stageName;
  if (!resolvedStage && typeof window !== 'undefined' && window.location) {
    resolvedStage = getStageFromPath(window.location.pathname);
  }

  const type = getTatTypeForStage(resolvedStage);

  if (type === 'hours' || type === 'minute') {
    const hrs = String(parsed.getHours()).padStart(2, '0');
    const mins = String(parsed.getMinutes()).padStart(2, '0');
    const secs = String(parsed.getSeconds()).padStart(2, '0');
    return `${dd}/${mm}/${yyyy} ${hrs}:${mins}:${secs}`;
  }

  return `${dd}/${mm}/${yyyy}`;
};
