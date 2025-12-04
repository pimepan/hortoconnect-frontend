import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Resolve current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
  colors: {
    "primary": { hex: "#004e98", rgb: "236,38,169" },
    "primary-1": { hex: "#3a6ea5", rgb: "253,184,230" },
    "secondary": { hex: "#8d99ae", rgb: "79,61,83" },
    "secondary-1": { hex: "#dad7cd", rgb: "74,59,77" },
    "info": { hex: "#26E0EC", rgb: "38,224,236" },
    "info-1": { hex: "#BEF5F9", rgb: "190,245,249" },
    "warning": { hex: "#fec601", rgb: "236,228,38" },
    "warning-1": { hex: "#ea7317", rgb: "250,249,208" },
    "success": { hex: "#3bceac", rgb: "38,236,177" },
    "success-1": { hex: "#0ead69", rgb: "184,250,230" },
    "danger": { hex: "#ee4266", rgb: "236,38,38" },
    "danger-1": { hex: "#ff99ac", rgb: "253,184,184" },
    "white": { hex: "#FFFFFF", rgb: "255,255,255" },
    "light": { hex: "#F4F4F4", rgb: "244,244,244" },
    "light-1": { hex: "#CFCFCF", rgb: "207,207,207" },
    "light-2": { hex: "#BBBBBB", rgb: "187,187,187" },
    "dark": { hex: "#1E1E1E", rgb: "30,30,30" },
    "dark-1": { hex: "#221B23", rgb: "34,27,35" },
    "dark-2": { hex: "#322834", rgb: "50,40,52" },
    "dark-3": { hex: "#180E1A", rgb: "24,14,26" }
  },
  styles: [
    { selector: ".pointer", style: "cursor:pointer" },
    { selector: ".text-#color", style: "color:#color !important" },
    { selector: ".bg-#color", style: "background-color:#color !important" },
    { selector: ".border-#color", style: "border-color:#color !important" },
    { selector: ".btn-#color", style: "background-color:#color !important" },
    { 
      selector: ".btn-#color:focus", 
      style: "background-color:#color !important; box-shadow: 0 6px 22px rgba(#color-rgb, 0.45) !important;" 
    },
    { selector: ".btn", style: "border-radius:12px !important; border:none !important; height:3rem" },
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
  
  const sheet = rules.join('');

  // Write CSS file to the same directory
  const outputPath = path.join(__dirname, 'theme.css');
  fs.writeFileSync(outputPath, sheet);
  console.log(`✅ Theme CSS generated at: ${outputPath}`);
}

// Run immediately when executed
generateTheme();
