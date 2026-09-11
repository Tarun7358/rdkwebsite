import { supabase } from '../lib/supabase';
import type { ApiResponse } from '../types';

const BOT_NAME = 'Sarah K.';
const BOT_SENDER = 'employee';

function nowTime() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export const ticketsApi = {
  create: async (data: {
    client: string;
    clientName: string;
    title: string;
    priority: string;
    category: string;
    description: string;
  }): Promise<ApiResponse> => {
    const ticketId = 'WEB-2026-' + Math.floor(1000 + Math.random() * 9000);
    const firstMsg = {
      sender: 'client',
      senderName: data.clientName || 'Client',
      text: data.description,
      time: nowTime(),
    };
    const { error } = await supabase.from('tickets').insert({
      id: ticketId,
      client: data.client,
      category: data.category,
      priority: data.priority,
      status: 'Active',
      assigned_to: 'employee@rdk.com',
      title: data.title,
      description: data.description,
      messages: [firstMsg],
    });
    if (error) return { success: false, message: error.message };

    // Auto-reply after 1.5s (client-side, same as server.js setTimeout)
    setTimeout(async () => {
      const { data: t } = await supabase
        .from('tickets').select('messages, status').eq('id', ticketId).single();
      if (t && t.status === 'Active') {
        const msgs = [
          ...t.messages,
          {
            sender: BOT_SENDER,
            senderName: BOT_NAME,
            text: `Hello! I've received your ticket regarding "${data.title}". Investigating now — will update you shortly.`,
            time: nowTime(),
          },
        ];
        await supabase.from('tickets').update({ messages: msgs }).eq('id', ticketId);
      }
    }, 1500);

    return { success: true, message: 'Ticket created' };
  },

  sendMessage: async (data: {
    ticketId: string;
    sender: 'client' | 'employee';
    senderName: string;
    text: string;
  }): Promise<ApiResponse> => {
    const { data: t, error: fetchErr } = await supabase
      .from('tickets').select('messages, status').eq('id', data.ticketId).single();
    if (fetchErr || !t) return { success: false, message: 'Ticket not found' };

    const msgs = [...t.messages, { sender: data.sender, senderName: data.senderName, text: data.text, time: nowTime() }];
    const { error } = await supabase.from('tickets').update({ messages: msgs }).eq('id', data.ticketId);
    if (error) return { success: false, message: error.message };

    // Auto-reply if client sent the message
    if (data.sender === 'client') {
      setTimeout(async () => {
        const { data: fresh } = await supabase
          .from('tickets').select('messages, status').eq('id', data.ticketId).single();
        if (fresh && fresh.status === 'Active') {
          const updated = [
            ...fresh.messages,
            {
              sender: BOT_SENDER,
              senderName: BOT_NAME,
              text: 'Thank you for the update. Our team is running tests on the staging server.',
              time: nowTime(),
            },
          ];
          await supabase.from('tickets').update({ messages: updated }).eq('id', data.ticketId);
        }
      }, 1500);
    }

    return { success: true, message: 'Message sent' };
  },

  assign: async (ticketId: string, assignedTo: string, status?: string): Promise<ApiResponse> => {
    const { error } = await supabase
      .from('tickets')
      .update({ assigned_to: assignedTo, status: status || 'Active' })
      .eq('id', ticketId);
    if (error) return { success: false, message: error.message };
    return { success: true, message: 'Ticket assigned' };
  },

  close: async (ticketId: string): Promise<ApiResponse> => {
    const { error } = await supabase.from('tickets').update({ status: 'Resolved' }).eq('id', ticketId);
    if (error) return { success: false, message: error.message };
    return { success: true, message: 'Ticket closed' };
  },
};
