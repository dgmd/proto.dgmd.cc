export const addListItem = (list, item) => {
  return [...list, item];
};

export const removeListItem = (list, item) => {
  return list.filter((listItem) => listItem !== item);
};
  
export const areAllMapSetsEmpty = unloadedPgIds => {
  // Iterate over the Map entries
  for (const set of unloadedPgIds.values()) {
    // Check if the Set is not empty
    if (set.size > 0) {
      return false; // If any set is not empty, return false
    }
  }
  // If all sets are empty, return true
  return true;
}