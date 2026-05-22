export const TARGET_MODELS = [
  { value: 'claude', label: 'Claude' },
  { value: 'gpt-4', label: 'GPT-4' },
  { value: 'gemini', label: 'Gemini' },
  { value: 'model-agnostic', label: 'Model-agnostic' },
] as const;

export const TESTED_MODELS = [
  { value: 'claude', label: 'Claude' },
  { value: 'gpt-4', label: 'GPT-4' },
  { value: 'gemini', label: 'Gemini' },
  { value: 'other', label: 'Other' },
] as const