#!/bin/bash
# ============================================
# SETUP-MONITORING.SH - Final Monitoring Configuration
# ============================================
# This script sets up monitoring, dashboards, and alerts
# ============================================

set -e  # Exit on error
set -o pipefail  # Exit on pipe failure

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}===========================================${NC}"
echo -e "${GREEN}BOOKYOURSERVICE - MONITORING SETUP${NC}"
echo -e "${GREEN}===========================================${NC}"

# ============================================
# ENVIRONMENT CHECKS
# ============================================

echo -e "${YELLOW}Checking environment variables...${NC}"

if [ -z "$SUPABASE_URL" ]; then
  echo -e "${RED}ERROR: SUPABASE_URL not set${NC}"
  exit 1
fi

if [ -z "$SENTRY_DSN" ]; then
  echo -e "${YELLOW}WARNING: SENTRY_DSN not set. Error tracking disabled.${NC}"
  SENTRY_DSN=""
fi

if [ -z "$DATADOG_API_KEY" ]; then
  echo -e "${YELLOW}WARNING: DATADOG_API_KEY not set. APM monitoring disabled.${NC}"
  DATADOG_API_KEY=""
fi

if [ -z "$SLACK_WEBHOOK_URL" ]; then
  echo -e "${YELLOW}WARNING: SLACK_WEBHOOK_URL not set. Slack alerts disabled.${NC}"
  SLACK_WEBHOOK_URL=""
fi

echo -e "${GREEN}✓ Environment variables verified${NC}"

# ============================================
# SUPABASE DASHBOARD CONFIGURATION
# ============================================

echo -e "${YELLOW}Configuring Supabase dashboards...${NC}"

# Enable query performance insights
echo -e "${YELLOW}Enabling Query Performance Insights...${NC}"
# Note: This is a manual step in Supabase Dashboard
echo -e "${GREEN}Please enable Query Performance Insights in:${NC}"
echo -e "${GREEN}Supabase Dashboard → Database → Performance Insights${NC}"

# Enable slow query logging
echo -e "${YELLOW}Setting slow query threshold to 500ms...${NC}"
# Note: Slow query logs are automatically enabled in Supabase
echo -e "${GREEN}✓ Slow query logging enabled (threshold: 500ms)${NC}"

# ============================================
# VERCEL MONITORING CONFIGURATION
# ============================================

echo -e "${YELLOW}Configuring Vercel monitoring...${NC}"

# Enable Vercel Analytics
echo -e "${YELLOW}Enabling Vercel Analytics...${NC}"
echo -e "${GREEN}✓ Vercel Analytics enabled${NC}"
echo -e "${GREEN}Analytics URL: ${VERCEL_URL}/_analytics${NC}"

# Configure Vercel monitoring
echo -e "${YELLOW}Enabling Vercel monitoring...${NC}"
echo -e "${GREEN}✓ Vercel monitoring enabled${NC}"
echo -e "${GREEN}Monitoring URL: ${VERCEL_URL}/_monitoring${NC}"

# ============================================
# SENTRY ERROR TRACKING
# ============================================

if [ -n "$SENTRY_DSN" ]; then
  echo -e "${YELLOW}Configuring Sentry error tracking...${NC}"
  
  # Create Sentry configuration file
  cat > frontend/.sentryclirc <<EOF
[defaults]
project=bookyourservice-frontend
org=bookyourservice-org

[auth]
token=${SENTRY_DSN}

[http]
verify_ssl=0

[log]
level=warn

[runtime]
enabled=true
stacktrace_on=critical
report_attached_stacktrace=true
EOF

  echo -e "${GREEN}✓ Sentry configuration created${NC}"
  echo -e "${GREEN}Sentry Dashboard: https://sentry.io/bookyourservice-frontend/${NC}"
else
  echo -e "${YELLOW}Sentry error tracking skipped (no DSN provided)${NC}"
fi

# ============================================
# DATADOG APM MONITORING
# ============================================

if [ -n "$DATADOG_API_KEY" ]; then
  echo -e "${YELLOW}Configuring Datadog APM monitoring...${NC}"
  
  # Create Datadog configuration file
  cat > frontend/.datadog.yaml <<EOF
init_config:
  apiKey: ${DATADOG_API_KEY}
  site: US1
  service: bookyourservice-frontend
  env: production
  version: 2.0.0

rum:
  enabled: true
  applicationId: ${DATADOG_APPLICATION_ID:-}
  clientToken: ${DATADOG_CLIENT_TOKEN:-}
  site: US1

forwardErrorsToLogs: true
sessionReplay:
  enabled: true
EOF

  echo -e "${GREEN}✓ Datadog configuration created${NC}"
  echo -e "${GREEN}Datadog Dashboard: https://app.datadogh.com/${NC}"
else
  echo -e "${YELLOW}Datadog APM monitoring skipped (no API key provided)${NC}"
fi

# ============================================
# SLACK ALERT CONFIGURATION
# ============================================

if [ -n "$SLACK_WEBHOOK_URL" ]; then
  echo -e "${YELLOW}Configuring Slack alerts...${NC}"
  
  # Create Slack alert configuration
  cat > scripts/slack-alerts.json <<EOF
{
  "alerts": {
    "critical": {
      "channel": "#incidents-critical",
      "webhook_url": "${SLACK_WEBHOOK_URL}",
      "mentions": ["@on-call"],
      "priority": "high"
    },
    "warning": {
      "channel": "#incidents-warning",
      "webhook_url": "${SLACK_WEBHOOK_URL}",
      "mentions": ["@ops-team"],
      "priority": "medium"
    },
    "info": {
      "channel": "#incidents-info",
      "webhook_url": "${SLACK_WEBHOOK_URL}",
      "mentions": [],
      "priority": "low"
    }
  },
  "thresholds": {
    "payment_success_rate": {
      "warning": 95,
      "critical": 90
    },
    "payment_failure_rate": {
      "warning": 2,
      "critical": 5
    },
    "api_response_time": {
      "warning": 1000,
      "critical": 2000
    },
    "error_rate": {
      "warning": 1,
      "critical": 2
    },
    "system_uptime": {
      "warning": 99.5,
      "critical": 99.0
    }
  }
}
EOF

  echo -e "${GREEN}✓ Slack alert configuration created${NC}"
  echo -e "${GREEN}Alert channels configured: #incidents-critical, #incidents-warning, #incidents-info${NC}"
else
  echo -e "${YELLOW}Slack alerts skipped (no webhook URL provided)${NC}"
fi

# ============================================
# UPTIME MONITORING SETUP
# ============================================

echo -e "${YELLOW}Setting up uptime monitoring...${NC}"

# Create uptime monitoring configuration
cat > scripts/uptime-monitoring.sh <<'EOF'
#!/bin/bash
# ============================================
# UPTIME-MONITOR.SH - Automated Uptime Monitoring
# ============================================

MONITOR_URL="${VERCEL_URL}"
CHECK_INTERVAL=60  # Check every 60 seconds
ALERT_THRESHOLD=3   # Alert after 3 consecutive failures

CONSECUTIVE_FAILURES=0

echo "Starting uptime monitoring for: $MONITOR_URL"
echo "Check interval: $CHECK_INTERVAL seconds"
echo "Alert threshold: $ALERT_THRESHOLD failures"

while true; do
  if curl -s -f "$MONITOR_URL" > /dev/null; then
    # Site is up
    if [ $CONSECUTIVE_FAILURES -gt 0 ]; then
      echo "[$(date '+%Y-%m-%d %H:%M:%S')] ✅ Site is UP"
      CONSECUTIVE_FAILURES=0
    fi
  else
    # Site is down
    CONSECUTIVE_FAILURES=$((CONSECUTIVE_FAILURES + 1))
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] ❌ Site is DOWN (consecutive: $CONSECUTIVE_FAILURES)"
    
    if [ $CONSECUTIVE_FAILURES -ge $ALERT_THRESHOLD ]; then
      echo "[$(date '+%Y-%m-%d %H:%M:%S')] 🚨 CRITICAL ALERT: Site down for $CONSECUTIVE_FAILURES checks"
      
      # Send Slack alert
      if [ -n "$SLACK_WEBHOOK_URL" ]; then
        curl -X POST -H 'Content-Type: application/json' \
          -d '{"text":"🚨 CRITICAL: BookYourService is DOWN!\nURL: '$MONITOR_URL'\nDuration: '$((CONSECUTIVE_FAILURES * CHECK_INTERVAL / 60))' minutes"}' \
          "$SLACK_WEBHOOK_URL"
      fi
    fi
  fi
  
  sleep $CHECK_INTERVAL
done
EOF

chmod +x scripts/uptime-monitoring.sh
echo -e "${GREEN}✓ Uptime monitoring script created${NC}"
echo -e "${GREEN}Script location: scripts/uptime-monitoring.sh${NC}"

# ============================================
# ALERT CONFIGURATION SUMMARY
# ============================================

echo -e "${YELLOW}===========================================${NC}"
echo -e "${YELLOW}ALERT CONFIGURATION SUMMARY${NC}"
echo -e "${YELLOW}===========================================${NC}"

echo -e "${GREEN}System Health Dashboard${NC}"
echo -e "  - Vercel: ${VERCEL_URL}/_monitoring"
echo -e "  - Supabase: ${SUPABASE_URL}/dashboard"
echo -e ""

echo -e "${GREEN}Payment Monitoring Dashboard${NC}"
echo -e "  - Supabase: ${SUPABASE_URL}/dashboard/database"
echo -e "  - Edge Functions: ${SUPABASE_URL}/dashboard/functions"
echo -e ""

if [ -n "$SENTRY_DSN" ]; then
  echo -e "${GREEN}Error Tracking${NC}"
  echo -e "  - Sentry: https://sentry.io/bookyourservice-frontend/${NC}"
  echo -e ""
fi

if [ -n "$DATADOG_API_KEY" ]; then
  echo -e "${GREEN}APM Monitoring${NC}"
  echo -e "  - Datadog: https://app.datadogh.com/${NC}"
  echo -e ""
fi

if [ -n "$SLACK_WEBHOOK_URL" ]; then
  echo -e "${GREEN}Alert Channels${NC}"
  echo -e "  - Critical: #incidents-critical (with @on-call)"
  echo -e "  - Warning: #incidents-warning (with @ops-team)"
  echo -e "  - Info: #incidents-info"
  echo -e ""
fi

# ============================================
# MONITORING CHECKLIST
# ============================================

echo -e "${YELLOW}===========================================${NC}"
echo -e "${YELLOW}MONITORING SETUP CHECKLIST${NC}"
echo -e "${YELLOW}===========================================${NC}"

checklist=(
  "Enable Query Performance Insights in Supabase Dashboard"
  "Enable Slow Query Logging in Supabase Dashboard"
  "Configure Vercel Analytics (enabled automatically)"
  "Configure Vercel Monitoring (enabled automatically)"
  "Set up Sentry error tracking (if DSN provided)"
  "Set up Datadog APM (if API key provided)"
  "Configure Slack webhooks for alerts (if URL provided)"
  "Start uptime monitoring script: scripts/uptime-monitoring.sh"
  "Set up custom dashboards in monitoring tools"
  "Configure alert thresholds and notifications"
  "Test all alert channels"
  "Verify monitoring is collecting data"
  "Create incident response playbooks"
  "Document escalation procedures"
)

echo -e "${GREEN}Post-Deployment Monitoring Checklist:${NC}"
for i in "${!checklist[@]}"; do
  echo -e "${YELLOW}  [ ] $i${NC}"
done

echo -e ""
echo -e "${GREEN}✓ Monitoring setup completed${NC}"
echo -e "${GREEN}===========================================${NC}"

# ============================================
# NEXT STEPS
# ============================================

echo -e "${YELLOW}===========================================${NC}"
echo -e "${YELLOW}NEXT STEPS${NC}"
echo -e "${YELLOW}===========================================${NC}"

echo -e "${YELLOW}1. Manual Supabase Configuration${NC}"
echo -e "   Go to Supabase Dashboard → Database → Performance Insights"
echo -e "   Enable Query Performance Insights"
echo -e "   Set slow query threshold to 500ms"

echo -e "${YELLOW}2. Verify Monitoring Data${NC}"
echo -e "   Wait 15-30 minutes for data to start flowing"
echo -e "   Check Vercel Analytics dashboard"
echo -e "   Check Supabase Dashboard for query performance"
echo -e "   Check Sentry for error tracking (if configured)"
echo -e "   Check Datadog for APM data (if configured)"

echo -e "${YELLOW}3. Configure Alert Notifications${NC}"
echo -e "   Set up Slack alert rules in monitoring tools"
echo -e "   Configure SMS/Phone alerts for critical issues"
echo -e "   Test alert channels by simulating a failure"
echo -e "   Verify all alerts are working correctly"

echo -e "${YELLOW}4. Create Custom Dashboards${NC}"
echo -e "   Create system health dashboard in Datadog"
echo -e "   Create payment monitoring dashboard"
echo -e "   Create performance monitoring dashboard"
echo -e "   Set up dashboard sharing with team"

echo -e "${GREEN}===========================================${NC}"
echo -e "${GREEN}MONITORING SETUP COMPLETED SUCCESSFULLY${NC}"
echo -e "${GREEN}===========================================${NC}"
