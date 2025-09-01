import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
// CampaignForm is no longer directly used here for create/edit, but could be for other dialogs.
// For simplicity, we'll keep the import if it's used elsewhere, or remove if not.
// import { CampaignForm } from './CampaignForm'; 

export const CampaignDialog = ({ isOpen, onOpenChange, title, description, children }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg md:max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-xl md:text-2xl">
            {title || "Información"}
          </DialogTitle>
          {description && (
            <DialogDescription>
              {description}
            </DialogDescription>
          )}
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  );
};