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
  
  const tats = savedTats ? JSON.parse(savedTats) : [
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

export const formatTargetDate = (dateStr) => {
  if (!dateStr) return '-';
  const parsed = new Date(dateStr);
  if (isNaN(parsed.getTime())) return dateStr;
  const dd = String(parsed.getDate()).padStart(2, '0');
  const mm = String(parsed.getMonth() + 1).padStart(2, '0');
  const yyyy = parsed.getFullYear();
  const hrs = String(parsed.getHours()).padStart(2, '0');
  const mins = String(parsed.getMinutes()).padStart(2, '0');
  return `${dd}/${mm}/${yyyy} ${hrs}:${mins}`;
};
