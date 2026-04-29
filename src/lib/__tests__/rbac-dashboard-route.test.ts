import { getDashboardRoute } from "@/lib/rbac";

describe("getDashboardRoute", () => {
  it("maps each supported role to a dedicated dashboard route", () => {
    expect(getDashboardRoute("STUDENT")).toBe("/dashboard/student");
    expect(getDashboardRoute("PARENT")).toBe("/dashboard/parent");
    expect(getDashboardRoute("FACILITATOR")).toBe("/dashboard/facilitator");
    expect(getDashboardRoute("SCHOOL_ADMIN")).toBe("/dashboard/admin");
    expect(getDashboardRoute("UNI_MEMBER")).toBe("/dashboard/university");
    expect(getDashboardRoute("CIRCLE_MEMBER")).toBe("/dashboard/circle-member");
    expect(getDashboardRoute("ADMIN")).toBe("/dashboard/admin");
    expect(getDashboardRoute("MENTOR")).toBe("/dashboard/mentor");
  });

  it("normalizes case and whitespace", () => {
    expect(getDashboardRoute("  student ")).toBe("/dashboard/student");
    expect(getDashboardRoute("facilitator")).toBe("/dashboard/facilitator");
  });

  it("falls back to /dashboard for unknown roles", () => {
    expect(getDashboardRoute(undefined)).toBe("/dashboard");
    expect(getDashboardRoute("UNKNOWN_ROLE")).toBe("/dashboard");
  });
});
