// scripts/seed-admin.ts
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";
import "dotenv/config";  
import { db } from "@/db";  


const ADMIN_EMAIL    = process.env.ADMIN_EMAIL!;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD!;
const ADMIN_NAME     = process.env.ADMIN_NAME ?? "Super Admin";

if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
  console.error("❌ Pleas set the ADMIN_EMAIL and ADMIN_PASSWORD in .env.local");
  process.exit(1);
}

async function seedAdmin() {
  console.log("🌱 Seeding admin user...");

  const [existing] = await db
    .select()
    .from(users)
    .where(eq(users.email, ADMIN_EMAIL));

  if (existing) {
    // already exists — sirf isAdmin ensure karo
    await db
      .update(users)
      .set({ isAdmin: true })
      .where(eq(users.email, ADMIN_EMAIL));
    console.log("✅ Existing user updated to admin:", ADMIN_EMAIL);
    process.exit(0);
  }

  const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);

  await db.insert(users).values({
    id:       crypto.randomUUID(),
    email:    ADMIN_EMAIL,
    name:     ADMIN_NAME,
    password: hashedPassword,
    isAdmin:  true,
    isBanned: false,
  });

  console.log("✅ Admin user created:", ADMIN_EMAIL);
  console.log("🔑 Password:", ADMIN_PASSWORD);
  process.exit(0);
}

seedAdmin().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});