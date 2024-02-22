export const removeHyphens =
  st => {
  return st.replace( /-/g, '' );
};

export const deriveBoolean = 
  value => {
  const str = String( value );
  const strLowTrim = str.toLowerCase().trim();
  return [
    'true',
    '1',
    'yes',
    'y',
    'on'
  ].includes( strLowTrim );
};