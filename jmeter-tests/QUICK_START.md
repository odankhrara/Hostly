# JMeter Quick Start Guide

## 🚀 Simple 3-Step Process

### Step 1: Install JMeter (if needed)
Download from: https://jmeter.apache.org/download_jmeter.cgi
Extract to: `C:\apache-jmeter-5.6.3` (or any location)

### Step 2: Set JMETER_HOME
```powershell
$env:JMETER_HOME = "C:\apache-jmeter-5.6.3"
```

### Step 3: Run Tests
```powershell
cd jmeter-tests\scripts
.\run-all-tests.ps1
```

That's it! Results will be in `jmeter-tests\reports\`

## 📊 What Gets Tested

1. **User Authentication** - Login API
2. **Property Data Fetching** - Search properties API  
3. **Booking Processing** - Create booking API

## 📈 Test Loads

- 100 concurrent users
- 200 concurrent users
- 300 concurrent users
- 400 concurrent users
- 500 concurrent users

## 📁 Results

After running, you'll get:
- HTML reports with graphs
- Comparison analysis
- Performance metrics

Open `jmeter-tests\reports\report-{users}-users-{timestamp}\index.html` in browser to view results.

