export const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'Housing & Roommate Platform API',
    version: '1.0.0',
    description:
      'Production RESTful backend API for Housing & Roommate Platform (B7A6 Assignment). Features: Email/Password Auth, Google GCP Login, Roommate Compatibility Matching Algorithm, Properties, Rooms, Bookings, Stripe Payments, Maintenance Tickets, and Admin Analytics.',
    contact: {
      name: 'Mahfuz',
      email: 'mahfuzru5634@gmail.com',
    },
  },
  servers: [
    {
      url: '/api/v1',
      description: 'API Base Path (V1)',
    },
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter your JWT access token in the format: Bearer <token>',
      },
    },
  },
  security: [
    {
      BearerAuth: [],
    },
  ],
  paths: {
    '/auth/register': {
      post: {
        tags: ['Authentication'],
        summary: 'Register a new tenant or landlord user',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password', 'firstName', 'lastName'],
                properties: {
                  email: { type: 'string', example: 'newuser@roommatehub.com' },
                  password: { type: 'string', example: 'Tenant@123456' },
                  role: { type: 'string', enum: ['TENANT', 'LANDLORD'], example: 'TENANT' },
                  firstName: { type: 'string', example: 'John' },
                  lastName: { type: 'string', example: 'Doe' },
                  phone: { type: 'string', example: '+1-555-0100' },
                  city: { type: 'string', example: 'New York' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'User successfully registered' },
          400: { description: 'Validation error' },
          409: { description: 'Email already exists' },
        },
      },
    },
    '/auth/login': {
      post: {
        tags: ['Authentication'],
        summary: 'Log in with email and password to receive JWT tokens',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', example: 'admin@roommatehub.com' },
                  password: { type: 'string', example: 'Admin@123456' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Login successful' },
          401: { description: 'Invalid credentials' },
          403: { description: 'User account blocked' },
        },
      },
    },
    '/auth/google-login': {
      post: {
        tags: ['Authentication'],
        summary: 'Google GCP Social Login via ID token',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['idToken'],
                properties: {
                  idToken: { type: 'string', example: 'mock-google-token-user@gmail.com' },
                  role: { type: 'string', enum: ['TENANT', 'LANDLORD'], default: 'TENANT' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Social login successful' },
        },
      },
    },
    '/auth/me': {
      get: {
        tags: ['Authentication'],
        summary: 'Get currently logged-in user profile',
        security: [{ BearerAuth: [] }],
        responses: {
          200: { description: 'Profile retrieved' },
          401: { description: 'Unauthorized' },
        },
      },
    },
    '/auth/refresh-token': {
      post: {
        tags: ['Authentication'],
        summary: 'Refresh access token using refresh token',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['refreshToken'],
                properties: {
                  refreshToken: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Token refreshed' },
          401: { description: 'Invalid or expired token' },
        },
      },
    },
    '/roommates/profile': {
      post: {
        tags: ['Roommates & Matching Engine'],
        summary: 'Create or update roommate lifestyle preferences',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['budgetMin', 'budgetMax'],
                properties: {
                  budgetMin: { type: 'number', example: 800 },
                  budgetMax: { type: 'number', example: 1500 },
                  preferredGender: { type: 'string', enum: ['MALE', 'FEMALE', 'ANY'], example: 'ANY' },
                  occupation: { type: 'string', example: 'Software Engineer' },
                  sleepSchedule: { type: 'string', enum: ['EARLY_BIRD', 'NIGHT_OWL', 'FLEXIBLE'], example: 'EARLY_BIRD' },
                  smoking: { type: 'boolean', example: false },
                  pets: { type: 'boolean', example: false },
                  cleanlinessScore: { type: 'integer', minimum: 1, maximum: 5, example: 5 },
                  preferredLocations: { type: 'array', items: { type: 'string' }, example: ['Manhattan', 'Brooklyn'] },
                  bio: { type: 'string', example: 'Clean, quiet, and friendly professional.' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Roommate profile updated' },
        },
      },
    },
    '/roommates/match': {
      get: {
        tags: ['Roommates & Matching Engine'],
        summary: 'Calculate algorithmic compatibility score against other roommates (TENANT only)',
        security: [{ BearerAuth: [] }],
        responses: {
          200: { description: 'Compatibility ranking returned' },
          403: { description: 'Forbidden: TENANT role required' },
        },
      },
    },
    '/roommates': {
      get: {
        tags: ['Roommates & Matching Engine'],
        summary: 'Browse and filter roommate candidate profiles',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'minBudget', in: 'query', schema: { type: 'number' } },
          { name: 'maxBudget', in: 'query', schema: { type: 'number' } },
          { name: 'sleepSchedule', in: 'query', schema: { type: 'string', enum: ['EARLY_BIRD', 'NIGHT_OWL', 'FLEXIBLE'] } },
          { name: 'city', in: 'query', schema: { type: 'string' } },
        ],
        responses: {
          200: { description: 'Roommate profiles list' },
        },
      },
    },
    '/properties': {
      get: {
        tags: ['Properties & Rooms'],
        summary: 'Search and filter property listings (Public)',
        parameters: [
          { name: 'searchTerm', in: 'query', schema: { type: 'string' } },
          { name: 'city', in: 'query', schema: { type: 'string' } },
          { name: 'minRent', in: 'query', schema: { type: 'number' } },
          { name: 'maxRent', in: 'query', schema: { type: 'number' } },
          { name: 'propertyType', in: 'query', schema: { type: 'string' } },
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
        ],
        responses: {
          200: { description: 'List of matching properties with average ratings' },
        },
      },
      post: {
        tags: ['Properties & Rooms'],
        summary: 'Create a new property listing (LANDLORD or ADMIN)',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['title', 'description', 'address', 'city', 'area', 'totalRent'],
                properties: {
                  title: { type: 'string', example: 'Modern Downtown Loft' },
                  description: { type: 'string', example: 'High ceilings, stainless steel appliances, prime location.' },
                  propertyType: { type: 'string', enum: ['APARTMENT', 'HOUSE', 'CONDO', 'STUDIO'], example: 'APARTMENT' },
                  address: { type: 'string', example: '123 Broadway St' },
                  city: { type: 'string', example: 'New York' },
                  area: { type: 'string', example: 'Manhattan' },
                  totalRent: { type: 'number', example: 2500 },
                  bedrooms: { type: 'integer', example: 2 },
                  bathrooms: { type: 'integer', example: 1 },
                  amenities: { type: 'array', items: { type: 'string' }, example: ['Wifi', 'Gym', 'Balcony'] },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Property created' },
          403: { description: 'Forbidden' },
        },
      },
    },
    '/properties/{id}': {
      get: {
        tags: ['Properties & Rooms'],
        summary: 'Get property details with rooms and reviews',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Property details' },
          404: { description: 'Not found' },
        },
      },
      patch: {
        tags: ['Properties & Rooms'],
        summary: 'Update property listing (Owner LANDLORD or ADMIN)',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Property updated' },
        },
      },
      delete: {
        tags: ['Properties & Rooms'],
        summary: 'Delete property listing',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Property deleted' },
        },
      },
    },
    '/rooms': {
      post: {
        tags: ['Properties & Rooms'],
        summary: 'Add a room to an existing property',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['propertyId', 'title', 'rentAmount'],
                properties: {
                  propertyId: { type: 'string', format: 'uuid' },
                  title: { type: 'string', example: 'Master Bedroom' },
                  roomType: { type: 'string', enum: ['PRIVATE', 'SHARED'], example: 'PRIVATE' },
                  rentAmount: { type: 'number', example: 1200 },
                  depositAmount: { type: 'number', example: 600 },
                  capacity: { type: 'integer', example: 1 },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Room created' },
        },
      },
    },
    '/bookings': {
      post: {
        tags: ['Bookings & Applications'],
        summary: 'Submit a booking request for property/room (TENANT only)',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['propertyId', 'moveInDate'],
                properties: {
                  propertyId: { type: 'string', format: 'uuid' },
                  roomId: { type: 'string', format: 'uuid' },
                  moveInDate: { type: 'string', format: 'date-time', example: '2026-11-01T00:00:00.000Z' },
                  notes: { type: 'string', example: 'Non-smoker, clean professional.' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Booking request created with PENDING status' },
        },
      },
    },
    '/bookings/my-bookings': {
      get: {
        tags: ['Bookings & Applications'],
        summary: 'Get all bookings submitted by logged-in tenant',
        security: [{ BearerAuth: [] }],
        responses: {
          200: { description: 'Tenant bookings' },
        },
      },
    },
    '/bookings/landlord': {
      get: {
        tags: ['Bookings & Applications'],
        summary: 'Get booking applications for landlord properties',
        security: [{ BearerAuth: [] }],
        responses: {
          200: { description: 'Landlord bookings' },
        },
      },
    },
    '/bookings/{id}/status': {
      patch: {
        tags: ['Bookings & Applications'],
        summary: 'Approve or Reject booking (LANDLORD or ADMIN)',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['status'],
                properties: {
                  status: { type: 'string', enum: ['APPROVED', 'REJECTED', 'COMPLETED'] },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Booking status updated' },
        },
      },
    },
    '/payments/checkout-session': {
      post: {
        tags: ['Stripe Payments'],
        summary: 'Create Stripe checkout session for APPROVED booking (TENANT only)',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['bookingRequestId'],
                properties: {
                  bookingRequestId: { type: 'string', format: 'uuid' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Checkout session created with payment URL' },
          400: { description: 'Booking not approved or already paid' },
        },
      },
    },
    '/payments/verify': {
      post: {
        tags: ['Stripe Payments'],
        summary: 'Verify Stripe payment & atomically confirm booking & lock room occupancy',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['sessionId', 'bookingRequestId'],
                properties: {
                  sessionId: { type: 'string' },
                  bookingRequestId: { type: 'string', format: 'uuid' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Payment verified and occupancy locked' },
        },
      },
    },
    '/payments/my-payments': {
      get: {
        tags: ['Stripe Payments'],
        summary: 'Get tenant payment receipts',
        security: [{ BearerAuth: [] }],
        responses: {
          200: { description: 'Receipt history' },
        },
      },
    },
    '/maintenance': {
      post: {
        tags: ['Maintenance Tickets'],
        summary: 'File a maintenance ticket for a property or room (TENANT only)',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['propertyId', 'title', 'description'],
                properties: {
                  propertyId: { type: 'string', format: 'uuid' },
                  roomId: { type: 'string', format: 'uuid' },
                  category: { type: 'string', enum: ['PLUMBING', 'ELECTRICAL', 'APPLIANCE', 'STRUCTURAL', 'OTHER'], default: 'OTHER' },
                  priority: { type: 'string', enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'], default: 'MEDIUM' },
                  title: { type: 'string', example: 'Leaking pipe under kitchen sink' },
                  description: { type: 'string', example: 'Constant water drip when using tap.' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Ticket created with PENDING status' },
        },
      },
    },
    '/maintenance/{id}/status': {
      patch: {
        tags: ['Maintenance Tickets'],
        summary: 'Update maintenance ticket status (PENDING -> IN_PROGRESS -> RESOLVED)',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['status'],
                properties: {
                  status: { type: 'string', enum: ['PENDING', 'IN_PROGRESS', 'RESOLVED'] },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Maintenance status updated' },
        },
      },
    },
    '/reviews': {
      post: {
        tags: ['Reviews & Ratings'],
        summary: 'Post a review and rating for a property (TENANT only)',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['propertyId', 'rating', 'comment'],
                properties: {
                  propertyId: { type: 'string', format: 'uuid' },
                  rating: { type: 'integer', minimum: 1, maximum: 5, example: 5 },
                  comment: { type: 'string', example: 'Excellent place, very clean and peaceful.' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Review posted' },
        },
      },
    },
    '/admin/analytics': {
      get: {
        tags: ['Admin & Platform Moderation'],
        summary: 'Retrieve platform-wide dashboard analytics (ADMIN only)',
        security: [{ BearerAuth: [] }],
        responses: {
          200: { description: 'Analytics data with users, properties, revenue, and bookings' },
          403: { description: 'Forbidden: ADMIN role required' },
        },
      },
    },
    '/admin/properties/{id}/approve': {
      patch: {
        tags: ['Admin & Platform Moderation'],
        summary: 'Approve or reject a property listing (ADMIN only)',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  isApproved: { type: 'boolean', default: true },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Listing approval updated' },
        },
      },
    },
  },
};
