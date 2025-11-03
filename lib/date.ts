export function daysLeft(toISO?: string) {
    if (!toISO) return 0;
    const now = new Date();
    const to = new Date(toISO);
    const diff = Math.ceil((to.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(diff, 0);
  }
  