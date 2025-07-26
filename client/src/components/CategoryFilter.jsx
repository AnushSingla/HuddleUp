import React from 'react';
import { Button } from '@/components/ui/button';
import  Badge  from '@/components/ui/badge';

const CategoryFilter = ({ selectedCategory, onCategoryChange, videoCounts = {} }) => {
  const categories = [
    { value: 'ALL', label: 'All', icon: '🎬' },
    { value: 'UNHEARD STORIES', label: 'UNHEARD STORIES', icon: '📢' },
    { value: 'MATCH ANALYSIS', label: 'MATCH ANALYSIS', icon: '📊' },
    { value: 'SPORTS AROUND THE GLOBE', label: 'SPORTS AROUND THE GLOBE', icon: '🌍' }
  ];

  return (
    <div className="flex flex-wrap md:flex-nowrap justify-center md:justify-between gap-2 md:gap-4">
      {categories.map((category) => (
        <Button
          key={category.value}
          variant={selectedCategory === category.value ? "default" : "outline"}
          onClick={() => onCategoryChange(category.value)}
          className={`relative px-3 py-2 text-sm transition-all duration-300 whitespace-nowrap ${
            selectedCategory === category.value
              ? 'bg-green-500 hover:bg-green-600 text-white shadow-lg scale-105'
              : 'border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300'
          }`}
        >
          <span className="mr-1">{category.icon}</span>
          {category.label}
          {videoCounts[category.value] !== undefined && (
            <Badge
              variant="secondary"
              className={`ml-2 text-xs ${
                selectedCategory === category.value
                  ? 'bg-white/20 text-white'
                  : 'bg-blue-100 text-blue-600'
              }`}
            >
              {videoCounts[category.value]}
            </Badge>
          )}
        </Button>
      ))}
    </div>
  );
};

export default CategoryFilter;
