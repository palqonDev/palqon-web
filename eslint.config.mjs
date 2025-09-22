import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",   // disattiva errore "any"
      "@typescript-eslint/no-unused-vars": "warn",  // solo warning se variabile non usata
      "react/no-unescaped-entities": "off",         // disattiva errore su apostrofi/virgolette
      "@next/next/no-img-element": "off",           // permetti <img> invece di <Image />
    },
  },
];

export default eslintConfig;
