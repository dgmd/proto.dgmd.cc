export const addListItem = (list, item) => {
  return [...list, item];
};

export const removeListItem = (list, item) => {
  return list.filter((listItem) => listItem !== item);
};
  