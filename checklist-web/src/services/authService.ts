import { eq } from "drizzle-orm";

import { db } from "@/db";
import { users } from "@/db/schema";
import type { SessionUser } from "@/lib/auth";

const PASSWORD_SALT_ROUNDS = 12;

async function getBcrypt() {
  return import("bcrypt");
}

export type AuthResult =
  | {
      ok: true;
      user: SessionUser;
    }
  | {
      ok: false;
      error: string;
    };

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function toSessionUser(user: typeof users.$inferSelect): SessionUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  };
}

export async function registerUser(input: {
  name: string;
  email: string;
  password: string;
}): Promise<AuthResult> {
  const name = input.name.trim();
  const email = normalizeEmail(input.email);
  const password = input.password;

  if (name.length < 2) {
    return { ok: false, error: "Enter your name." };
  }

  if (!email.includes("@")) {
    return { ok: false, error: "Enter a valid email address." };
  }

  if (password.length < 6) {
    return { ok: false, error: "Password must be at least 6 characters." };
  }

  const existingUser = await db.query.users.findFirst({
    where: eq(users.email, email),
  });

  if (existingUser) {
    return { ok: false, error: "An account with this email already exists." };
  }

  const bcrypt = await getBcrypt();
  const passwordHash = await bcrypt.hash(password, PASSWORD_SALT_ROUNDS);

  const [createdUser] = await db
    .insert(users)
    .values({
      name,
      email,
      passwordHash,
      role: "user",
    })
    .returning();

  return {
    ok: true,
    user: toSessionUser(createdUser),
  };
}

export async function loginUser(input: { email: string; password: string }): Promise<AuthResult> {
  const email = normalizeEmail(input.email);

  const user = await db.query.users.findFirst({
    where: eq(users.email, email),
  });

  if (!user) {
    return { ok: false, error: "Invalid email or password." };
  }

  const bcrypt = await getBcrypt();
  const isValidPassword = await bcrypt.compare(input.password, user.passwordHash);

  if (!isValidPassword) {
    return { ok: false, error: "Invalid email or password." };
  }

  return {
    ok: true,
    user: toSessionUser(user),
  };
}
