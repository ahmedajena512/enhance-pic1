<<<<<<< HEAD
# AI Image Enhancer - React + TypeScript + Vite

A sophisticated AI-powered image enhancement application built with React, TypeScript, and Vite. Features premium liquid glass UI design with Real-ESRGAN AI processing.

## Features

- 🎨 **Premium Liquid Glass UI** - Sophisticated glass morphism effects with backdrop blur
- 🖼️ **Drag & Drop Upload** - Animated file upload with preview and validation
- 🔧 **Enhancement Controls** - Scale slider (1x-10x) with face enhancement options
- 🤖 **AI Processing** - Real-ESRGAN integration with progress tracking
- 📱 **Responsive Design** - Mobile-first approach with smooth animations
- 💾 **State Management** - Zustand store with comprehensive image history
- ⚡ **Performance Optimized** - 60fps animations with proper error handling

## Setup

### Prerequisites

1. **Node.js** (v18 or higher)
2. **pnpm** (recommended) or npm
3. **Replicate API Token** - Get one at [replicate.com](https://replicate.com)

### Installation

1. **Clone and install dependencies:**
```bash
cd enhance-pics
pnpm install
```

2. **Set up environment variables:**
```bash
cp env.example .env
```

3. **Add your Replicate API token to `.env`:**
```
REPLICATE_API_TOKEN=your_actual_token_here
```

4. **Start development server:**
```bash
pnpm dev
```

5. **Start backend server (in another terminal):**
```bash
pnpm server
```

### Production Build

```bash
# Build the application
pnpm build

# Start production server
pnpm start
```

## API Configuration

The application uses the Replicate API with the Real-ESRGAN model:

- **Model**: `nightmareai/real-esrgan`
- **Version**: `f121d640bd286e1fdc67f9799164c1d5be36ff74576ee11c803ae5b665dd46aa`
- **Features**: Image upscaling, face enhancement, quality improvement

## Development

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

### Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm preview` - Preview production build
- `pnpm server` - Start backend API server
- `pnpm start` - Build and start production server
- `pnpm lint` - Run ESLint

### Project Structure

```
src/
├── components/     # UI components
├── services/       # API services
├── store/          # State management
├── hooks/          # Custom hooks
├── lib/            # Utility functions
└── App.tsx         # Main application
```

## Technologies Used

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, Framer Motion
- **State Management**: Zustand
- **UI Components**: Radix UI, Lucide React
- **Backend**: Express.js
- **AI Processing**: Replicate API (Real-ESRGAN)

## License

MIT
=======
# enhance-pic
>>>>>>> ff4918edfb7b4308b266990428fbc8e37b69ec3d
