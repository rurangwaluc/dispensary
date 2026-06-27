import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { db, users, businessSettings } from './index.js';

const ownerEmail = process.env.OWNER_EMAIL || 'owner@dispensary.local';
const ownerPassword = process.env.OWNER_PASSWORD || 'change-me-now';
const ownerName = process.env.OWNER_NAME || 'Owner';
const businessName = process.env.BUSINESS_NAME || 'Dispensary Manager';

async function main() {
  const existingOwner = await db.query.users.findFirst({
    where: eq(users.email, ownerEmail),
  });

  if (existingOwner) {
    console.log('Owner already exists:', ownerEmail);
    return;
  }

  const passwordHash = await bcrypt.hash(ownerPassword, 12);

  await db.insert(users).values({
    name: ownerName,
    email: ownerEmail,
    passwordHash,
    role: 'OWNER',
    status: 'ACTIVE',
  });

  const existingSettings = await db.query.businessSettings.findFirst();

  if (!existingSettings) {
    await db.insert(businessSettings).values({
      businessName,
      ownerName,
      currency: 'RWF',
    });
  }

  console.log('Owner created successfully.');
  console.log('Email:', ownerEmail);
  console.log('Password:', ownerPassword);
  console.log('Change this password before real use.');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});