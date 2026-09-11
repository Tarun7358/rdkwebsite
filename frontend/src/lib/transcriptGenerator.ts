import type { Ticket } from '../types';

/**
 * Generates an official, structured plaintext transcript for any support/engineering ticket.
 */
export function generateTicketTranscript(ticket: Ticket): string {
  const generatedAt = new Date().toLocaleString('en-US', {
    dateStyle: 'full',
    timeStyle: 'medium',
  });
  const divider = '='.repeat(72);
  const subDivider = '-'.repeat(72);

  let transcript = '';
  transcript += `${divider}\n`;
  transcript += `                   RDK TECH ENTERPRISE SUPPORT TICKET\n`;
  transcript += `                     OFFICIAL COMMUNICATION TRANSCRIPT\n`;
  transcript += `${divider}\n\n`;

  transcript += `TICKET METADATA:\n`;
  transcript += `${subDivider}\n`;
  transcript += `Ticket ID:          ${ticket.id}\n`;
  transcript += `Subject:            ${ticket.title}\n`;
  transcript += `Client Email:       ${ticket.client}\n`;
  transcript += `Category:           ${ticket.category || 'General Support'}\n`;
  transcript += `Priority Level:     ${ticket.priority || 'Normal'}\n`;
  transcript += `Current Status:     ${ticket.status}\n`;
  transcript += `Lead Engineer:      ${ticket.assignedTo || 'Unassigned / Engineering Pool'}\n`;
  transcript += `Transcript Date:    ${generatedAt}\n`;
  transcript += `System Engine:      RDK Tech Real-Time Communication Sync (v2.6)\n\n`;

  transcript += `INITIAL ISSUE SCOPE & DESCRIPTION:\n`;
  transcript += `${subDivider}\n`;
  transcript += `${ticket.description || ticket.title || 'No initial description recorded.'}\n\n`;

  transcript += `COMMUNICATION LOG & MESSAGE HISTORY (${(ticket.messages || []).length} entries):\n`;
  transcript += `${subDivider}\n`;

  if (!ticket.messages || ticket.messages.length === 0) {
    transcript += `[No message exchanges recorded yet]\n\n`;
  } else {
    ticket.messages.forEach((msg, idx) => {
      const roleLabel = msg.sender === 'client' ? '[CLIENT]' : '[RDK ENGINEERING]';
      transcript += `\n[Message #${idx + 1}]  ${msg.time || 'N/A'}\n`;
      transcript += `From: ${roleLabel} ${msg.senderName || 'Authorized User'}\n`;
      transcript += `Body: ${msg.text}\n`;
      transcript += `${'-'.repeat(40)}\n`;
    });
    transcript += `\n`;
  }

  transcript += `${divider}\n`;
  transcript += `CONFIDENTIALITY NOTICE:\n`;
  transcript += `This transcript contains proprietary communication between RDK Tech and the registered\n`;
  transcript += `client. All intellectual property, code snippets, and diagnostic dumps are strictly\n`;
  transcript += `confidential under RDK Master Services Agreement.\n`;
  transcript += `${divider}\n`;

  return transcript;
}

/**
 * Initiates browser download of the ticket transcript file.
 */
export function downloadTicketTranscript(ticket: Ticket): void {
  const content = generateTicketTranscript(ticket);
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  
  const sanitizedTitle = (ticket.title || 'Ticket')
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .slice(0, 30);
  
  link.href = url;
  link.download = `RDK-Transcript-${ticket.id}-${sanitizedTitle}.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
