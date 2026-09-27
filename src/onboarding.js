import { OnboardEngine } from '@onboard/sdk';
import '@onboard/sdk/styles';

let engine = null;

export function initOnboarding(userId, userName) {
  if (engine) return engine;

  engine = new OnboardEngine({
    productId: 'campus-events',
    userId: userId || 'anonymous',
    debug: true,
    theme: {
      primaryColor: '#4F46E5',
      primaryHover: '#4338CA',
      borderRadius: 12,
      fontFamily: "'Inter', system-ui, sans-serif",
    },
  });

  // ── Home Page Tour ──
  engine.defineTour('home-welcome', {
    trigger: 'first-visit',
    page: '/',
    steps: [
      {
        target: 'nav',
        title: 'Welcome to CampusEvents!',
        description: 'This is your go-to platform for discovering and booking campus events. Let me show you around!',
        side: 'bottom',
      },
      {
        target: 'a[href="/events"]',
        title: 'Browse Events',
        description: 'Find all upcoming events here — workshops, meetups, competitions, and more.',
        side: 'bottom',
        highlight: true,
      },
    ],
  });

  // ── Dashboard Tour ──
  engine.defineTour('dashboard-intro', {
    trigger: 'first-visit',
    page: '/dashboard',
    steps: [
      {
        target: '.grid.grid-cols-1.sm\\:grid-cols-3',
        title: 'Your Activity at a Glance',
        description: 'These cards show your total bookings, upcoming events, and profile info. Click any card to dive deeper.',
        side: 'bottom',
      },
      {
        target: 'a[href="/events"].btn-primary',
        title: 'Browse Events',
        description: "Ready to find your next event? Click here to explore what's happening on campus.",
        side: 'bottom',
        highlight: true,
      },
      {
        target: 'a[href="/my-bookings"].btn-secondary',
        title: 'Your Bookings',
        description: 'All your registered events are tracked here — upcoming and past.',
        side: 'bottom',
      },
      {
        target: 'a[href="/profile"].btn-secondary',
        title: 'Complete Your Profile',
        description: "Add your details so organizers know who's attending.",
        side: 'bottom',
      },
    ],
    onComplete: () => {
      engine?.showChecklist('getting-started');
    },
  });

  // ── Events Page Tour ──
  engine.defineTour('events-browse', {
    trigger: 'first-visit',
    page: '/events',
    steps: [
      {
        target: 'main',
        title: 'Event Listings',
        description: 'Browse through all available events. Each card shows the event details — click one to see more and register.',
        side: 'bottom',
      },
    ],
  });

  // ── Profile Tour ──
  engine.defineTour('profile-setup', {
    trigger: 'first-visit',
    page: '/profile',
    steps: [
      {
        target: 'main',
        title: 'Your Profile',
        description: 'Fill in your details here. A complete profile helps organizers and makes your experience better.',
        side: 'bottom',
      },
    ],
  });

  // ── Getting Started Checklist ──
  engine.defineChecklist('getting-started', {
    title: 'Getting Started',
    tasks: [
      { id: 'browse-events', label: 'Browse available events', tour: 'events-browse' },
      { id: 'complete-profile', label: 'Complete your profile', tour: 'profile-setup' },
      { id: 'book-event', label: 'Book your first event' },
      { id: 'view-bookings', label: 'Check your bookings' },
    ],
    position: 'bottom-right',
    showProgress: true,
    celebrateOnDone: true,
  });

  // Expose for debugging
  window.__onboard = engine;

  // Auto-start tours based on current route
  engine.autoStart();

  return engine;
}

export function getEngine() {
  return engine;
}

export function destroyOnboarding() {
  if (engine) {
    engine.destroy();
    engine = null;
    window.__onboard = null;
  }
}
