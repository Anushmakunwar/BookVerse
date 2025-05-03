/**
 * Route constants for the application
 */
export const routes = {
  // Public routes
  home: '/',
  books: {
    list: '/books',
    search: '/books/search',
    detail: (id: number) => `/books/${id}`,
  },
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    forgotPassword: '/auth/forgot-password',
    resetPassword: '/auth/reset-password',
    verifyEmail: '/auth/verify-email',
  },

  // Member routes
  member: {
    profile: '/member/profile',
    cart: '/member/cart',
    bookmarks: '/member/bookmarks',
    orders: '/member/orders',
    orderDetail: (id: number) => `/member/orders/${id}`,
  },

  // Staff routes
  staff: {
    dashboard: '/staff',
    orders: '/staff/orders',
    orderHistory: '/staff/order-history',
  },

  // Admin routes
  admin: {
    dashboard: '/admin',
    books: {
      list: '/admin/books',
      add: '/admin/books/add',
      edit: (id: number) => `/admin/books/edit/${id}`,
    },
    users: {
      list: '/admin/users',
      detail: (id: string) => `/admin/users/${id}`,
    },
    orders: {
      list: '/admin/orders',
      detail: (id: number) => `/admin/orders/${id}`,
    },
    announcements: '/admin/announcements',
    reports: '/admin/reports',
  },
};

/**
 * Check if a route is an admin route
 */
export const isAdminRoute = (path: string) => {
  return path.startsWith('/admin');
};

/**
 * Check if a route is a staff route
 */
export const isStaffRoute = (path: string) => {
  return path.startsWith('/staff');
};

/**
 * Check if a route is a member route
 */
export const isMemberRoute = (path: string) => {
  return path.startsWith('/member');
};

/**
 * Check if a route is an auth route
 */
export const isAuthRoute = (path: string) => {
  return path.startsWith('/auth');
};

/**
 * Get the route group for a path
 */
export const getRouteGroup = (path: string) => {
  if (isAdminRoute(path)) return 'admin';
  if (isStaffRoute(path)) return 'staff';
  if (isMemberRoute(path)) return 'member';
  if (isAuthRoute(path)) return 'auth';
  return 'public';
};
