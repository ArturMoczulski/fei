import React, { useState } from 'react';
import { getKeyBindingForAction } from '../keyboard/keyBindings';
import type { KeyboardLayout } from '@shared/types';

interface KeyBindingTooltipProps {
  actions: string[];
  keyboardLayout: KeyboardLayout;
  children: React.ReactNode;
  className?: string;
}

export function KeyBindingTooltip({ actions, keyboardLayout, children, className }: KeyBindingTooltipProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  const keyBindings = actions
    .map(action => {
      const key = getKeyBindingForAction(action, keyboardLayout);
      return key ? { action, key } : null;
    })
    .filter((binding): binding is { action: string; key: string } => binding !== null);

  if (keyBindings.length === 0) {
    return <>{children}</>;
  }

  const handleMouseEnter = () => {
    setShowTooltip(true);
  };

  const handleMouseLeave = () => {
    setShowTooltip(false);
  };

  const formatActionName = (action: string): string => {
    return action
      .replace(/_/g, ' ')
      .replace(/\b\w/g, c => c.toUpperCase());
  };

  return (
    <div
      className={className}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{ position: 'relative', display: 'inline-flex' }}
    >
      {children}
      {showTooltip && (
        <div className="key-binding-tooltip">
          {keyBindings.map(({ action, key }) => (
            <div key={action} className="key-binding-row">
              <span className="key-binding-action">{formatActionName(action)}:</span>
              <span className="key-binding-key">{key}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
