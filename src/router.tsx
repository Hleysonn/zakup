import { 
  createRootRoute, 
  createRoute, 
  createRouter,
  Route,
  lazyRouteComponent,
  Outlet
} from '@tanstack/react-router';
import Layout from './components/layout/Layout';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

// Route racine avec les providers
const rootRoute = createRootRoute({
  component: () => (
    <AuthProvider>
      <CartProvider>
        <Layout>
          <Outlet />
        </Layout>
      </CartProvider>
    </AuthProvider>
  )
});

// Page d'accueil
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: lazyRouteComponent(() => import('./pages/Home'))
});

// Page de produits
const productsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'products',
  component: lazyRouteComponent(() => import('./pages/Products'))
});

// Détail d'un produit
const productDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'products/$productId',
  component: lazyRouteComponent(() => import('./pages/ProductDetail'))
});

// Page des sponsors
const sponsorsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'sponsors',
  component: lazyRouteComponent(() => import('./pages/Sponsors'))
});

// Détail d'un sponsor
const sponsorDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'sponsors/$sponsorId',
  component: lazyRouteComponent(() => import('./pages/SponsorDetail'))
});

// Page des clubs
const clubsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'clubs',
  component: lazyRouteComponent(() => import('./pages/Clubs'))
});

// Détail d'un club
const clubDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'clubs/$clubId',
  component: lazyRouteComponent(() => import('./pages/ClubDetail'))
});

// Page d'abonnement à un club
const clubAbonnementRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'clubs/$clubId/abonnement',
  component: lazyRouteComponent(() => import('./pages/club/AbonnementClub'))
});

// Page de panier
const cartRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'cart',
  component: lazyRouteComponent(() => import('./pages/Cart'))
});

// Page de paiement
const checkoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'checkout',
  component: lazyRouteComponent(() => import('./pages/Checkout'))
});

// Page de confirmation de commande
const orderConfirmationRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'order-confirmation',
  component: lazyRouteComponent(() => import('./pages/OrderConfirmation'))
});

// Page de connexion
const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'login',
  component: lazyRouteComponent(() => import('./pages/Login'))
});

// Page d'inscription
const registerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'register',
  component: lazyRouteComponent(() => import('./pages/Register'))
});

// Page de profil
const profileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'profile',
  component: lazyRouteComponent(() => import('./pages/Profile'))
});

// Page des commandes
const ordersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'orders',
  component: lazyRouteComponent(() => import('./pages/Orders'))
});

// Dashboard du sponsor
const sponsorDashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'sponsor/dashboard',
  component: lazyRouteComponent(() => import('./pages/sponsor/Dashboard'))
});

// Profil du sponsor
const sponsorProfileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'sponsor/profile',
  component: lazyRouteComponent(() => import('./pages/sponsor/SponsorProfile'))
});

// Dashboard du club
const clubDashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'club/dashboard',
  component: lazyRouteComponent(() => import('./pages/club/Dashboard'))
});

// Profil du club
const clubProfileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'club/profile',
  component: lazyRouteComponent(() => import('./pages/club/ClubProfile'))
});

// Routes à propos, termes, etc.
const aboutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'about',
  component: lazyRouteComponent(() => import('./pages/About'))
});

const termsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'terms',
  component: lazyRouteComponent(() => import('./pages/Terms'))
});

const privacyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'privacy',
  component: lazyRouteComponent(() => import('./pages/Privacy'))
});

const faqRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'faq',
  component: lazyRouteComponent(() => import('./pages/FAQ'))
});

const contactRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'contact',
  component: lazyRouteComponent(() => import('./pages/Contact'))
});

// Page 404
const notFoundRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '*',
  component: lazyRouteComponent(() => import('./pages/NotFound'))
});

// Définir toutes les routes
const routeTree = rootRoute.addChildren([
  indexRoute,
  productsRoute,
  productDetailRoute,
  sponsorsRoute,
  sponsorDetailRoute,
  clubsRoute,
  clubDetailRoute,
  clubAbonnementRoute,
  cartRoute,
  checkoutRoute,
  orderConfirmationRoute,
  loginRoute,
  registerRoute,
  profileRoute,
  ordersRoute,
  sponsorDashboardRoute,
  sponsorProfileRoute,
  clubDashboardRoute,
  clubProfileRoute,
  aboutRoute,
  termsRoute,
  privacyRoute,
  faqRoute,
  contactRoute,
  notFoundRoute
]);

// Créer le routeur
export const router = createRouter({ routeTree }); 