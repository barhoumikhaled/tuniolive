// PostCSS and Tailwind setup for Next.js
const fs = require('fs');

// Create postcss.config.js if it doesn't exist
const postcssConfig = `module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}`;

if (!fs.existsSync('postcss.config.js')) {
  fs.writeFileSync('postcss.config.js', postcssConfig);
  console.log('Created postcss.config.js');
}