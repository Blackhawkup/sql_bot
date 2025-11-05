/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        // Legacy colors (keep for compatibility)
        chatbg: "#fffcf2",
        accent: "#eb5e28",
        
        // Custom Brand Colors (Orange/Red Highlight)
        brand: {
          50: '#fef5f1',
          100: '#fde8df',
          200: '#fbd1bf',
          300: '#f9ba9f',
          400: '#f7a37f',
          500: '#eb5e28',
          600: '#d44b1a',
          700: '#bd3a0f',
          800: '#a62908',
          900: '#8f1a03'
        },
        
        // Navy/Blue Colors (Now darker grays/browns)
        navy: {
          50: '#f9f8f6',
          100: '#f3f1ed',
          200: '#e7e3db',
          300: '#dbd5c9',
          400: '#ccc5b9',
          500: '#b8b0a3',
          600: '#9a9188',
          700: '#726b61',
          800: '#403d39',
          900: '#fffcf2'
        },
        
        // Secondary Gray (Brown tones)
        secondaryGray: {
          100: '#fffcf2',
          200: '#f5f2ea',
          300: '#e8e4db',
          400: '#ccc5b9',
          500: '#b0a89b',
          600: '#948c7f',
          700: '#787063',
          800: '#403d39',
          900: '#252422'
        }
      },
      
      fontFamily: {
        sans: ['Poppins', 'system-ui', 'sans-serif']
      },
      
      boxShadow: {
        'card': '14px 17px 40px 4px rgba(112, 144, 176, 0.08)',
        'button': '45px 76px 113px 7px rgba(112, 144, 176, 0.08)',
        'hover': '0px 21px 27px -10px rgba(96, 60, 255, 0.48)',
        'teal': '0px 21px 27px -10px rgba(67, 200, 192, 0.47)'
      },
      
      borderRadius: {
        'card': '14px',
        'button': '16px',
        'input': '12px',
        'pill': '45px'
      },
      
      backgroundImage: {
        'gradient-brand': 'linear-gradient(15.46deg, #eb5e28 26.3%, #f07e52 86.4%)',
        'gradient-teal': 'linear-gradient(15.46deg, #ccc5b9 0%, #403d39 100%)',
        'gradient-purple': 'linear-gradient(135deg, #eb5e28 0%, #d44b1a 100%)'
      }
    }
  },
  plugins: []
};



