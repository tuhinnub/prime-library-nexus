import { cloudLibraryService } from "./cloud-library-service";
import type { LibraryService } from "./library-service";

/** Swap this binding to a C++-backed HTTP adapter when the core is exposed as an API. */
export const library: LibraryService = cloudLibraryService;
export type { LibraryService };
