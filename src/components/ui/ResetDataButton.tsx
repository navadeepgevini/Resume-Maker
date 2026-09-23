'use client';

import { useState } from 'react';
import { useResume } from '@/context/ResumeContext';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';

export default function ResetDataButton() {
  const [isOpen, setIsOpen] = useState(false);
  const { dispatch, goToStep } = useResume();

  const handleConfirm = () => {
    dispatch({ type: 'RESET' });
    if (goToStep) {
      goToStep(1);
    }
    setIsOpen(false);
  };

  return (
    <>
      <Button 
        variant="ghost" 
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 text-[#6B6B63] hover:text-[#B91C1C] hover:bg-[#B91C1C]/10"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="3 6 5 6 21 6"></polyline>
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          <line x1="10" y1="11" x2="10" y2="17"></line>
          <line x1="14" y1="11" x2="14" y2="17"></line>
        </svg>
        Start Fresh
      </Button>

      {isOpen && (
        <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Start Fresh">
          <div className="flex flex-col gap-6">
            <p className="text-[#1C1C1A]">Are you sure? This will clear all your resume data.</p>
            <div className="flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleConfirm}
                className="bg-[#B91C1C] hover:bg-[#991b1b] text-white"
              >
                Yes, Reset
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
