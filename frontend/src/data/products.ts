export interface RdkProduct {
  id: string;
  name: string;
  tagline: string;
  badge: string;
  priceInr: number;
  periodLabel: string;
  supportsAutoPay: boolean;
  requiresDiscordGuild: boolean;
  features: { title: string; desc: string }[];
}

export const RDK_PRODUCTS: Record<string, RdkProduct> = {
  'rage-pro': {
    id: 'rage-pro',
    name: 'Rage Optimiser Pro',
    tagline: 'Enterprise Discord protection, 2FA approval alerts, unlimited backups, and custom bot branding.',
    badge: 'Pro License',
    priceInr: 99,
    periodLabel: '30 days',
    supportsAutoPay: true,
    requiresDiscordGuild: true,
    features: [
      { title: 'Gmail 2FA & Daily Security Reports', desc: 'Verify critical admin actions by email and receive daily EOD audit summaries.' },
      { title: 'Unlimited Extra Owners & Backups', desc: 'Add unlimited trusted owners with full server snapshots and UPM restore points.' },
      { title: 'Custom Bot Avatar & Banner', desc: 'Personalize Rage Optimiser’s profile per server to match your community.' },
      { title: 'Unlimited Tickets, Embeds & Giveaways', desc: 'Create unlimited ticket panels, role menus, giveaways, and Box UI embeds.' },
      { title: '24/7 Voice & Social Trackers', desc: 'Keep 24/7 voice presence active alongside unlimited YouTube, Twitch & stat feeds.' },
      { title: 'Free Core Always Included', desc: 'Anti-Nuke, AutoMod, Whitelist Bot, and unlimited member size stay 100% free.' },
    ],
  },
};

export const DEFAULT_PRODUCT_ID = 'rage-pro';
