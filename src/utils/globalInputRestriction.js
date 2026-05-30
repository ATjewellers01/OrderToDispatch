export const initGlobalInputRestriction = () => {
  if (typeof document === 'undefined') return;

  const isWeightInput = (target) => {
    if (target.tagName !== 'INPUT') return false;
    // Apply to all type="number" or text inputs that look like weight
    if (target.type === 'number') return true;
    
    // Fallback if some are type="text" but meant for weight
    const name = (target.name || '').toLowerCase();
    const placeholder = (target.placeholder || '').toLowerCase();
    return name.includes('weight') || placeholder.includes('weight');
  };

  document.addEventListener('keydown', (e) => {
    const target = e.target;
    if (isWeightInput(target)) {
      if (['e', 'E', '+', '-'].includes(e.key)) {
        e.preventDefault();
        return;
      }
      
      const val = target.value;
      const dotIndex = val.indexOf('.');
      
      // If dot exists, and we are typing a character (not a control key)
      if (dotIndex !== -1 && val.length - dotIndex > 3) {
        // Allow navigation and deletion
        if (['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Tab'].includes(e.key) || e.ctrlKey || e.metaKey) {
          return;
        }
        
        // If the cursor is BEFORE or AT the decimal point, allow typing more integers!
        // e.g., 12.345, cursor at 1 -> 912.345.
        if (target.selectionStart <= dotIndex && target.selectionEnd === target.selectionStart) {
           return;
        }
        
        // If user has selected text to overwrite, allow it
        if (target.selectionEnd > target.selectionStart) {
           return;
        }

        e.preventDefault();
      }
    }
  }, true);

  document.addEventListener('paste', (e) => {
    const target = e.target;
    if (isWeightInput(target)) {
      const paste = (e.clipboardData || window.clipboardData).getData('text');
      if (paste.includes('.')) {
        const parts = paste.split('.');
        if (parts[1].length > 3) {
          e.preventDefault();
          try {
            const truncated = parts[0] + '.' + parts[1].substring(0, 3);
            document.execCommand('insertText', false, truncated);
          } catch (err) {
            // Do nothing if execCommand fails
          }
        }
      }
    }
  }, true);

  // Dynamically set step="0.001" on focus to allow proper step increments and native validation
  document.addEventListener('focus', (e) => {
    const target = e.target;
    if (isWeightInput(target) && target.type === 'number') {
      if (!target.hasAttribute('step') || target.getAttribute('step') !== '0.001') {
        target.setAttribute('step', '0.001');
      }
    }
  }, true);
};
