export const CMS_MODULES = Object.freeze({
  services: {
    title: 'Services',
    intro: 'Manage service copy, FAQs, pricing and metadata without changing service routes.',
    collection: 'services',
    fields: [
      { name: 'slug', label: 'Slug', required: true },
      { name: 'title', label: 'Service title', required: true },
      { name: 'description', label: 'Description', type: 'textarea', required: true },
      { name: 'faqs', label: 'FAQs (JSON array)', type: 'json', defaultValue: [] },
      { name: 'pricing', label: 'Pricing', required: true },
      { name: 'metaTitle', label: 'SEO meta title', required: true, maxLength: 70 },
      { name: 'metaDescription', label: 'SEO meta description', type: 'textarea', required: true, maxLength: 170 },
      { name: 'active', label: 'Active', type: 'checkbox', defaultValue: true },
    ],
  },
  reviews: {
    title: 'Reviews',
    intro: 'Add, edit, feature or remove manually managed reviews.',
    collection: 'reviews',
    fields: [
      { name: 'author', label: 'Reviewer name', required: true },
      { name: 'text', label: 'Review', type: 'textarea', required: true },
      { name: 'rating', label: 'Rating', type: 'number', required: true, min: 1, max: 5, defaultValue: 5 },
      { name: 'source', label: 'Source', defaultValue: 'Google' },
      { name: 'featured', label: 'Featured', type: 'checkbox', defaultValue: false },
      { name: 'published', label: 'Published', type: 'checkbox', defaultValue: true },
    ],
  },
  faqs: {
    title: 'FAQs',
    intro: 'Create and manage frequently asked questions.',
    collection: 'faqs',
    fields: [
      { name: 'question', label: 'Question', required: true },
      { name: 'answer', label: 'Answer', type: 'textarea', required: true },
      { name: 'order', label: 'Display order', type: 'number', min: 0, defaultValue: 0 },
      { name: 'published', label: 'Published', type: 'checkbox', defaultValue: true },
    ],
  },
  offers: {
    title: 'Offers',
    intro: 'Schedule website offers and control whether they are active.',
    collection: 'offers',
    fields: [
      { name: 'title', label: 'Offer title', required: true },
      { name: 'description', label: 'Description', type: 'textarea', required: true },
      { name: 'ctaText', label: 'CTA text', defaultValue: 'Book Now' },
      { name: 'startDate', label: 'Start date', type: 'date', required: true },
      { name: 'endDate', label: 'End date', type: 'date', required: true },
      { name: 'active', label: 'Active', type: 'checkbox', defaultValue: true },
    ],
  },
});

export const SETTINGS_MODULES = Object.freeze({
  homepage: {
    title: 'Homepage settings',
    intro: 'Manage homepage text and the two About section image references while preserving the existing layout.',
    documentId: 'homepage',
    fields: [
      { name: 'bannerText', label: 'Banner text', required: true },
      { name: 'ctaText', label: 'Primary CTA text', required: true },
      { name: 'featuredImages', label: 'About image URLs (JSON array: main image first, small image second)', type: 'json', defaultValue: [] },
      { name: 'offersHeading', label: 'Offers heading' },
      { name: 'offersText', label: 'Offers text', type: 'textarea' },
    ],
  },
  contact: {
    title: 'Contact settings',
    intro: 'Change only the contact fields you need. Any field left empty keeps the current built-in website value.',
    documentId: 'contact',
    fields: [
      { name: 'phone', label: 'Phone' },
      { name: 'whatsapp', label: 'WhatsApp' },
      { name: 'address', label: 'Address', type: 'textarea' },
      { name: 'instagram', label: 'Instagram URL', type: 'url' },
      { name: 'facebook', label: 'Facebook URL', type: 'url' },
      { name: 'openingHours', label: 'Opening hours' },
      { name: 'googleMapsUrl', label: 'Google Maps URL', type: 'url' },
    ],
  },
  seo: {
    title: 'SEO settings',
    intro: 'Store validated site-level SEO configuration for controlled publishing.',
    documentId: 'seo',
    fields: [
      { name: 'metaTitle', label: 'Meta title', required: true, maxLength: 70 },
      { name: 'metaDescription', label: 'Meta description', type: 'textarea', required: true, maxLength: 170 },
      { name: 'ogImage', label: 'Open Graph image URL', type: 'url', required: true },
      { name: 'canonical', label: 'Canonical URL', type: 'url', required: true },
      { name: 'robots', label: 'Robots directive', required: true },
      { name: 'schema', label: 'Schema settings (JSON)', type: 'json', defaultValue: {} },
    ],
  },
});
