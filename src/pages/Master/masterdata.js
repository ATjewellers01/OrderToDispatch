// ─────────────────────────────────────────────────────────────────────────────
//  masterdata.js — Central seed data for the Master module
//  Contains: SEEDED_KARIGARS, SEEDED_ITEMS
// ─────────────────────────────────────────────────────────────────────────────

// ── SVG Placeholder Generators ────────────────────────────────────────────────

/** Generate a circular avatar with initials */
const makeAvatar = (initials, bg) => {
  const svg = `<svg width="80" height="80" xmlns="http://www.w3.org/2000/svg"><circle cx="40" cy="40" r="40" fill="${bg}"/><text x="40" y="52" font-family="Arial,sans-serif" font-size="26" font-weight="bold" fill="white" text-anchor="middle">${initials}</text></svg>`;
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
};

/** Generate an Aadhaar card placeholder image (pure ASCII only) */
const makeAadhar = (name, number, bg = '#1a237e') => {
  const short = name.length > 16 ? name.slice(0, 15) + '.' : name;
  const svg = [
    `<svg width="220" height="130" xmlns="http://www.w3.org/2000/svg">`,
    `<rect width="220" height="130" rx="10" fill="${bg}"/>`,
    `<rect x="0" y="0" width="220" height="28" rx="10" fill="rgba(0,0,0,0.25)"/>`,
    `<rect x="0" y="18" width="220" height="10" fill="rgba(0,0,0,0.25)"/>`,
    `<text x="110" y="19" font-family="Arial,sans-serif" font-size="8" fill="#c5cae9" text-anchor="middle" font-weight="bold">GOVERNMENT OF INDIA</text>`,
    `<text x="12" y="48" font-family="Arial,sans-serif" font-size="16" fill="#ffd740" font-weight="bold">AADHAAR</text>`,
    `<rect x="12" y="58" width="44" height="52" rx="4" fill="rgba(255,255,255,0.1)"/>`,
    `<circle cx="34" cy="76" r="14" fill="rgba(255,255,255,0.2)"/>`,
    `<text x="34" y="80" font-family="Arial,sans-serif" font-size="9" fill="white" text-anchor="middle">PHOTO</text>`,
    `<text x="64" y="72" font-family="Arial,sans-serif" font-size="11" fill="white" font-weight="bold">${short}</text>`,
    `<text x="64" y="87" font-family="Arial,sans-serif" font-size="9" fill="#c5cae9">DOB: 01/01/1985  Male</text>`,
    `<text x="12" y="122" font-family="Arial,sans-serif" font-size="14" fill="white" font-weight="bold" letter-spacing="2">${number}</text>`,
    `</svg>`,
  ].join('');
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
};

// ── Avatar colours (10, cycling) ──────────────────────────────────────────────
const C = ['#F59E0B','#EF4444','#10B981','#3B82F6','#8B5CF6','#F97316','#EC4899','#14B8A6','#6366F1','#84CC16'];

// ── Karigar Details Seed Data ─────────────────────────────────────────────────
export const SEEDED_KARIGARS = [
  {
    id: 'KR-001', karigarCode: 'KG001', name: 'Ramesh Kumar',
    number: '9801234567', email: 'ramesh.kumar@gmail.com',
    address: 'Shop 12, Zaveri Bazaar, Mumbai', type: 'Office',
    aadharNumber: '2345 6789 1001',
    karigarImage: makeAvatar('RK', C[0]),
    aadharImage: makeAadhar('Ramesh Kumar', '2345 6789 1001', '#1a237e'),
  },
  {
    id: 'KR-002', karigarCode: 'KG002', name: 'Suresh Patel',
    number: '9802234567', email: 'suresh.patel@gmail.com',
    address: 'Factory 3, MIDC, Thane', type: 'Factory',
    aadharNumber: '3456 7890 1002',
    karigarImage: makeAvatar('SP', C[1]),
    aadharImage: makeAadhar('Suresh Patel', '3456 7890 1002', '#b71c1c'),
  },
  {
    id: 'KR-003', karigarCode: 'KG003', name: 'Amit Shah',
    number: '9803234567', email: 'amit.shah@gmail.com',
    address: 'Office 7, Opera House, Mumbai', type: 'Office',
    aadharNumber: '4567 8901 1003',
    karigarImage: makeAvatar('AS', C[2]),
    aadharImage: makeAadhar('Amit Shah', '4567 8901 1003', '#1b5e20'),
  },
  {
    id: 'KR-004', karigarCode: 'KG004', name: 'Rahul Verma',
    number: '9804234567', email: 'rahul.verma@gmail.com',
    address: 'Unit 5, Bhiwandi Industrial Area', type: 'Factory',
    aadharNumber: '5678 9012 1004',
    karigarImage: makeAvatar('RV', C[3]),
    aadharImage: makeAadhar('Rahul Verma', '5678 9012 1004', '#0d47a1'),
  },
  {
    id: 'KR-005', karigarCode: 'KG005', name: 'Manoj Tiwari',
    number: '9805234567', email: 'manoj.tiwari@gmail.com',
    address: 'Shop 4, Crawford Market, Mumbai', type: 'Office',
    aadharNumber: '6789 0123 1005',
    karigarImage: makeAvatar('MT', C[4]),
    aadharImage: makeAadhar('Manoj Tiwari', '6789 0123 1005', '#4a148c'),
  },
  {
    id: 'KR-006', karigarCode: 'KG006', name: 'Prakash Joshi',
    number: '9806234567', email: 'prakash.joshi@gmail.com',
    address: 'Shed 9, Taloja MIDC, Navi Mumbai', type: 'Factory',
    aadharNumber: '7890 1234 1006',
    karigarImage: makeAvatar('PJ', C[5]),
    aadharImage: makeAadhar('Prakash Joshi', '7890 1234 1006', '#bf360c'),
  },
  {
    id: 'KR-007', karigarCode: 'KG007', name: 'Deepak Gupta',
    number: '9807234567', email: 'deepak.gupta@gmail.com',
    address: 'Room 2, Dharavi Crafts Centre', type: 'Office',
    aadharNumber: '8901 2345 1007',
    karigarImage: makeAvatar('DG', C[6]),
    aadharImage: makeAadhar('Deepak Gupta', '8901 2345 1007', '#880e4f'),
  },
  {
    id: 'KR-008', karigarCode: 'KG008', name: 'Sanjay Mehta',
    number: '9808234567', email: 'sanjay.mehta@gmail.com',
    address: 'Workshop 6, Kalbadevi, Mumbai', type: 'Factory',
    aadharNumber: '9012 3456 1008',
    karigarImage: makeAvatar('SM', C[7]),
    aadharImage: makeAadhar('Sanjay Mehta', '9012 3456 1008', '#004d40'),
  },
  {
    id: 'KR-009', karigarCode: 'KG009', name: 'Dinesh Sharma',
    number: '9809234567', email: 'dinesh.sharma@gmail.com',
    address: 'Office 3, Lalbaug, Mumbai', type: 'Office',
    aadharNumber: '1023 4567 1009',
    karigarImage: makeAvatar('DS', C[8]),
    aadharImage: makeAadhar('Dinesh Sharma', '1023 4567 1009', '#1a237e'),
  },
  {
    id: 'KR-010', karigarCode: 'KG010', name: 'Vikram Singh',
    number: '9810234567', email: 'vikram.singh@gmail.com',
    address: 'Plot 11, Turbhe MIDC, Navi Mumbai', type: 'Factory',
    aadharNumber: '1134 5678 1010',
    karigarImage: makeAvatar('VS', C[9]),
    aadharImage: makeAadhar('Vikram Singh', '1134 5678 1010', '#33691e'),
  },
  {
    id: 'KR-011', karigarCode: 'KG011', name: 'Ajay Yadav',
    number: '9811234567', email: 'ajay.yadav@gmail.com',
    address: 'Shop 8, Masjid Bunder, Mumbai', type: 'Office',
    aadharNumber: '2245 6789 1011',
    karigarImage: makeAvatar('AY', C[0]),
    aadharImage: makeAadhar('Ajay Yadav', '2245 6789 1011', '#e65100'),
  },
  {
    id: 'KR-012', karigarCode: 'KG012', name: 'Ravi Dubey',
    number: '9812234567', email: 'ravi.dubey@gmail.com',
    address: 'Factory 2, Ambernath East', type: 'Factory',
    aadharNumber: '3356 7890 1012',
    karigarImage: makeAvatar('RD', C[1]),
    aadharImage: makeAadhar('Ravi Dubey', '3356 7890 1012', '#b71c1c'),
  },
  {
    id: 'KR-013', karigarCode: 'KG013', name: 'Pradeep Nair',
    number: '9813234567', email: 'pradeep.nair@gmail.com',
    address: 'Shop 5, Bhuleshwar, Mumbai', type: 'Office',
    aadharNumber: '4467 8901 1013',
    karigarImage: makeAvatar('PN', C[2]),
    aadharImage: makeAadhar('Pradeep Nair', '4467 8901 1013', '#1b5e20'),
  },
  {
    id: 'KR-014', karigarCode: 'KG014', name: 'Santosh Kadam',
    number: '9814234567', email: 'santosh.kadam@gmail.com',
    address: 'Shed 14, Dombivli MIDC', type: 'Factory',
    aadharNumber: '5578 9012 1014',
    karigarImage: makeAvatar('SK', C[3]),
    aadharImage: makeAadhar('Santosh Kadam', '5578 9012 1014', '#0d47a1'),
  },
  {
    id: 'KR-015', karigarCode: 'KG015', name: 'Vijay Patil',
    number: '9815234567', email: 'vijay.patil@gmail.com',
    address: 'Office 9, Charni Road, Mumbai', type: 'Office',
    aadharNumber: '6689 0123 1015',
    karigarImage: makeAvatar('VP', C[4]),
    aadharImage: makeAadhar('Vijay Patil', '6689 0123 1015', '#4a148c'),
  },
  {
    id: 'KR-016', karigarCode: 'KG016', name: 'Naveen Jain',
    number: '9816234567', email: 'naveen.jain@gmail.com',
    address: 'Shop 11, Byculla, Mumbai', type: 'Office',
    aadharNumber: '7790 1234 1016',
    karigarImage: makeAvatar('NJ', C[5]),
    aadharImage: makeAadhar('Naveen Jain', '7790 1234 1016', '#bf360c'),
  },
  {
    id: 'KR-017', karigarCode: 'KG017', name: 'Hemant Rao',
    number: '9817234567', email: 'hemant.rao@gmail.com',
    address: 'Unit 8, Kalyan Industrial Zone', type: 'Factory',
    aadharNumber: '8801 2345 1017',
    karigarImage: makeAvatar('HR', C[6]),
    aadharImage: makeAadhar('Hemant Rao', '8801 2345 1017', '#880e4f'),
  },
  {
    id: 'KR-018', karigarCode: 'KG018', name: 'Girish Pandey',
    number: '9818234567', email: 'girish.pandey@gmail.com',
    address: 'Office 5, Dadar, Mumbai', type: 'Office',
    aadharNumber: '9912 3456 1018',
    karigarImage: makeAvatar('GP', C[7]),
    aadharImage: makeAadhar('Girish Pandey', '9912 3456 1018', '#004d40'),
  },
  {
    id: 'KR-019', karigarCode: 'KG019', name: 'Sunil Bansode',
    number: '9819234567', email: 'sunil.bansode@gmail.com',
    address: 'Factory 7, Vasai East MIDC', type: 'Factory',
    aadharNumber: '1023 4567 1019',
    karigarImage: makeAvatar('SB', C[8]),
    aadharImage: makeAadhar('Sunil Bansode', '1023 4567 1019', '#1a237e'),
  },
  {
    id: 'KR-020', karigarCode: 'KG020', name: 'Arun Deshmukh',
    number: '9820234567', email: 'arun.deshmukh@gmail.com',
    address: 'Shop 3, Kurla Market, Mumbai', type: 'Office',
    aadharNumber: '1134 5678 1020',
    karigarImage: makeAvatar('AD', C[9]),
    aadharImage: makeAadhar('Arun Deshmukh', '1134 5678 1020', '#33691e'),
  },
];
