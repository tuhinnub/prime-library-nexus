# Prime Library Nexus

PROJECT NAME:
Libra

PROJECT TYPE:
Full-Stack Dynamic Library Management Web Application

PRIMARY DEVELOPMENT PLATFORM:
Lovable

FRONTEND:
React + TypeScript

DESIGN:
Premium Minimalist Digital Library UI

THEME:
Light Mode Only

PROJECT GOAL:
Build a complete, modern, responsive, dynamic,
database-driven Smart Library Management System
that combines beautiful online book discovery
with real university library management features.

====================================================
1. CRITICAL DESIGN REFERENCE INSTRUCTIONS
====================================================

I have uploaded a reference image showing a premium
mobile reading application called Readly.

THIS IMAGE IS THE PRIMARY VISUAL DESIGN REFERENCE
FOR THE ENTIRE APPLICATION.

Recreate the reference's visual design language
as closely as possible.

The new application must feel like the same
beautiful, minimalist, premium reading platform.

However, replace all Readly branding with:

SMART LIBRARY

IMPORTANT:

Do not create a generic library website.

Do not create a traditional university portal.

Do not create a corporate SaaS dashboard.

Do not create an unrelated modern UI.

Follow the uploaded reference image closely.

Preserve its:

- Minimalist appearance
- Editorial typography
- Book cover compositions
- Floating book illustrations
- Soft shadows
- Rounded cards
- Large whitespace
- Clean navigation
- Elegant button styling
- Book collection grid
- Colorful category cards
- Premium onboarding layouts
- Smooth page transitions

The reference image controls the visual style.

My project requirements control the functionality.

Both must be followed.

====================================================
2. STRICT COLOR PALETTE
====================================================

Use my custom brand color palette.

PRIMARY BRAND COLOR:

Elite Blue:
#0251B0

ACCENT COLOR:

Volt Lime:
#D1FF42

SECONDARY COLOR:

Blue Gray:
#C7D1DD

BASE COLOR:

White:
#FFFFFF

ADDITIONAL NEUTRAL COLORS:

Background:
#F8FAFC

Primary Text:
#14213D

Secondary Text:
#64748B

Borders:
#E5EAF0

Card Background:
#FFFFFF

DESIGN RULES:

Use Elite Blue for:

- Primary buttons
- Active navigation
- Important headings
- Links
- Selected filters
- Interactive elements

Use Volt Lime for:

- Accent badges
- Selected highlights
- Decorative details
- Important indicators
- Special call-to-action accents

Use Blue Gray for:

- Secondary backgrounds
- Inactive controls
- Subtle gradients
- Decorative cards
- Borders

Keep the entire website in LIGHT MODE.

Do not implement dark mode.

Avoid excessive blue backgrounds.

Use white as the dominant background.

The design must look premium, clean,
modern, and professional.

====================================================
3. TECHNOLOGY STACK
====================================================

Use:

React
TypeScript
Vite
Tailwind CSS
shadcn/ui
Lucide Icons
React Router

For animations:

Framer Motion / Motion for React

For backend and database:

Use a supported persistent backend and
PostgreSQL database integration if available.

The project also includes C++ core logic.

IMPORTANT:

The existing C++ modules may eventually
provide library business logic.

Do not pretend that browser-side React
can execute C++ directly.

Create a clean API/service abstraction
so the frontend can later communicate
with the existing C++ backend.

Do not replace existing C++ business logic
without checking the repository.

Keep backend integration modular.

====================================================
4. APPLICATION ARCHITECTURE
====================================================

Use a clean, modular architecture.

Suggested folders:

src/
  components/
    ui/
    layout/
    books/
    navigation/
    forms/
    shared/

  pages/
    onboarding/
    auth/
    user/
    admin/

  hooks/

  services/

  lib/

  types/

  contexts/

  assets/

  routes/

Use reusable components.

Use TypeScript interfaces for data models.

Keep UI components separate from
database operations.

Avoid hardcoded business logic inside pages.

====================================================
5. APPLICATION USER ROLES
====================================================

Support these roles:

1. Student
2. Faculty Member
3. Librarian
4. Administrator

Optional future role:

Public Reader

Use role-based authentication.

Users must only access features
allowed by their roles.

IMPORTANT:

Role permissions must be enforced
on the backend.

Do not rely only on hiding buttons.

Never allow users to assign themselves
administrator permissions.

====================================================
6. APPLICATION ROUTES
====================================================

Create these routes:

PUBLIC:

/
 /welcome
 /onboarding
 /login
 /register
 /forgot-password

USER:

/dashboard
/explore
/books/:id
/my-library
/my-library/borrowed
/my-library/reservations
/my-library/history
/favorites
/reservations
/due-dates
/fines
/notifications
/profile
/settings

ADMIN:

/admin
/admin/books
/admin/books/add
/admin/categories
/admin/authors
/admin/users
/admin/borrowings
/admin/reservations
/admin/fines
/admin/reports
/admin/settings

IMPORTANT:

Build the user-facing experience first.

Keep the admin section separate.

Admin functionality can be implemented
in a later development phase.

====================================================
7. SPLASH SCREEN
====================================================

Recreate the first screen of the
uploaded Readly reference.

Background:

Very light gray / white.

Center:

Smart Library

Typography:

Bold
Minimal
Perfectly centered

Bottom:

Extremely subtle gradient using:

Elite Blue
Blue Gray
Volt Lime

The gradient must be soft and blurred.

No unnecessary illustrations.

No buttons.

No navigation.

ANIMATION:

Brand name fades in.

After approximately 2 seconds,
navigate to the welcome screen.

Do not repeatedly show onboarding
to returning authenticated users.

====================================================
8. WELCOME ONBOARDING
====================================================

Recreate the second reference screen.

TOP:

Skip button.

CENTER:

Floating overlapping book covers.

Use realistic book cover images.

Suggested books:

Atomic Habits
Clean Code
Deep Work

The covers should have:

- Slight rotation
- Natural overlapping
- Soft shadows
- Premium floating appearance

HEADING:

Welcome
to Smart Library

DESCRIPTION:

Discover, borrow, and explore books
in one smart library.

BOTTOM:

Primary Button:

Continue →

Button Color:

Elite Blue

Footer:

Already have an account? Log in

Use the same layout proportions
as the reference image.

====================================================
9. ONBOARDING SCREEN 03
====================================================

Recreate the third reference screen.

TOP:

Back button
Skip button

CENTER:

Beautiful floating bookshelf illustration.

Use multiple book covers.

Use translucent blue-gray shelves
and subtle Volt Lime accents.

HEADING:

Customize
Your Library

DESCRIPTION:

Discover books from your favorite
categories and build your collection.

BOTTOM:

Continue →

Use the same layout as the reference.

====================================================
10. ONBOARDING SCREEN 04
====================================================

Create the final onboarding screen.

Use the same visual composition as
the fourth reference screen.

Replace referral rewards with
library-related functionality.

Use floating book covers and
small decorative elements.

Include a floating notification:

"Book Available"

"Your requested book is ready."

HEADING:

Borrow Books
With Ease

DESCRIPTION:

Reserve books, track due dates,
and manage your library activity.

BOTTOM:

Get Started →

Navigate to registration or login.

====================================================
11. AUTHENTICATION SCREEN
====================================================

Recreate the fifth reference screen.

TOP:

Beautiful collage of colorful book covers.

HEADING:

A Better Way
to Explore Books

AUTHENTICATION OPTIONS:

Continue with Email

Continue with Google
(if authentication provider is configured)

Already have an account? Log in

Create:

Login Page
Registration Page
Forgot Password Page

Registration fields:

Full Name
Email
Password
Confirm Password

Optional profile fields:

University ID
Department
Semester

Use secure authentication.

Passwords must never be stored
as plain text.

Provide proper validation.

Do not create fake authentication.

====================================================
12. USER DASHBOARD
====================================================

Create a beautiful user dashboard
inspired by the sixth and seventh
reference screens.

HEADER:

Welcome back,
[User Name]

Search Icon
Notification Icon
Profile Avatar

MAIN CONTENT:

Featured Books

Recommended Books

Popular Categories

Recently Added Books

My Borrowed Books

Upcoming Due Dates

My Reservations

Create beautiful book category cards.

Use translucent colored backgrounds.

Use overlapping book covers.

CATEGORY EXAMPLES:

Programming
Computer Science
Mathematics
Literature
Science
Business

Use a premium editorial layout.

Do not create an admin-style dashboard.

====================================================
13. BOOK DISCOVERY PAGE
====================================================

ROUTE:

/explore

Create a beautiful book discovery experience.

HEADER:

Explore Books

SUBTITLE:

Discover your next great read.

SEARCH:

Search by:

Book Title
Author
ISBN
Category
Department

FILTERS:

Category
Author
Language
Publication Year
Availability

SORT:

Most Popular
Recently Added
Title A-Z
Highest Rated

FEATURED SECTION:

Create a horizontal featured book carousel.

BOOK COLLECTION:

Use a responsive book grid.

Each book card displays:

Book Cover
Title
Author
Category
Availability
Favorite Button

ACTIONS:

View Details
Reserve Book (when eligible)

Use the same visual styling
as the uploaded reference.

====================================================
14. BOOK DETAILS PAGE
====================================================

ROUTE:

/books/:id

Create a premium book details page.

Use a large book cover.

Display:

Book Title
Author
ISBN
Publisher
Category
Department
Language
Publication Year
Description
Total Copies
Available Copies
Availability Status

ACTIONS:

Reserve Book
Add to Favorites
View Availability

IMPORTANT:

Only allow reservations according
to actual backend rules.

Do not allow invalid reservations.

Use a smooth shared-element book
cover transition where practical.

====================================================
15. MY LIBRARY PAGE
====================================================

ROUTE:

/my-library

Use the final screen of the
uploaded reference as inspiration.

HEADER:

My Library

FILTER TABS:

All
Borrowed
Reserved
History
Favorites

Display a beautiful two-column
book grid on mobile.

Each book card displays:

Book Cover
Title
Author
Borrowing Status
Due Date (if borrowed)
Reservation Status (if reserved)

ACTIONS:

View Details
View Reservation
View Borrowing Record

Use professional cards.

Keep the layout minimal.

Do not turn this page into
a generic data table.

====================================================
16. BOOK RESERVATION SYSTEM
====================================================

Allow authenticated users to
reserve eligible books.

Reservation flow:

1. User opens Book Details.
2. System checks availability.
3. User selects Reserve.
4. System validates eligibility.
5. Reservation is created.
6. User receives confirmation.
7. Reservation appears in My Library.

Reservation statuses:

Pending
Approved
Ready for Pickup
Cancelled
Completed
Expired

Use backend validation.

Prevent duplicate active reservations
when prohibited by library rules.

Do not allow users to modify
other users' reservations.

====================================================
17. BORROWED BOOKS
====================================================

ROUTE:

/my-library/borrowed

Display:

Book Cover
Book Title
Borrow Date
Due Date
Borrowing Status

Statuses:

Active
Due Soon
Overdue
Returned

Use professional status badges.

Highlight upcoming due dates.

Allow users to view borrowing history.

Do not allow users to mark
physical books as returned
without authorized verification.

====================================================
18. DUE DATE TRACKING
====================================================

ROUTE:

/due-dates

Display:

Currently Borrowed Books
Upcoming Due Dates
Overdue Books

Calculate due status from
actual borrowing records.

Show:

Days Remaining
Due Date
Book Title
Borrowing Status

Use visual indicators.

Do not hardcode due dates.

====================================================
19. FINE MANAGEMENT
====================================================

ROUTE:

/fines

Display:

Outstanding Fines
Paid Fines
Fine History

Each record shows:

Book
Due Date
Return Date
Overdue Days
Fine Amount
Payment Status

Fine calculation must follow
configurable library rules.

Do not hardcode a fine amount.

Do not implement fake payments.

Only enable payments when a
real payment provider is configured.

====================================================
20. FAVORITES
====================================================

ROUTE:

/favorites

Allow users to save books
to their favorites.

Features:

Add Favorite
Remove Favorite
View Favorites

Persist favorite records
in the database.

Update the UI immediately
after successful changes.

====================================================
21. NOTIFICATION SYSTEM
====================================================

ROUTE:

/notifications

Support notifications for:

Reservation Updates
Book Availability
Upcoming Due Dates
Overdue Books
Important Announcements

Display:

Notification Title
Message
Date
Read/Unread Status

Allow users to mark notifications
as read.

Persist notification state.

====================================================
22. USER PROFILE
====================================================

ROUTE:

/profile

Create a premium minimalist
user profile page.

Display:

Profile Photo
Full Name
Email
University ID
Department
Semester
Account Role

Allow users to update
permitted profile information.

Create a separate settings page.

Include:

Account Settings
Notification Preferences
Language Preferences
Logout

====================================================
23. ADMIN DASHBOARD
====================================================

Create a separate admin architecture.

The admin panel must use the
same design system but a more
management-focused layout.

ADMIN FEATURES:

Manage Books
Manage Authors
Manage Categories
Manage Users
Manage Book Copies
Manage Reservations
Manage Borrowings
Manage Fines
View Reports

ADMIN DASHBOARD METRICS:

Total Books
Available Books
Borrowed Books
Overdue Books
Registered Users
Pending Reservations

IMPORTANT:

The current development priority
is the user-facing website.

Do not spend the initial build
creating a complex admin interface.

Prepare protected admin routes
and reusable architecture.

Build detailed admin features later.

====================================================
24. DATABASE DESIGN
====================================================

Use a persistent relational database.

Suggested tables:

profiles
roles
books
authors
book_authors
categories
book_copies
borrow_records
reservations
favorites
fines
notifications

Use proper relationships.

Each book must have a unique ID.

Each physical book copy must
have a unique identifier.

Borrowing records must reference:

User
Book Copy
Borrow Date
Due Date
Return Date
Status

Reservations must reference:

User
Book
Reservation Date
Status

Fines must reference:

User
Borrowing Record
Amount
Payment Status

Use database constraints.

Use transactions for operations
that update multiple related records.

Enable row-level security or
equivalent backend authorization.

Users must not access private
records belonging to other users.

====================================================
25. DYNAMIC DATA REQUIREMENTS
====================================================

THIS IS EXTREMELY IMPORTANT.

The application must be dynamic.

Do not create a static website.

Do not rely on hardcoded arrays
as the permanent data source.

Use persistent database records.

Books must be loaded dynamically.

Search results must reflect
stored book records.

Availability must reflect
actual book copy records.

Reservations must persist.

Favorites must persist.

Borrowing records must persist.

User profiles must persist.

Notifications must persist.

Admin changes must update
the user-facing interface.

Use proper loading states.

Use error handling.

Use empty states.

Use success notifications.

Use optimistic updates only
when rollback is handled.

====================================================
26. RESPONSIVE DESIGN
====================================================

The application must work on:

Mobile
Tablet
Desktop

MOBILE:

Follow the uploaded Readly
reference image closely.

Use:

Bottom Navigation
Two-Column Book Grid
Rounded Cards
Compact Header
Horizontal Category Scrolling

TABLET:

Use adaptive layouts.

DESKTOP:

Use a professional responsive
web layout.

Preserve the same visual identity.

Use wider book grids.

Keep navigation intuitive.

Do not stretch mobile components
unnaturally across desktop screens.

====================================================
27. NAVIGATION SYSTEM
====================================================

USER NAVIGATION:

Home
Explore
My Library
Profile

MOBILE:

Use a floating rounded
bottom navigation bar.

Active item:

Elite Blue circular background.

Inactive icons:

Muted Blue Gray.

DESKTOP:

Use a clean top navigation
or compact sidebar.

Keep navigation consistent
across all user pages.

====================================================
28. ANIMATION SYSTEM
====================================================

Use professional micro-interactions.

ANIMATIONS:

Page Fade Transitions
Book Card Hover
Button Hover
Category Selection
Filter Transitions
Modal Animations
Notification Animations

BOOK COVER TRANSITION:

When a user clicks a book cover,
animate the selected cover toward
the Book Details page.

Use shared-element transitions
where supported.

Animation Duration:

250ms to 500ms

Use smooth easing.

Avoid excessive motion.

Respect reduced-motion preferences.

====================================================
29. REUSABLE COMPONENTS
====================================================

Create:

AppLayout
UserHeader
BottomNavigation
DesktopNavigation
BookCard
FeaturedBookCard
CategoryCard
SearchBar
FilterPanel
AvailabilityBadge
ReservationCard
BorrowedBookCard
FineCard
NotificationCard
ProfileCard
LoadingSkeleton
EmptyState
ErrorState
ConfirmDialog

All components must use
consistent design tokens.

====================================================
30. ACCESSIBILITY
====================================================

Use semantic HTML.

Provide accessible buttons.

Ensure sufficient text contrast.

Support keyboard navigation.

Provide visible focus indicators.

Add accessible labels.

Use meaningful error messages.

Support reduced motion.

Do not sacrifice accessibility
to imitate the reference image.

====================================================
31. SECURITY REQUIREMENTS
====================================================

Use secure authentication.

Validate user input.

Enforce role permissions
on the backend.

Protect private user records.

Use parameterized database queries
or safe ORM/database APIs.

Do not expose secrets
in frontend code.

Prevent unauthorized updates.

Use server-side validation
for reservations and borrowing.

Never trust client-side
availability checks alone.

====================================================
32. QUALITY REQUIREMENTS
====================================================

Use clean TypeScript.

Create reusable components.

Avoid duplicate logic.

Use consistent naming.

Handle API errors.

Handle empty database results.

Handle loading states.

Prevent broken navigation.

Use realistic demo data only
when clearly marked as demo data.

Do not claim unimplemented
features are functional.

====================================================
33. DEVELOPMENT PRIORITY
====================================================

PHASE 1:

Design System
Splash Screen
Onboarding
Authentication

PHASE 2:

User Dashboard
Book Discovery
Book Details
My Library

PHASE 3:

Reservations
Borrowing Records
Due Dates
Favorites

PHASE 4:

Notifications
Fines
Profile
Settings

PHASE 5:

Backend Integration
Database
Security
Testing

PHASE 6:

Admin Dashboard
Book Management
User Management
Reports

IMPORTANT:

Start with the user-facing experience.

Build incrementally.

Do not attempt to implement
everything in one uncontrolled step.

====================================================
34. FINAL INSTRUCTIONS
====================================================

Build a premium, modern, responsive,
dynamic Smart Library Management System.

Use the uploaded Readly reference image
as the main visual inspiration.

Use my exact brand palette:

Elite Blue #0251B0
Volt Lime #D1FF42
Blue Gray #C7D1DD
White #FFFFFF

LIGHT MODE ONLY.

The application should combine:

Premium Online Library UI

+

Functional University Library Management

+

Dynamic Database-Driven Features

+

Professional Responsive Web Design

+

Smooth Modern Animations

Do not generate only a landing page.

Do not create a static mockup.

Do not use placeholder buttons
that pretend to perform real actions.

Create a real application foundation
that can be extended and integrated
with existing C++ modules.

Begin with Phase 1 and Phase 2.

Establish the design system,
implement the user-facing pages,
and create the necessary backend
interfaces for future integration.

After completing the initial phase,
report:

- Pages created
- Components created
- Database tables created
- Features actually working
- Features using demo data
- Features pending integration
- Known limitations
- Recommended next steps

The final visual experience must
closely resemble the uploaded reference.

Prioritize design consistency,
real functionality, maintainability,
and security.         IMPORTANT DESIGN CORRECTION:

The current UI does not closely match

my uploaded reference image.

I want the entire Smart Library website

to follow the exact same visual language

as the uploaded Readly mobile app reference.

Keep the existing application functionality,

routes, database connections, and business logic.

Only improve the visual design.

Match the reference in:

1. Layout proportions

2. Typography hierarchy

3. Book cover presentation

4. Rounded card design

5. Minimalist navigation

6. Floating book illustrations

7. Spacing and alignment

8. Soft shadows

9. Button proportions

10. Overall premium editorial appearance

Use my brand palette:

Elite Blue: #0251B0

Volt Lime: #D1FF42

Blue Gray: #C7D1DD

White: #FFFFFF

Keep the website in light mode.

Do not introduce unrelated colors.

Do not use generic dashboard components.

Do not redesign the existing functionality.

Do not remove any working features.

The final UI should look like a premium

online library application inspired

directly by my reference image.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/c9c1a2dd-2ba9-443f-a05a-f5bb5fae2b5f).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
