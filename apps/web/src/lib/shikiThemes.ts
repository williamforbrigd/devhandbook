import type { ThemeRegistration } from 'shiki'

/**
 * Custom Shiki themes that harmonise with the handbook design system palette.
 *
 * Light  — based on :root CSS variables
 * Dark   — based on .dark CSS variables
 *
 * Key colours:
 *   text       #111827 / #f1f5f9
 *   muted      #6b7280 / #94a3b8
 *   link/key   #1d4ed8 / #60a5fa
 *   string     #065f46 / #34d399
 *   fn/type    #7c3aed / #a78bfa
 *   number     #b45309 / #fbbf24
 *   special    #0e7490 / #22d3ee
 */

export const handbookLight: ThemeRegistration = {
  name: 'handbook-light',
  type: 'light',
  colors: {
    'editor.background': '#f9fafb',
    'editor.foreground': '#111827',
  },
  tokenColors: [
    // Default
    { settings: { foreground: '#111827' } },
    // Comments
    {
      scope: ['comment', 'punctuation.definition.comment'],
      settings: { foreground: '#9ca3af', fontStyle: 'italic' },
    },
    // Keywords, control flow
    {
      scope: [
        'keyword',
        'keyword.control',
        'keyword.operator.new',
        'keyword.other',
        'storage.type',
        'storage.modifier',
        'variable.language.this',
        'variable.language.super',
      ],
      settings: { foreground: '#1d4ed8', fontStyle: 'bold' },
    },
    // Strings
    {
      scope: ['string', 'string.quoted', 'string.template'],
      settings: { foreground: '#065f46' },
    },
    // String interpolation
    {
      scope: ['punctuation.definition.template-expression', 'string.template variable'],
      settings: { foreground: '#0f766e' },
    },
    // Numbers, booleans
    {
      scope: ['constant.numeric', 'constant.language.boolean', 'constant.language.null', 'constant.language.undefined'],
      settings: { foreground: '#b45309' },
    },
    // Functions
    {
      scope: ['entity.name.function', 'meta.function-call entity.name.function', 'support.function'],
      settings: { foreground: '#7c3aed' },
    },
    // Types, classes
    {
      scope: [
        'entity.name.type',
        'entity.name.class',
        'entity.other.inherited-class',
        'support.type',
        'support.class',
      ],
      settings: { foreground: '#0e7490' },
    },
    // Parameters
    {
      scope: ['variable.parameter'],
      settings: { foreground: '#374151' },
    },
    // Properties
    {
      scope: ['variable.object.property', 'support.type.property-name', 'entity.name.tag.css'],
      settings: { foreground: '#0f766e' },
    },
    // Imports / namespaces
    {
      scope: ['entity.name.namespace', 'meta.import variable'],
      settings: { foreground: '#1d4ed8' },
    },
    // Operators, punctuation
    {
      scope: ['keyword.operator', 'punctuation.accessor'],
      settings: { foreground: '#374151' },
    },
    // CSS: selectors
    {
      scope: ['entity.name.tag', 'entity.other.attribute-name'],
      settings: { foreground: '#7c3aed' },
    },
    // Decorators
    {
      scope: ['meta.decorator punctuation.decorator', 'meta.decorator entity.name.function'],
      settings: { foreground: '#b45309' },
    },
    // Regex
    {
      scope: ['string.regexp', 'constant.other.character-class.regexp'],
      settings: { foreground: '#0e7490' },
    },
  ],
}

export const handbookDark: ThemeRegistration = {
  name: 'handbook-dark',
  type: 'dark',
  colors: {
    'editor.background': '#161b27',
    'editor.foreground': '#f1f5f9',
  },
  tokenColors: [
    // Default
    { settings: { foreground: '#f1f5f9' } },
    // Comments
    {
      scope: ['comment', 'punctuation.definition.comment'],
      settings: { foreground: '#94a3b8', fontStyle: 'italic' },
    },
    // Keywords
    {
      scope: [
        'keyword',
        'keyword.control',
        'keyword.operator.new',
        'keyword.other',
        'storage.type',
        'storage.modifier',
        'variable.language.this',
        'variable.language.super',
      ],
      settings: { foreground: '#60a5fa', fontStyle: 'bold' },
    },
    // Strings
    {
      scope: ['string', 'string.quoted', 'string.template'],
      settings: { foreground: '#34d399' },
    },
    // String interpolation
    {
      scope: ['punctuation.definition.template-expression', 'string.template variable'],
      settings: { foreground: '#2dd4bf' },
    },
    // Numbers, booleans
    {
      scope: ['constant.numeric', 'constant.language.boolean', 'constant.language.null', 'constant.language.undefined'],
      settings: { foreground: '#fbbf24' },
    },
    // Functions
    {
      scope: ['entity.name.function', 'meta.function-call entity.name.function', 'support.function'],
      settings: { foreground: '#a78bfa' },
    },
    // Types, classes
    {
      scope: [
        'entity.name.type',
        'entity.name.class',
        'entity.other.inherited-class',
        'support.type',
        'support.class',
      ],
      settings: { foreground: '#22d3ee' },
    },
    // Parameters
    {
      scope: ['variable.parameter'],
      settings: { foreground: '#e2e8f0' },
    },
    // Properties
    {
      scope: ['variable.object.property', 'support.type.property-name', 'entity.name.tag.css'],
      settings: { foreground: '#2dd4bf' },
    },
    // Imports / namespaces
    {
      scope: ['entity.name.namespace', 'meta.import variable'],
      settings: { foreground: '#60a5fa' },
    },
    // Operators, punctuation
    {
      scope: ['keyword.operator', 'punctuation.accessor'],
      settings: { foreground: '#cbd5e1' },
    },
    // CSS: selectors
    {
      scope: ['entity.name.tag', 'entity.other.attribute-name'],
      settings: { foreground: '#a78bfa' },
    },
    // Decorators
    {
      scope: ['meta.decorator punctuation.decorator', 'meta.decorator entity.name.function'],
      settings: { foreground: '#fbbf24' },
    },
    // Regex
    {
      scope: ['string.regexp', 'constant.other.character-class.regexp'],
      settings: { foreground: '#22d3ee' },
    },
  ],
}
