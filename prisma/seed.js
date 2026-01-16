const { PrismaClient } = require("@prisma/client");
const { hash } = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting seed...");

  // Clear existing data
  await prisma.payment.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.availability.deleteMany();
  await prisma.residentProfile.deleteMany();
  await prisma.user.deleteMany();

  // Create admin user
  const admin = await prisma.user.create({
    data: {
      email: "admin@example.com",
      password: await hash("admin123", 12),
      name: "Admin User",
      role: "ADMIN",
    },
  });
  console.log("✓ Created admin:", admin.email);

  // Create sample residents
  const residents = [];
  for (let i = 1; i <= 5; i++) {
    const user = await prisma.user.create({
      data: {
        email: `resident${i}@example.com`,
        password: await hash("password123", 12),
        name: `Resident ${i}`,
        role: "RESIDENT",
      },
    });

    const profile = await prisma.residentProfile.create({
      data: {
        userId: user.id,
        slug: `resident-${i}`,
        bio: `I am a professional with ${i * 5} years of experience.`,
        description: `Specialized in various services. Available for bookings.`,
        price: 50 + i * 10,
        bookingEnabled: true,
        approved: true,
        featured: i === 1,
        images: [
          `https://api.dicebear.com/7.x/avataaars/svg?seed=resident${i}`,
        ],
      },
    });

    // Add availability (Monday to Friday, 9 AM to 5 PM)
    for (let day = 1; day <= 5; day++) {
      await prisma.availability.create({
        data: {
          residentId: profile.id,
          dayOfWeek: day,
          startTime: "09:00",
          endTime: "17:00",
        },
      });
    }

    residents.push({ user, profile });
    console.log(`✓ Created resident: ${user.email}`);
  }

  // Create sample customers
  const customers = [];
  for (let i = 1; i <= 3; i++) {
    const user = await prisma.user.create({
      data: {
        email: `customer${i}@example.com`,
        password: await hash("password123", 12),
        name: `Customer ${i}`,
        role: "CUSTOMER",
      },
    });
    customers.push(user);
    console.log(`✓ Created customer: ${user.email}`);
  }

  // Create sample bookings
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split("T")[0];

  for (let i = 0; i < 3; i++) {
    const booking = await prisma.booking.create({
      data: {
        residentId: residents[i].profile.id,
        customerId: customers[i].id,
        date: new Date(tomorrowStr),
        timeSlot: "10:00",
        status: "CONFIRMED",
      },
    });

    // Create payment record
    const amount = residents[i].profile.price * 100; // in cents
    const platformFee = Math.round(amount * 0.1);
    const residentEarnings = amount - platformFee;

    await prisma.payment.create({
      data: {
        bookingId: booking.id,
        residentId: residents[i].profile.id,
        stripePaymentId: `pi_test_${i}`,
        amount,
        platformFee,
        residentEarnings,
        status: "COMPLETED",
      },
    });

    console.log(`✓ Created booking: ${residents[i].user.name} - ${tomorrowStr}`);
  }

  console.log("✅ Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
