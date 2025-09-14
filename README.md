# DB Monitor - Database Performance Dashboard

A modern, AI-powered database monitoring and optimization platform built with Next.js 14, TypeScript, and Tailwind CSS. Monitor database performance, analyze slow queries, and get intelligent optimization recommendations through an intuitive web interface.

## Features

### Core Functionality
- **Database Connection Management**: Secure connection to PostgreSQL, MySQL, MariaDB, and SQLite databases
- **Real-time Performance Monitoring**: Live metrics including query count, latency, and slow query detection
- **AI-Powered Insights**: Intelligent recommendations for database optimization and performance improvements
- **Query Analysis**: Detailed analysis of slow queries with execution time and frequency tracking
- **Email Alerts**: Configurable email notifications for specific queries and performance thresholds
- **Interactive Dashboard**: Comprehensive overview of database health and performance metrics

### Advanced Capabilities
- **AI Chat Assistant**: Conversational interface for database optimization guidance and best practices
- **Auto-refresh Monitoring**: Configurable real-time data updates with 30-second intervals
- **Query Severity Classification**: Automatic categorization of queries by performance impact
- **Responsive Design**: Mobile-first approach with modern UI components
- **Secure Authentication**: Token-based authentication with persistent session management

## Technology Stack

### Frontend
- **Next.js 14**: React framework with App Router and Server Components
- **TypeScript**: Type-safe development with comprehensive type definitions
- **Tailwind CSS**: Utility-first CSS framework for responsive design
- **Radix UI**: Accessible component primitives for consistent UI
- **React Query**: Data fetching and caching with TanStack Query
- **Redux Toolkit**: State management for complex application state

### Key Libraries
- **Axios**: HTTP client for API communication
- **React Hook Form**: Form handling with validation
- **Zod**: Schema validation and type inference
- **Lucide React**: Modern icon library
- **Recharts**: Data visualization and charting
- **React Markdown**: Markdown rendering for AI responses

## Project Structure

```
dboptimizer-frontend/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes for AI integration
│   ├── dashboard/         # Main dashboard interface
│   ├── copilot/          # AI chat assistant
│   ├── queries/          # Query management
│   └── query-analysis/   # Detailed query analysis
├── components/           # Reusable UI components
│   ├── layout/          # Layout components
│   └── ui/              # Base UI components
├── contexts/            # React context providers
├── hooks/               # Custom React hooks
├── lib/                 # Utility libraries and configurations
│   ├── redux/          # Redux store and slices
│   └── api.ts          # API client configuration
└── styles/             # Global styles and themes
```

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm, yarn, or pnpm package manager
- Access to a supported database (PostgreSQL, MySQL, MariaDB, SQLite)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd dboptimizer-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000` to access the application

### Database Connection

1. **Connect Your Database**: Use the onboarding interface to enter your database credentials
2. **Sample Database**: Option to connect to a pre-configured sample database for testing
3. **Connection Validation**: Real-time validation of database connectivity and permissions

## Usage

### Dashboard Overview
- **Performance Metrics**: View total queries, average latency, and slow query counts
- **Connection Status**: Monitor database connectivity and user information
- **AI Insights**: Receive intelligent optimization recommendations
- **Auto-refresh**: Enable automatic data updates for real-time monitoring

### Query Analysis
- **Slow Query Detection**: Identify queries exceeding performance thresholds
- **Severity Classification**: Categorize queries by impact level (high, medium, low)
- **Detailed Analysis**: Click through to individual query analysis pages
- **Frequency Tracking**: Monitor query execution patterns

### AI Copilot
- **Interactive Chat**: Ask questions about database performance and optimization
- **Best Practices**: Get recommendations for indexing, query optimization, and schema design
- **Execution Plan Analysis**: Understand query performance characteristics
- **Contextual Suggestions**: Receive relevant optimization tips based on your database

### Email Alerts & Notifications
- **Custom Query Alerts**: Set up email notifications for specific SQL queries
- **Performance Threshold Monitoring**: Get notified when queries exceed defined performance limits
- **Alert Management**: View and manage active alerts through the Trends & Alerts dashboard
- **Real-time Notifications**: Instant email alerts when configured queries are executed

## API Integration

The application integrates with a backend API for:
- Database connection management
- Performance metrics collection
- AI-powered insights generation
- Query analysis and optimization recommendations

### Key Endpoints
- `/db/connect-db`: Database connection establishment
- `/db/metric-data`: Performance metrics retrieval
- `/db/top-k-slow-queries`: Slow query analysis
- `/db/get-insights`: AI-generated optimization insights
- `/alerts/enable`: Create and configure email alerts
- `/alerts/query-with-alerts`: Retrieve active alerts and notifications
- `/ai/chat`: Conversational AI assistance
- `/ai/optimize`: Query optimization suggestions

## Development

### Available Scripts
- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run start`: Start production server
- `npm run lint`: Run ESLint for code quality

### Code Quality
- **TypeScript**: Full type safety with strict configuration
- **ESLint**: Code linting and style enforcement
- **Prettier**: Consistent code formatting
- **Component Architecture**: Modular, reusable component design

### State Management
- **Redux Toolkit**: Global state management for application data
- **React Query**: Server state management and caching
- **Context API**: Local state management for UI components

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Create an issue in the repository
- Review the documentation
- Check the AI copilot for guidance on database optimization

---

Built with modern web technologies to provide a professional, scalable, and user-friendly database monitoring experience.