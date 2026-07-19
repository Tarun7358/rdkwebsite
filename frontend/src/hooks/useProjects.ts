import { useAppStore } from '../store/appStore';
import { useAuthStore } from '../store/authStore';

export function useProjects() {
  const user = useAuthStore((s) => s.user);
  const projects = useAppStore((s) => s.projects) ?? [];

  const myProjects = user
    ? projects.filter((p) => p.client === user.email)
    : [];

  const assignedProjects = user
    ? projects.filter((p) => p.assignedTo === user.email)
    : [];

  return { projects, myProjects, assignedProjects };
}
