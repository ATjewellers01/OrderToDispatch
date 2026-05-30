// Storage Manager - Handle all localStorage operations

const STORAGE_KEYS = {
  USERS: 'pcb_users',
  SETTINGS: 'pcb_settings',
};

// Initialize default data
const DEFAULT_USERS = [
  { id: 'admin', name: 'Admin User', password: 'admin123', role: 'ADMIN', accessPages: [] },
  { id: 'user', name: 'Employee 1', password: 'user123', role: 'USER', accessPages: [] },
  { id: 'user2', name: 'Employee 2', password: 'user123', role: 'USER', accessPages: [] }
];

// Initialize storage with defaults
export const initializeStorage = () => {
  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(DEFAULT_USERS));
  }

  if (!localStorage.getItem('companyShiftsDataV3')) {
    localStorage.setItem('companyShiftsDataV3', JSON.stringify([
      { id: 'shift-1', name: 'General Shift', startTime: '09:00', endTime: '18:00', isDefault: 'Yes' }
    ]));
  }

  if (!localStorage.getItem('tatSetupDataV3')) {
    localStorage.setItem('tatSetupDataV3', JSON.stringify([
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
    ]));
  }

  if (!localStorage.getItem('weekendSetupDataV3')) {
    localStorage.setItem('weekendSetupDataV3', JSON.stringify(['Sunday']));
  }

  // Sync / Migrate existing orders to include metalIssueType
  try {
    const savedOrders = localStorage.getItem('ordersDataV3');
    const savedIssues = localStorage.getItem('metalIssuesDataV3');
    if (savedOrders && savedIssues) {
      const orders = JSON.parse(savedOrders);
      const issues = JSON.parse(savedIssues);
      const issueMap = new Map();
      issues.forEach(issue => {
        if (issue.orderId) issueMap.set(issue.orderId, issue.metalIssueType);
        if (issue.orderNo) issueMap.set(issue.orderNo, issue.metalIssueType);
      });
      let changed = false;
      const updatedOrders = orders.map(o => {
        const type = issueMap.get(o.id) || issueMap.get(o.orderNo) || '';
        if (o.metalIssueType !== type) {
          changed = true;
          return { ...o, metalIssueType: type };
        }
        return o;
      });
      if (changed) {
        localStorage.setItem('ordersDataV3', JSON.stringify(updatedOrders));
      }
    }
  } catch (e) {
    console.error('Storage migration error:', e);
  }
};

// Get data from storage
export const getFromStorage = (key) => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : null;
};

// Save data to storage
export const saveToStorage = (key, data) => {
  localStorage.setItem(key, JSON.stringify(data));
};

// User operations
export const getUsers = () => {
  const users = getFromStorage(STORAGE_KEYS.USERS);
  if (!users || !users.some(u => u.id === 'admin')) {
    saveToStorage(STORAGE_KEYS.USERS, DEFAULT_USERS);
    return DEFAULT_USERS;
  }
  return users;
};
export const saveUsers = (users) => saveToStorage(STORAGE_KEYS.USERS, users);

export { STORAGE_KEYS };
