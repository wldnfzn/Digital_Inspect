/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "primary": "#2563eb",
        "on-primary": "#ffffff",
        "primary-container": "#dbeafe",
        "on-primary-container": "#1e3a8a",
        "primary-fixed": "#dbeafe",
        "on-primary-fixed": "#1e3a8a",
        "primary-fixed-dim": "#bfdbfe",
        "on-primary-fixed-variant": "#1d4ed8",
        
        "surface": "#ffffff",
        "on-surface": "#0f172a",
        "surface-bright": "#ffffff",
        "surface-dim": "#f8fafc",
        "surface-variant": "#f1f5f9",
        "on-surface-variant": "#475569",
        "surface-container-lowest": "#ffffff",
        "surface-container-low": "#f8fafc",
        "surface-container": "#f1f5f9",
        "surface-container-high": "#e2e8f0",
        "surface-container-highest": "#cbd5e1",
        
        "background": "#f8fafc",
        "on-background": "#0f172a",
        
        "outline": "#94a3b8",
        "outline-variant": "#cbd5e1",
        
        "error": "#dc2626",
        "on-error": "#ffffff",
        "error-container": "#fef2f2",
        "on-error-container": "#991b1b",
        
        "warning": "#f59e0b",
        "on-warning": "#ffffff",
        "warning-container": "#fffbeb",
        "on-warning-container": "#92400e",
        
        "success": "#16a34a",
        "on-success": "#ffffff",
        "success-container": "#f0fdf4",
        "on-success-container": "#166534",
        
        "healthy": "#16a34a",
        "attention": "#f59e0b",
        "critical": "#dc2626",
      },
      borderRadius: {
        DEFAULT: "0.375rem",
        md: "0.5rem",
        lg: "0.75rem",
        xl: "1rem",
        "2xl": "1.25rem",
        full: "9999px"
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        'dropdown': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        'modal': '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
      },
      spacing: {
        "margin-desktop": "32px",
        gutter: "16px",
        "margin-mobile": "16px",
        base: "4px"
      },
      fontFamily: {
        caption: ["Inter", "sans-serif"],
        "body-sm": ["Inter", "sans-serif"],
        "body-md": ["Inter", "sans-serif"],
        "headline-sm": ["Inter", "sans-serif"],
        "headline-md": ["Inter", "sans-serif"],
        "headline-lg": ["Inter", "sans-serif"],
        "headline-xl": ["Inter", "sans-serif"],
        "label-sm": ["Inter", "sans-serif"],
        "label-md": ["Inter", "sans-serif"],
        "asset-id": ["JetBrains Mono", "monospace"]
      },
      fontSize: {
        caption: ["13px", { lineHeight: "18px", fontWeight: "400" }],
        "body-sm": ["14px", { lineHeight: "20px", fontWeight: "400" }],
        "body-md": ["15px", { lineHeight: "22px", fontWeight: "400" }],
        "headline-sm": ["16px", { lineHeight: "24px", fontWeight: "600" }],
        "headline-md": ["18px", { lineHeight: "26px", fontWeight: "600" }],
        "headline-lg": ["22px", { lineHeight: "30px", fontWeight: "600" }],
        "headline-xl": ["28px", { lineHeight: "36px", fontWeight: "700" }],
        "label-sm": ["12px", { lineHeight: "16px", fontWeight: "600" }],
        "label-md": ["13px", { lineHeight: "18px", fontWeight: "500" }],
        "asset-id": ["13px", { lineHeight: "16px", letterSpacing: "-0.02em", fontWeight: "500" }]
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/container-queries')
  ],
};
