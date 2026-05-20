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
    'editor.background': '#1f2128',
    'editor.foreground': '#e6e6e8',
  },
  tokenColors: [
    // Default
    { settings: { foreground: '#e6e6e8' } },
    // Comments
    {
      scope: ['comment', 'punctuation.definition.comment'],
      settings: { foreground: '#8a8d97', fontStyle: 'italic' },
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
      settings: { foreground: '#c9b3ff', fontStyle: 'bold' },
    },
    // Strings
    {
      scope: ['string', 'string.quoted', 'string.template'],
      settings: { foreground: '#b5d7a8' },
    },
    // String interpolation / template expressions
    {
      scope: ['punctuation.definition.template-expression', 'string.template variable'],
      settings: { foreground: '#94dfd7' },
    },
    // Numbers, booleans, null/undefined
    {
      scope: ['constant.numeric', 'constant.language.boolean', 'constant.language.null', 'constant.language.undefined'],
      settings: { foreground: '#ffcf99' },
    },
    // Functions
    {
      scope: ['entity.name.function', 'meta.function-call entity.name.function', 'support.function'],
      settings: { foreground: '#ffd297' },
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
      settings: { foreground: '#88d4f5' },
    },
    // Parameters
    {
      scope: ['variable.parameter'],
      settings: { foreground: '#e6e6e8' },
    },
    // Properties
    {
      scope: ['variable.object.property', 'support.type.property-name', 'entity.name.tag.css'],
      settings: { foreground: '#94dfd7' },
    },
    // Imports / namespaces
    {
      scope: ['entity.name.namespace', 'meta.import variable'],
      settings: { foreground: '#b9bbff' },
    },
    // Operators, punctuation
    {
      scope: ['keyword.operator', 'punctuation.accessor'],
      settings: { foreground: '#8a8d97' },
    },
    // CSS: selectors / tag names
    {
      scope: ['entity.name.tag', 'entity.other.attribute-name'],
      settings: { foreground: '#c9b3ff' },
    },
    // CSS: attribute values / HTML attributes
    {
      scope: ['entity.other.attribute-name.html'],
      settings: { foreground: '#88d4f5' },
    },
    // Decorators
    {
      scope: ['meta.decorator punctuation.decorator', 'meta.decorator entity.name.function'],
      settings: { foreground: '#ffcf99' },
    },
    // Regex
    {
      scope: ['string.regexp', 'constant.other.character-class.regexp'],
      settings: { foreground: '#94dfd7' },
    },
  ],
}
