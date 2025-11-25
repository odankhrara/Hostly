#!/usr/bin/env python3
"""
Analyze JMeter test results and generate comparison graphs
"""

import os
import csv
import json
import glob
from pathlib import Path
import matplotlib.pyplot as plt
import numpy as np

def parse_jtl_file(jtl_path):
    """Parse JMeter JTL file and extract metrics"""
    metrics = {
        'total_requests': 0,
        'successful': 0,
        'failed': 0,
        'response_times': [],
        'error_rate': 0,
        'throughput': 0
    }
    
    try:
        with open(jtl_path, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                metrics['total_requests'] += 1
                
                if row.get('success', '').lower() == 'true':
                    metrics['successful'] += 1
                    if 'elapsed' in row:
                        try:
                            metrics['response_times'].append(int(row['elapsed']))
                        except:
                            pass
                else:
                    metrics['failed'] += 1
        
        if metrics['total_requests'] > 0:
            metrics['error_rate'] = (metrics['failed'] / metrics['total_requests']) * 100
        
        # Calculate average response time
        if metrics['response_times']:
            metrics['avg_response_time'] = np.mean(metrics['response_times'])
            metrics['min_response_time'] = np.min(metrics['response_times'])
            metrics['max_response_time'] = np.max(metrics['response_times'])
            metrics['p95_response_time'] = np.percentile(metrics['response_times'], 95)
            metrics['p99_response_time'] = np.percentile(metrics['response_times'], 99)
        else:
            metrics['avg_response_time'] = 0
            metrics['min_response_time'] = 0
            metrics['max_response_time'] = 0
            metrics['p95_response_time'] = 0
            metrics['p99_response_time'] = 0
        
    except Exception as e:
        print(f"Error parsing {jtl_path}: {e}")
    
    return metrics

def extract_user_count(filename):
    """Extract user count from filename"""
    import re
    match = re.search(r'(\d+)-users', filename)
    return int(match.group(1)) if match else 0

def generate_comparison_report():
    """Generate comparison graphs and report"""
    
    results_dir = Path(__file__).parent.parent / 'results'
    reports_dir = Path(__file__).parent.parent / 'reports'
    
    # Find all JTL files
    jtl_files = list(results_dir.glob('*.jtl'))
    
    if not jtl_files:
        print("No JTL files found in results directory")
        return
    
    # Parse all results
    all_results = []
    for jtl_file in jtl_files:
        user_count = extract_user_count(jtl_file.name)
        metrics = parse_jtl_file(jtl_file)
        metrics['users'] = user_count
        metrics['filename'] = jtl_file.name
        all_results.append(metrics)
    
    # Sort by user count
    all_results.sort(key=lambda x: x['users'])
    
    # Extract data for graphs
    user_counts = [r['users'] for r in all_results]
    avg_response_times = [r.get('avg_response_time', 0) for r in all_results]
    error_rates = [r.get('error_rate', 0) for r in all_results]
    throughputs = [r.get('throughput', 0) for r in all_results]
    
    # Create comparison graphs
    fig, axes = plt.subplots(2, 2, figsize=(15, 10))
    fig.suptitle('JMeter Performance Test Results - Comparison', fontsize=16, fontweight='bold')
    
    # Graph 1: Average Response Time
    axes[0, 0].plot(user_counts, avg_response_times, marker='o', linewidth=2, markersize=8, color='#2E86AB')
    axes[0, 0].set_title('Average Response Time vs Concurrent Users', fontweight='bold')
    axes[0, 0].set_xlabel('Concurrent Users')
    axes[0, 0].set_ylabel('Response Time (ms)')
    axes[0, 0].grid(True, alpha=0.3)
    axes[0, 0].set_xticks(user_counts)
    
    # Graph 2: Error Rate
    axes[0, 1].bar(user_counts, error_rates, color='#A23B72', alpha=0.7)
    axes[0, 1].set_title('Error Rate vs Concurrent Users', fontweight='bold')
    axes[0, 1].set_xlabel('Concurrent Users')
    axes[0, 1].set_ylabel('Error Rate (%)')
    axes[0, 1].grid(True, alpha=0.3, axis='y')
    axes[0, 1].set_xticks(user_counts)
    
    # Graph 3: Throughput
    axes[1, 0].plot(user_counts, throughputs, marker='s', linewidth=2, markersize=8, color='#F18F01')
    axes[1, 0].set_title('Throughput vs Concurrent Users', fontweight='bold')
    axes[1, 0].set_xlabel('Concurrent Users')
    axes[1, 0].set_ylabel('Requests/Second')
    axes[1, 0].grid(True, alpha=0.3)
    axes[1, 0].set_xticks(user_counts)
    
    # Graph 4: Success vs Failed Requests
    success_counts = [r['successful'] for r in all_results]
    failed_counts = [r['failed'] for r in all_results]
    x = np.arange(len(user_counts))
    width = 0.35
    axes[1, 1].bar(x - width/2, success_counts, width, label='Successful', color='#06A77D', alpha=0.7)
    axes[1, 1].bar(x + width/2, failed_counts, width, label='Failed', color='#D00000', alpha=0.7)
    axes[1, 1].set_title('Successful vs Failed Requests', fontweight='bold')
    axes[1, 1].set_xlabel('Concurrent Users')
    axes[1, 1].set_ylabel('Number of Requests')
    axes[1, 1].set_xticks(x)
    axes[1, 1].set_xticklabels(user_counts)
    axes[1, 1].legend()
    axes[1, 1].grid(True, alpha=0.3, axis='y')
    
    plt.tight_layout()
    
    # Save graph
    output_file = reports_dir / 'performance-comparison.png'
    plt.savefig(output_file, dpi=300, bbox_inches='tight')
    print(f"✓ Comparison graph saved: {output_file}")
    
    # Generate text report
    report_file = reports_dir / 'performance-analysis.txt'
    with open(report_file, 'w') as f:
        f.write("═══════════════════════════════════════════════════════════\n")
        f.write("        JMeter Performance Test Analysis Report\n")
        f.write("═══════════════════════════════════════════════════════════\n\n")
        
        for result in all_results:
            f.write(f"Test with {result['users']} Concurrent Users:\n")
            f.write(f"  Total Requests: {result['total_requests']}\n")
            f.write(f"  Successful: {result['successful']}\n")
            f.write(f"  Failed: {result['failed']}\n")
            f.write(f"  Error Rate: {result['error_rate']:.2f}%\n")
            f.write(f"  Avg Response Time: {result.get('avg_response_time', 0):.2f} ms\n")
            f.write(f"  Min Response Time: {result.get('min_response_time', 0):.2f} ms\n")
            f.write(f"  Max Response Time: {result.get('max_response_time', 0):.2f} ms\n")
            f.write(f"  P95 Response Time: {result.get('p95_response_time', 0):.2f} ms\n")
            f.write(f"  P99 Response Time: {result.get('p99_response_time', 0):.2f} ms\n")
            f.write("\n")
        
        f.write("\n═══════════════════════════════════════════════════════════\n")
        f.write("                    ANALYSIS\n")
        f.write("═══════════════════════════════════════════════════════════\n\n")
        
        # Analysis
        f.write("Key Findings:\n")
        f.write("1. Response Time Analysis:\n")
        if len(avg_response_times) > 1:
            if avg_response_times[-1] > avg_response_times[0] * 2:
                f.write("   - Response time increases significantly with more users\n")
                f.write("   - Possible bottleneck: Database or backend processing\n")
            else:
                f.write("   - Response time remains relatively stable\n")
        
        f.write("\n2. Error Rate Analysis:\n")
        max_error = max(error_rates)
        if max_error > 5:
            f.write(f"   - High error rate ({max_error:.2f}%) indicates system stress\n")
            f.write("   - Consider optimizing database queries or increasing resources\n")
        else:
            f.write("   - Error rates are within acceptable range\n")
        
        f.write("\n3. Recommendations:\n")
        f.write("   - Monitor database connection pool size\n")
        f.write("   - Consider implementing caching for frequently accessed data\n")
        f.write("   - Review and optimize slow database queries\n")
        f.write("   - Consider horizontal scaling for high traffic scenarios\n")
    
    print(f"✓ Analysis report saved: {report_file}")
    print(f"\nOpen the graph: {output_file}")

if __name__ == '__main__':
    try:
        generate_comparison_report()
    except ImportError:
        print("Error: matplotlib is required. Install it with: pip install matplotlib numpy")
    except Exception as e:
        print(f"Error: {e}")

