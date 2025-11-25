# SSH Connection to EC2 Instance

## Your EC2 Instance Details
- **Public IP**: `18.218.47.142`
- **Key Pair**: `hostly-key` (in Downloads folder)
- **AMI Type**: Linux

### Linux Username by AMI Type:
- **Ubuntu**: `ubuntu`
- **Amazon Linux 2/2023**: `ec2-user`
- **Debian**: `admin`
- **CentOS/RHEL**: `ec2-user` or `centos`
- **SUSE**: `ec2-user`

**💡 Tip**: If you're not sure which AMI you selected, try `ec2-user` first (most common for Amazon Linux), then `ubuntu` if that doesn't work.

---

## Option 1: Using PowerShell (Recommended)

### Step 1: Navigate to Downloads folder

```powershell
cd $env:USERPROFILE\Downloads
```

### Step 2: Set permissions (if using .pem file)

If your key file is `hostly-key.pem`:

```powershell
icacls hostly-key.pem /inheritance:r
icacls hostly-key.pem /grant:r "$($env:USERNAME):(R)"
```

### Step 3: Connect via SSH

**Try these commands in order** (depending on your Linux AMI):

**For Amazon Linux (most common):**
```powershell
ssh -i hostly-key.pem ec2-user@18.218.47.142
```

**For Ubuntu:**
```powershell
ssh -i hostly-key.pem ubuntu@18.218.47.142
```

**If your key file is `hostly-key` (no extension):**
```powershell
ssh -i hostly-key ec2-user@18.218.47.142
# or
ssh -i hostly-key ubuntu@18.218.47.142
```

---

## Option 2: One-Line Command (PowerShell)

**For Amazon Linux:**
```powershell
ssh -i "$env:USERPROFILE\Downloads\hostly-key.pem" ec2-user@18.218.47.142
```

**For Ubuntu:**
```powershell
ssh -i "$env:USERPROFILE\Downloads\hostly-key.pem" ubuntu@18.218.47.142
```

Or if the file has no extension:
```powershell
ssh -i "$env:USERPROFILE\Downloads\hostly-key" ec2-user@18.218.47.142
```

---

## Option 3: Using PuTTY (If you have .ppk file)

If you converted your key to `.ppk` format:

1. **Open PuTTY**
2. **Configure**:
   - **Host Name**: `ec2-user@18.218.47.142` (or `ubuntu@18.218.47.142` for Ubuntu)
   - **Port**: `22`
   - **Connection type**: SSH
3. **Go to**: Connection → SSH → Auth → Credentials
4. **Browse** and select: `C:\Users\Jenil Savalia\Downloads\hostly-key.ppk`
5. **Click "Open"**

---

## Option 4: Using AWS Systems Manager Session Manager (No SSH Key Needed)

1. **Go to EC2 Console**: https://console.aws.amazon.com/ec2/
2. **Select your instance** (with IP 18.218.47.142)
3. **Click "Connect"**
4. **Choose "Session Manager" tab**
5. **Click "Connect"**
6. A browser-based terminal will open

---

## Troubleshooting

### Issue: "Permission denied (publickey)"

**Solution 1**: Check if the key file exists
```powershell
Test-Path "$env:USERPROFILE\Downloads\hostly-key.pem"
```

**Solution 2**: Try with full path (try both usernames)
```powershell
ssh -i "C:\Users\Jenil Savalia\Downloads\hostly-key.pem" ec2-user@18.218.47.142
# or
ssh -i "C:\Users\Jenil Savalia\Downloads\hostly-key.pem" ubuntu@18.218.47.142
```

**Solution 3**: Check file extension - it might be `.pem`, `.ppk`, or no extension

### Issue: "WARNING: UNPROTECTED PRIVATE KEY FILE!"

**Solution**: Set proper permissions
```powershell
icacls "$env:USERPROFILE\Downloads\hostly-key.pem" /inheritance:r
icacls "$env:USERPROFILE\Downloads\hostly-key.pem" /grant:r "$($env:USERNAME):(R)"
```

### Issue: "Connection timed out"

**Check**:
1. Security group allows SSH (port 22) from your IP
2. Instance is running (check EC2 console)
3. Your IP address hasn't changed (update security group if needed)

### Issue: "Could not resolve hostname"

**Solution**: Make sure you're using the correct IP: `18.218.47.142`

---

## After Connecting Successfully

Once you're connected, you should see something like:
```
For Amazon Linux:
       __|  __|_  )
       _|  (     /   Amazon Linux 2023
      ___|\___|___|

[ec2-user@ip-xxx-xxx-xxx-xxx ~]$

For Ubuntu:
Welcome to Ubuntu 22.04.3 LTS...
ubuntu@ip-xxx-xxx-xxx-xxx:~$
```

Then you can proceed with:
1. Installing Docker and Docker Compose
2. Uploading your code
3. Setting up the application

See `EC2_SECURITY_GROUPS_SETUP.md` for next steps!

---

## Quick Reference

**Most likely commands** (try in this order):

**1. For Amazon Linux (try this first):**
```powershell
cd $env:USERPROFILE\Downloads
ssh -i hostly-key.pem ec2-user@18.218.47.142
```

**2. For Ubuntu (if above doesn't work):**
```powershell
cd $env:USERPROFILE\Downloads
ssh -i hostly-key.pem ubuntu@18.218.47.142
```

**If permission error occurs, run first**:
```powershell
cd $env:USERPROFILE\Downloads
icacls hostly-key.pem /inheritance:r
icacls hostly-key.pem /grant:r "$($env:USERNAME):(R)"
# Then try the SSH command again
```

