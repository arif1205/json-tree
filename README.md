# JSON Tree Explorer

A modern, interactive JSON tree viewer and editor built with React, Redux Toolkit, and Tailwind CSS. This application allows you to visualize, explore, and manipulate JSON data structures in a collapsible tree format similar to VSCode's Explorer.

## 🔗 Live Demo

[https://json-tree-iota.vercel.app](https://json-tree-iota.vercel.app)

## 🎯 Features

### Required Features (✅ Implemented)

- **JSON Import**: Import JSON data via a modal dialog with text input
- **Collapsible Tree View**: Visualize JSON data as an expandable/collapsible tree structure with proper nesting
- **Node Selection**: Click on any node to select it, with visual highlighting
- **Breadcrumb Navigation**: Shows the exact path of the selected node (e.g., `parent > child > selectedNode`)
- **Delete Nodes**:
  - Delete any node (except first-level nodes and root)
  - Confirmation modal before deletion
  - Updates both tree view and object view in real-time
- **Persistence**: All changes are automatically saved to localStorage and persist across page refreshes
- **Object View**: Displays the JSON structure in a formatted, object-like syntax (unquoted keys)

### Bonus Features (✅ Partially Implemented)

- **Add/Rename Nodes**: Double-click on any node to rename or click to add a new node its key while preserving key order (Partially Implemented, only rename is implemented)
- **Formatted JSON View**: View the JSON data in standard formatted JSON format via a modal (implemented)
- **Undo**: Not implemented
- **Drag and drop**: Not implemented

## 🛠️ Technology Stack

### Core Technologies

- **React 19.2.0**
- **TypeScript 5.9.3**
- **Redux Toolkit 2.11.0**
- **Vite 7.2.4**
- **Tailwind CSS 4.1.17**
- **shadcn/ui**

## 📦 Installation

### Prerequisites

- Node.js 24+ and npm
- Docker (optional, for containerized deployment)

### Local Development

1. **Clone the repository**

   ```bash
   git clone https://github.com/arif1205/json-tree
   cd tree-explorar
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start the development server**

   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173` (or the port shown in your terminal)

### Build for Production

```bash
npm run build
```

The production build will be in the `dist` directory.

### Preview Production Build

```bash
npm run preview
```

## 🐳 Docker Deployment

### Using Dockerfile

1. **Build the Docker image**

   ```bash
   docker build -t json-tree-explorer .
   ```

2. **Run the container**

   ```bash
   docker run -p 3000:80 json-tree-explorer
   ```

3. **Access the application**
   Open `http://localhost:3000` in your browser

### Using Docker Compose

1. **Start the application**

   ```bash
   docker-compose up -d
   ```

2. **Access the application**
   Open `http://localhost:3000` in your browser

3. **Stop the application**
   ```bash
   docker-compose down
   ```

## 🚀 Usage

### Importing JSON

1. Click the **"Import"** button in the top-right corner
2. Paste your JSON data into the modal textarea and click **"Import"** to load the data

### Navigating the Tree

- **Expand/Collapse**: Click the chevron icon (▶/▼) next to nodes with children
- **Select Node**: Click on a node to select it (it will be highlighted)
- **View Breadcrumb**: The selected node's path appears in the Object View panel

### Editing Node

- **Rename Node**: Double-click on any node's key to rename it
- **Delete Node**: Click the minus (➖) button on any node (first-level nodes cannot be deleted)
- **View Formatted JSON**: Click "View Formatted JSON" button to see standard JSON format

### Object View

The right panel displays:

- **Breadcrumb**: Path of the currently selected node
- **Formatted Object**: JSON data displayed with unquoted keys (object-like syntax)

## 📁 Project Structure

```
tree-explorar/
├── src/
│   ├── components/
│   │   ├── main/              # Main container component
│   │   ├── modal/              # Modal components (import, delete, formatted JSON)
│   │   ├── object-view/           # Object view panel
│   │   ├── tree-view/           # Tree view components
│   │   └── ui/                  # Reusable UI components (shadcn/ui)
│   ├── hooks/
│   │   ├── json/                # JSON transformation hooks
│   │   └── store/               # Redux store hooks
│   ├── lib/
│   │   ├── json.lib.ts          # JSON manipulation utilities
│   │   ├── localstorage.ts      # LocalStorage utilities
│   │   └── utils.ts              # General utilities
│   ├── store/
│   │   └── slice/
│   │       └── global/          # Redux global state slice
│   ├── types/                   # TypeScript type definitions
│   ├── App.tsx                  # Root component
│   └── main.tsx                 # Application entry point
├── public/                      # Static assets
├── Dockerfile                   # Docker configuration
├── docker-compose.yml           # Docker Compose configuration
├── package.json                 # Dependencies and scripts
├── tsconfig.json               # TypeScript configuration
├── vite.config.ts              # Vite configuration
└── README.md                    # This file
```

## Key Implementation Details

### Tree Transformation

The `useJsonTree` hook transforms raw JSON data into a hierarchical `TreeNode` structure with:

- Unique IDs based on paths (e.g., `root.user.name`)
- Type information (object, array, primitive)
- Children relationships
- Full path tracking for operations

### State Management

- **Redux Toolkit**: Centralized state management for JSON data, selected node, and breadcrumb
- **Middleware**: Automatically syncs state with localStorage and calculates breadcrumbs

### JSON Operations

- **Delete**: `deleteNodeByPath` - Safely removes nodes by path while maintaining structure
- **Rename**: `renameNodeByPath` - Renames object keys while preserving key order
- **Breadcrumb**: `calculateBreadcrumb` - Converts node paths to human-readable breadcrumbs

### Persistence

- All JSON data is automatically saved to `localStorage`
- Data persists across page refreshes
- State is restored on application load

### Missing Features (Not Implemented)

1. **Add Node**: Ability to add new nodes to the tree structure
2. **Drag-and-Drop Re-parenting**: Move nodes by dragging and dropping
3. **Undo/Redo**: Undo last action functionality
