import { PrismaClient, UserRole, UserStatus, GenderPreference, SleepSchedule, PropertyType, PropertyStatus, RoomType, BookingStatus, PaymentStatus, MaintenanceCategory, MaintenancePriority, MaintenanceStatus } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding for Housing & Roommate Platform...');

  // Hash demo passwords
  const adminPassword = await bcrypt.hash('Admin@123456', 12);
  const landlordPassword = await bcrypt.hash('Landlord@123456', 12);
  const tenantPassword = await bcrypt.hash('Tenant@123456', 12);

  // 1. Create or update Admin
  const admin = await prisma.user.upsert({
    where: { email: 'admin@roommatehub.com' },
    update: {},
    create: {
      email: 'admin@roommatehub.com',
      password: adminPassword,
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
      isVerified: true,
      profile: {
        create: {
          firstName: 'Platform',
          lastName: 'Administrator',
          phone: '+1-555-0100',
          bio: 'Head administrator overseeing the Housing & Roommate platform.',
          city: 'San Francisco',
        },
      },
    },
  });
  console.log('✔ Admin user created: admin@roommatehub.com');

  // 2. Create Landlords
  const landlordJohn = await prisma.user.upsert({
    where: { email: 'john.landlord@roommatehub.com' },
    update: {},
    create: {
      email: 'john.landlord@roommatehub.com',
      password: landlordPassword,
      role: UserRole.LANDLORD,
      status: UserStatus.ACTIVE,
      isVerified: true,
      profile: {
        create: {
          firstName: 'John',
          lastName: 'Doe',
          phone: '+1-555-0101',
          bio: 'Professional landlord with over 8 years managing prime urban apartments.',
          city: 'New York',
        },
      },
    },
  });

  const landlordSarah = await prisma.user.upsert({
    where: { email: 'sarah.landlord@roommatehub.com' },
    update: {},
    create: {
      email: 'sarah.landlord@roommatehub.com',
      password: landlordPassword,
      role: UserRole.LANDLORD,
      status: UserStatus.ACTIVE,
      isVerified: true,
      profile: {
        create: {
          firstName: 'Sarah',
          lastName: 'Connor',
          phone: '+1-555-0102',
          bio: 'Eco-conscious real estate manager specializing in student and young-pro housing.',
          city: 'Austin',
        },
      },
    },
  });
  console.log('✔ Landlords created: john.landlord@roommatehub.com & sarah.landlord@roommatehub.com');

  // 3. Create Tenants
  const tenantAlex = await prisma.user.upsert({
    where: { email: 'alex.tenant@roommatehub.com' },
    update: {},
    create: {
      email: 'alex.tenant@roommatehub.com',
      password: tenantPassword,
      role: UserRole.TENANT,
      status: UserStatus.ACTIVE,
      isVerified: true,
      profile: {
        create: {
          firstName: 'Alex',
          lastName: 'Morgan',
          phone: '+1-555-0201',
          bio: 'Software engineer who loves cooking, coffee, and quiet weeknights.',
          city: 'New York',
        },
      },
      roommateProfile: {
        create: {
          budgetMin: 800,
          budgetMax: 1500,
          preferredGender: GenderPreference.ANY,
          occupation: 'Frontend Developer',
          sleepSchedule: SleepSchedule.EARLY_BIRD,
          smoking: false,
          pets: false,
          cleanlinessScore: 5,
          preferredLocations: ['Manhattan', 'Brooklyn', 'Queens'],
          bio: 'Looking for a clean, respectful roommate to share an apartment in NYC.',
        },
      },
    },
  });

  const tenantEmma = await prisma.user.upsert({
    where: { email: 'emma.tenant@roommatehub.com' },
    update: {},
    create: {
      email: 'emma.tenant@roommatehub.com',
      password: tenantPassword,
      role: UserRole.TENANT,
      status: UserStatus.ACTIVE,
      isVerified: true,
      profile: {
        create: {
          firstName: 'Emma',
          lastName: 'Watson',
          phone: '+1-555-0202',
          bio: 'Graphic designer and yoga enthusiast. Social and tidy.',
          city: 'Austin',
        },
      },
      roommateProfile: {
        create: {
          budgetMin: 900,
          budgetMax: 1600,
          preferredGender: GenderPreference.FEMALE,
          occupation: 'UX/UI Designer',
          sleepSchedule: SleepSchedule.FLEXIBLE,
          smoking: false,
          pets: true,
          cleanlinessScore: 4,
          preferredLocations: ['Downtown', 'South Congress', 'East Austin'],
          bio: 'Dog mom with a cute hypoallergenic poodle looking for a sunny spot!',
        },
      },
    },
  });

  const tenantMichael = await prisma.user.upsert({
    where: { email: 'michael.tenant@roommatehub.com' },
    update: {},
    create: {
      email: 'michael.tenant@roommatehub.com',
      password: tenantPassword,
      role: UserRole.TENANT,
      status: UserStatus.ACTIVE,
      isVerified: true,
      profile: {
        create: {
          firstName: 'Michael',
          lastName: 'Scott',
          phone: '+1-555-0203',
          bio: 'Marketing lead who enjoys weekend cycling and Netflix marathons.',
          city: 'New York',
        },
      },
      roommateProfile: {
        create: {
          budgetMin: 700,
          budgetMax: 1400,
          preferredGender: GenderPreference.ANY,
          occupation: 'Growth Specialist',
          sleepSchedule: SleepSchedule.NIGHT_OWL,
          smoking: false,
          pets: false,
          cleanlinessScore: 4,
          preferredLocations: ['Brooklyn', 'Williamsburg', 'Manhattan'],
          bio: 'Easy-going roommate who respects personal space.',
        },
      },
    },
  });
  console.log('✔ Tenants and Roommate Profiles created');

  // 4. Create Properties
  const prop1 = await prisma.property.create({
    data: {
      landlordId: landlordJohn.id,
      title: 'Modern High-Rise 2-Bed Luxury Apartment',
      description:
        'Stunning panoramic city views, floor-to-ceiling windows, modern kitchen with quartz countertops, in-unit washer/dryer, gym, and rooftop lounge.',
      propertyType: PropertyType.APARTMENT,
      address: '450 West 42nd St, Hell’s Kitchen',
      city: 'New York',
      area: 'Manhattan',
      totalRent: 2800,
      bedrooms: 2,
      bathrooms: 2,
      amenities: ['Gym', 'Doorman', 'Elevator', 'Air Conditioning', 'Dishwasher', 'Balcony'],
      rules: ['No indoor smoking', 'Quiet hours after 11 PM'],
      images: [
        'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267',
        'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688',
      ],
      status: PropertyStatus.AVAILABLE,
      isApproved: true,
      rooms: {
        create: [
          {
            title: 'Master Bedroom with Private En-suite Bath',
            roomType: RoomType.PRIVATE,
            rentAmount: 1500,
            depositAmount: 750,
            capacity: 1,
            currentOccupancy: 0,
            isAvailable: true,
          },
          {
            title: 'Sunny Second Bedroom with Large Closet',
            roomType: RoomType.PRIVATE,
            rentAmount: 1300,
            depositAmount: 650,
            capacity: 1,
            currentOccupancy: 0,
            isAvailable: true,
          },
        ],
      },
    },
    include: { rooms: true },
  });

  const prop2 = await prisma.property.create({
    data: {
      landlordId: landlordSarah.id,
      title: 'Charming Co-living Bungalow with Private Garden',
      description:
        'Peaceful tree-lined neighborhood near South Congress. Hardwood floors throughout, renovated kitchen, spacious fenced backyard with BBQ grill and solar panels.',
      propertyType: PropertyType.HOUSE,
      address: '1204 Monroe Street',
      city: 'Austin',
      area: 'South Congress',
      totalRent: 2200,
      bedrooms: 3,
      bathrooms: 2,
      amenities: ['Garden', 'Pet Friendly', 'Free Parking', 'High Speed Wifi', 'Washer/Dryer'],
      rules: ['Pets welcome with notice', 'No cigarette smoking inside'],
      images: [
        'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7',
        'https://images.unsplash.com/photo-1512917774080-9991f1c4c750',
      ],
      status: PropertyStatus.AVAILABLE,
      isApproved: true,
      rooms: {
        create: [
          {
            title: 'Spacious Garden View Master Room',
            roomType: RoomType.PRIVATE,
            rentAmount: 1100,
            depositAmount: 550,
            capacity: 1,
            currentOccupancy: 0,
            isAvailable: true,
          },
          {
            title: 'Cozy Sunlit Corner Bedroom',
            roomType: RoomType.PRIVATE,
            rentAmount: 950,
            depositAmount: 475,
            capacity: 1,
            currentOccupancy: 0,
            isAvailable: true,
          },
        ],
      },
    },
    include: { rooms: true },
  });
  console.log('✔ Properties and Rooms created');

  // 5. Create a sample Booking and Payment
  const sampleBooking = await prisma.bookingRequest.create({
    data: {
      tenantId: tenantAlex.id,
      propertyId: prop1.id,
      roomId: prop1.rooms[0].id,
      moveInDate: new Date('2026-11-01'),
      status: BookingStatus.COMPLETED,
      totalAmount: 1500,
      depositAmount: 750,
      notes: 'Excited to move into Manhattan! Non-smoker and very quiet.',
      payment: {
        create: {
          tenantId: tenantAlex.id,
          amount: 750,
          currency: 'usd',
          status: PaymentStatus.COMPLETED,
          transactionId: `txn_seed_${Date.now()}`,
          stripeSessionId: `cs_test_seed_${Date.now()}`,
          paymentMethod: 'stripe',
        },
      },
    },
  });

  // Update room occupancy for this confirmed booking
  await prisma.room.update({
    where: { id: prop1.rooms[0].id },
    data: { currentOccupancy: 1, isAvailable: false },
  });

  // 6. Create a Maintenance Request
  await prisma.maintenanceRequest.create({
    data: {
      tenantId: tenantAlex.id,
      propertyId: prop1.id,
      roomId: prop1.rooms[0].id,
      category: MaintenanceCategory.PLUMBING,
      priority: MaintenancePriority.MEDIUM,
      status: MaintenanceStatus.IN_PROGRESS,
      title: 'Bathroom sink faucet has a slight drip',
      description: 'The cold water knob drips slowly when fully turned off. Needs a minor washer change.',
    },
  });

  // 7. Create a Review
  await prisma.review.create({
    data: {
      authorId: tenantAlex.id,
      propertyId: prop1.id,
      rating: 5,
      comment: 'Fantastic apartment! Beautiful views, super quiet, and Landlord John is very responsive!',
    },
  });

  console.log('🎉 Seeding successfully completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
