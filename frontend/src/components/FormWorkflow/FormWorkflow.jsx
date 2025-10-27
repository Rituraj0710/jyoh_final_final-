"use client"

import React from 'react';
import { useFormWorkflow } from './FormWorkflowProvider';
import FormPreview from './FormPreview';
import ProcessingState from './ProcessingState';
import PaymentGateway from './PaymentGateway';

const FormWorkflow = ({ 
  children, 
  formTitle, 
  fields = [],
  formType 
}) => {
  const { currentStep } = useFormWorkflow();

  const renderStep = () => {
    switch (currentStep) {
      case 'preview':
        return <FormPreview formTitle={formTitle} fields={fields} />;
      case 'processing':
        return <ProcessingState />;
      case 'payment':
        return <PaymentGateway />;
      default:
        return children;
    }
  };

  return (
    <div className="form-workflow">
      {renderStep()}
    </div>
  );
};

export default FormWorkflow;
