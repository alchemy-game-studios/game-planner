export default {
    safelist: [
      // Lens colors for dynamic connection UI
      'text-ck-ember', 'bg-ck-ember/20', 'border-ck-ember/30',
      'text-ck-teal', 'bg-ck-teal/20', 'border-ck-teal/30',
      'text-ck-rare', 'bg-ck-rare/20', 'border-ck-rare/30',
      'text-ck-gold', 'bg-ck-gold/20', 'border-ck-gold/30',
    ],
    theme: {
      extend: {
        fontFamily: {
          sans: ['Inter', 'sans-serif'],
          heading: ['Cinzel', 'serif'],
          book: ['"Cormorant Garamond"', 'serif'],
        },
        colors: {
          ck: {
            ember: '#F28C28',
            gold: '#FFB703',
            forge: '#D97706',
            indigo: '#1B1F2A',
            charcoal: '#14161D',
            obsidian: '#0B0D12',
            teal: '#3AB7A8',
            ash: '#E6E6E6',
            stone: '#9CA3AF',
            danger: '#C2410C',
            rare: '#7C3AED',
          },
        },
      },
    },
  };