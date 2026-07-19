import { useAppStore } from '../store/appStore';
import { useAuthStore } from '../store/authStore';

export function useTickets() {
  const user = useAuthStore((s) => s.user);
  const tickets = useAppStore((s) => s.tickets) ?? [];

  const myTickets = user
    ? tickets.filter((t) => t.client === user.email)
    : [];

  const assignedTickets = user
    ? tickets.filter((t) => t.assignedTo === user.email)
    : [];

  return { tickets, myTickets, assignedTickets };
}
