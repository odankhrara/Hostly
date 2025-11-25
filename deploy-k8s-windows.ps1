# Kubernetes Deployment Script for Windows
# Run this script once Kubernetes in Docker Desktop is ready

Write-Host "☸️  Deploying Hostly to Kubernetes..." -ForegroundColor Cyan
Write-Host ""

# Check if kubectl is available
if (-not (Get-Command kubectl -ErrorAction SilentlyContinue)) {
    Write-Host " Error: kubectl is not installed" -ForegroundColor Red
    exit 1
}

# Check if Kubernetes cluster is accessible
Write-Host "Checking Kubernetes cluster..." -ForegroundColor Yellow
try {
    $nodes = kubectl get nodes 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Kubernetes cluster is not ready yet!" -ForegroundColor Red
        Write-Host "Please wait for Kubernetes to finish starting in Docker Desktop." -ForegroundColor Yellow
        Write-Host "Check Docker Desktop → Settings → Kubernetes (should show green 'Running' indicator)" -ForegroundColor Yellow
        exit 1
    }
    Write-Host "✅ Kubernetes cluster is ready!" -ForegroundColor Green
    kubectl get nodes
    Write-Host ""
} catch {
    Write-Host "❌ Cannot connect to Kubernetes cluster" -ForegroundColor Red
    exit 1
}

# Check if .env file exists
$envFile = ".env"
if (-not (Test-Path $envFile)) {
    Write-Host "⚠️  Warning: .env file not found" -ForegroundColor Yellow
    Write-Host "You'll need to create secrets manually or update k8s/secrets.yaml" -ForegroundColor Yellow
    Write-Host ""
} else {
    Write-Host "✅ Found .env file" -ForegroundColor Green
}

# Navigate to k8s directory
$k8sDir = "k8s"
if (-not (Test-Path $k8sDir)) {
    Write-Host "❌ Error: k8s directory not found" -ForegroundColor Red
    exit 1
}

Set-Location $k8sDir

# Step 1: Create Namespace
Write-Host "📦 Creating namespace..." -ForegroundColor Blue
kubectl apply -f namespace.yaml
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to create namespace" -ForegroundColor Red
    exit 1
}

# Step 2: Create ConfigMap
Write-Host "⚙️  Creating ConfigMap..." -ForegroundColor Blue
kubectl apply -f configmap.yaml
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to create ConfigMap" -ForegroundColor Red
    exit 1
}

# Step 3: Create Secrets from .env file
Write-Host "🔐 Creating Secrets..." -ForegroundColor Blue
Set-Location ..

if (Test-Path $envFile) {
    # Read .env file
    $envContent = Get-Content $envFile
    
    # Extract values
    $dbPassword = ($envContent | Select-String "DB_PASSWORD=" | ForEach-Object { $_.Line.Split('=')[1] }).Trim()
    $sessionSecret = ($envContent | Select-String "SESSION_SECRET=" | ForEach-Object { $_.Line.Split('=')[1] }).Trim()
    $openaiKey = ($envContent | Select-String "OPENAI_API_KEY=" | ForEach-Object { $_.Line.Split('=')[1] }).Trim()
    $tavilyKey = ($envContent | Select-String "TAVILY_API_KEY=" | ForEach-Object { $_.Line.Split('=')[1] }).Trim()
    
    # Create secret using kubectl
    $secretArgs = @(
        "create", "secret", "generic", "hostly-secrets",
        "--from-literal=DB_PASSWORD=$dbPassword",
        "--from-literal=SESSION_SECRET=$sessionSecret",
        "--from-literal=OPENAI_API_KEY=$openaiKey",
        "--from-literal=TAVILY_API_KEY=$tavilyKey",
        "-n", "hostly",
        "--dry-run=client", "-o", "yaml"
    )
    
    $secretYaml = kubectl @secretArgs
    
    # Apply the secret (or update if exists)
    $secretYaml | kubectl apply -f -
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Secrets created from .env file" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Could not create secrets from .env, using secrets.yaml instead" -ForegroundColor Yellow
        Set-Location $k8sDir
        kubectl apply -f secrets.yaml
    }
} else {
    Write-Host "⚠️  No .env file found, using secrets.yaml (you may need to update it)" -ForegroundColor Yellow
    Set-Location $k8sDir
    kubectl apply -f secrets.yaml
}

Set-Location $k8sDir

# Step 4: Deploy MySQL
Write-Host "🗄️  Deploying MySQL..." -ForegroundColor Blue
kubectl apply -f mysql-deployment.yaml
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to deploy MySQL" -ForegroundColor Red
    exit 1
}

# Step 5: Wait for MySQL to be ready
Write-Host "⏳ Waiting for MySQL to be ready..." -ForegroundColor Yellow
kubectl wait --for=condition=ready pod -l app=mysql -n hostly --timeout=120s
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  MySQL may not be ready yet, but continuing..." -ForegroundColor Yellow
}

# Step 6: Deploy Backend
Write-Host "🚀 Deploying Backend..." -ForegroundColor Blue
kubectl apply -f backend-deployment.yaml
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to deploy Backend" -ForegroundColor Red
    exit 1
}

# Step 7: Deploy Agent Service
Write-Host "🤖 Deploying Agent Service..." -ForegroundColor Blue
kubectl apply -f agent-deployment.yaml
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to deploy Agent Service" -ForegroundColor Red
    exit 1
}

# Step 8: Deploy Frontend
Write-Host "🌐 Deploying Frontend..." -ForegroundColor Blue
kubectl apply -f frontend-deployment.yaml
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to deploy Frontend" -ForegroundColor Red
    exit 1
}

# Step 9: Deploy HPA (Horizontal Pod Autoscalers)
Write-Host "📈 Deploying HPA..." -ForegroundColor Blue
kubectl apply -f hpa.yaml
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  HPA deployment failed (metrics-server may not be installed)" -ForegroundColor Yellow
}

# Step 10: Deploy Ingress (optional)
Write-Host "🔀 Deploying Ingress..." -ForegroundColor Blue
kubectl apply -f ingress.yaml
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  Ingress deployment failed (ingress controller may not be installed)" -ForegroundColor Yellow
}

Set-Location ..

Write-Host ""
Write-Host "✅ Deployment complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📊 Check status with:" -ForegroundColor Cyan
Write-Host "  kubectl get all -n hostly" -ForegroundColor White
Write-Host ""
Write-Host "📝 View logs with:" -ForegroundColor Cyan
Write-Host "  kubectl logs -f deployment/backend -n hostly" -ForegroundColor White
Write-Host "  kubectl logs -f deployment/agent-service -n hostly" -ForegroundColor White
Write-Host "  kubectl logs -f deployment/frontend -n hostly" -ForegroundColor White
Write-Host ""
Write-Host "🔌 Port forward to access services:" -ForegroundColor Cyan
Write-Host "  kubectl port-forward svc/frontend 5173:80 -n hostly" -ForegroundColor White
Write-Host "  kubectl port-forward svc/backend 3000:3000 -n hostly" -ForegroundColor White
Write-Host "  kubectl port-forward svc/agent-service 8000:8000 -n hostly" -ForegroundColor White
Write-Host ""

