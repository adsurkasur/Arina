# i18n Directory

This folder contains translation files for each supported language (e.g., `en.json`, `id.json`).

- Add new languages by creating a new JSON file (e.g., `fr.json` for French).
- Add new translation keys as needed in all language files.
- Use the `t('key')` function from `react-i18next` in your components.

Example usage in a component:

```tsx
import { useTranslation } from 'react-i18next';
const { t } = useTranslation();
return <h1>{t('userProfile.title')}</h1>;
```
