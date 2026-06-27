import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { businessSettings, users } from './schema.ts';
import { db, queryClient } from './client.ts';

const ownerEmail = process.env.OWNER_EMAIL || 'owner@dispensary.local';
const ownerPassword = process.env.OWNER_PASSWORD || 'Owner@12345';
const ownerName = process.env.OWNER_NAME || 'Owner';
const businessName = process.env.BUSINESS_NAME || 'Dispensary Manager';

async function main() {
  const passwordHash = await bcrypt.hash(ownerPassword, 12);

  const existingOwner = await db.query.users.findFirst({
    where: eq(users.email, ownerEmail),
  });

  if (existingOwner) {
    await db
      .update(users)
      .set({
        name: ownerName,
        passwordHash,
        role: 'OWNER',
        status: 'ACTIVE',
        updatedAt: new Date(),
      })
      .where(eq(users.email, ownerEmail));

    console.log('Owner updated successfully.');
    console.log('Email:', ownerEmail);
    console.log('Password:', ownerPassword);
  } else {
    await db.insert(users).values({
      name: ownerName,
      email: ownerEmail,
      passwordHash,
      role: 'OWNER',
      status: 'ACTIVE',
    });

    console.log('Owner created successfully.');
    console.log('Email:', ownerEmail);
    console.log('Password:', ownerPassword);
  }

  const existingSettings = await db.query.businessSettings.findFirst();

  if (!existingSettings) {
    await db.insert(businessSettings).values({
      businessName,
      ownerName,
      currency: 'RWF',
    });
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await queryClient.end();
  });
