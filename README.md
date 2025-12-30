
# DoorStep Pro: Enterprise Service Platform

A comprehensive UrbanClap-style platform connecting users with local service providers for daily-life problems.

## 🚀 Key Features
- **Problem-Based Booking**: Users select from 2,000+ specific daily problems.
- **Strict Pricing Engine**: Automated billing based on system-locked base prices.
- **Multi-Role Governance**: User, Provider, and Admin dashboards.

## ☁️ GCP Deployment (Production)

This project is configured for seamless deployment to **Google Cloud Platform** using Cloud Run and Terraform.

### 1. Prerequisites
- Google Cloud SDK installed.
- Terraform installed.
- A GCP Project with billing enabled.

### 2. Infrastructure Provisioning
```bash
cd terraform
terraform init
terraform apply -var="project_id=your-project-id" -var="domain_name=doorstep-pro.com"
```

### 3. CI/CD Deployment
Pushing to the `main` branch triggers **Google Cloud Build**:
1. Builds the production Docker image.
2. Pushes to **Artifact Registry**.
3. Deploys to **Cloud Run** in the `us-central1` region.

### 4. SSL & DNS
The global load balancer reserved IP should be added to your DNS provider as an `A` record. Google will automatically provision and renew the SSL certificate once the domain points to the load balancer.

## 🛡️ Security & Compliance
- **PII Masking**: Integrated in `SecurityIntelligenceService`.
- **Audit Logs**: Forensic logging of all pricing and state changes.
- **Secrets**: Production secrets managed via GCP Secret Manager and environment variables.

---
*Developed for Enterprise Scale by DoorStep Pro Governance v6.4.*
