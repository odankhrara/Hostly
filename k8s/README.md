# Kubernetes Deployment Manifests

This directory contains all Kubernetes manifests for deploying the Hostly application.

## 📁 File Structure

- `namespace.yaml` - Creates the `hostly` namespace
- `configmap.yaml` - Non-sensitive configuration
- `secrets.yaml` - Sensitive data (passwords, API keys)
- `mysql-deployment.yaml` - MySQL database deployment and service
- `backend-deployment.yaml` - Backend API deployment and service
- `agent-deployment.yaml` - AI Agent service deployment and service
- `frontend-deployment.yaml` - Frontend web application deployment and service
- `ingress.yaml` - Ingress controller configuration
- `hpa.yaml` - Horizontal Pod Autoscalers for auto-scaling
- `kustomization.yaml` - Kustomize configuration

## 🚀 Quick Deploy

```bash
# Apply all resources
kubectl apply -k .

# Or apply individually
kubectl apply -f namespace.yaml
kubectl apply -f configmap.yaml
kubectl apply -f secrets.yaml
kubectl apply -f mysql-deployment.yaml
kubectl apply -f backend-deployment.yaml
kubectl apply -f agent-deployment.yaml
kubectl apply -f frontend-deployment.yaml
kubectl apply -f ingress.yaml
kubectl apply -f hpa.yaml
```

## ⚙️ Configuration

### Before Deploying

1. **Update Secrets**: Edit `secrets.yaml` with your actual values:
   - `DB_PASSWORD`: MySQL root password
   - `SESSION_SECRET`: Session encryption key
   - `OPENAI_API_KEY`: OpenAI/Groq API key
   - `TAVILY_API_KEY`: Tavily API key (optional)

2. **Update Image Names**: In deployment files, update image references:
   ```yaml
   image: your-registry/hostly-backend:latest
   ```

3. **Update ConfigMap**: Adjust `configmap.yaml` if needed for your environment

## 📊 Service Architecture

```
Internet
   ↓
Ingress (hostly.local)
   ├── / → Frontend Service (2+ replicas)
   ├── /api → Backend Service (2+ replicas)
   └── /agent → Agent Service (2+ replicas)
   
Backend Service → MySQL Service
Agent Service → MySQL Service
Frontend → Backend Service (via API)
```

## 🔍 Service Discovery

Services communicate using Kubernetes DNS:
- `mysql:3306` - MySQL database
- `backend:3000` - Backend API
- `agent-service:8000` - AI Agent service
- `frontend:80` - Frontend web app

## 📈 Scaling

Services are configured with:
- **Initial Replicas**: 2 for each service
- **HPA**: Auto-scaling based on CPU/Memory
- **Resource Limits**: Defined for each container

Scale manually:
```bash
kubectl scale deployment backend --replicas=5 -n hostly
```

## 🔐 Security Notes

- Secrets are stored in Kubernetes Secrets (base64 encoded)
- For production, use:
  - External Secrets Operator
  - Sealed Secrets
  - Cloud provider secret management (AWS Secrets Manager, GCP Secret Manager, etc.)

## 📝 Production Checklist

- [ ] Update all secrets with production values
- [ ] Use private container registry
- [ ] Configure TLS/HTTPS in Ingress
- [ ] Set up persistent volumes for uploads
- [ ] Configure resource limits appropriately
- [ ] Set up monitoring (Prometheus/Grafana)
- [ ] Set up logging (ELK/Loki)
- [ ] Configure backup for MySQL
- [ ] Set up network policies
- [ ] Review and adjust HPA settings

