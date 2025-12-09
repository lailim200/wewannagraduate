/**
 * Categories for Events and Friends
 */

export const EVENT_CATEGORIES = [
  { id: 'friends', label: 'Friends', icon: '👥', color: '#667eea' },
  { id: 'family', label: 'Family', icon: '👨‍👩‍👧‍👦', color: '#f093fb' },
  { id: 'colleagues', label: 'Colleagues', icon: '💼', color: '#4facfe' },
  { id: 'group-project', label: 'Group Project', icon: '📚', color: '#43e97b' },
  { id: 'social', label: 'Social', icon: '🎉', color: '#fa709a' },
  { id: 'meeting', label: 'Meeting', icon: '🤝', color: '#fda085' },
  { id: 'other', label: 'Other', icon: '📌', color: '#a8edea' },
];

export const FRIEND_CATEGORIES = [
  { id: 'friends', label: 'Friends', icon: '👥', color: '#667eea' },
  { id: 'family', label: 'Family', icon: '👨‍👩‍👧‍👦', color: '#f093fb' },
  { id: 'colleagues', label: 'Colleagues', icon: '💼', color: '#4facfe' },
  { id: 'classmates', label: 'Classmates', icon: '🎓', color: '#43e97b' },
  { id: 'other', label: 'Other', icon: '📌', color: '#a8edea' },
];

/**
 * Get category details by ID
 * @param {string} categoryId - Category ID
 * @param {Array} categories - Categories array (EVENT_CATEGORIES or FRIEND_CATEGORIES)
 * @returns {Object} - Category object or default
 */
export const getCategoryById = (categoryId, categories = EVENT_CATEGORIES) => {
  return categories.find(cat => cat.id === categoryId) || categories[categories.length - 1];
};

/**
 * Get category color
 * @param {string} categoryId - Category ID
 * @param {Array} categories - Categories array
 * @returns {string} - Hex color
 */
export const getCategoryColor = (categoryId, categories = EVENT_CATEGORIES) => {
  const category = getCategoryById(categoryId, categories);
  return category.color;
};

/**
 * Get category gradient for backgrounds
 * @param {string} categoryId - Category ID
 * @param {Array} categories - Categories array
 * @returns {string} - CSS gradient string
 */
export const getCategoryGradient = (categoryId, categories = EVENT_CATEGORIES) => {
  const color = getCategoryColor(categoryId, categories);
  // Create a lighter version for gradient
  return `linear-gradient(135deg, ${color}, ${adjustColorBrightness(color, -20)})`;
};

/**
 * Adjust color brightness
 * @param {string} color - Hex color
 * @param {number} amount - Amount to adjust (-255 to 255)
 * @returns {string} - Adjusted hex color
 */
function adjustColorBrightness(color, amount) {
  const clamp = (num) => Math.min(Math.max(num, 0), 255);
  const num = parseInt(color.replace('#', ''), 16);
  const r = clamp((num >> 16) + amount);
  const g = clamp(((num >> 8) & 0x00ff) + amount);
  const b = clamp((num & 0x0000ff) + amount);
  return '#' + ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0');
}
