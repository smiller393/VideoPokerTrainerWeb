# Video Poker Trainer

A comprehensive web application for learning optimal video poker strategy, built with React, TypeScript, and Vite. Features offline functionality, responsive design, and extensive testing coverage.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)
![TypeScript](https://img.shields.io/badge/typescript-%5E5.0.2-blue.svg)
![Tests](https://img.shields.io/badge/tests-15%20unit%20%2B%20e2e-green.svg)

## 🎮 Features

- **Full Video Poker Gameplay**: Complete Jacks or Better implementation with 9-6 pay table (99.54% RTP)
- **Strategy Training**: Real-time optimal play analysis with mistake detection and feedback
- **Progressive Web App**: Offline support with service worker caching
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Comprehensive Testing**: Unit tests, E2E tests across multiple browsers and devices
- **Accessibility**: ARIA labels, keyboard navigation, high contrast support
- **Performance Optimized**: <500KB bundle, <3s load time, 95+ Lighthouse score

## 🚀 Quick Start

### Prerequisites

- **Node.js**: 18.0.0 or higher
- **npm**: 8.0.0 or higher (comes with Node.js)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/vp-trainer-web.git
   cd vp-trainer-web
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   Navigate to `http://localhost:5173`

## 📝 Available Scripts

### Development

```bash
# Start development server with hot reload
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview

# Type check without emitting files
npm run typecheck

# Run ESLint for code quality
npm run lint
```

### Testing

```bash
# Run all unit tests
npm test

# Run unit tests in watch mode
npm run test:watch

# Run end-to-end tests
npm run test:e2e

# Install Playwright browsers (first time only)
npx playwright install
```

## 🧪 Testing Guide

### Unit Tests

The project uses **Jest** with **React Testing Library** for unit testing:

- **Location**: `src/tests/*.test.ts`
- **Coverage**: 90%+ code coverage requirement
- **What's tested**: Game logic, hand evaluation, state management

```bash
# Run tests with coverage report
npm test -- --coverage

# Run specific test file
npm test handEvaluator.test.ts

# Run tests in watch mode during development
npm run test:watch
```

### End-to-End Tests

**Playwright** is used for comprehensive E2E testing:

- **Location**: `src/tests/e2e/*.spec.ts`
- **Browsers**: Chrome, Firefox, Safari, Mobile Chrome, Mobile Safari
- **What's tested**: Complete user workflows, responsive design, cross-browser compatibility

```bash
# Run E2E tests
npm run test:e2e

# Run E2E tests in headed mode (see browser)
npx playwright test --headed

# Run specific test file
npx playwright test gameFlow.spec.ts

# Generate test report
npx playwright show-report
```

### Test Configuration

- **Jest Config**: `jest.config.js`
- **Playwright Config**: `playwright.config.ts`
- **Test Setup**: `src/tests/setup.ts`

## 🏗️ Project Structure

```
src/
├── components/          # React UI components
│   ├── Card/           # Playing card component with hold functionality
│   ├── GameBoard/      # Main game interface layout
│   ├── PayTable/       # Payout table display
│   └── Controls/       # Game controls (bet, deal, draw)
├── game/               # Core game logic (framework-agnostic)
│   ├── types.ts        # TypeScript interfaces and enums
│   ├── deck.ts         # Card deck management and shuffling
│   ├── handEvaluator.ts # Poker hand evaluation engine
│   ├── strategy.ts     # Optimal play calculation algorithm
│   ├── engine.ts       # Main game state management
│   └── payTables.ts    # Payout table definitions
├── hooks/              # React hooks and state management
│   ├── useGameStore.ts # Zustand store for game state
│   └── useStats.ts     # Player statistics tracking
├── services/           # External services and utilities
│   └── pwa.ts          # Service worker and offline functionality
├── tests/              # Test files
│   ├── *.test.ts       # Unit tests
│   └── e2e/            # End-to-end tests
└── App.tsx             # Main application component
```

## ⚙️ Configuration Files

### Build & Development
- **`vite.config.ts`**: Vite configuration with PWA plugin
- **`tsconfig.json`**: TypeScript compiler configuration
- **`tsconfig.node.json`**: Node.js TypeScript configuration

### Code Quality
- **`.eslintrc.cjs`**: ESLint rules and configuration
- **`jest.config.js`**: Jest testing framework configuration
- **`playwright.config.ts`**: Playwright E2E testing configuration

### PWA
- **`public/manifest.webmanifest`**: Web app manifest (auto-generated)
- **`dist/sw.js`**: Service worker (auto-generated by Workbox)

### IDE Configuration
- **`.idea/runConfigurations/`**: IntelliJ IDEA/WebStorm run configurations

## 💻 IntelliJ IDEA / WebStorm Setup

This project includes pre-configured run configurations for IntelliJ IDEA and WebStorm that make development easier.

### Available Run Configurations

Once you open the project in IntelliJ IDEA or WebStorm, you'll find these run configurations in the top-right dropdown:

1. **🚀 Start Video Poker Trainer** 
   - Starts the development server and automatically opens http://localhost:5173 in your browser
   - Best for daily development work

2. **🔨 Build Production**
   - Builds the project for production 
   - Output goes to `dist/` folder

3. **🌐 Preview Production Build**
   - Serves the production build and opens http://localhost:4173
   - Use this to test the production version locally

4. **🏗️ Build and Preview**
   - Compound configuration that runs Build Production followed by Preview
   - One-click production testing

5. **🧪 Run Tests**
   - Runs all Jest unit tests
   - Shows test results in IDE

6. **✅ Type Check**
   - Runs TypeScript compiler type checking
   - Catches type errors without building

7. **🎭 E2E Tests**
   - Runs Playwright end-to-end tests
   - Tests the full application workflow

### How to Use

1. **Open the project** in IntelliJ IDEA or WebStorm
2. **Select a run configuration** from the dropdown in the top-right corner
3. **Click the green play button** or press `Ctrl+F5` (Windows/Linux) / `Cmd+R` (Mac)

The **"Start Video Poker Trainer"** configuration is perfect for daily development - it will start the dev server and automatically open your browser to the running application.

### Browser Auto-Launch

The development and preview configurations are set to automatically open your default browser. If you prefer not to auto-launch the browser:

1. Go to **Run → Edit Configurations**
2. Select the configuration you want to modify
3. Remove the **"Launch browser"** before launch task

## 🎯 Game Implementation Details

### Core Game Logic

The game engine (`src/game/`) is designed to be framework-agnostic and thoroughly tested:

```typescript
// Example: Hand evaluation
import { evaluateHand } from '@/game/handEvaluator';
import { Card, Suit, Rank } from '@/game/types';

const hand: Card[] = [
  { suit: Suit.HEARTS, rank: Rank.ACE, id: 'A_hearts' },
  { suit: Suit.HEARTS, rank: Rank.KING, id: 'K_hearts' },
  // ... more cards
];

const result = evaluateHand(hand);
console.log(result.type); // HandType.ROYAL_FLUSH
```

### Strategy Engine

The optimal strategy calculator uses expected value analysis:

```typescript
import { analyzeOptimalStrategy } from '@/game/strategy';

const analysis = analyzeOptimalStrategy(hand);
console.log(analysis.optimalHolds); // [true, true, false, false, false]
console.log(analysis.expectedValue); // 2.3 (coins)
```

### State Management

Game state is managed with Zustand for simplicity and performance:

```typescript
import { useGameStore } from '@/hooks/useGameStore';

function GameComponent() {
  const { hand, credits, deal, hold, draw } = useGameStore();
  
  return (
    <div>
      <div>Credits: {credits}</div>
      <button onClick={deal}>Deal</button>
      {/* Game UI */}
    </div>
  );
}
```

## 🚢 Deployment

### Production Build

```bash
# Create optimized production build
npm run build

# Files will be generated in dist/ directory
# - Minified JavaScript and CSS
# - Service worker for offline functionality
# - Web app manifest for PWA features
```

### Deployment Options

**Static Hosting** (Recommended):
- **Vercel**: `vercel --prod`
- **Netlify**: Drag and drop `dist/` folder
- **GitHub Pages**: Deploy `dist/` to `gh-pages` branch

**Server Deployment**:
- **Docker**: Use included `Dockerfile` (if added)
- **Node.js**: Serve `dist/` with any static file server

### Environment Variables

No environment variables required for basic functionality. All game logic runs client-side.

## 🤝 Contributing

We welcome contributions! Please follow these steps:

### Setting Up Development Environment

1. **Fork the repository** on GitHub
2. **Clone your fork:**
   ```bash
   git clone https://github.com/yourusername/vp-trainer-web.git
   cd vp-trainer-web
   ```
3. **Install dependencies:**
   ```bash
   npm install
   ```
4. **Create a feature branch:**
   ```bash
   git checkout -b feature/amazing-feature
   ```

### Development Workflow

1. **Make your changes** following the code style
2. **Add tests** for new functionality
3. **Run the test suite:**
   ```bash
   npm test
   npm run test:e2e
   npm run typecheck
   npm run lint
   ```
4. **Commit your changes:**
   ```bash
   git commit -m 'Add amazing feature'
   ```
5. **Push to your fork:**
   ```bash
   git push origin feature/amazing-feature
   ```
6. **Open a Pull Request** on GitHub

### Code Style Guidelines

- **TypeScript**: All code must be properly typed
- **ESLint**: Follow the configured rules
- **Testing**: Maintain 90%+ test coverage
- **Commits**: Use conventional commit messages
- **Components**: Use functional components with hooks

### Adding New Poker Variants

The architecture supports multiple poker variants:

1. **Add pay table** in `src/game/payTables.ts`
2. **Update hand evaluator** if needed in `src/game/handEvaluator.ts`
3. **Create strategy engine** in `src/game/strategy.ts`
4. **Add tests** for the new variant
5. **Update UI** to support variant selection

## 📊 Performance Metrics

### Bundle Analysis
```bash
# Analyze bundle size
npm run build
npx vite-bundle-analyzer dist/assets/*.js
```

### Lighthouse Scores
- **Performance**: 95+
- **Accessibility**: 95+
- **Best Practices**: 95+
- **SEO**: 95+

### Browser Support
- **Desktop**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Mobile**: iOS Safari 14+, Chrome Mobile 90+, Samsung Internet 14+

## 🔧 Troubleshooting

### Common Issues

**Node.js Version Conflicts:**
```bash
# Use Node Version Manager (nvm)
nvm install 18
nvm use 18
```

**Playwright Browser Installation:**
```bash
npx playwright install
```

**TypeScript Errors:**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

**PWA Not Working in Development:**
PWA features only work in production builds. Use `npm run preview` to test.

### Getting Help

- **Issues**: Report bugs on GitHub Issues
- **Discussions**: Ask questions in GitHub Discussions
- **Discord**: Join our Discord server (link in repo)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Video poker strategy based on optimal mathematical analysis
- PWA implementation following modern web standards
- Accessibility guidelines following WCAG 2.1 standards
- Testing patterns inspired by Kent C. Dodds' testing philosophy

## 📈 Roadmap

- [ ] Additional poker variants (Deuces Wild, Bonus Poker)
- [ ] Multiplayer tournaments
- [ ] Advanced analytics dashboard
- [ ] Mobile app (React Native)
- [ ] Machine learning strategy hints

---

**Happy coding! 🎰**