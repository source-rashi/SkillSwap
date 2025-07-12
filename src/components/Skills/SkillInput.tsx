import React, { useState, KeyboardEvent } from 'react';
import { Plus } from 'lucide-react';
import Input from '../UI/Input';
import Button from '../UI/Button';
import SkillTag from './SkillTag';

interface SkillInputProps {
  skills: string[];
  onSkillsChange: (skills: string[]) => void;
  label: string;
  placeholder: string;
  variant?: 'offered' | 'wanted' | 'default';
}

const SkillInput: React.FC<SkillInputProps> = ({
  skills,
  onSkillsChange,
  label,
  placeholder,
  variant = 'default'
}) => {
  const [newSkill, setNewSkill] = useState('');

  const addSkill = () => {
    const trimmedSkill = newSkill.trim();
    if (trimmedSkill && !skills.includes(trimmedSkill)) {
      onSkillsChange([...skills, trimmedSkill]);
      setNewSkill('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    onSkillsChange(skills.filter(skill => skill !== skillToRemove));
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSkill();
    }
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      
      <div className="flex space-x-2">
        <Input
          value={newSkill}
          onChange={(e) => setNewSkill(e.target.value)}
          placeholder={placeholder}
          onKeyPress={handleKeyPress}
          className="flex-1"
        />
        <Button
          type="button"
          onClick={addSkill}
          size="sm"
          disabled={!newSkill.trim()}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {skills.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {skills.map((skill, index) => (
            <SkillTag
              key={index}
              skill={skill}
              variant={variant}
              onRemove={() => removeSkill(skill)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default SkillInput;