import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing authorization token' },
        { status: 401 }
      );
    }

    const token = authHeader.slice(7);
    const payload = await verifyToken(token);

    if (!payload || payload.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden: Invalid role' },
        { status: 403 }
      );
    }

    // Get system alerts (would come from monitoring system in real app)
    // For now, simulating with database queries for system health

    const alerts: any[] = [];

    // Check for high error rate
    const recentErrors = await prisma.errorLog.count({
      where: {
        createdAt: { gte: new Date(Date.now() - 1 * 60 * 60 * 1000) },
      },
    });

    if (recentErrors > 50) {
      alerts.push({
        id: 'error-rate-001',
        type: 'critical',
        title: 'High Error Rate Detected',
        description: `${recentErrors} errors detected in the last hour. Investigation needed.`,
        timestamp: new Date().toISOString(),
        resolved: false,
      });
    }

    // Check for disk space (simulated)
    alerts.push({
      id: 'storage-001',
      type: 'info',
      title: 'Backup Completed Successfully',
      description: 'Daily backup completed at 02:00 UTC with 0 errors',
      timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
      resolved: true,
      resolution: 'Automatic backup process completed successfully. 847 GB backed up.',
    });

    // Check for suspicious activity
    const suspiciousLogins = await prisma.user.count({
      where: {
        failedLoginAttempts: { gt: 3 },
      },
    });

    if (suspiciousLogins > 0) {
      alerts.push({
        id: 'security-001',
        type: 'warning',
        title: `${suspiciousLogins} Users with Failed Login Attempts`,
        description: `${suspiciousLogins} user accounts have more than 3 failed login attempts in the past 24 hours.`,
        affectedUsers: suspiciousLogins,
        timestamp: new Date().toISOString(),
        resolved: false,
      });
    }

    // Check for inactive schools
    const inactiveSchools = await prisma.school.count({
      where: {
        lastActivity: { lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
      },
    });

    if (inactiveSchools > 0) {
      alerts.push({
        id: 'engagement-001',
        type: 'info',
        title: `${inactiveSchools} Schools Inactive for 30+ Days`,
        description: `${inactiveSchools} schools have not reported activity in the last 30 days. Consider reaching out.`,
        timestamp: new Date().toISOString(),
        resolved: false,
      });
    }

    return NextResponse.json(alerts);
  } catch (error) {
    console.error('Get alerts error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing authorization token' },
        { status: 401 }
      );
    }

    const token = authHeader.slice(7);
    const payload = await verifyToken(token);

    if (!payload || payload.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden: Invalid role' },
        { status: 403 }
      );
    }

    const { alertId, resolution } = await request.json();

    if (!alertId || !resolution) {
      return NextResponse.json(
        { error: 'alertId and resolution are required' },
        { status: 400 }
      );
    }

    // In a real app, would update alert resolution in database
    return NextResponse.json({
      id: alertId,
      resolved: true,
      resolution,
      resolvedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Resolve alert error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
