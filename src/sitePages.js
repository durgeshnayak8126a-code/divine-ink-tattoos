export const mainPages = [
  {
    slug: 'about',
    label: 'About',
    view: 'about',
    metaTitle: 'About Divine Ink Tattoos | Tattoo Studio in Gurugram',
    description: 'Learn about Divine Ink Tattoos & Piercing Studio in Sector 31, Gurugram, including the studio approach, hygiene-focused preparation and custom consultation process.',
  },
  {
    slug: 'services',
    label: 'Services',
    view: 'services',
    metaTitle: 'Tattoo & Piercing Services in Gurugram | Divine Ink Tattoos',
    description: 'Explore tattoo and piercing services at Divine Ink in Sector 31, Gurugram, including custom tattoos, cover-ups, portraits, minimal tattoos and professional piercing.',
  },
  {
    slug: 'artists',
    label: 'Artists',
    view: 'artists',
    metaTitle: 'Tattoo Artists in Gurugram | Divine Ink Tattoos',
    description: 'Meet the tattoo artists at Divine Ink Tattoos & Piercing Studio in Sector 31, Gurugram and explore portfolio work by artist.',
  },
  {
    slug: 'gallery',
    label: 'Gallery',
    view: 'gallery',
    metaTitle: 'Tattoo Gallery & Portfolio | Divine Ink Tattoos Gurugram',
    description: 'Browse the Divine Ink tattoo portfolio featuring portrait, realism, religious, minimal, floral, geometric and colour tattoo work.',
  },
  {
    slug: 'piercing',
    label: 'Piercing',
    view: 'piercing',
    metaTitle: 'Professional Piercing in Gurugram | Divine Ink Tattoos',
    description: 'Explore professional piercing services at Divine Ink in Sector 31, Gurugram, including lobe, helix, septum, nose, belly, eyebrow, lip and tongue piercing.',
  },
  {
    slug: 'reviews',
    label: 'Reviews',
    view: 'reviews',
    metaTitle: 'Google Reviews | Divine Ink Tattoos Gurugram',
    description: 'Read live Google reviews for Divine Ink Tattoos & Piercing Studio in Sector 31, Gurugram.',
  },
  {
    slug: 'faq',
    label: 'FAQ',
    view: 'faq',
    metaTitle: 'Tattoo & Piercing FAQs | Divine Ink Tattoos Gurugram',
    description: 'Read common tattoo and piercing questions about pricing, custom designs, cover-ups, appointments, hygiene and aftercare at Divine Ink in Gurugram.',
  },
  {
    slug: 'contact',
    label: 'Contact',
    view: 'contact',
    metaTitle: 'Contact Divine Ink Tattoos | Sector 31 Gurugram',
    description: 'Contact Divine Ink Tattoos & Piercing Studio in Sector 31, Gurugram for tattoo or piercing enquiries, appointments, directions and consultation.',
  },
];

export const mainPageMap = new Map(mainPages.map((page) => [page.slug, page]));
