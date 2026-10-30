export const WHATSAPP_NUMBER = '923702996795';
export const SECOND_WHATSAPP_NUMBER = '923222123145';

export const WHATSAPP_CONTACTS = [
  { number: WHATSAPP_NUMBER },
  { number: SECOND_WHATSAPP_NUMBER },
] as const;

export const STORE_URL = 'https://aabroo-modern-modest-wear.vercel.app';

export const STORE_CONFIG = {
  brandName: 'Aabroo',
  tagline: 'Grace in Every Layer.',
  about:
    'Our goal is to make elegant and modest abaya styles easy to explore. Discover your preferred design, choose a color and contact us directly on WhatsApp for details and availability.',
  faq: [
    {
      question: 'What is the price of an abaya?',
      answer:
        'Prices are being updated. Please ask us on WhatsApp for the current price of a design.',
    },
    {
      question: 'Which colors are available?',
      answer:
        'Color options are shown with each design. Please message us to confirm current color availability.',
    },
    {
      question: 'How can I check available sizes?',
      answer:
        'Size availability varies by design. Contact us on WhatsApp to confirm the sizes for your selected abaya.',
    },
    {
      question: 'How do I ask about a product?',
      answer:
        'Choose a design and color, then use its WhatsApp button. You can review and send the prepared message yourself.',
    },
    {
      question: 'What are the delivery charges and delivery time?',
      answer: 'Please contact us on WhatsApp to confirm delivery details for your location.',
    },
    {
      question: 'What is the exchange policy?',
      answer: 'Please contact us directly on WhatsApp to ask about the current exchange policy.',
    },
  ],
} as const;
