import type { Book, BookFilters } from '@/types/library';

export function filterCatalogue(books: Book[], filters: BookFilters): Book[] {
  const term = filters.q?.trim().toLocaleLowerCase();
  return books.filter(book =>
    (!term || [book.title, book.isbn, book.description, book.department, book.category?.name, ...book.authors].filter(Boolean).join(' ').toLocaleLowerCase().includes(term)) &&
    (!filters.category || book.category?.slug === filters.category) &&
    (!filters.author || book.authors.includes(filters.author)) &&
    (!filters.language || book.language === filters.language) &&
    (!filters.year || book.publicationYear === filters.year) &&
    (!filters.availableOnly || book.availableCopies > 0)
  ).sort((a,b) => {
    switch (filters.sort) {
      case 'title': return a.title.localeCompare(b.title);
      case 'author': return a.authors.join(', ').localeCompare(b.authors.join(', ')) || a.title.localeCompare(b.title);
      case 'recent': return b.createdAt.localeCompare(a.createdAt);
      case 'rating': return b.rating-a.rating;
      default: return b.popularity-a.popularity;
    }
  });
}
