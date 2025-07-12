import React from 'react';
import { X } from 'lucide-react';

interface SkillTagProps {
  skill: string;
  onRemove?: () => void;
  variant?: 'offered' | 'wanted' | 'default';
}

const SkillTag: React.FC<SkillTagProps> = ({ 
  skill, 
  onRemove, 
  variant = 'default' 
}) => {
  const variantClasses = {
    offered: 'bg-green-100 text-green-800 border-green-200',
    wanted: 'bg-blue-100 text-blue-800 border-blue-200',
    default: 'bg-gray-100 text-gray-800 border-gray-200',
  };

  return (
    <span className={`
      inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border
      ${variantClasses[variant]}
    `}>
      {skill}
      {onRemove && (
        <button
          onClick={onRemove}
          className="ml-1.5 h-3 w-3 text-current hover:text-red-600 transition-colors"
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </span>
  );
};

export default SkillTag;