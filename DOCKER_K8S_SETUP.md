# Docker & Kubernetes Setup Guide for Hostly

This guide provides instructions for containerizing and deploying the Hostly application using Docker and Kubernetes.

## 📋 Prerequisites

- Docker Desktop (or Docker Engine + Docker Compose)
- Kubernetes cluster (Minikube, Docker Desktop Kubernetes, or cloud provider)
- kubectl configured to access your cluster
- Docker images built and available (or use a container registry)

## 🐳 Part 1: Docker Setup

### Building Docker Images

Build images for all services:

```bash
# Build Backend image
cd backend
docker build -t hostly-backend:latest .

# Build Frontend image
cd ../frontend
docker build -t hostly-frontend:latest .

# Build Agent Service image
cd ../agent-service
docker build -t hostly-agent:latest .
```

### Using Docker Compose (Local Development)

1. **Create `.env` file** in the root directory:
```env
DB_PASSWORD=your_mysql_password
DB_NAME=hostly
DB_USER=root
SESSION_SECRET=your-super-secret-session-key-here
OPENAI_API_KEY=your_openai_api_key
TAVILY_API_KEY=your_tavily_api_key
```

2. **Start all services**:
```bash
docker-compose up -d
```

3. **View logs**:
```bash
docker-compose logs -f
```

4. **Stop services**:
```bash
docker-compose down
```

5. **Stop and remove volumes**:
```bash
docker-compose down -v
```

### Services in Docker Compose

- **MySQL**: Port 3306
- **Backend**: Port 3000
- **Agent Service**: Port 8000
- **Frontend**: Port 5173 (mapped to nginx port 80)

## ☸️ Part 2: Kubernetes Deployment

### Step 1: Build and Push Images to Registry

**Option A: Using Docker Hub**
```bash
# Tag images
docker tag hostly-backend:latest yourusername/hostly-backend:latest
docker tag hostly-frontend:latest yourusername/hostly-frontend:latest
docker tag hostly-agent:latest yourusername/hostly-agent:latest

# Push to Docker Hub
docker push yourusername/hostly-backend:latest
docker push yourusername/hostly-frontend:latest
docker push yourusername/hostly-agent:latest
```

**Option B: Using Local Registry (Minikube)**
```bash
# Enable Minikube registry
minikube addons enable registry

# Build images directly in Minikube
eval $(minikube docker-env)
docker build -t hostly-backend:latest ./backend
docker build -t hostly-frontend:latest ./frontend
docker build -t hostly-agent:latest ./agent-service
```

**Option C: Using Kind (Kubernetes in Docker)**
```bash
kind load docker-image hostly-backend:latest
kind load docker-image hostly-frontend:latest
kind load docker-image hostly-agent:latest
```

### Step 2: Update Image References

Update the deployment files in `k8s/` directory to use your image registry:

```yaml
# In backend-deployment.yaml, agent-deployment.yaml, frontend-deployment.yaml
image: yourusername/hostly-backend:latest
# OR for local: image: hostly-backend:latest
```

### Step 3: Create Secrets

**Create secrets manually** (recommended for production):
```bash
kubectl create namespace hostly

kubectl create secret generic hostly-secrets \
  --from-literal=DB_PASSWORD='your-mysql-password' \
  --from-literal=SESSION_SECRET='your-session-secret' \
  --from-literal=OPENAI_API_KEY='your-openai-key' \
  --from-literal=TAVILY_API_KEY='your-tavily-key' \
  -n hostly
```

**OR apply the secrets.yaml** (update values first):
```bash
kubectl apply -f k8s/secrets.yaml
```

### Step 4: Deploy to Kubernetes

**Option A: Using kubectl (apply all manifests)**
```bash
# Apply all resources
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secrets.yaml
kubectl apply -f k8s/mysql-deployment.yaml
kubectl apply -f k8s/backend-deployment.yaml
kubectl apply -f k8s/agent-deployment.yaml
kubectl apply -f k8s/frontend-deployment.yaml
kubectl apply -f k8s/ingress.yaml
```

**Option B: Using kustomize**
```bash
kubectl apply -k k8s/
```

### Step 5: Verify Deployment

```bash
# Check all pods
kubectl get pods -n hostly

# Check services
kubectl get svc -n hostly

# Check deployments
kubectl get deployments -n hostly

# View logs
kubectl logs -f deployment/backend -n hostly
kubectl logs -f deployment/agent-service -n hostly
kubectl logs -f deployment/frontend -n hostly
```

### Step 6: Access the Application

**With Ingress (if configured)**:
```bash
# Add to /etc/hosts (or C:\Windows\System32\drivers\etc\hosts on Windows)
# For Minikube:
minikube ip
# Add: <minikube-ip> hostly.local

# Access at: http://hostly.local
```

**Port Forwarding (for testing)**:
```bash
# Frontend
kubectl port-forward svc/frontend 5173:80 -n hostly

# Backend
kubectl port-forward svc/backend 3000:3000 -n hostly

# Agent Service
kubectl port-forward svc/agent-service 8000:8000 -n hostly
```

## 🔧 Service Communication

Services communicate using Kubernetes service names:
- Backend → MySQL: `mysql:3306`
- Backend → Agent Service: `agent-service:8000`
- Frontend → Backend: `backend:3000`
- Agent Service → MySQL: `mysql:3306`

## 📊 Scaling

Scale services horizontally:

```bash
# Scale backend to 3 replicas
kubectl scale deployment backend --replicas=3 -n hostly

# Scale agent service to 3 replicas
kubectl scale deployment agent-service --replicas=3 -n hostly

# Scale frontend to 3 replicas
kubectl scale deployment frontend --replicas=3 -n hostly
```

## 🔍 Monitoring & Debugging

```bash
# Describe a pod
kubectl describe pod <pod-name> -n hostly

# Get pod events
kubectl get events -n hostly --sort-by='.lastTimestamp'

# Execute commands in pod
kubectl exec -it <pod-name> -n hostly -- /bin/sh

# View pod logs
kubectl logs <pod-name> -n hostly --tail=100 -f
```

## 🗑️ Cleanup

```bash
# Delete all resources
kubectl delete namespace hostly

# OR delete individually
kubectl delete -f k8s/
```

## 📝 Production Considerations

1. **Use PersistentVolumes** for MySQL data (already configured)
2. **Use Secrets Management**: Consider using external-secrets or sealed-secrets
3. **Resource Limits**: Adjust CPU/memory limits based on your cluster
4. **Health Checks**: All services have liveness and readiness probes
5. **TLS/HTTPS**: Configure TLS certificates in Ingress for production
6. **Image Registry**: Use a private registry for production images
7. **Monitoring**: Add Prometheus/Grafana for monitoring
8. **Logging**: Consider centralized logging (ELK, Loki, etc.)

## 🚀 Quick Start Commands

```bash
# Build all images
docker build -t hostly-backend:latest ./backend
docker build -t hostly-frontend:latest ./frontend
docker build -t hostly-agent:latest ./agent-service

# Deploy to Kubernetes
kubectl apply -k k8s/

# Check status
kubectl get all -n hostly

# Access via port-forward
kubectl port-forward svc/frontend 5173:80 -n hostly &
kubectl port-forward svc/backend 3000:3000 -n hostly &
kubectl port-forward svc/agent-service 8000:8000 -n hostly &
```

## 📚 Additional Resources

- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [Docker Documentation](https://docs.docker.com/)
- [Kubernetes Service Discovery](https://kubernetes.io/docs/concepts/services-networking/service/)

