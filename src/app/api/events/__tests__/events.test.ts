import { NextRequest } from 'next/server';
import { GET as getEvents } from '../route';
import { GET as getEventDetail } from '../[id]/route';
import { POST as registerEvent } from '../[id]/register/route';
import { GET as getMyRegistrations } from '../my-registrations/route';
import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

// Mock dependencies
jest.mock('@/lib/auth');
jest.mock('@/lib/prisma');
jest.mock('@/lib/email-service');

describe('Events API Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/events - List Events', () => {
    it('should fetch published events successfully', async () => {
      const mockEvents = [
        {
          id: 'evt_1',
          title: 'Python Workshop',
          description: 'Learn Python',
          eventType: 'WORKSHOP',
          eventDate: new Date('2025-12-20'),
          startTime: '10:00',
          endTime: '12:00',
          venue: 'Tech Center',
          location: 'NYC',
          capacity: 30,
          currentAttendees: 15,
          image: 'https://example.com/image.jpg',
          createdBy: { firstName: 'John', lastName: 'Doe' },
          createdAt: new Date(),
          registrations: [],
          _count: { registrations: 15 },
          isPublished: true,
          isCancelled: false,
        },
      ];

      (prisma.event.findMany as jest.Mock).mockResolvedValue(mockEvents);

      const request = new NextRequest('http://localhost:3000/api/events?limit=10');
      const response = await getEvents(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toHaveLength(1);
      expect(data.data[0].title).toBe('Python Workshop');
    });

    it('should filter events by eventType', async () => {
      const mockEvent = {
        id: 'evt_1',
        title: 'Python Workshop',
        eventType: 'WORKSHOP',
        _count: { registrations: 5 },
        createdBy: { firstName: 'John', lastName: 'Doe' },
        registrations: [],
      };

      (prisma.event.findMany as jest.Mock).mockResolvedValue([mockEvent]);

      const request = new NextRequest(
        'http://localhost:3000/api/events?eventType=WORKSHOP'
      );
      const response = await getEvents(request);
      const data = await response.json();

      expect(data.success).toBe(true);
      expect((prisma.event.findMany as jest.Mock)).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            eventType: 'WORKSHOP',
          }),
        })
      );
    });

    it('should return only upcoming events by default', async () => {
      (prisma.event.findMany as jest.Mock).mockResolvedValue([]);

      const request = new NextRequest('http://localhost:3000/api/events');
      await getEvents(request);

      const callArgs = (prisma.event.findMany as jest.Mock).mock.calls[0][0];
      expect(callArgs.where).toHaveProperty(
        'eventDate.gte'
      );
    });

    it('should include past events when requested', async () => {
      (prisma.event.findMany as jest.Mock).mockResolvedValue([]);

      const request = new NextRequest(
        'http://localhost:3000/api/events?includePast=true'
      );
      await getEvents(request);

      const callArgs = (prisma.event.findMany as jest.Mock).mock.calls[0][0];
      expect(callArgs.where.eventDate).toBeUndefined();
    });

    it('should handle database errors', async () => {
      (prisma.event.findMany as jest.Mock).mockRejectedValue(
        new Error('Database connection failed')
      );

      const request = new NextRequest('http://localhost:3000/api/events');
      const response = await getEvents(request);

      expect(response.status).toBe(500);
    });
  });

  describe('GET /api/events/[id] - Get Event Details', () => {
    it('should fetch event details successfully', async () => {
      const mockEvent = {
        id: 'evt_1',
        title: 'Python Workshop',
        description: 'Learn Python',
        eventDate: new Date('2025-12-20'),
        startTime: '10:00',
        endTime: '12:00',
        venue: 'Tech Center',
        capacity: 30,
        createdBy: { firstName: 'John', lastName: 'Doe', email: 'john@example.com' },
        registrations: [
          {
            id: 'reg_1',
            userId: 'user_1',
            status: 'REGISTERED',
            registeredAt: new Date(),
          },
        ],
        _count: { registrations: 1 },
      };

      (prisma.event.findUnique as jest.Mock).mockResolvedValue(mockEvent);

      const request = new NextRequest('http://localhost:3000/api/events/evt_1');
      const response = await getEventDetail(request, {
        params: { id: 'evt_1' },
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.title).toBe('Python Workshop');
    });

    it('should return 404 for non-existent event', async () => {
      (prisma.event.findUnique as jest.Mock).mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/events/invalid_id');
      const response = await getEventDetail(request, {
        params: { id: 'invalid_id' },
      });

      expect(response.status).toBe(404);
    });

    it('should include registration count in response', async () => {
      const mockEvent = {
        id: 'evt_1',
        title: 'Workshop',
        registrations: Array(10).fill({ id: '1', userId: 'u1', status: 'REGISTERED' }),
        _count: { registrations: 10 },
        createdBy: { firstName: 'John', lastName: 'Doe', email: 'john@example.com' },
      };

      (prisma.event.findUnique as jest.Mock).mockResolvedValue(mockEvent);

      const request = new NextRequest('http://localhost:3000/api/events/evt_1');
      const response = await getEventDetail(request, { params: { id: 'evt_1' } });
      const data = await response.json();

      expect(data.data.registrations).toHaveLength(10);
    });
  });

  describe('POST /api/events/[id]/register - Register for Event', () => {
    it('should register user for event successfully', async () => {
      const mockPayload = { sub: 'user_123' };
      (verifyToken as jest.Mock).mockReturnValue(mockPayload);

      const mockEvent = {
        id: 'evt_1',
        title: 'Python Workshop',
        eventDate: new Date('2025-12-20'),
        capacity: 30,
        isPublished: true,
        isCancelled: false,
        _count: { registrations: 5 },
      };

      const mockRegistration = {
        id: 'reg_1',
        userId: 'user_123',
        eventId: 'evt_1',
        status: 'REGISTERED',
        registeredAt: new Date(),
        event: mockEvent,
        user: { email: 'user@example.com', firstName: 'Jane' },
      };

      (prisma.event.findUnique as jest.Mock).mockResolvedValue(mockEvent);
      (prisma.eventRegistration.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.eventRegistration.create as jest.Mock).mockResolvedValue(mockRegistration);
      (prisma.notification.create as jest.Mock).mockResolvedValue({});

      const request = new NextRequest(
        'http://localhost:3000/api/events/evt_1/register',
        {
          method: 'POST',
          headers: { Authorization: 'Bearer token123' },
        }
      );

      const response = await registerEvent(request, { params: { id: 'evt_1' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.registrationId).toBe('reg_1');
    });

    it('should return 401 if token is invalid', async () => {
      (verifyToken as jest.Mock).mockReturnValue(null);

      const request = new NextRequest(
        'http://localhost:3000/api/events/evt_1/register',
        {
          method: 'POST',
          headers: { Authorization: 'Bearer invalid' },
        }
      );

      const response = await registerEvent(request, { params: { id: 'evt_1' } });

      expect(response.status).toBe(401);
    });

    it('should return 404 if event not found', async () => {
      const mockPayload = { sub: 'user_123' };
      (verifyToken as jest.Mock).mockReturnValue(mockPayload);
      (prisma.event.findUnique as jest.Mock).mockResolvedValue(null);

      const request = new NextRequest(
        'http://localhost:3000/api/events/invalid_id/register',
        {
          method: 'POST',
          headers: { Authorization: 'Bearer token123' },
        }
      );

      const response = await registerEvent(request, { params: { id: 'invalid_id' } });

      expect(response.status).toBe(404);
    });

    it('should return 400 if event is not published', async () => {
      const mockPayload = { sub: 'user_123' };
      (verifyToken as jest.Mock).mockReturnValue(mockPayload);

      const mockEvent = {
        id: 'evt_1',
        title: 'Workshop',
        isPublished: false,
        isCancelled: false,
        _count: { registrations: 0 },
      };

      (prisma.event.findUnique as jest.Mock).mockResolvedValue(mockEvent);

      const request = new NextRequest(
        'http://localhost:3000/api/events/evt_1/register',
        {
          method: 'POST',
          headers: { Authorization: 'Bearer token123' },
        }
      );

      const response = await registerEvent(request, { params: { id: 'evt_1' } });

      expect(response.status).toBe(400);
    });

    it('should return 400 if event has started', async () => {
      const mockPayload = { sub: 'user_123' };
      (verifyToken as jest.Mock).mockReturnValue(mockPayload);

      const mockEvent = {
        id: 'evt_1',
        title: 'Workshop',
        eventDate: new Date('2020-01-01'), // Past date
        isPublished: true,
        isCancelled: false,
        _count: { registrations: 0 },
      };

      (prisma.event.findUnique as jest.Mock).mockResolvedValue(mockEvent);

      const request = new NextRequest(
        'http://localhost:3000/api/events/evt_1/register',
        {
          method: 'POST',
          headers: { Authorization: 'Bearer token123' },
        }
      );

      const response = await registerEvent(request, { params: { id: 'evt_1' } });

      expect(response.status).toBe(400);
    });

    it('should return 400 if event is at capacity', async () => {
      const mockPayload = { sub: 'user_123' };
      (verifyToken as jest.Mock).mockReturnValue(mockPayload);

      const mockEvent = {
        id: 'evt_1',
        title: 'Workshop',
        eventDate: new Date('2025-12-20'),
        capacity: 10,
        isPublished: true,
        isCancelled: false,
        _count: { registrations: 10 }, // At capacity
      };

      (prisma.event.findUnique as jest.Mock).mockResolvedValue(mockEvent);

      const request = new NextRequest(
        'http://localhost:3000/api/events/evt_1/register',
        {
          method: 'POST',
          headers: { Authorization: 'Bearer token123' },
        }
      );

      const response = await registerEvent(request, { params: { id: 'evt_1' } });

      expect(response.status).toBe(400);
    });

    it('should return 409 if user is already registered', async () => {
      const mockPayload = { sub: 'user_123' };
      (verifyToken as jest.Mock).mockReturnValue(mockPayload);

      const mockEvent = {
        id: 'evt_1',
        title: 'Workshop',
        eventDate: new Date('2025-12-20'),
        capacity: 30,
        isPublished: true,
        isCancelled: false,
        _count: { registrations: 5 },
      };

      const existingRegistration = {
        id: 'reg_existing',
        userId: 'user_123',
        status: 'REGISTERED',
      };

      (prisma.event.findUnique as jest.Mock).mockResolvedValue(mockEvent);
      (prisma.eventRegistration.findUnique as jest.Mock).mockResolvedValue(
        existingRegistration
      );

      const request = new NextRequest(
        'http://localhost:3000/api/events/evt_1/register',
        {
          method: 'POST',
          headers: { Authorization: 'Bearer token123' },
        }
      );

      const response = await registerEvent(request, { params: { id: 'evt_1' } });

      expect(response.status).toBe(409);
    });
  });

  describe('GET /api/events/my-registrations - Get User Registrations', () => {
    it('should fetch user registrations successfully', async () => {
      const mockUser = { id: 'user_123' };
      (getAuthUser as jest.Mock).mockResolvedValue(mockUser);

      const mockRegistrations = [
        {
          id: 'reg_1',
          eventId: 'evt_1',
          userId: 'user_123',
          status: 'REGISTERED',
          registeredAt: new Date(),
          event: {
            id: 'evt_1',
            title: 'Python Workshop',
            eventDate: new Date('2025-12-20'),
            startTime: '10:00',
            venue: 'Tech Center',
            _count: { registrations: 10 },
          },
        },
      ];

      (prisma.eventRegistration.findMany as jest.Mock).mockResolvedValue(
        mockRegistrations
      );

      const request = new NextRequest('http://localhost:3000/api/events/my-registrations');
      const response = await getMyRegistrations(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toHaveLength(1);
      expect(data.data[0].event.title).toBe('Python Workshop');
    });

    it('should return 401 if user is not authenticated', async () => {
      (getAuthUser as jest.Mock).mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/events/my-registrations');
      const response = await getMyRegistrations(request);

      expect(response.status).toBe(401);
    });

    it('should return empty array if user has no registrations', async () => {
      const mockUser = { id: 'user_123' };
      (getAuthUser as jest.Mock).mockResolvedValue(mockUser);
      (prisma.eventRegistration.findMany as jest.Mock).mockResolvedValue([]);

      const request = new NextRequest('http://localhost:3000/api/events/my-registrations');
      const response = await getMyRegistrations(request);
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.data).toHaveLength(0);
    });

    it('should order registrations by event date descending', async () => {
      const mockUser = { id: 'user_123' };
      (getAuthUser as jest.Mock).mockResolvedValue(mockUser);
      (prisma.eventRegistration.findMany as jest.Mock).mockResolvedValue([]);

      const request = new NextRequest('http://localhost:3000/api/events/my-registrations');
      await getMyRegistrations(request);

      expect((prisma.eventRegistration.findMany as jest.Mock)).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: {
            event: {
              eventDate: 'desc',
            },
          },
        })
      );
    });
  });

  describe('Event API Performance Tests', () => {
    it('should fetch 100 events within reasonable time', async () => {
      const mockEvents = Array.from({ length: 100 }, (_, i) => ({
        id: `evt_${i}`,
        title: `Event ${i}`,
        _count: { registrations: Math.random() * 100 },
        createdBy: { firstName: 'John', lastName: 'Doe' },
        registrations: [],
      }));

      (prisma.event.findMany as jest.Mock).mockResolvedValue(mockEvents);

      const startTime = Date.now();
      const request = new NextRequest('http://localhost:3000/api/events?limit=100');
      await getEvents(request);
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(1000); // Should complete in < 1 second
    });

    it('should handle concurrent registration requests', async () => {
      const mockPayload = { sub: 'user_123' };
      (verifyToken as jest.Mock).mockReturnValue(mockPayload);

      const mockEvent = {
        id: 'evt_1',
        title: 'Workshop',
        eventDate: new Date('2025-12-20'),
        capacity: 100,
        isPublished: true,
        isCancelled: false,
        _count: { registrations: 0 },
      };

      (prisma.event.findUnique as jest.Mock).mockResolvedValue(mockEvent);
      (prisma.eventRegistration.findUnique as jest.Mock).mockResolvedValue(null);

      const requests = Array.from({ length: 5 }, (_, i) => {
        return new NextRequest(
          'http://localhost:3000/api/events/evt_1/register',
          {
            method: 'POST',
            headers: { Authorization: `Bearer token_${i}` },
          }
        );
      });

      const startTime = Date.now();
      await Promise.all(
        requests.map((req) => registerEvent(req, { params: { id: 'evt_1' } }))
      );
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(2000); // Should handle 5 requests in < 2 seconds
    });
  });
});
