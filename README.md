# GoBarberly - Barbershop Management System# React + TypeScript + Vite



A comprehensive barbershop management system built with React, TypeScript, and Vite. Features role-based authentication with three user types: Super Admin, Admin, and Barbershop owners.This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.



## 🚀 FeaturesCurrently, two official plugins are available:



### **Multi-Role Authentication System**- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh

- **Super Admin**: Complete system management, user administration- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

- **Admin**: Barbershop management and oversight  

- **Barbershop**: Full shop operations and appointment management## React Compiler



### **Core Functionality**The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

- 📅 Appointment scheduling and management

- 👥 Staff management with schedules and performance tracking## Expanding the ESLint configuration

- 📊 Comprehensive reporting and analytics

- 💰 Sales tracking and financial reportingIf you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

- 📦 Inventory management

- 📈 Business insights and growth metrics```js

export default defineConfig([

## 🛠️ Tech Stack  globalIgnores(['dist']),

  {

- **Frontend**: React 19, TypeScript, React Router DOM    files: ['**/*.{ts,tsx}'],

- **Styling**: CSS Modules with responsive design    extends: [

- **Charts**: Chart.js with React integration      // Other configs...

- **Build Tool**: Vite

- **Deployment**: Vercel      // Remove tseslint.configs.recommended and replace with this

      tseslint.configs.recommendedTypeChecked,

## 🏃‍♂️ Quick Start      // Alternatively, use this for stricter rules

      tseslint.configs.strictTypeChecked,

### Prerequisites      // Optionally, add this for stylistic rules

- Node.js 18+       tseslint.configs.stylisticTypeChecked,

- npm or yarn

      // Other configs...

### Local Development    ],

```bash    languageOptions: {

# Install dependencies      parserOptions: {

npm install        project: ['./tsconfig.node.json', './tsconfig.app.json'],

        tsconfigRootDir: import.meta.dirname,

# Start development server      },

npm run dev      // other options...

    },

# Build for production  },

npm run build])

```

# Preview production build

npm run previewYou can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```

```js

## 🔐 Demo Credentials// eslint.config.js

import reactX from 'eslint-plugin-react-x'

### Super Adminimport reactDom from 'eslint-plugin-react-dom'

- **Email**: `superadmin@gobarberly.com`

- **Password**: `admin123`export default defineConfig([

- Access to complete system management  globalIgnores(['dist']),

  {

### Admin      files: ['**/*.{ts,tsx}'],

- **Email**: `admin@gobarberly.com`    extends: [

- **Password**: `admin123`      // Other configs...

- Access to barbershop management      // Enable lint rules for React

      reactX.configs['recommended-typescript'],

### Barbershop Owner      // Enable lint rules for React DOM

- **Email**: `barbershop@gobarberly.com`       reactDom.configs.recommended,

- **Password**: `admin123`    ],

- Access to shop operations    languageOptions: {

      parserOptions: {

## 🚀 Vercel Deployment        project: ['./tsconfig.node.json', './tsconfig.app.json'],

        tsconfigRootDir: import.meta.dirname,

This project is configured for easy deployment on Vercel:      },

      // other options...

1. **Connect Repository**: Link your GitHub repository to Vercel    },

2. **Auto Deploy**: Vercel will automatically detect the build settings  },

3. **Environment**: No additional environment variables needed for demo])

```

### Build Commands
- **Build Command**: `npm run vercel-build`  
- **Output Directory**: `dist`
- **Install Command**: `npm install`

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Basic UI elements
│   ├── layout/         # Layout components
│   ├── auth/           # Authentication components
│   └── admin/          # Admin management components
├── pages/              # Page components
├── context/            # React context providers
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
└── data/               # Mock data and constants
```

## 🎨 Design System

- **Modern UI**: Clean, professional interface
- **Responsive**: Mobile-first design approach
- **Accessibility**: ARIA compliant components
- **Theme**: Consistent color scheme and typography

## 📱 Browser Support

- Chrome (latest)
- Firefox (latest)  
- Safari (latest)
- Edge (latest)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

This project is proprietary and confidential.

---

**GoBarberly** - Streamlining barbershop operations with modern technology.