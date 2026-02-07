# 🚀 BookYourService - Production Deployment Guide

Complete guide to deploy BookYourService marketplace on Vercel with Neon PostgreSQL database.

---

## 📋 Prerequisites

- ✅ Node.js/Bun installed
- ✅ Git installed
- ✅ GitHub account
- ✅ Vercel account ([vercel.com](https://vercel.com/signup))
- ✅ Neon account ([console.neon.tech](https://console.neon.tech/))

---

## 🗄️ Step 1: Set Up Neon PostgreSQL Database

### 1.1 Create Neon Account
1. Go to [console.neon.tech](https://console.neon.tech/)
2. Sign up for FREE account
3. Complete email verification

### 1.2 Create Database Project
1. Click "New Project"
2. Project name: `bookyourservice`
3. Region: Choose nearest region (e.g., AWS US East)
4. Click "Create Project"

### 1.3 Get Database Connection String
1. Neon will show your connection string:
   ```
   postgresql://user:password@ep-xxx-xxx-xxx.aws.neon.tech/neondb?sslmode=require
   ```
2. Copy this connection string

### 1.4 Test Connection Locally (Optional)
Create a local `.env` file:
```bash
DATABASE_PROVIDER=postgresql
DATABASE_URL=postgresql://user:password@ep-xxx-xxx-xxx.aws.neon.tech/neondb?sslmode=require
SESSION_SECRET=your-random-session-secret-min-32-chars
```

Run database push:
```bash
bun run db:push
bun run db:seed
```

---

## 📦 Step 2: Prepare Repository for Vercel

### 2.1 Update `.gitignore`
Ensure these files are ignored:
```
.env
.env.local
.env.production
*.db
db/*.db
.next/
```

### 2.2 Update `.env.example`
Update `.env.example` with your actual Neon connection string (DO NOT commit actual credentials).

### 2.3 Verify Code Quality
```bash
bun run lint
```

Fix any linting errors before deploying.

### 2.4 Test Build Locally
```bash
bun run vercel-build
```

Ensure build completes successfully.

---

## 🚢 Step 3: Connect Repository to Vercel

### 3.1 Push to GitHub
```bash
git add .
git commit -m "Ready for Vercel deployment with Neon database"
git push origin master
```

### 3.2 Import Project in Vercel
1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click "Add New Project"
3. Import from "Git Repository"
4. Select: `rawatharish27-commits/bookyourservice`
5. Click "Import"

### 3.3 Configure Framework
- **Framework Preset**: Next.js
- **Root Directory**: `./` (leave as default)
- **Build Command**: Auto-detected (`bun run vercel-build`)
- **Output Directory**: Auto-detected (`.next`)
- Click "Continue"

---

## 🔧 Step 4: Configure Environment Variables

### 4.1 Add Environment Variables
In Vercel Dashboard → Project → Settings → Environment Variables, add:

| Variable | Value | Environment |
|----------|-------|-------------|
| `DATABASE_PROVIDER` | `postgresql` | Production, Preview, Development |
| `DATABASE_URL` | Your Neon connection string | Production, Preview, Development |
| `SESSION_SECRET` | Generate a random 32+ char string | Production, Preview, Development |
| `NEXT_PUBLIC_APP_URL` | Your Vercel app URL | Production, Preview, Development |

### 4.2 Generate SESSION_SECRET
```bash
# Linux/Mac
openssl rand -base64 32

# Or Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Use the output for `SESSION_SECRET`.

### 4.3 Save Variables
- Click "Add" for each variable
- Make sure to check all three environment boxes (Production, Preview, Development)
- Click "Save"

---

## 🚀 Step 5: Deploy to Vercel

### 5.1 Automatic Deployment
After saving environment variables:
1. Vercel will automatically trigger a new deployment
2. Wait for deployment to complete (2-5 minutes)
3. Vercel will provide a URL like: `https://bookyourservice-xxx.vercel.app`

### 5.2 Monitor Deployment
- Watch the deployment logs in Vercel Dashboard
- Check for any build errors
- Verify environment variables are loaded correctly

### 5.3 Test Deployment
Once deployment completes:
1. Visit your Vercel URL
2. Test key functionality:
   - ✅ Home page loads
   - ✅ Categories display
   - ✅ Services list
   - ✅ Login/Signup works
   - ✅ Database connects (Neon)

---

## 🗄️ Step 6: Post-Deployment Actions

### 6.1 Verify Database
1. Go to [Neon Console](https://console.neon.tech/)
2. Check your `bookyourservice` project
3. Verify tables are created
4. Check for any connection errors

### 6.2 Test APIs Manually
```
# Categories
curl https://your-app.vercel.app/api/categories

# Featured Services
curl https://your-app.vercel.app/api/services?featured=true&limit=6
```

### 6.3 Monitor Performance
1. Set up Vercel Analytics
2. Check Vercel Deployment Logs
3. Monitor Neon Database Metrics
4. Set up error tracking (Sentry, etc.)

### 6.4 Set Up Custom Domain (Optional)
1. In Vercel Dashboard → Domains
2. Add your custom domain
3. Update DNS records as instructed
4. Enable SSL (automatic on Vercel)

---

## 🔒 Security Checklist

### Environment Variables
- ✅ Never commit actual `.env` file
- ✅ Use `.env.example` for documentation
- ✅ Rotate SESSION_SECRET periodically
- ✅ Use strong, unique DATABASE_URL

### Database Security
- ✅ Neon provides SSL by default
- ✅ Connection pooling is automatic
- ✅ Regular backups provided by Neon
- ✅ Read replicas for high availability

### Application Security
- ✅ HTTPS enforced on Vercel
- ✅ Session tokens expire after 7 days
- ✅ Password hashing with SHA-256
- ✅ SQL injection prevention via Prisma

---

## 📊 Free Tier Limits

### Neon Free Tier
- ✅ Storage: 3 GB
- ✅ Compute: 10 hours/month
- ✅ Connections: 10 concurrent
- ✅ Auto-suspend after limit
- **Sufficient for initial production use**

### Vercel Free Tier
- ✅ Bandwidth: 100 GB/month
- ✅ Builds: 6,000 minutes/month
- ✅ Functions: 100 GB-hours
- ✅ Zero configuration: automatic
- **Sufficient for production deployment**

---

## 🐛 Troubleshooting

### Build Errors

**Error: "DATABASE_URL not found"**
- Solution: Add DATABASE_URL environment variable in Vercel Dashboard

**Error: "Prisma Client initialization error"**
- Solution: Run `bun run db:generate` and commit the changes

### Runtime Errors

**Error: "Database connection failed"**
- Solution:
  1. Verify DATABASE_URL is correct
  2. Check Neon Console for database status
  3. Ensure `DATABASE_PROVIDER=postgresql`

**Error: "502 Bad Gateway"**
- Solution:
  1. Check deployment logs
  2. Wait for propagation
  3. Increase function timeout if needed

### Performance Issues

**Slow page loads:**
- Enable Vercel Edge Network caching
- Optimize database queries
- Add CDN for static assets

**Database connection pool exhausted:**
- Neon automatically manages pooling
- Monitor in Neon Console
- Consider upgrading if consistent issue

---

## 📈 Scaling Guide

### When to Scale

**Database (Neon):**
- Persistent slow queries
- Frequent connection timeouts
- Approaching storage limit

**Application (Vercel):**
- Consistent high latency
- 502 errors
- Build timeouts

### Scaling Options

**Neon Pro Plans:**
- $19/month: 10 GB storage, unlimited compute
- $49/month: 30 GB storage, unlimited compute
- $99/month: 100 GB storage, dedicated CPU

**Vercel Pro:**
- $20/month: Unlimited bandwidth, advanced analytics
- Higher function execution limits
- Priority support

---

## 📞 Support Resources

- **Vercel Documentation**: [vercel.com/docs](https://vercel.com/docs)
- **Vercel Support**: [vercel.com/support](https://vercel.com/support)
- **Neon Documentation**: [neon.tech/docs](https://neon.tech/docs)
- **Neon Status**: [status.neon.tech](https://status.neon.tech/)
- **Prisma Documentation**: [prisma.io/docs](https://www.prisma.io/docs)

---

## ✅ Deployment Checklist

Before deploying, ensure:

- [ ] Neon database created and tested
- [ ] `.env.example` updated with correct values
- [ ] All linting errors fixed
- [ ] Local build successful
- [ ] Code pushed to GitHub
- [ ] Vercel project imported
- [ ] Environment variables configured
- [ ] Build command verified
- [ ] Test deployment completed

---

## 🎉 Success!

Your BookYourService marketplace is now live on Vercel with Neon PostgreSQL!

### Next Steps
1. Monitor performance for 24 hours
2. Gather user feedback
3. Optimize based on real usage
4. Plan for future features
5. Set up monitoring and alerts

### Key URLs
- **Production App**: [Your Vercel URL]
- **Neon Console**: [https://console.neon.tech/](https://console.neon.tech/)
- **Vercel Dashboard**: [https://vercel.com/dashboard](https://vercel.com/dashboard)

---

## 📝 Notes

- This deployment guide is for the FREE tier of both Neon and Vercel
- For production, consider upgrading to paid tiers for better performance
- Regular backups are handled by Neon automatically
- Vercel provides automatic SSL and CDN
- Review logs regularly for security and performance

---

**Last Updated**: February 2024
**Platform Version**: BookYourService v1.0.0
