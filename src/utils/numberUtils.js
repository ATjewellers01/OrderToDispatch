/**
 * Blocks keyboard inputs that would violate 3 decimal places for numeric fields.
 * Prevents scientific notation (e, E), signs (+, -), and entries past 3 decimal points.
 */
export const preventInvalidDecimalChars = (e) => {
  if (['e', 'E', '+', '-'].includes(e.key)) {
    e.preventDefault();
    return;
  }
  
  const val = e.target.value;
  const dotIndex = val.indexOf('.');
  
  // Allow control/navigation keys, block typing beyond 3 decimal places
  const allowedKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Tab'];
  if (
    dotIndex !== -1 && 
    val.length - dotIndex > 3 && 
    !allowedKeys.includes(e.key) && 
    !e.ctrlKey && 
    !e.metaKey
  ) {
    e.preventDefault();
  }
};
