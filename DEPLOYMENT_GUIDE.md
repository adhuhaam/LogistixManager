# FoCar Deployment Guide - Digital Ocean Droplet

This guide provides step-by-step instructions to deploy your FoCar vehicle management application on a Digital Ocean droplet.

## Prerequisites

- Digital Ocean account
- Domain name (optional but recommended)
- Basic command line knowledge

## Step 1: Create Digital Ocean Droplet

1. **Log into Digital Ocean Console**
   - Go to https://cloud.digitalocean.com/
   - Click "Create" → "Droplets"

2. **Choose Droplet Configuration**
   - **Image**: Ubuntu 22.04 LTS x64
   - **Plan**: Basic
   - **CPU Options**: Regular with SSD
     - Minimum: $12/month (2GB RAM, 1 vCPU, 50GB SSD)
     - Recommended: $24/month (4GB RAM, 2 vCPUs, 80GB SSD)
   - **Datacenter Region**: Choose closest to your users
   - **Authentication**: SSH Key (recommended) or Password
   - **Hostname**: focar-production

3. **Create Droplet**
   - Click "Create Droplet"
   - Note the IP address once created

## Step 2: Initial Server Setup

1. **Connect to Server**
   ```bash
   ssh root@YOUR_DROPLET_IP
   ```

2. **Update System**
   ```bash
   apt update && apt upgrade -y
   ```

3. **Create Non-Root User**
   ```bash
   adduser focar
   usermod -aG sudo focar
   su - focar
   ```

## Step 3: Install Required Software

1. **Install Node.js 20**
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

2. **Install PostgreSQL**
   ```bash
   sudo apt install postgresql postgresql-contrib -y
   sudo systemctl start postgresql
   sudo systemctl enable postgresql
   ```

3. **Install Nginx**
   ```bash
   sudo apt install nginx -y
   sudo systemctl start nginx
   sudo systemctl enable nginx
   ```

4. **Install PM2 (Process Manager)**
   ```bash
   sudo npm install -g pm2
   ```

5. **Install Git**
   ```bash
   sudo apt install git -y
   ```

## Step 4: Setup PostgreSQL Database

1. **Switch to postgres user**
   ```bash
   sudo -u postgres psql
   ```

2. **Create database and user**
   ```sql
   CREATE DATABASE focar_production;
   CREATE USER focar_user WITH ENCRYPTED PASSWORD 'your_secure_password';
   GRANT ALL PRIVILEGES ON DATABASE focar_production TO focar_user;
   ALTER USER focar_user CREATEDB;
   \q
   ```

3. **Configure PostgreSQL for remote connections**
   ```bash
   sudo nano /etc/postgresql/14/main/postgresql.conf
   ```
   
   Find and uncomment:
   ```
   listen_addresses = 'localhost'
   ```

   Edit pg_hba.conf:
   ```bash
   sudo nano /etc/postgresql/14/main/pg_hba.conf
   ```
   
   Add line:
   ```
   local   all             focar_user                              md5
   ```

4. **Restart PostgreSQL**
   ```bash
   sudo systemctl restart postgresql
   ```

## Step 5: Deploy Application

1. **Create application directory**
   ```bash
   mkdir -p /home/focar/apps
   cd /home/focar/apps
   ```

2. **Upload and extract your application**
   ```bash
   # If using SCP from your local machine:
   scp focar-app.zip focar@YOUR_DROPLET_IP:/home/focar/apps/
   
   # On server:
   unzip focar-app.zip
   cd focar-app
   ```

3. **Install dependencies**
   ```bash
   npm install
   ```

4. **Create environment file**
   ```bash
   nano .env
   ```
   
   Add the following:
   ```env
   NODE_ENV=production
   DATABASE_URL=postgresql://focar_user:your_secure_password@localhost:5432/focar_production
   SESSION_SECRET=your_very_long_random_session_secret_here
   PORT=3000
   ```

5. **Build the application**
   ```bash
   npm run build
   ```

6. **Initialize database**
   ```bash
   npm run db:push
   ```

## Step 6: Configure PM2

1. **Create PM2 ecosystem file**
   ```bash
   nano ecosystem.config.js
   ```
   
   Add:
   ```javascript
   module.exports = {
     apps: [{
       name: 'focar-app',
       script: 'npm',
       args: 'start',
       cwd: '/home/focar/apps/focar-app',
       instances: 1,
       autorestart: true,
       watch: false,
       max_memory_restart: '1G',
       env: {
         NODE_ENV: 'production',
         PORT: 3000
       }
     }]
   };
   ```

2. **Start application with PM2**
   ```bash
   pm2 start ecosystem.config.js
   pm2 save
   pm2 startup
   ```

3. **Follow the startup command output to enable auto-start**

## Step 7: Configure Nginx

1. **Create Nginx configuration**
   ```bash
   sudo nano /etc/nginx/sites-available/focar
   ```
   
   Add:
   ```nginx
   server {
       listen 80;
       server_name YOUR_DOMAIN_OR_IP;
       
       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

2. **Enable the site**
   ```bash
   sudo ln -s /etc/nginx/sites-available/focar /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl reload nginx
   ```

3. **Remove default Nginx site**
   ```bash
   sudo rm /etc/nginx/sites-enabled/default
   sudo systemctl reload nginx
   ```

## Step 8: Configure Firewall

1. **Setup UFW firewall**
   ```bash
   sudo ufw enable
   sudo ufw allow ssh
   sudo ufw allow 'Nginx Full'
   sudo ufw status
   ```

## Step 9: SSL Certificate (Optional but Recommended)

1. **Install Certbot**
   ```bash
   sudo apt install snapd
   sudo snap install core; sudo snap refresh core
   sudo snap install --classic certbot
   sudo ln -s /snap/bin/certbot /usr/bin/certbot
   ```

2. **Obtain SSL certificate**
   ```bash
   sudo certbot --nginx -d your-domain.com
   ```

3. **Auto-renewal**
   ```bash
   sudo certbot renew --dry-run
   ```

## Step 10: Create Super Admin User

1. **Connect to the database**
   ```bash
   psql postgresql://focar_user:your_secure_password@localhost:5432/focar_production
   ```

2. **Create initial super admin**
   ```sql
   INSERT INTO users (username, password, email, name, role) VALUES 
   ('admin', '$2b$10$4ZlQQyLQj5qL9YQ3YKL6.e8qC0y9OGY6o9x8vQ3ZL4mK6Y8QZ9L6m', 'admin@yourcompany.com', 'System Administrator', 'super_admin');
   
   INSERT INTO system_settings (key, value, description) VALUES 
   ('app_name', 'FoCar', 'Application name displayed in the interface'),
   ('app_version', '1.0.0', 'Current application version'),
   ('app_icon', '/icons/app-icon.svg', 'Application icon path'),
   ('theme_primary_color', '#8B5CF6', 'Primary theme color'),
   ('theme_secondary_color', '#1F2937', 'Secondary theme color');
   
   \q
   ```

## Step 11: Monitoring and Maintenance

1. **Monitor application**
   ```bash
   pm2 logs focar-app
   pm2 status
   ```

2. **Monitor system resources**
   ```bash
   htop
   df -h
   ```

3. **Database backup script**
   ```bash
   nano /home/focar/backup.sh
   ```
   
   Add:
   ```bash
   #!/bin/bash
   DATE=$(date +%Y%m%d_%H%M%S)
   pg_dump postgresql://focar_user:your_secure_password@localhost:5432/focar_production > /home/focar/backups/focar_backup_$DATE.sql
   find /home/focar/backups/ -name "focar_backup_*.sql" -mtime +7 -delete
   ```
   
   Make executable and create backups directory:
   ```bash
   chmod +x /home/focar/backup.sh
   mkdir -p /home/focar/backups
   ```

4. **Setup daily backups with cron**
   ```bash
   crontab -e
   ```
   
   Add:
   ```
   0 2 * * * /home/focar/backup.sh
   ```

## Step 12: Application Updates

1. **Update process**
   ```bash
   cd /home/focar/apps/focar-app
   
   # Stop application
   pm2 stop focar-app
   
   # Backup current version
   cp -r . ../focar-app-backup-$(date +%Y%m%d)
   
   # Upload new version
   # Extract and install dependencies
   npm install
   npm run build
   
   # Run database migrations if needed
   npm run db:push
   
   # Restart application
   pm2 start focar-app
   ```

## Troubleshooting

### Application Won't Start
```bash
pm2 logs focar-app
cat /var/log/nginx/error.log
```

### Database Connection Issues
```bash
sudo systemctl status postgresql
sudo -u postgres psql -c "SELECT version();"
```

### Nginx Issues
```bash
sudo nginx -t
sudo systemctl status nginx
```

### Performance Monitoring
```bash
pm2 monit
```

## Security Best Practices

1. **Regular Updates**
   ```bash
   sudo apt update && sudo apt upgrade
   npm audit fix
   ```

2. **Change Default Passwords**
   - Update database passwords
   - Change default admin password in application

3. **Backup Strategy**
   - Daily database backups
   - Weekly full system backups
   - Test restore procedures

4. **Monitor Logs**
   ```bash
   tail -f /var/log/nginx/access.log
   pm2 logs focar-app --lines 100
   ```

## Default Login Credentials

After deployment, you can log in with:
- **Username**: admin
- **Password**: password

**Important**: Change this password immediately after first login through the Settings panel.

## Support

Your FoCar application should now be running at:
- HTTP: http://YOUR_DROPLET_IP or http://your-domain.com
- HTTPS: https://your-domain.com (if SSL configured)

For additional support or issues, refer to the application logs and monitoring tools configured above.