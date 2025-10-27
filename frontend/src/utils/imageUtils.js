// Utility function to get the full image URL
export const getImageUrl = (imagePath) => {
  if (!imagePath) {
    return 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop&crop=entropy&cs=tinysrgb';
  }
  
  // If it's already a full URL (starts with http), return as is
  if (imagePath.startsWith('http')) {
    return imagePath;
  }
  
  // If it's a relative path (starts with /uploads/), prepend the backend URL
  if (imagePath.startsWith('/uploads/')) {
    return `http://localhost:3000${imagePath}`;
  }
  
  // Fallback to default image
  return 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop&crop=entropy&cs=tinysrgb';
};
