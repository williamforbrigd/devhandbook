import { defineField, defineType } from 'sanity'

export const domain = defineType({
	name: 'hb.domain',
	title: 'Domain',
	type: 'document',
	fields: [
		defineField({
			name: 'title',
			title: 'Title',
			type: 'string',
			validation: (Rule) => Rule.required(),
		}),
		defineField({
			name: 'slug',
			title: 'Slug',
			type: 'slug',
			options: { source: 'title' },
			validation: (Rule) => Rule.required(),
		}),
		defineField({
			name: 'description',
			title: 'Description',
			type: 'text',
			rows: 3,
		}),
		defineField({
			name: 'icon',
			title: 'Icon',
			type: 'string',
			description: 'Lucide icon name for future web presentation',
		}),
		defineField({
			name: 'color',
			title: 'Color',
			type: 'string',
			description: 'Hex color for visual marking (e.g. "#3B82F6")',
		}),
	],
	preview: {
		select: {
			title: 'title',
			subtitle: 'description',
		},
	},
})
