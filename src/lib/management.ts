import type { ManagementAccess } from '@/types/library';
export function canEnterManagement(access: ManagementAccess | null, ownerOnly = false) {
  return ownerOnly ? access?.superAdmin === true : access?.staff === true;
}
export const managementHead = (title: string, description: string) => ({ meta: [
  { title: `${title} — Smart Library` }, { name: 'description', content: description },
  { property: 'og:title', content: `${title} — Smart Library` }, { property: 'og:description', content: description },
  { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary' }, { name: 'robots', content: 'noindex' },
] });
