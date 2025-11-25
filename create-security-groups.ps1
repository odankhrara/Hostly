# PowerShell script to create security groups for Hostly EC2 deployment
# Usage: .\create-security-groups.ps1 -VpcId <VPC_ID> -YourIp <YOUR_IP>

param(
    [Parameter(Mandatory=$true)]
    [string]$VpcId,
    
    [Parameter(Mandatory=$false)]
    [string]$YourIp = "76.102.15.113/32"
)

Write-Host "Creating security groups for Hostly deployment..." -ForegroundColor Green
Write-Host "VPC ID: $VpcId"
Write-Host "Your IP: $YourIp"
Write-Host ""

# Create Security Group 1: Application Services
Write-Host "Creating hostly-app-sg (Application Services)..." -ForegroundColor Yellow

$appSgParams = @{
    GroupName = "hostly-app-sg"
    Description = "Security group for Hostly application services (Frontend, Backend, Agent)"
    VpcId = $VpcId
}

$appSg = New-EC2SecurityGroup @appSgParams
$appSgId = $appSg.GroupId

Write-Host "Created security group: $appSgId"

# Add rules to Application Security Group
Write-Host "Adding inbound rules to hostly-app-sg..."

# SSH Rule
Grant-EC2SecurityGroupIngress -GroupId $appSgId -IpPermission @{
    IpProtocol = "tcp"
    FromPort = 22
    ToPort = 22
    IpRanges = @(
        @{
            CidrIp = $YourIp
            Description = "SSH"
        }
    )
} | Out-Null

# Backend Rule
Grant-EC2SecurityGroupIngress -GroupId $appSgId -IpPermission @{
    IpProtocol = "tcp"
    FromPort = 3000
    ToPort = 3000
    IpRanges = @(
        @{
            CidrIp = "0.0.0.0/0"
            Description = "Backend"
        }
    )
} | Out-Null

# Frontend Rule
Grant-EC2SecurityGroupIngress -GroupId $appSgId -IpPermission @{
    IpProtocol = "tcp"
    FromPort = 5173
    ToPort = 5173
    IpRanges = @(
        @{
            CidrIp = "0.0.0.0/0"
            Description = "Frontend"
        }
    )
} | Out-Null

# Agent Service Rule
Grant-EC2SecurityGroupIngress -GroupId $appSgId -IpPermission @{
    IpProtocol = "tcp"
    FromPort = 8000
    ToPort = 8000
    IpRanges = @(
        @{
            CidrIp = "0.0.0.0/0"
            Description = "agent"
        }
    )
} | Out-Null

Write-Host "✓ Application security group created: $appSgId" -ForegroundColor Green
Write-Host ""

# Create Security Group 2: Database & Infrastructure
Write-Host "Creating hostly-db-sg (Database & Infrastructure)..." -ForegroundColor Yellow

$dbSgParams = @{
    GroupName = "hostly-db-sg"
    Description = "Security group for Hostly database and infrastructure services"
    VpcId = $VpcId
}

$dbSg = New-EC2SecurityGroup @dbSgParams
$dbSgId = $dbSg.GroupId

Write-Host "Created security group: $dbSgId"

# Add rules to Database Security Group
Write-Host "Adding inbound rules to hostly-db-sg..."

# MongoDB Rule
Grant-EC2SecurityGroupIngress -GroupId $dbSgId -IpPermission @{
    IpProtocol = "tcp"
    FromPort = 27017
    ToPort = 27017
    IpRanges = @(
        @{
            CidrIp = "0.0.0.0/0"
            Description = "mongodb"
        }
    )
} | Out-Null

# Kafka Rule
Grant-EC2SecurityGroupIngress -GroupId $dbSgId -IpPermission @{
    IpProtocol = "tcp"
    FromPort = 9092
    ToPort = 9092
    IpRanges = @(
        @{
            CidrIp = "0.0.0.0/0"
            Description = "kafka"
        }
    )
} | Out-Null

# Mongo Express Rule
Grant-EC2SecurityGroupIngress -GroupId $dbSgId -IpPermission @{
    IpProtocol = "tcp"
    FromPort = 8081
    ToPort = 8081
    IpRanges = @(
        @{
            CidrIp = "0.0.0.0/0"
            Description = "mongo-express"
        }
    )
} | Out-Null

# Zookeeper Rule
Grant-EC2SecurityGroupIngress -GroupId $dbSgId -IpPermission @{
    IpProtocol = "tcp"
    FromPort = 2181
    ToPort = 2181
    IpRanges = @(
        @{
            CidrIp = "0.0.0.0/0"
            Description = "zookeeper"
        }
    )
} | Out-Null

Write-Host "✓ Database security group created: $dbSgId" -ForegroundColor Green
Write-Host ""

# Summary
Write-Host "========================================" -ForegroundColor Green
Write-Host "Security Groups Created Successfully!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Application Security Group (hostly-app-sg):"
Write-Host "  ID: $appSgId"
Write-Host "  Rules: SSH (22), Backend (3000), Frontend (5173), Agent (8000)"
Write-Host ""
Write-Host "Database Security Group (hostly-db-sg):"
Write-Host "  ID: $dbSgId"
Write-Host "  Rules: MongoDB (27017), Kafka (9092), Mongo Express (8081), Zookeeper (2181)"
Write-Host ""
Write-Host "Next steps:"
Write-Host "  1. Launch EC2 instance and attach both security groups"
Write-Host "  2. Use these security group IDs when launching your instance"
Write-Host ""
Write-Host "To find your default VPC ID:"
Write-Host '  (Get-EC2Vpc -Filter @{Name="isDefault";Values="true"}).VpcId'
Write-Host ""

