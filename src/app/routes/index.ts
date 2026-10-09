import { Router } from 'express';
import { AuthRoutes } from '../modules/auth/auth.routes';
import { UserRoutes } from '../modules/user/user.routes';
import { RoommateRoutes } from '../modules/roommate/roommate.routes';
import { PropertyRoutes } from '../modules/property/property.routes';
import { RoomRoutes } from '../modules/room/room.routes';
import { BookingRoutes } from '../modules/booking/booking.routes';
import { PaymentRoutes } from '../modules/payment/payment.routes';
import { MaintenanceRoutes } from '../modules/maintenance/maintenance.routes';
import { ReviewRoutes } from '../modules/review/review.routes';
import { AdminRoutes } from '../modules/admin/admin.routes';

const router = Router();

const moduleRoutes = [
  {
    path: '/auth',
    route: AuthRoutes,
  },
  {
    path: '/users',
    route: UserRoutes,
  },
  {
    path: '/roommates',
    route: RoommateRoutes,
  },
  {
    path: '/properties',
    route: PropertyRoutes,
  },
  {
    path: '/rooms',
    route: RoomRoutes,
  },
  {
    path: '/bookings',
    route: BookingRoutes,
  },
  {
    path: '/payments',
    route: PaymentRoutes,
  },
  {
    path: '/maintenance',
    route: MaintenanceRoutes,
  },
  {
    path: '/reviews',
    route: ReviewRoutes,
  },
  {
    path: '/admin',
    route: AdminRoutes,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
