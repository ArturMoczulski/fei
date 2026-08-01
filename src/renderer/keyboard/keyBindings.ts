import type { KeyboardLayout, KeyMapping } from '@shared/types';
import { getLayout } from './layouts';

export function getKeyBindingForAction(action: string, layout: KeyboardLayout): string | null {
  const mappings = getLayout(layout);
  const mapping = mappings.find((m: KeyMapping) => m.action === action);
  return mapping ? mapping.key.toUpperCase() : null;
}

export function getActionForKey(key: string, layout: KeyboardLayout): string | null {
  const mappings = getLayout(layout);
  const normalizedKey = key.toLowerCase();
  const mapping = mappings.find((m: KeyMapping) => m.key.toLowerCase() === normalizedKey);
  return mapping ? mapping.action : null;
}
