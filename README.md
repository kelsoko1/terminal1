# kelsoko - Next.js Trading Platform

A modern trading platform built with Next.js, PostgreSQL, Redis, and deployed on AWS EC2.

## Production Infrastructure

### AWS EC2 Setup

- **Instance Type**: t2.medium (recommended minimum)
- **Operating System**: Ubuntu 22.04 LTS
- **Domain**: kelsoko.org
- **Process Manager**: PM2
- **Database**: PostgreSQL
- **Caching**: Redis

### Key Features

- Real-time trading data visualization
- User authentication and subscription management
- Social feed with TikTok-style video streaming
- Broker integration
- Portfolio management

## Deployment

### Automatic Deployment (CI/CD)

The application uses GitHub Actions for continuous deployment:

1. Push changes to the `main` branch
2. GitHub Actions workflow automatically deploys to AWS EC2
3. PM2 restarts the application with zero downtime

### Manual Deployment

```bash
# SSH into your EC2 instance
ssh ubuntu@your-ec2-ip

# Navigate to the project directory
cd ~/kelsoko

# Pull the latest changes
git pull origin main

# Install dependencies
npm ci --production

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate deploy

# Build the application
npm run build

# Restart the application
pm2 restart kelsoko-terminal || pm2 start ecosystem.config.js
```

## Environment Configuration

The application uses the following environment variables in production:

```
# Core
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://kelsoko.org

# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/terminaldb

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_secure_redis_password

# Authentication
JWT_SECRET=your_secure_jwt_secret
```

## Monitoring & Maintenance

### PM2 Commands

```bash
# View running processes
pm2 list

# Monitor CPU/Memory usage
pm2 monit

# View logs
pm2 logs

# Restart application
pm2 restart kelsoko-terminal
```

### Database Maintenance

```bash
# Connect to PostgreSQL
sudo -u postgres psql

# Backup database
pg_dump -U postgres terminaldb > backup_$(date +%Y%m%d).sql

# Restore database
psql -U postgres terminaldb < backup_file.sql
```

## Troubleshooting

### Common Issues

1. **Application not starting**:
   - Check PM2 logs: `pm2 logs kelsoko-terminal`
   - Verify Node.js version: `node -v` (should be v18+)
   - Check disk space: `df -h`

2. **Database connection issues**:
   - Verify PostgreSQL is running: `sudo systemctl status postgresql`
   - Check database credentials in `.env`
   - Test connection: `psql -U postgres -d terminaldb -h localhost`

3. **Performance issues**:
   - Monitor resource usage: `pm2 monit`
   - Check for memory leaks: `pm2 reload kelsoko-terminal`
   - Consider scaling up EC2 instance if needed

## Security

- SSL/TLS encryption via AWS Certificate Manager
- JWT authentication with secure token handling
- Database password encryption with bcrypt
- Regular security updates via automated deployment

## Contact

For issues or inquiries, contact the development team at support@kelsoko.org