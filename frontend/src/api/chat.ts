import { supabase } from '../lib/supabase';
import { analyzeProjectRequirement } from '../lib/aiRequirementEngine';
import type { ApiResponse } from '../types';

function nowTime() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export const chatApi = {
  send: async (data: {
    sender: 'in' | 'out';
    senderName: string;
    text: string;
  }): Promise<ApiResponse> => {
    // Insert user message
    const { error } = await supabase.from('chat_messages').insert({
      sender: data.sender,
      sender_name: data.senderName,
      text: data.text,
      time: nowTime(),
    });
    if (error) return { success: false, message: error.message };

    // AI bot replies after 1s (client-side — same logic as server.js)
    setTimeout(async () => {
      const { replyText, projectCreated } = analyzeProjectRequirement(data.text, data.senderName);
      const botSender = data.sender === 'in' ? 'out' : 'in';

      await supabase.from('chat_messages').insert({
        sender: botSender,
        sender_name: 'RDK AI Assistant',
        text: replyText,
        time: nowTime(),
      });

      // If the AI engine identified a project requirement, auto-register it
      if (projectCreated) {
        const clientIdentifier =
          data.senderName && data.senderName !== 'Visitor Client' && data.senderName !== 'Client Partner'
            ? data.senderName
            : 'client@rdk.com';
        await supabase.from('projects').insert({
          id: projectCreated.id,
          name: projectCreated.name,
          client: clientIdentifier,
          assigned_to: 'engineering@rdk.com',
          status: 'Proposed',
          progress: 10,
          description: `[AI Requirement Scoping Intake]\nRaw Input: ${data.text}\nFeatures: ${projectCreated.features.join(', ')}`,
          milestones: [
            { name: 'AI Scope Analysis & Intake', completed: true },
            { name: 'Architecture Review & Budget Approval', completed: false },
            { name: 'Sprint 1 Core Build', completed: false },
            { name: 'QA Testing & Production Launch', completed: false },
          ],
          tasks: [{ id: 1, title: 'Scope Verification with Engineering', status: 'To Do' }],
          deliverables: [],
          budget: projectCreated.budget,
          deadline: projectCreated.deadline,
        }).select(); // silent — don't block on error
      }
    }, 1000);

    return { success: true, message: 'Message sent' };
  },
};
