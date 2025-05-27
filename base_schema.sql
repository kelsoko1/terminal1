-- Create User table first
CREATE TABLE IF NOT EXISTS "User" (
  "id" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "name" TEXT,
  "password" TEXT NOT NULL,
  "role" TEXT NOT NULL DEFAULT 'USER',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "organizationId" TEXT,
  "department" TEXT,
  "position" TEXT,
  "employeeId" TEXT,
  "contactNumber" TEXT,
  "status" TEXT NOT NULL DEFAULT 'ACTIVE',
  "permissions" TEXT[] DEFAULT ARRAY[]::TEXT[],
  "supervisor" TEXT,
  "hireDate" TIMESTAMP(3),
  "createdBy" TEXT,
  "isOrganizationAdmin" BOOLEAN NOT NULL DEFAULT false,

  CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- Create unique index on email
CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email");
