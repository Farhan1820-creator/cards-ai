import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    rules: {
      // Canvas/dataUrl ke saath next/image kaam nahi karta
      "@next/next/no-img-element": "warn",

      // Underscore prefix wale intentionally unused hain
      "@typescript-eslint/no-unused-vars": ["warn", {
        varsIgnorePattern: "^_",
        argsIgnorePattern: "^_",
        caughtErrorsIgnorePattern: "^_",
      }],

      // Unused expressions
      "@typescript-eslint/no-unused-expressions": "warn",

      // setState-in-effect: ye controlled-component sync ke liye valid pattern hai
      "react-hooks/set-state-in-effect": "off",

      // Refs during render — off (BulkDeleteOverlay jaise cases)
      "react-hooks/refs": "off",
    },
  },
]);

export default eslintConfig;
