import { describe, expect, it } from 'vitest';
import { filterCatalogue } from '@/services/catalogue';
import type { Book } from '@/types/library';
const base: Book = { id: 'a', title: 'Clean Code', isbn: '9780132350884', authors: ['Robert Martin'], description: 'A handbook of software craftsmanship', category: { id: 'c', slug: 'programming', name: 'Programming', tone: 'blue' }, availableCopies: 2, totalCopies: 3, publisher: null, department: null, language: 'English', publicationYear: 2008, coverUrl: null, rating: 4, popularity: 2, pages: null, featured: false, createdAt: '2026-01-01' };
const second: Book = { ...base, id: 'b', title: 'Atomic Habits', authors: ['James Clear'], isbn: '9780735211292', description: 'Build better habits', availableCopies: 0, category: { ...base.category, id: 'd', slug: 'self-help', name: 'Self Help', tone: 'lime' }, createdAt: '2026-02-01' };
describe('Public catalogue browsing', () => {
  it('shows every catalogue book without a filter', () => expect(filterCatalogue([base, second], {})).toHaveLength(2));
  it.each(['Clean Code', 'Robert Martin', '9780132350884', 'craftsmanship'])('searches title, author, ISBN and description: %s', q => expect(filterCatalogue([base, second], { q }).map(b => b.id)).toEqual(['a']));
  it('filters by category/genre', () => expect(filterCatalogue([base, second], { category: 'self-help' }).map(b => b.id)).toEqual(['b']));
  it('filters by available copies only', () => expect(filterCatalogue([base, second], { availableOnly: true }).map(b => b.id)).toEqual(['a']));
  it('sorts by newest', () => expect(filterCatalogue([base, second], { sort: 'recent' }).map(b => b.id)).toEqual(['b', 'a']));
  it('sorts by title', () => expect(filterCatalogue([base, second], { sort: 'title' }).map(b => b.id)).toEqual(['b', 'a']));
  it('sorts by author', () => expect(filterCatalogue([base, second], { sort: 'author' }).map(b => b.id)).toEqual(['b', 'a']));
});
