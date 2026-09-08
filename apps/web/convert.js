import fs from 'fs';

const cfg = {
  theme: {
    extend: {
      colors: {
        "on-primary-fixed-variant": "#173bab",
        "surface-variant": "#e3e1eb",
        "surface-tint": "#3755c3",
        "on-error-container": "#93000a",
        "on-tertiary-fixed-variant": "#3a4858",
        "surface-bright": "#fbf8ff",
        "error": "#ba1a1a",
        "surface-dim": "#dad9e3",
        "on-background": "#1a1b22",
        "on-primary-fixed": "#001453",
        "on-tertiary-container": "#adbccf",
        "primary-fixed": "#dde1ff",
        "inverse-primary": "#b8c4ff",
        "on-secondary-fixed-variant": "#2d486d",
        "on-surface-variant": "#444653",
        "on-secondary-fixed": "#001c3b",
        "tertiary-fixed-dim": "#b9c8db",
        "tertiary": "#273545",
        "outline": "#757684",
        "on-secondary-container": "#3e5980",
        "secondary-fixed-dim": "#adc8f5",
        "surface-container": "#eeedf7",
        "primary-container": "#1e40af",
        "secondary-fixed": "#d5e3ff",
        "on-surface": "#1a1b22",
        "tertiary-container": "#3e4c5c",
        "surface-container-lowest": "#ffffff",
        "on-secondary": "#ffffff",
        "inverse-surface": "#2f3037",
        "inverse-on-surface": "#f1f0fa",
        "surface-container-high": "#e8e7f1",
        "surface-container-highest": "#e3e1eb",
        "on-tertiary": "#ffffff",
        "secondary": "#455f87",
        "surface-container-low": "#f4f2fc",
        "outline-variant": "#c4c5d5",
        "error-container": "#ffdad6",
        "on-primary": "#ffffff",
        "primary": "#00288e",
        "surface": "#fbf8ff",
        "on-primary-container": "#a8b8ff",
        "on-tertiary-fixed": "#0e1d2b",
        "primary-fixed-dim": "#b8c4ff",
        "on-error": "#ffffff",
        "background": "#fbf8ff",
        "tertiary-fixed": "#d5e4f8",
        "secondary-container": "#b5d0fd"
      },
      borderRadius: {
        DEFAULT: "0.125rem",
        lg: "0.25rem",
        xl: "0.5rem",
        full: "0.75rem"
      },
      spacing: {
        lg: "24px",
        xl: "32px",
        "margin-desktop": "32px",
        gutter: "16px",
        sm: "8px",
        "margin-mobile": "16px",
        xs: "4px",
        md: "16px",
        base: "4px"
      },
      fontFamily: {
        caption: ["Inter", "sans-serif"],
        "body-md": ["Inter", "sans-serif"],
        "headline-xl": ["Inter", "sans-serif"],
        "label-sm": ["Inter", "sans-serif"],
        "headline-lg": ["Inter", "sans-serif"],
        "asset-id": ["JetBrains Mono", "monospace"]
      }
    }
  }
};

let css = `@import "tailwindcss";
@plugin "@tailwindcss/forms";
@plugin "@tailwindcss/container-queries";

@theme {
`;

for (const [k, v] of Object.entries(cfg.theme.extend.colors)) {
  css += `  --color-${k}: ${v};\n`;
}
for (const [k, v] of Object.entries(cfg.theme.extend.spacing)) {
  css += `  --spacing-${k}: ${v};\n`;
}
for (const [k, v] of Object.entries(cfg.theme.extend.borderRadius)) {
  css += `  --radius-${k === 'DEFAULT' ? 'base' : k}: ${v};\n`;
}
for (const [k, v] of Object.entries(cfg.theme.extend.fontFamily)) {
  css += `  --font-${k}: ${v.map(f => f.includes(' ') ? "'" + f + "'" : f).join(', ')};\n`;
}

css += `}

@layer base {
  .material-symbols-outlined {
    font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
  }
  .material-symbols-outlined.fill {
    font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24;
  }
}
`;

fs.writeFileSync('./src/index.css', css);
