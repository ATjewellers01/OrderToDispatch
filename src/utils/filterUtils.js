export const generateFilterOptions = (data, fieldOrExtractor) => {
  if (!data || !Array.isArray(data)) return [];
  
  const counts = {};
  data.forEach(item => {
    let val;
    if (typeof fieldOrExtractor === 'function') {
      val = fieldOrExtractor(item);
    } else {
      val = item[fieldOrExtractor];
    }
    
    if (val !== undefined && val !== null && val !== '') {
      counts[val] = (counts[val] || 0) + 1;
    }
  });
  
  return Object.keys(counts)
    .sort()
    .map(val => ({
      value: val,
      label: val,
      count: counts[val]
    }));
};
