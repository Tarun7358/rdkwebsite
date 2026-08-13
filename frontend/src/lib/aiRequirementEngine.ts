export interface AiReplyResult {
  replyText: string;
  projectCreated?: {
    id: string;
    name: string;
    category: string;
    budget: string;
    deadline: string;
    features: string[];
  };
}

export function analyzeProjectRequirement(userText: string, userName: string = 'Client'): AiReplyResult {
  const lower = userText.toLowerCase();

  let extractedBudget: string | null = null;
  const budgetMatch = userText.match(/\$?\s?(\d+[\d,]*\s*k|\d+[\d,]*)/i);
  if (budgetMatch) {
    let numStr = budgetMatch[1].toLowerCase().replace(',', '');
    if (numStr.endsWith('k')) {
      numStr = (parseFloat(numStr) * 1000).toString();
    }
    const val = parseInt(numStr, 10);
    if (!isNaN(val) && val > 50) {
      extractedBudget = `$${val.toLocaleString()}`;
    }
  }

  let category = '';
  if (/mobile|app|ios|android|flutter|react native/i.test(lower)) {
    category = 'Mobile Application (iOS / Android)';
  } else if (/e-?commerce|store|shop|stripe|cart|checkout/i.test(lower)) {
    category = 'E-Commerce Platform';
  } else if (/ai|bot|automation|chatgpt|openai|llm|discord|security/i.test(lower)) {
    category = 'AI & Automation System';
  } else if (/website|web|landing|frontend|react|next/i.test(lower)) {
    category = 'Web Platform / Web Application';
  } else if (/saas|crm|dashboard|enterprise|system|portal/i.test(lower)) {
    category = 'Enterprise SaaS Workspace';
  }

  const isRequirementQuery =
    category !== '' ||
    lower.length > 12 ||
    /build|create|need|want|develop|requirement|spec|feature|budget|cost|estimate|quote|project|stack|time|hello|hi|help/i.test(lower);

  if (isRequirementQuery && category !== '') {
    const projCategory = category;
    const finalBudget = extractedBudget || '$3,500 - $6,000';
    const estimatedTimeline = lower.includes('urgent') || lower.includes('fast') ? '2 Weeks (Sprint Mode)' : '3 - 4 Weeks';

    const features: string[] = [];
    if (/auth|login|signup|user|role/i.test(lower)) features.push('Role-Based Auth & Security');
    if (/payment|stripe|pay|invoice|billing|cart/i.test(lower)) features.push('Stripe Payment & Automated Checkout');
    if (/chat|realtime|live|stream|message|db/i.test(lower)) features.push('Real-time Supabase Messaging & DB Sync');
    if (/dashboard|admin|analytics|panel|stats/i.test(lower)) features.push('Executive Control Dashboard & Analytics');
    if (/mobile|responsive|design|ui/i.test(lower)) features.push('Modern Glassmorphic Responsive UI/UX');

    if (features.length === 0) {
      features.push(
        'User Authentication & Role Management',
        'Interactive Control Dashboard',
        'Real-time Cloud Database Integration',
        'REST & Event Stream API Infrastructure'
      );
    }

    const replyText = `🤖 RDK AI Requirement Analysis & Project Scope
━━━━━━━━━━━━━━━━━━━━━━━
📌 Project Type: ${projCategory}
🛠️ Tech Architecture: React + Node.js + Supabase Real-Time DB
⚡ Core Features:
${features.map((f) => `  • ${f}`).join('\n')}

⏱️ Recommended Timeline: ${estimatedTimeline}
💰 Estimated Investment: ${finalBudget}

✅ Requirement Registered!
Your project scope has been analyzed and logged under profile "${userName}". You can track milestones and sprint updates under the Projects tab.`;

    const projId = 'PROJ-' + Math.floor(1000 + Math.random() * 9000);

    return {
      replyText,
      projectCreated: {
        id: projId,
        name: `${projCategory} (${userName})`,
        category: projCategory,
        budget: finalBudget,
        deadline: estimatedTimeline,
        features,
      },
    };
  }

  return {
    replyText: `Hello ${userName}! 👋 I am the RDK AI Project Architect.

I can instantly analyze your software requirements, estimate cost & timeline, and register your project with our engineering team.

Tell me:
1️⃣ What kind of project do you want to build? (e.g. Website, Mobile App, AI Bot)
2️⃣ What features are required? (e.g. Auth, Payments, Real-time Chat)
3️⃣ What is your budget or deadline?`,
  };
}
