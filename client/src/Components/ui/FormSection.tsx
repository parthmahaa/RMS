import React, { type ReactNode } from 'react';

interface FormSectionProps {
  title: string;
  children: ReactNode;
  className?: string;
}

const FormSection: React.FC<FormSectionProps> = ({ title, children, className }) => {
  return (
    <div className={`form-section bg-white border border-gray-200 rounded-lg p-6 ${className || ''}`}>
      <h2 className="text-lg font-medium text-gray-900 mb-4">{title}</h2>
      {children}
    </div>
  );
};

export default FormSection;