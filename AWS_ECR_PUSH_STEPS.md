# Step-by-Step Guide: Push Docker Images to AWS ECR

**Your AWS Account ID:** `261737252607`  
**Region:** `us-east-2`

---

## Prerequisites Checklist

- [ ] AWS Account created
- [ ] ECR repositories created (hostly-frontend, hostly-backend, hostly-agent)
- [ ] Docker Desktop running
- [ ] AWS CLI installed (we'll do this below)

---

## Part 1: Install and Configure AWS CLI

### Step 1: Install AWS CLI

Open **PowerShell as Administrator** and run:

```powershell
winget install Amazon.AWSCLI
```

**Wait for installation to complete** (takes 1-2 minutes)

### Step 2: Close and Reopen PowerShell

**Important**: Close your current PowerShell window and open a **new one** so it picks up the AWS CLI installation.

### Step 3: Verify AWS CLI Installation

In the new PowerShell window, run:

```powershell
aws --version
```

**Expected output**: `aws-cli/2.x.x Python/3.x.x Windows/11 exe/AMD64`

If you see an error, try:
```powershell
# Refresh PATH
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
aws --version
```

### Step 4: Configure AWS CLI

Run this command:

```powershell
aws configure
```

You'll be prompted to enter:

1. **AWS Access Key ID**: 
   - Get this from: AWS Console → IAM → Users → Your User → Security Credentials → Create Access Key
   - Or if you already have one, enter it here
   - **Example**: `AKIAIOSFODNN7EXAMPLE`

2. **AWS Secret Access Key**:
   - This is shown only once when you create the access key
   - **Example**: `wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY`

3. **Default region name**: 
   - Enter: `us-east-2`
   - (This is your region based on your ECR URL)

4. **Default output format**: 
   - Enter: `json`
   - (Just press Enter for default)

**Example of what it looks like:**
```
AWS Access Key ID [None]: AKIAIOSFODNN7EXAMPLE
AWS Secret Access Key [None]: wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
Default region name [None]: us-east-2
Default output format [None]: json
```

### Step 5: Verify Configuration

Test your configuration:

```powershell
aws sts get-caller-identity
```

**Expected output**: Should show your account ID `261737252607` and your user details.

If you see an error, check:
- Access Key ID and Secret Access Key are correct
- You have permissions to access ECR

---

## Part 2: Login to ECR

### Step 1: Authenticate Docker with ECR

Run this command (replace with your account ID if different):

```powershell
aws ecr get-login-password --region us-east-2 | docker login --username AWS --password-stdin 261737252607.dkr.ecr.us-east-2.amazonaws.com
```

**Expected output**: `Login Succeeded`

**If you get an error:**
- Check your AWS credentials: `aws configure list`
- Verify region is correct: `us-east-2`
- Make sure Docker Desktop is running

---

## Part 3: Push Frontend Image

### Step 1: Navigate to Frontend Directory

```powershell
cd frontend
```

### Step 2: Build the Docker Image

```powershell
docker build -t hostly-frontend .
```

**Wait for build to complete** (takes 2-5 minutes)

**Expected output**: 
```
[+] Building ... 
 => => naming to docker.io/library/hostly-frontend
```

### Step 3: Tag the Image

```powershell
docker tag hostly-frontend:latest 261737252607.dkr.ecr.us-east-2.amazonaws.com/hostly-frontend:latest
```

No output expected (silent success)

### Step 4: Push to ECR

```powershell
docker push 261737252607.dkr.ecr.us-east-2.amazonaws.com/hostly-frontend:latest
```

**Wait for push to complete** (takes 3-10 minutes depending on image size)

**Expected output**:
```
The push refers to repository [261737252607.dkr.ecr.us-east-2.amazonaws.com/hostly-frontend]
...
latest: digest: sha256:... size: ...
```

### Step 5: Go Back to Root Directory

```powershell
cd ..
```

---

## Part 4: Push Backend Image

### Step 1: Navigate to Backend Directory

```powershell
cd backend
```

### Step 2: Build the Docker Image

```powershell
docker build -t hostly-backend .
```

**Wait for build to complete** (takes 3-7 minutes)

### Step 3: Tag the Image

```powershell
docker tag hostly-backend:latest 261737252607.dkr.ecr.us-east-2.amazonaws.com/hostly-backend:latest
```

### Step 4: Push to ECR

```powershell
docker push 261737252607.dkr.ecr.us-east-2.amazonaws.com/hostly-backend:latest
```

**Wait for push to complete** (takes 3-10 minutes)

### Step 5: Go Back to Root Directory

```powershell
cd ..
```

---

## Part 5: Push Agent Service Image

### Step 1: Navigate to Agent Service Directory

```powershell
cd agent-service
```

### Step 2: Build the Docker Image

```powershell
docker build -t hostly-agent .
```

**Wait for build to complete** (takes 2-5 minutes)

### Step 3: Tag the Image

```powershell
docker tag hostly-agent:latest 261737252607.dkr.ecr.us-east-2.amazonaws.com/hostly-agent:latest
```

### Step 4: Push to ECR

```powershell
docker push 261737252607.dkr.ecr.us-east-2.amazonaws.com/hostly-agent:latest
```

**Wait for push to complete** (takes 3-10 minutes)

### Step 5: Go Back to Root Directory

```powershell
cd ..
```

---

## Part 6: Verify Images in ECR

### Step 1: Check ECR Console

1. Go to **AWS Console**: https://console.aws.amazon.com/ecr/
2. Make sure you're in region **us-east-2** (check top right)
3. You should see 3 repositories:
   - `hostly-frontend`
   - `hostly-backend`
   - `hostly-agent`

### Step 2: Verify Each Repository

Click on each repository and verify:
- Image tag: `latest`
- Image size: Should show a size (e.g., 500 MB)
- Last pushed: Should show recent timestamp

### Step 3: Copy Image URIs

For each repository, **copy the Image URI** (you'll need this for ECS task definitions):

- **Frontend**: `261737252607.dkr.ecr.us-east-2.amazonaws.com/hostly-frontend:latest`
- **Backend**: `261737252607.dkr.ecr.us-east-2.amazonaws.com/hostly-backend:latest`
- **Agent**: `261737252607.dkr.ecr.us-east-2.amazonaws.com/hostly-agent:latest`

---

## Quick Reference: All Commands in One Place

**Copy and paste these commands one by one:**

```powershell
# 1. Login to ECR (do this first, only once per session)
aws ecr get-login-password --region us-east-2 | docker login --username AWS --password-stdin 261737252607.dkr.ecr.us-east-2.amazonaws.com

# 2. Frontend
cd frontend
docker build -t hostly-frontend .
docker tag hostly-frontend:latest 261737252607.dkr.ecr.us-east-2.amazonaws.com/hostly-frontend:latest
docker push 261737252607.dkr.ecr.us-east-2.amazonaws.com/hostly-frontend:latest
cd ..

# 3. Backend
cd backend
docker build -t hostly-backend .
docker tag hostly-backend:latest 261737252607.dkr.ecr.us-east-2.amazonaws.com/hostly-backend:latest
docker push 261737252607.dkr.ecr.us-east-2.amazonaws.com/hostly-backend:latest
cd ..

# 4. Agent Service
cd agent-service
docker build -t hostly-agent .
docker tag hostly-agent:latest 261737252607.dkr.ecr.us-east-2.amazonaws.com/hostly-agent:latest
docker push 261737252607.dkr.ecr.us-east-2.amazonaws.com/hostly-agent:latest
cd ..
```

---

## Troubleshooting

### Issue: "aws: command not found"

**Solution:**
1. Close and reopen PowerShell
2. Or refresh PATH:
   ```powershell
   $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
   ```
3. Verify: `aws --version`

### Issue: "Unable to locate credentials"

**Solution:**
1. Run `aws configure` again
2. Enter your Access Key ID and Secret Access Key
3. Verify: `aws sts get-caller-identity`

### Issue: "Login Succeeded" but push fails with "denied"

**Solution:**
1. Check your IAM user has ECR permissions
2. Go to IAM Console → Your User → Permissions
3. Attach policy: `AmazonEC2ContainerRegistryFullAccess`

### Issue: "docker build" fails

**Solution:**
1. Make sure Docker Desktop is running
2. Check you're in the correct directory (frontend/backend/agent-service)
3. Verify Dockerfile exists: `ls Dockerfile` (or `dir Dockerfile` on Windows)

### Issue: Push is very slow

**Solution:**
- This is normal for first push (images can be 500MB-1GB)
- Be patient, it will complete
- Check your internet connection

### Issue: "Repository does not exist"

**Solution:**
1. Go to ECR Console
2. Make sure you're in region `us-east-2`
3. Create the repository if it doesn't exist:
   - Click "Create repository"
   - Name: `hostly-frontend` (or backend/agent)
   - Visibility: Private
   - Click "Create"

---

## Next Steps

After successfully pushing all images:

1. ✅ Images are in ECR
2. ✅ Copy the Image URIs (from Part 6, Step 3)
3. ✅ Continue with ECS deployment (use the Image URIs in task definitions)
4. ✅ Follow the rest of `ECS_DEPLOYMENT_STEPS.md`

---

## Time Estimate

- **AWS CLI Setup**: 5-10 minutes
- **ECR Login**: 1 minute
- **Build & Push Frontend**: 5-15 minutes
- **Build & Push Backend**: 5-15 minutes
- **Build & Push Agent**: 5-15 minutes
- **Total**: ~30-60 minutes

---

## Important Notes

1. **Keep your Access Keys secure** - Never commit them to Git
2. **Region matters** - Make sure you're using `us-east-2` consistently
3. **Login expires** - If push fails after a while, re-run the login command
4. **Image sizes** - First push takes longer, subsequent pushes are faster (only changed layers)

---

**You're all set! Follow these steps and your images will be in ECR! 🚀**

