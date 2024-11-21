import React from 'react';

const iconMap = {
  clothing: '/category-icons/clothing.svg',
  dining: '/category-icons/dining.svg',
  education: '/category-icons/education.svg',
  entertainment: '/category-icons/entertainment.svg',
  groceries: '/category-icons/groceries.svg',
  health: '/category-icons/health.svg',
  'personal-care': '/category-icons/personal-care.svg',
  rent: '/category-icons/rent.svg',
  subscriptions: '/category-icons/subscriptions.svg',
  transport: '/category-icons/transport.svg',
  travel: '/category-icons/travel.svg',
  utilities: '/category-icons/utilities.svg',
};

export function CategoryIcon({ category }: { category: string }) {
  const iconPath = iconMap[category.toLowerCase() as keyof typeof iconMap];
  
  if (iconPath) {
    return (
      <img 
        src={iconPath} 
        alt={`${category} icon`}
        className="h-5 w-5"
      />
    );
  }

  // Fallback for categories without custom icons
  return null;
}