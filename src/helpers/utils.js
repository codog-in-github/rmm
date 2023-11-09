
export function map2array(map) {
  const list = [];
  for(const [value, label] of Object.entries(map)) {
    list.push({
      value: Number(value),
      label
    });
  }
  return list; 
}
