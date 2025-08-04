# Docker Setup for 3D Print Dungeon

This guide will help you run the 3D Print Dungeon project using Docker, eliminating the need to install Node.js, npm, or other dependencies on your local machine.

## Prerequisites

- Docker Desktop installed on your machine
- Git (to clone the repository)

## Quick Start

### 1. Development Mode (Recommended for development)

Run the application in development mode with hot reload:

```bash
# Build and start the development container
docker-compose --profile dev-hot up --build

# Or if you want to run it in the background
docker-compose --profile dev-hot up --build -d
```

The application will be available at: `http://localhost:5173`

### 2. Production Mode

Run the application in production mode:

```bash
# Build and start the production container
docker-compose --profile prod up --build

# Or if you want to run it in the background
docker-compose --profile prod up --build -d
```

The application will be available at: `http://localhost:80` (or just `http://localhost`)

## Available Commands

### Development Commands

```bash
# Start development server with hot reload
docker-compose --profile dev-hot up --build

# Start development server (basic)
docker-compose --profile dev up --build

# Stop development server
docker-compose --profile dev-hot down

# View logs
docker-compose --profile dev-hot logs -f
```

### Production Commands

```bash
# Start production server
docker-compose --profile prod up --build

# Stop production server
docker-compose --profile prod down

# View logs
docker-compose --profile prod logs -f
```

### Docker Commands (Alternative)

If you prefer using Docker directly instead of docker-compose:

```bash
# Development
docker build --target development -t 3d-print-dungeon-dev .
docker run -p 5173:5173 -v $(pwd):/app -v /app/node_modules 3d-print-dungeon-dev

# Production
docker build --target production -t 3d-print-dungeon-prod .
docker run -p 80:80 3d-print-dungeon-prod
```

## File Structure

```
3d-print-dungeon/
├── Dockerfile              # Multi-stage Docker build
├── docker-compose.yml      # Docker Compose configuration
├── nginx.conf             # Nginx configuration for production
├── .dockerignore          # Files to exclude from Docker build
└── README-Docker.md       # This file
```

## Development Workflow

1. **Start the development server:**
   ```bash
   docker-compose --profile dev-hot up --build
   ```

2. **Make changes to your code:**
   - Edit files in your local directory
   - Changes will automatically reload in the browser

3. **View logs:**
   ```bash
   docker-compose --profile dev-hot logs -f
   ```

4. **Stop the server:**
   ```bash
   docker-compose --profile dev-hot down
   ```

## Troubleshooting

### Port Already in Use

If you get an error about port 5173 or 80 being in use:

```bash
# Check what's using the port
lsof -i :5173
lsof -i :80

# Kill the process or use different ports in docker-compose.yml
```

### Permission Issues (Linux/Mac)

If you encounter permission issues:

```bash
# Fix file permissions
sudo chown -R $USER:$USER .

# Or run docker with your user ID
docker-compose --profile dev-hot up --build --user $(id -u):$(id -g)
```

### Windows WSL Issues

If you're on Windows and having issues with file watching:

```bash
# Add these environment variables to your docker-compose.yml
environment:
  - CHOKIDAR_USEPOLLING=true
  - WATCHPACK_POLLING=true
```

### Clean Build

If you need to rebuild everything from scratch:

```bash
# Remove all containers and images
docker-compose down --rmi all --volumes --remove-orphans

# Rebuild
docker-compose --profile dev-hot up --build
```

## Environment Variables

You can add environment variables by creating a `.env` file or modifying the `docker-compose.yml`:

```bash
# Create .env file
cp .env.example .env

# Edit .env file with your configuration
```

## Performance Tips

1. **Use volumes for node_modules:**
   - The `docker-compose.yml` already includes volume mapping for `node_modules`
   - This prevents the container from overwriting your local `node_modules`

2. **Exclude unnecessary files:**
   - The `.dockerignore` file excludes files that don't need to be in the container
   - This speeds up builds and reduces image size

3. **Use multi-stage builds:**
   - The Dockerfile uses multi-stage builds to create smaller production images
   - Development and production use different base images

## Switching Between Computers

1. **On your current computer:**
   ```bash
   # Stop the containers
   docker-compose down
   
   # Commit your changes
   git add .
   git commit -m "Your changes"
   git push
   ```

2. **On the new computer:**
   ```bash
   # Clone the repository
   git clone <your-repo-url>
   cd 3d-print-dungeon
   
   # Start development
   docker-compose --profile dev-hot up --build
   ```

That's it! No need to install Node.js, npm, or any other dependencies on the new computer.

## Additional Notes

- The development server runs on port 5173 (Vite default)
- The production server runs on port 80 (HTTP default)
- Hot reload is enabled in development mode
- The production build uses nginx for better performance
- All necessary security headers are configured in nginx
- Static assets are cached for better performance 