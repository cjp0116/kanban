# Kanban Board Application

A modern, full-stack Kanban board application built with Next.js, PostgreSQL, and TypeScript. Features drag-and-drop task management, automation rules, and a beautiful dark/light theme.

## Features

- 🎯 **Drag & Drop Interface** - Intuitive task management with smooth animations
- 📊 **Real-time Updates** - Instant synchronization between frontend and database
- 🤖 **Automation Rules** - Automatically move tasks based on conditions
- 🎨 **Dark/Light Theme** - Beautiful UI with theme switching
- 📱 **Responsive Design** - Works perfectly on desktop and mobile
- 🔧 **Custom Fields** - Add custom properties to tasks
- ✅ **Subtasks** - Break down tasks into smaller components
- 🗄️ **PostgreSQL Database** - Robust data persistence with proper relationships

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Database**: PostgreSQL with postgres.js
- **UI Components**: Radix UI, Tailwind CSS
- **Drag & Drop**: @hello-pangea/dnd
- **Icons**: Lucide React
- **Date Picker**: React Day Picker

## Getting Started

### Prerequisites

1. **Node.js** (v18 or higher)
2. **PostgreSQL** database
3. **Git**

### Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd kanban
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   ```bash
   cp env.example .env.local
   ```
   
   Update `.env.local` with your database credentials:
   ```env
   POSTGRES_USER=postgres
   POSTGRES_HOST=localhost
   POSTGRES_DB=kanban
   POSTGRES_PASSWORD=your_password_here
   POSTGRES_PORT=5432
   ```

4. **Initialize the database**:
   ```bash
   npm run db:init
   ```

5. **Test the database connection**:
   ```bash
   npm run db:test
   ```

6. **Start the development server**:
   ```bash
   npm run dev
   ```

7. **Open your browser** and navigate to [http://localhost:3000](http://localhost:3000)

## Database Scripts

The project includes several database management scripts:

- `npm run db:init` - Initialize database with tables, views, functions, and demo data
- `npm run db:reset` - Reset and reinitialize the database (same as db:init)
- `npm run db:seed` - Seed the database with demo data (same as db:init)
- `npm run db:test` - Test database connection and show data summary

## Database Schema

The application uses a comprehensive PostgreSQL schema with:

- **Users** - User management (for future multi-user support)
- **Boards** - Kanban boards
- **Columns** - Board columns (To Do, In Progress, Done, etc.)
- **Tasks** - Individual tasks/cards
- **Subtasks** - Task breakdown items
- **Custom Fields** - Custom task properties
- **Automation Rules** - Automated task movement rules

## API Endpoints

The application provides RESTful API endpoints:

- `GET /api/boards/[boardId]` - Get board with all data
- `POST /api/tasks` - Create new task
- `PATCH /api/tasks/[taskId]` - Update task
- `DELETE /api/tasks/[taskId]` - Delete task
- `POST /api/columns` - Create new column
- `PATCH /api/columns/[columnId]` - Update column
- `DELETE /api/columns/[columnId]` - Delete column
- `GET /api/boards/[boardId]/rules` - Get automation rules
- `POST /api/boards/[boardId]/rules` - Create automation rule

## Project Structure

```
src/
├── app/                 # Next.js app directory
│   ├── api/            # API routes
│   ├── globals.css     # Global styles
│   ├── layout.tsx      # Root layout
│   └── page.tsx        # Home page
├── components/         # React components
│   ├── ui/            # Reusable UI components
│   └── *.tsx          # Feature components
├── lib/               # Utility libraries
│   ├── database.ts    # Database connection and queries
│   ├── api-client.ts  # API client functions
│   └── utils.ts       # Utility functions
├── scripts/           # Database scripts
│   ├── 001-create-tables.sql
│   ├── 002-seed-demo-data.sql
│   ├── 003-create-views.sql
│   ├── 004-create-functions.sql
│   ├── init-database.ts
│   └── test-connection.ts
└── types/             # TypeScript type definitions
    └── kanban.ts      # Application types
```

## Development

### Running in Development Mode

```bash
npm run dev
```

### Building for Production

```bash
npm run build
npm start
```

### Linting

```bash
npm run lint
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please open an issue on GitHub.
