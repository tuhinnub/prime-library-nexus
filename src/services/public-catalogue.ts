import { queryOptions } from '@tanstack/react-query';
import { library } from '@/services';
export const publicCatalogueQuery = queryOptions({
  queryKey: ['public-catalogue'], queryFn: () => library.publicCatalogue(), staleTime: 30_000,
});
