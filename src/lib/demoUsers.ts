// Shared demo users store for when database is unavailable
export const demoUsers = new Map<string, any>();

// Pre-seeded demo user with a known bcryptjs hash
// Password: "Test@1234" hashed with bcryptjs cost 10
demoUsers.set("demo@example.com", {
  id: "demo-user-001",
  email: "demo@example.com",
  firstName: "Demo",
  lastName: "User",
  phone: "+234 701 234 5678",
  role: "STUDENT",
  state: "Lagos",
  institution: "Demo School",
  passwordHash: "$2a$10$b4cQPeosYPKWmRQRTBAJJ.UZjInmZid/8V1mACovylm40uqhqfpGq",
  emailVerified: true,
  isActive: true,
  avatar: null,
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-01"),
});

// Test user for easy testing
// Password: "Test123!@" hashed with bcryptjs cost 10
demoUsers.set("test@test.com", {
  id: "test-user-001",
  email: "test@test.com",
  firstName: "Test",
  lastName: "Student",
  phone: "+234 700 000 0000",
  role: "STUDENT",
  state: "Lagos",
  institution: "Test Institute",
  passwordHash: "$2b$10$OXPBbXfFTmtdp2hPYnG5OeZQiXm7KXgxZsT2LkF5TpBpzMqyBLQYW",
  emailVerified: true,
  isActive: true,
  avatar: null,
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-01"),
});

