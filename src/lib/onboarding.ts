// Decorative cover art for the marketing/onboarding screens only (not catalogue data).
const cover = (isbn: string) => `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg`;

export const showcaseCovers = {
  atomicHabits: cover("9780735211292"),
  cleanCode: cover("9780132350884"),
  deepWork: cover("9781455586691"),
  gatsby: cover("9780743273565"),
  mockingbird: cover("9780061120084"),
  sapiens: cover("9780062316097"),
  pragmatic: cover("9780135957059"),
  orwell: cover("9780451524935"),
  algorithms: cover("9780262046305"),
  zero: cover("9780804139298"),
};

export const ONBOARDED_KEY = "smart-library:onboarded";
