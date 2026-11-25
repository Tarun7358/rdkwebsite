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
    tagline: 'Enterprise-grade Discord security, 2FA sentinel, unlimited backups, and custom branding.',
    badge: 'Flagship Discord Suite',
    priceInr: 99,
    periodLabel: '30 Days',
    supportsAutoPay: true,
    requiresDiscordGuild: true,
    features: [
      { title: 'Gmail 2FA Sentinel & EOD Reports', desc: 'Approve high-risk anti-nuke & admin actions via email and receive daily security digests.' },
      { title: 'Unlimited Extra Owners & Backups', desc: 'No caps on trusted extra owners, full server snapshots, and UPM version history.' },
      { title: 'Custom Server Bot Avatar & Banner', desc: 'Per-server custom bot identity so Rage Optimiser matches your community brand.' },
      { title: 'Unlimited Tickets, Embeds & Giveaways', desc: 'Unlimited interactive ticket panels, custom Box UI embeds, role menus, and giveaways.' },
      { title: '24/7 Voice Presence & Social Trackers', desc: 'Persistent 24/7 voice channel presence plus unlimited YouTube, Twitch & stat trackers.' },
      { title: 'Free Core Included Always', desc: 'Whitelist Bot & unlimited server member size remain 100% free on every plan.' },
    ],
  },
};

export const DEFAULT_PRODUCT_ID = 'rage-pro';
