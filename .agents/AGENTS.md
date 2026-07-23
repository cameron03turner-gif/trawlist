# UI Design Rules

When creating or modifying components, please adhere to the following styling rules to maintain consistency across the Trawlist web app:

## Cards and Panels
1. **Background**: All cards and panels should use `bg-surface` or `bg-surface-alt` (never Tailwind default grays like `bg-neutral-900`).
2. **Borders**: All cards and panels must feature an amber border by default (`border border-amber`). Do **not** use `border-border` around surface color elements, as these were intentionally removed for a cleaner look.
3. **Hover Effects**: All interactive cards and panels must have dynamic hover effects that make them "grow" slightly and cast an amber-tinted shadow. Use the following classes for standard interactive cards: `hover:scale-[1.02] hover:shadow-xl hover:shadow-amber/10 hover:brightness-110 transition-all duration-300`.
4. **Thumbnails**: When a card contains a thumbnail image and uses a grid layout, the thumbnail should have no padding around it (it should sit flush with the card's edge). To ensure the image respects the card's rounded corners, the parent container must have `overflow-hidden`.

## Colors
- Rely on the custom color scheme defined in `tailwind.config.ts`: `bg`, `surface`, `surface-alt`, `border`, `ink`, `muted`, `amber`, and `rec`.
- Do not use Tailwind's default `neutral`, `gray`, `zinc`, or `slate` palettes for backgrounds, borders, or text.

## Standard Card Components
To keep card design consistent and easy to maintain, always use one of the existing card templates depending on the context:
- **`VideoGridCard`**: Used for standard video grids (e.g., Home, Profile, Videos tabs).
- **`VideoRow`**: Used for standard list rows (e.g., the Channel page).
- **`ListVideoRow`**: Used specifically for videos within editable custom Lists.
- **`FeedItemCard`**: Used for rendering events in the Activity Feed.
- **`ListCard`**: Used for rendering collections/playlists of videos (Lists).

## Links and Navigation
- **Clickable Entities**: Any time a video title, channel name, or user name is displayed, it must be wrapped in a `<Link>` pointing to its corresponding detail page. This promotes discoverability and a connected user experience.

## Consistency and Terminology
- **Icons**: Always use `lucide-react` for icons. Ensure the exact same icon is used for identical actions across the site (e.g., always use `Trash2` for deleting, `Edit2` for editing).
- **Action Text**: Use the exact same button text/labels for identical functions (e.g., don't mix "Save Changes" on one page with "Update" on another).
- **Button Hierarchy**: Maintain a strict visual hierarchy. Primary actions use the accent color (`bg-amber text-bg`), Secondary actions use surface layers (`bg-surface-alt border border-border text-ink`), and Destructive actions use the red accent (`text-rec hover:bg-rec/10`).

## Interactivity and States
- **Focus Rings**: All clickable elements (buttons, custom inputs, dropdown toggles) must have a distinct keyboard focus state (e.g., `focus:outline-none focus:ring-2 focus:ring-amber`) to ensure accessibility.
- **Empty States**: Never display a blank area when data is missing. Use a standardized empty state featuring a centered layout, a relevant muted icon from `lucide-react`, and descriptive `text-muted` text.
- **Loading Skeletons**: Complex components should use animated skeleton loaders (`animate-pulse bg-surface-alt rounded-lg`) that mimic the shape of the content, rather than using generic loading spinners.

## Modals and Overlays
- **Backdrops**: All modals and popups must use a consistent backdrop styling (e.g., `bg-black/60 backdrop-blur-sm z-50`).
- **Container Styling**: Modal containers should feel like elevated surfaces, typically utilizing `bg-surface border border-border rounded-2xl shadow-xl`.
