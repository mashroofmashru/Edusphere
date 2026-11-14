# EduSphere UI Improvements

This document describes the UI overhaul in commit `a218fe6` ("feat: UI overhaul across student, instructor and admin areas"). For each change it explains what was wrong before and how the change helps.

All changes are in `client/`. The backend is unchanged.

---

## 1. Fixes for things that were broken

| Change | Before | How it helps |
|---|---|---|
| Missing Tailwind colours added (full `navy-50`–`900` scale, `font-display`) | Classes like `navy-50`, `navy-500`, `accent-blue` did nothing. The selected quiz answer had no highlight and avatars and info tiles had no colour. | Every colour used in the app now renders, and quiz answers show which option is selected. |
| Undefined CSS classes defined in `index.css` (`custom-scrollbar`, `hide-scrollbar`, `animate-fade-in-up`, `animate-slide-in-right`) | Scrollbars, animations and the toast slide-in did nothing. | Animations and thin scrollbars now work. They also respect the "reduce motion" accessibility setting. |
| Fonts | `Outfit`, `Inter` and `Cinzel` were referenced but never loaded, so the player and certificate fell back to default fonts. | Fonts are consistent, and the certificate uses its serif font. |
| Placeholder images | `via.placeholder.com` no longer works, so every course without a thumbnail showed a broken image. | A built-in placeholder image is used instead (`utils/format.js`), so nothing breaks. |
| One thumbnail URL helper (`courseThumb`) | Thumbnail URLs were built three different ways, and some pages broke on relative upload paths. | Thumbnails behave the same on every page. |
| Favicon | Empty `href`, so no tab icon. | The tab shows an EduSphere icon. |
| Pro-only icon (`fa-sparkles`) | Rendered blank in the AI chat. | Replaced with a free icon. |
| Dead buttons and links (section delete, "Explore Courses" on Profile, footer links) | Clicking them did nothing. | All of them work now. |
| `/admin` route | Anyone could open the admin shell. | Only admins can open it. |
| 404 page | Unknown URLs showed a blank page. | A "Page not found" page links back to Home and Courses. |
| Course form category | Editing a course reset its category to the first one in the list. | The saved category is kept. |
| Free courses | A price of `0` failed "Price is required", so free courses couldn't be saved. | Free (₹0) courses can be created and edited, and show as **Free**. |
| Instructor name change | Saved to the wrong storage key, so the new name didn't appear until you logged in again. | The name updates everywhere immediately. |

---

## 2. App-wide consistency

- **Toasts and confirm dialogs instead of `alert()` / `window.confirm()`.** All 20 browser popups now use the app's own toast and confirm dialog (`context/UIContext.jsx`). Popups block the page and look out of place. The new messages match the design and are easy to read. Delete confirmations name the item being deleted.
- **Shared components** (`components/UI/Modal.jsx`, `components/UI/Feedback.jsx`) for modals, spinners, skeletons and empty states. Modals close with **Esc** or a backdrop click and manage keyboard focus, so every screen looks and behaves the same.
- **One layout for instructor and admin pages** (`components/Navbar/DashboardShell.jsx`). The floating bottom-right menu button covered content. On mobile there's now a top bar with a slide-in menu, and the sidebar shows the real logged-in user instead of a hardcoded "Admin User".
- **Navigation without full page reloads.** Navbar links use React Router instead of plain `<a>` tags. Before, every click reloaded the whole app. Now moving between pages is instant, the active link is highlighted, and the mobile menu closes after you tap a link.
- **One footer** on every public page, instead of three different ones.
- **Page titles and scroll position.** Each page sets its own browser-tab title and starts at the top.
- **Accessibility:**
  - visible keyboard focus rings;
  - labels on icon-only buttons;
  - form labels linked to their inputs;
  - clickable cards are real links, so keyboard and screen-reader users can reach them.
- **Error screen.** The error boundary shows a styled message with a way back instead of a bare "Something went wrong."

---

## 3. Student experience

### Login and signup
- Errors appear inside the form instead of in popups.
- Show/hide toggle on password fields.
- Signup asks for a password of at least 6 characters, with hints as you type.
- A clear **Learn / Teach** choice replaces the small "Sign up as Instructor" checkbox, and explains that teaching needs admin approval.
- After logging in you return to the page you came from (for example, the course you tried to enrol in).
- The card fits small phone screens and no longer clips the signup form.
- "Forgot password?" links to the support contact form. There's no reset feature in the backend yet.
- A **Back to home** link, and signed-in users are redirected away from the login page.

### Home and Explore
- The banner has a main **Browse Courses** button and a second button: **Get Started Free** for visitors, **Continue Learning** for signed-in students.
- Stats show a loading placeholder instead of flashing made-up numbers ("50,000+") before the real ones load.
- **Featured courses** are the highest-rated ones, not a random shuffle that changed on every visit.
- **Explore:**
  - categories load once instead of on every keystroke;
  - search has a clear (×) button;
  - level, price and sort filters;
  - a result count;
  - "no results" offers a **Clear all filters** button.

### Course cards
- Cards are real links, so you can open them in a new tab.
- Titles and descriptions are trimmed to two lines, so the grid lines up.
- Free courses show **Free**. Courses without a rating show **New**.
- Images load only when scrolled into view.

### Course detail page
- On mobile, a sticky bar at the bottom always shows the price and the enrol button. Before, the button sat below all the reviews.
- The button reflects the price: **Enroll for Free**, **Enroll Now · ₹X**, or **Go to Course**.
- The "secure payment" note is hidden for free courses and for students who are already enrolled.
- Curriculum sections are collapsible and show lesson counts, durations, quiz question counts and free-preview badges.
- Courses with no reviews show **No ratings yet** instead of "0 out of 5".
- The review form shows its errors inline.
- Loading and "course not found" pages keep the navbar.

### Course player
- **Previous / Next** lesson buttons.
- Opens at your first unfinished lesson.
- YouTube and Vimeo links now play; before, only direct video files worked.
- Text lessons no longer show the title twice.
- The sidebar shows real durations instead of a fake "5m" and has a close button on mobile.
- **Quiz:**
  - shows the pass mark;
  - question dots let you jump between questions;
  - you can't submit with unanswered questions;
  - after submitting you can **review your answers** and **continue** to the next lesson.
- **Certificate** opens in the preview instead of an alert showing its ID.
- **AI tutor:**
  - fits small phones;
  - shows formatting in replies (bold, lists, code);
  - suggests starter questions;
  - closes with Esc.
- The design matches the rest of the app instead of a separate purple/glass style.

### My Courses, Profile and Certificate
- Each enrolled course shows a **progress bar**. **Resume Learning** is always visible, so it works on touch screens.
- Profile: you can **edit your name** and see enrolled courses and certificates earned. The header wraps properly on mobile.
- The certificate preview **scales to fit phones**, and the downloaded PDF is still full size.

---

## 4. Instructor experience

- **My Courses:**
  - status badges are coloured by status (Published green, Draft amber, Archived grey); before, they were always green;
  - card layout on phones;
  - edit and delete buttons have tooltips;
  - delete asks for confirmation and names the course.
- **Students:** search across name, email and course, with a result count and a card layout on mobile.
- **Reviews:** a rating summary and a filter by course. The comment alignment bug is fixed.
- **Dashboard:** loading placeholders, a friendly message when charts have no data, and brand colours on the charts.
- **Course form:**
  - delete and reorder sections and lessons, and delete quiz questions;
  - new fields: subtitle, lesson duration, free-preview toggle;
  - video upload shows progress and the file name;
  - thumbnail upload checks the size and can be removed;
  - quiz questions must have all four options filled in, and the correct answer is highlighted;
  - the save button matches what will happen (**Publish Course**, **Save as Draft** or **Save Changes**);
  - error dots on the tabs clear once the errors are fixed;
  - closing with unsaved changes asks for confirmation;
  - tighter spacing on mobile.
- **Settings:** website and LinkedIn fields are URL inputs.

---

## 5. Admin experience

- **Search, filters and pagination** on every table (courses, users, categories, enrollments, messages, instructor requests).
- Sidebar **badges** for unread messages and pending instructor requests, plus a banner on the dashboard when applications are waiting.
- Pending instructor requests are listed first, with **Approve** and **Reject** buttons on each row.
- Revenue is formatted as ₹ (Indian number format) with a rupee icon instead of a dollar sign.
- Every popup uses the shared modal.
- Loading skeletons on stat cards and tables, and messages when charts have no data.
- The delete button is hidden for admin accounts.

---

## 6. Effect on performance

This overhaul focused on correctness, mobile layouts and usability, **not speed**. The table below gives an honest summary.

| Effect | Change |
|---|---|
| Faster | Navbar links use React Router, so moving between pages no longer reloads the whole app. |
| Faster | Explore loads categories once instead of on every search keystroke. |
| Faster | Course images load only when scrolled into view. |
| Feels faster | Skeleton placeholders show the page layout immediately, and Explore keeps the current results visible while new ones load. |
| Slightly slower | My Courses makes one extra request per enrolled course to get its progress. |
| Slightly slower | Profile makes two extra requests to load its stats, and saving your name makes one more. |
| Unchanged | The main JavaScript file is still about **1.2 MB**, and the browser downloads all of it before any page shows. |

### Recommended next steps for speed
1. **Load each page's code only when it's visited** (`React.lazy` + `Suspense` in `App.jsx`). Then visitors to the home page don't download the admin dashboard, the chart library or the PDF code. This is the biggest win.
2. **Include progress in the `/users/my-courses` response** on the server, so My Courses needs one request instead of one per course.
3. **Resize course images** (for example, use Cloudinary transformations to serve smaller thumbnails on cards).

---

## 7. Known limitations

- There's no password change or self-service password reset; the backend has no endpoints for them.
- About-page team cards show initials until real photos are added.
- These changes were checked with a production build and lint. They have not been tested with a running backend and real data, so the main flows should be clicked through:
  - signup and enrolment;
  - course player and quiz;
  - creating and editing a course;
  - admin tables.
