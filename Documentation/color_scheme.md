# Scrubbed UI Color Scheme

The color scheme for the Scrubbed UI is defined directly in the Tailwind CSS configuration. Here is the full breakdown of the colors and where they are located.

## Colors

| Name | Hex Code | Purpose/Usage |
| :--- | :--- | :--- |
| **`bg`** | `#0F141F` | The main background color for the application. |
| **`surface`** | `#171E2C` | Used for cards, panels, and elevated surfaces. |
| **`surface-alt`** | `#1F2837` | An alternative, slightly lighter surface color (used for active item states and avatars). |
| **`border`** | `#2A3446` | Used for subtle borders and dividers between elements. |
| **`ink`** | `#EDEFF3` | The primary text color (high contrast against dark backgrounds). |
| **`muted`** | `#8996AC` | Used for secondary text, descriptions, and deactivated/idle elements. |
| **`amber`** | `#E8B34D` | The primary accent color, used for prominent UI elements, active states, and ratings. |
| **`rec`** | `#E4572E` | An alert or error color, likely used for "recording" indicators, destructive actions, or warnings. |

## File Locations

The color palette is centrally defined and applied in the following locations within the `c:\scrubbed` directory:

1. [**`tailwind.config.ts`**](file:///c:/scrubbed/tailwind.config.ts)
   - **Location:** Project Root
   - **Details:** The color palette is defined here inside `theme.extend.colors`. This makes all the colors available as Tailwind utility classes (e.g., `bg-surface`, `text-amber`, `border-border`).

2. [**`src/app/globals.css`**](file:///c:/scrubbed/src/app/globals.css)
   - **Location:** `c:\scrubbed\src\app\globals.css`
   - **Details:** The `bg` color (`#0F141F`) is explicitly set as the `background-color` for the `body` element in this global stylesheet to ensure the base background is applied across the entire app before Tailwind utilities fully hydrate.
