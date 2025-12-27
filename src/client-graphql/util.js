export function capitalizeFirst(str) {
    if (!str) return '';
    return str[0].toUpperCase() + str.slice(1);
}

export function grouped(contents) {
    return contents.reduce((acc, item) => {
        const key = item._nodeType;
        if (!acc[key]) acc[key] = [];
      
        // Check if the ID already exists in the group
        const id = item.properties?.id ?? item.id;
        const alreadyExists = acc[key].some(existing => {
          const existingId = existing.properties?.id ?? existing.id;
          return existingId === id;
        });
      
        if (!alreadyExists) {
          acc[key].push(item);
        }
      
        return acc;
      }, {});
}

export function removeTypeName(obj) {
  if (Array.isArray(obj)) {
    return obj.map(removeTypename);
  } else if (obj !== null && typeof obj === 'object') {
    const newObj = {};
    for (const key in obj) {
      if (key !== '__typename') {
        newObj[key] = removeTypeName(obj[key]);
      }
    }
    return newObj;
  }
  return obj;
}