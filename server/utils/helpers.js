exports.filterObject = (obj, keys, keysType) => {
  const filtered = {};
  for (const key in obj) {
    if (keysType === 'include' && keys.includes(key)) filtered[key] = obj[key];
    if (keysType === 'exclude' && !keys.includes(key)) filtered[key] = obj[key];
  }
  return filtered;
};
