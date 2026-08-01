import React from 'react';
import { getKeyBindingForAction } from '../keyboard/keyBindings';
import actions from '../../../mappings/actions.json';
import type { KeyboardLayout } from '@shared/types';

interface ActionsListModalProps {
  keyboardLayout: KeyboardLayout;
  onClose: () => void;
}

export function ActionsListModal({ keyboardLayout, onClose }: ActionsListModalProps) {
  const formatActionName = (action: string): string => {
    return action
      .replace(/_/g, ' ')
      .replace(/\b\w/g, c => c.toUpperCase());
  };

  const renderCategory = (categoryName: string, categoryData: { description: string; actions: string[] }) => {
    const actionItems = categoryData.actions.map(action => {
      const keyBinding = getKeyBindingForAction(action, keyboardLayout);
      return (
        <div key={action} className="action-row">
          <span className="action-name">{formatActionName(action)}</span>
          <span className="action-key">{keyBinding || 'Not bound'}</span>
        </div>
      );
    });

    return (
      <div key={categoryName} className="actions-category">
        <div className="category-title">{categoryName.charAt(0).toUpperCase() + categoryName.slice(1)}</div>
        <div className="category-description">{categoryData.description}</div>
        <div className="category-actions">{actionItems}</div>
      </div>
    );
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal actions-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-title">Keyboard Actions</div>
        <div className="actions-list">
          {Object.entries(actions.categories).map(([name, data]) => renderCategory(name, data as { description: string; actions: string[] }))}
        </div>
        <button className="modal-close" onClick={onClose}>Close</button>
      </div>
    </div>
  );
}
