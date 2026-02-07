import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Resolve current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const hexToRgb = (hex) => {
  if (!hex) return "0,0,0";
  const raw = hex.toString().trim().replace("#", "");
  const full = raw.length === 3 ? raw.split("").map((c) => c + c).join("") : raw;
  const int = parseInt(full, 16);
  const r = (int >> 16) & 255;
  const g = (int >> 8) & 255;
  const b = int & 255;
  return `${r},${g},${b}`;
};

const buildColors = (palette) =>
  Object.fromEntries(
    Object.entries(palette).map(([name, hex]) => [name, { hex, rgb: hexToRgb(hex) }])
  );

const walkStyle = (style, colors = {}, breakPoints = {}) => {
  let rules = [];
  
  const processRule = (styleRule) => {
    let processedRule = [];

    if (styleRule.includes("#color")) {
      for (const [colorName, colorProps] of Object.entries(colors)) {
        let t = 0;
        let result = styleRule
          .replace(/#color-rgb/g, colorProps?.rgb)
          .replace(/#color/g, () => ++t === 1 ? colorName : colorProps?.hex);
        processedRule.push(result);
      }
    } else if (styleRule.includes("#responsive")) {
      const result = styleRule.replace("#responsive-", "");
      processedRule.push(result);

      for (const [breakpoint, val] of Object.entries(breakPoints)) {
        let t = 0;
        const responsiveResult = styleRule.replace(/#responsive/g, () => 
          ++t === 1 ? breakpoint : val
        );
        processedRule.push(`@media only screen and (min-width: ${val}px){${responsiveResult}}`);
      }
    } else {
      processedRule.push(styleRule);
    }

    return processedRule;
  };

  const styles = typeof style === "function" ? style() : [style];
  
  styles.forEach((styleObj) => {
    const styleRule = `${styleObj.selector}{${styleObj.style}}`;
    rules.push(...processRule(styleRule));
  });

  return rules;
};

const generateSpacingUtils = (property, prefix) => {
  return () => Array.from({ length: 99 }, (_, i) => ({
    selector: `.${prefix}-#responsive-${i + 1}`,
    style: `${property}: ${i * 0.5}rem !important`
  }));
};

const generateAxisSpacingUtils = (properties, prefix) => {
  return () => Array.from({ length: 99 }, (_, i) => ({
    selector: `.${prefix}-#responsive-${i + 1}`,
    style: properties.map(prop => `${prop}: ${i * 0.5}rem !important`).join('; ')
  }));
};

const generatePercentageUtils = (property, prefix) => {
  return () => Array.from({ length: 99 }, (_, i) => ({
    selector: `.${prefix}-#responsive-${i + 1}`,
    style: `${property}: ${i}% !important`
  }));
};

function generateTheme(theme = {
  breakpoints: {
    sm: 576, md: 768, lg: 992, xl: 1200, xxl: 1400
  },
  // Modern landscaping palette: olive greens + earth + sun.
  colors: buildColors({
    "primary": "#6B8E23",      // olive green
    "primary-1": "#9ACD32",    // yellow-green (light olive)
    "secondary": "#78716C",    // modern earth brown
    "secondary-1": "#E7E5E4",  // light sand
    "accent": "#556B2F",       // dark olive green
    "accent-1": "#C4D4A0",     // pale olive
    "info": "#3B82F6",         // modern blue
    "info-1": "#DBEAFE",       // light blue
    "warning": "#F59E0B",      // modern amber
    "warning-1": "#FDE68A",    // light amber
    "success": "#556B2F",
    "success-1": "#C4D4A0",
    "danger": "#EF4444",
    "danger-1": "#FEE2E2",
    "white": "#FFFFFF",
    "light": "#F5F5DC",        // beige/light olive
    "light-1": "#E8F5E9",      // soft mint green
    "light-2": "#C4D4A0",      // light olive
    "dark": "#0F172A",         // modern dark
    "dark-1": "#1E293B",
    "dark-2": "#334155",
    "dark-3": "#0A0E1A"
  }),
  styles: [
    // Base app styling
    {
      selector: "html",
      style: "background-color: var(--light) !important;"
    },
    {
      selector: "body",
      style:
        "background: radial-gradient(1100px circle at 10% 10%, rgba(var(--primary-rgb), 0.08), transparent 55%), radial-gradient(900px circle at 90% 0%, rgba(var(--accent-rgb), 0.06), transparent 55%), var(--light) !important; color: var(--dark) !important;"
    },
    { selector: "a", style: "color: var(--primary) !important;" },
    { selector: "a:hover", style: "color: var(--accent) !important;" },
    { selector: "small, .text_small", style: "color: inherit !important;" },

    // Navbar + surfaces
    {
      selector: ".navbar",
      style:
        "background-color: rgba(var(--white-rgb), 0.75) !important; backdrop-filter: blur(14px); border-bottom: 1px solid rgba(var(--primary-rgb), 0.18) !important;"
    },
    { selector: ".navbar-brand", style: "color: var(--dark) !important; font-weight: 800;" },
    { selector: ".navbar .nav-link", style: "color: var(--dark) !important; font-weight: 600;" },
    { selector: ".navbar .nav-link:hover", style: "color: var(--primary) !important;" },
    {
      selector: ".navbar .nav-link.router-link-active, .navbar .nav-link.router-link-exact-active",
      style: "color: var(--primary) !important;"
    },
    {
      selector: ".dropdown-menu",
      style:
        "border-radius: 14px !important; border: 1px solid rgba(var(--primary-rgb), 0.14) !important; box-shadow: 0 18px 50px rgba(var(--dark-rgb), 0.12) !important;"
    },
    {
      selector: ".card-header",
      style:
        "background-color: rgba(var(--primary-rgb), 0.08) !important; border-bottom: 1px solid rgba(var(--primary-rgb), 0.12) !important;"
    },
    {
      selector: ".table thead th",
      style: "background-color: rgba(var(--primary-rgb), 0.06) !important; color: var(--dark) !important;"
    },

    { selector: ".pointer", style: "cursor:pointer" },
    { selector: ".text-#color", style: "color:#color !important" },
    { selector: ".bg-#color", style: "background-color:#color !important" },
    { selector: ".border-#color", style: "border-color:#color !important" },
    { selector: ".btn-#color", style: "background-color:#color !important" },
    { 
      selector: ".btn-#color:focus", 
      style: "background-color:#color !important; box-shadow: 0 6px 22px rgba(#color-rgb, 0.45) !important;" 
    },
    { selector: ".btn", style: "border-radius:12px !important; border:1px solid transparent !important; height:3rem" },
    { selector: ".text-hover-#color:hover", style: "color:#color !important;" },
    { selector: ".text-active-#color:active", style: "color:#color !important;" },
    { selector: ".bg-hover-#color:hover", style: "background-color:#color !important;" },
    
    // Margins
    generateSpacingUtils("margin-bottom", "mb"),
    () => Array.from({ length: 99 }, (_, i) => ({
      selector: `.mb-#responsive-n${i + 1}`,
      style: `margin-bottom: -${i * 0.5}rem !important`
    })),
    generateSpacingUtils("margin-top", "mt"),
    generateSpacingUtils("margin-left", "ms"),
    generateSpacingUtils("margin-right", "me"),
    generateAxisSpacingUtils(["margin-right", "margin-left"], "mx"),
    
    // Paddings
    generateSpacingUtils("padding-bottom", "pb"),
    generateSpacingUtils("padding-top", "pt"),
    generateSpacingUtils("padding-left", "ps"),
    generateSpacingUtils("padding-right", "pe"),
    generateAxisSpacingUtils(["padding-right", "padding-left"], "px"),
    generateAxisSpacingUtils(["padding-top", "padding-bottom"], "py"),
    generateAxisSpacingUtils(["padding-top", "padding-bottom", "padding-left", "padding-right"], "p"),
    
    // Height & Width
    generatePercentageUtils("height", "h"),
    generatePercentageUtils("max-height", "mx-h"),
    generatePercentageUtils("width", "w"),
    generatePercentageUtils("max-width", "wx-h"),
    
    // Border utilities
    () => Array.from({ length: 25 }, (_, i) => ({
      selector: `.border-radius-${i + 1}`,
      style: `border-radius: ${i * 2}px !important`
    })),
    () => Array.from({ length: 10 }, (_, i) => ({
      selector: `.border-width-#responsive-${i + 1}`,
      style: `border-width: ${i}px !important`
    }))
  ]
}) {
  let rules = [];
  
  // Generate CSS custom properties for colors
  const rootColors = Object.entries(theme.colors).flatMap(([colorName, vals]) => [
    `--${colorName}:${vals?.hex};`,
    `--${colorName}-rgb:${vals?.rgb};`
  ]);
  
  rules.push(`:root{${rootColors.join('')}}`);
  
  // Process all styles
  theme.styles.forEach((style) => {
    rules.push(...walkStyle(style, theme.colors, theme.breakpoints));
  });
  
  const sheet = rules.join('\n');

  // Write CSS file to the same directory
  const outputPath = path.join(__dirname, 'src', 'assets', 'css', 'theme.css');
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, sheet);
  console.log(`✅ Theme CSS generated at: ${outputPath}`);
}

// Run immediately when executed
generateTheme();
