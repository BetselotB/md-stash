# Frontend Agent Architecture & UI/UX Component Master Guide

> **Corpus Root**: `/corpus`  
> **Canonical Components**: **8,072** TSX + Tailwind Components  
> **Master Catalog**: `corpus/catalog/index.json` & `corpus/catalog/INDEX.md`  
> **Target Audience**: Autonomous Frontend Agents, AI Coding Assistants (Antigravity, Cursor, Claude, Copilot), and Senior Design Engineers.

---

## 1. Executive Context & System Philosophy

### 1.1 Purpose of the Corpus
The **Component Corpus** (`cmtlib`) is a production-grade, offline-first collection of **8,072 unique canonical React + Tailwind CSS components** harvested and deduplicated across 25 leading open-source component registries and libraries (including Mantine, Base UI, assistant-ui, Material UI, React Aria, Ant Design, Ark UI, Square UI, HeroUI, Chakra UI, Magic UI, React Bits, Lucide, Headless UI, Radix UI, Motion, Animata, Tremor, Motion Primitives, Animate UI, and shadcn/ui).

Every component in this corpus adheres to five fundamental guarantees:
1. **Zero Vendor Lock-in (Copy-Paste Architecture)**: Components are standalone `.tsx` code blocks stored inside Markdown files (`/corpus/components/<category>/<slug>.md`). They can be directly injected into a project's `components/` directory without requiring proprietary CLI wrappers or private package tokens.
2. **Strict Multi-Level Deduplication**: The corpus eliminated 6,927 duplicates using exact SHA-256 content hashing, AST structural normalizations, and 64-bit SimHash (Hamming distance $\le 3$, cosine similarity $\ge 0.85$). There are **zero duplicate content or AST hashes** among the 8,072 canonical files.
3. **Permissive Open-Source Licensing**: 100% of components are verified under permissive open-source licenses (MIT, Apache-2.0, BSD, ISC).
4. **Standardized Tailwind + TypeScript Stack**: Code uses clean TypeScript, idiomatic JSX, Tailwind utility classes, and standard React hooks.
5. **Shared Utilities Separation**: Recurring helpers like `cn()` are extracted to `/corpus/shared/utils/cn.md`, keeping components decoupled and DRY.

### 1.2 Agent Operating Directives
When you (the frontend agent) are tasked with generating a page, screen, or design:
- **Do NOT build generic MVP components from scratch** when a battle-tested canonical component exists in `/corpus`.
- **Match user requirements against the 20 taxonomy categories** to retrieve the exact components needed.
- **Always extract and apply the appropriate design tokens and micro-interactions** specified in Section 2 to ensure interfaces feel premium, cohesive, and modern.

---

## 2. UI/UX Design System & Aesthetic Tokens

Interfaces built with this corpus must deliver an immediate **"WOW" first impression**. Avoid flat, uninspired, default browser styles. Follow these strict design guidelines:

### 2.1 Curated Semantic Color System (HSL / CSS Variables)
Components use Tailwind semantic variable tokens rather than raw hex values. Always bind colors to CSS variables so light/dark mode transitions seamlessly:

```css
:root {
  /* Surface Layers */
  --background: 224 71% 4%;
  --foreground: 213 31% 91%;
  
  --card: 224 71% 6%;
  --card-foreground: 213 31% 91%;
  
  --popover: 224 71% 6%;
  --popover-foreground: 215 20.2% 65.1%;

  /* Brand Accents */
  --primary: 263.4 70% 50.4%;        /* Vibrant Violet/Indigo */
  --primary-foreground: 210 40% 98%;
  
  --secondary: 215 27.9% 16.9%;
  --secondary-foreground: 210 40% 98%;

  --accent: 199 89% 48%;             /* Electric Cyan */
  --accent-foreground: 224 71% 4%;

  /* Utility & States */
  --muted: 215 27.9% 16.9%;
  --muted-foreground: 217.9 10.6% 64.9%;

  --destructive: 0 62.8% 30.6%;
  --destructive-foreground: 210 40% 98%;

  --border: 215 27.9% 16.9%;
  --ring: 263.4 70% 50.4%;
  
  --radius: 0.75rem;
}
```

### 2.2 Glassmorphism & Depth Layers
Use multi-layered surfaces with translucent border rings and backdrop blur to create physical depth:

```tsx
// Standard High-End Card Primitive
<div className="relative rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl shadow-2xl shadow-black/40 transition-all duration-300 hover:border-white/20 hover:bg-white/[0.07] hover:shadow-primary/10">
  {/* Ambient Gradient Glow */}
  <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-primary/20 blur-3xl pointer-events-none" />
  
  <div className="relative z-10">
    {/* Component Content */}
  </div>
</div>
```

### 2.3 Typography Hierarchy
- **Display & Hero Headings**: High-contrast sans-serif (e.g. *Inter*, *Plus Jakarta Sans*, *Outfit*) with negative letter spacing: `font-bold tracking-tight text-foreground text-4xl md:text-6xl`.
- **Section Headers**: `font-semibold tracking-normal text-2xl md:text-3xl text-foreground`.
- **Muted Subtitles**: `text-muted-foreground text-sm md:text-base leading-relaxed`.
- **Code & Monospace**: `font-mono text-xs tracking-wide text-accent`.

### 2.4 Micro-Interactions & Spring Physics
Components should never snap abruptly. Use Framer Motion (`motion/react` or `framer-motion`) with spring physics or smooth cubic-bezier transitions:

```tsx
import { motion } from 'framer-motion';

// Interactive Card / Button Spring Standard
<motion.button
  whileHover={{ scale: 1.02, y: -2 }}
  whileTap={{ scale: 0.98 }}
  transition={{ type: "spring", stiffness: 400, damping: 25 }}
  className="inline-flex items-center justify-center rounded-xl bg-primary px-6 py-3 font-medium text-primary-foreground shadow-lg shadow-primary/25 hover:shadow-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
>
  Explore Components
</motion.button>
```

---

## 3. Comprehensive Categorization Taxonomy (All 20 Categories)

The 8,072 canonical components are organized into **20 discrete functional categories** located in `/corpus/components/<category>/`. Below is the complete directory map, breakdown, and representative components for each category.

```
corpus/components/
├── 3d-and-canvas/               (8 components)
├── ai-chat/                     (313 components)
├── animation-primitives/        (83 components)
├── backgrounds/                 (32 components)
├── buttons/                     (169 components)
├── charts/                      (20 components)
├── cursors-and-pointer/         (13 components)
├── data-display/                (577 components)
├── feedback/                    (207 components)
├── hero-and-marketing-sections/ (77 components)
├── hooks/                       (143 components)
├── inputs-forms/                (431 components)
├── layout/                      (147 components)
├── media/                       (72 components)
├── misc/                        (4,182 components)
├── navigation/                  (454 components)
├── overlays/                    (481 components)
├── scroll-and-parallax/         (43 components)
├── selection/                   (526 components)
└── text-effects/                (94 components)
```

---

### Category 1: `ai-chat`
- **Path**: `corpus/components/ai-chat/`
- **Component Count**: **313**
- **UX Purpose**: Conversational UI, LLM message streaming, chat threads, tool-call approval cards, multimodal attachments, and prompt inputs.
- **Core Dependencies**: `@radix-ui/react-*`, `lucide-react`, `motion`
- **Representative Components**:
  | ID | Canonical Slug | Key Props | Source Origin | Typical Use Case |
  | :--- | :--- | :--- | :--- | :--- |
  | `chat` | `chat` | `messages`, `onSend`, `isGenerating` | `assistant-ui` | Complete AI assistant chat window |
  | `composer` | `composer` | `onSubmit`, `attachments`, `placeholder` | `assistant-ui` | Multi-line auto-expanding prompt input box |
  | `thread` | `thread` | `threadId`, `activeModel` | `assistant-ui` | Message history view with virtualization |
  | `branchpicker` | `branchpicker` | `currentBranch`, `totalBranches`, `onSelect` | `assistant-ui` | Alternative response switcher (1 of 3) |
  | `messageprimitive` | `messageprimitive` | `role`, `content`, `status` | `assistant-ui` | Assistant / User bubble with markdown rendering |
  | `toolcall-card` | `toolcall-card` | `toolName`, `args`, `status` | `assistant-ui` | Function calling execution & confirmation card |

---

### Category 2: `overlays`
- **Path**: `corpus/components/overlays/`
- **Component Count**: **481**
- **UX Purpose**: Contextual modal dialogs, drawers, popovers, hover cards, tooltips, sheets, alert dialogs, and slide-over panels.
- **Core Dependencies**: `@radix-ui/react-dialog`, `@radix-ui/react-popover`, `@radix-ui/react-tooltip`, `motion`
- **Representative Components**:
  | ID | Canonical Slug | Key Props | Source Origin | Typical Use Case |
  | :--- | :--- | :--- | :--- | :--- |
  | `dialog--radix-ui` | `dialog--radix-ui` | `open`, `onOpenChange`, `children` | `radix-ui` | Accessible modal dialog with backdrop overlay |
  | `drawer--vaul` | `drawer` | `open`, `direction`, `snapPoints` | `shadcn-ui` | Mobile-friendly sliding bottom sheet with drag gesture |
  | `popover--base-ui` | `popover--base-ui` | `trigger`, `content`, `side` | `base-ui` | Floating panel anchored to reference element |
  | `tooltip--heroui` | `tooltip--heroui` | `content`, `delay`, `placement` | `heroui` | Micro-help hover badge with arrow anchor |
  | `context-menu` | `context-menu` | `items`, `onSelect` | `radix-ui` | Right-click contextual action list |
  | `alert-dialog` | `alert-dialog` | `onConfirm`, `onCancel`, `title` | `mantine` | Destructive action confirmation popup |

---

### Category 3: `data-display`
- **Path**: `corpus/components/data-display/`
- **Component Count**: **577**
- **UX Purpose**: Dense information presentation, tabular data, metric counters, stat widgets, badges, user avatars, lists, and key-value inspect grids.
- **Core Dependencies**: `@tanstack/react-table`, `lucide-react`, `motion`
- **Representative Components**:
  | ID | Canonical Slug | Key Props | Source Origin | Typical Use Case |
  | :--- | :--- | :--- | :--- | :--- |
  | `avatar--shadcn-ui` | `avatar--shadcn-ui` | `src`, `fallback`, `size` | `shadcn-ui` | User image with initials fallback |
  | `badge--heroui` | `badge--heroui` | `variant`, `color`, `children` | `heroui` | Status pill (active, pending, error) |
  | `data-table` | `data-table` | `columns`, `data`, `pagination` | `shadcn-ui` | Sortable, filterable client-side data grid |
  | `card--tremor` | `card--tremor` | `decoration`, `decorationColor` | `tremor` | KPI metric dashboard card |
  | `timeline` | `timeline` | `items`, `activeItem` | `mantine` | Vertical audit trail or process milestone tracker |
  | `stat-group` | `stat-group` | `stats`, `trend` | `chakra-ui` | Revenue / KPI performance numbers with +/- delta |

---

### Category 4: `navigation`
- **Path**: `corpus/components/navigation/`
- **Component Count**: **454**
- **UX Purpose**: Wayfinding, app shell navigation, top bars, breadcrumbs, responsive sidebars, horizontal tabs, steppers, and pagination controls.
- **Core Dependencies**: `@radix-ui/react-tabs`, `@radix-ui/react-navigation-menu`, `lucide-react`
- **Representative Components**:
  | ID | Canonical Slug | Key Props | Source Origin | Typical Use Case |
  | :--- | :--- | :--- | :--- | :--- |
  | `sidebar--square-ui` | `sidebar--square-ui` | `items`, `activePath`, `collapsed` | `square-ui` | Collapsible dashboard navigation drawer |
  | `tabs--radix-ui` | `tabs--radix-ui` | `defaultValue`, `orientation` | `radix-ui` | Animated horizontal pill or line tab bar |
  | `breadcrumbs` | `breadcrumbs` | `segments`, `separator` | `react-aria` | Deep link hierarchy path with home icon |
  | `pagination--mantine` | `pagination--mantine` | `page`, `totalPages`, `onChange` | `mantine` | Numbered page navigator with next/prev buttons |
  | `stepper` | `stepper` | `activeStep`, `steps`, `onStepClick` | `mantine` | Multi-step form wizard progression bar |
  | `navigation-menu` | `navigation-menu` | `viewport`, `items` | `radix-ui` | Mega-menu dropdown with image callouts |

---

### Category 5: `inputs-forms`
- **Path**: `corpus/components/inputs-forms/`
- **Component Count**: **431**
- **UX Purpose**: User data entry, text inputs, password reveals, numeric steppers, date pickers, sliders, rich textareas, and file upload dropzones.
- **Core Dependencies**: `@radix-ui/react-slider`, `react-hook-form`, `lucide-react`
- **Representative Components**:
  | ID | Canonical Slug | Key Props | Source Origin | Typical Use Case |
  | :--- | :--- | :--- | :--- | :--- |
  | `input--shadcn-ui` | `input--shadcn-ui` | `type`, `placeholder`, `disabled` | `shadcn-ui` | Styled text input with focus ring and error state |
  | `slider--radix-ui` | `slider--radix-ui` | `min`, `max`, `step`, `value` | `radix-ui` | Range slider with draggable thumb |
  | `date-picker` | `date-picker` | `date`, `onSelect`, `mode` | `shadcn-ui` | Calendar popover date selection field |
  | `file-upload` | `file-upload` | `accept`, `maxSize`, `onDrop` | `mantine` | Drag-and-drop file upload zone with preview |
  | `pin-input` | `pin-input` | `length`, `onComplete` | `ark-ui` | 4-6 digit 2FA verification code input boxes |
  | `textarea--heroui` | `textarea--heroui` | `minRows`, `maxRows`, `autoResize` | `heroui` | Expanding multi-line text input |

---

### Category 6: `selection`
- **Path**: `corpus/components/selection/`
- **Component Count**: **526**
- **UX Purpose**: Multi-option selection, toggle switches, checkboxes, radio groups, multi-select comboboxes, and segment pickers.
- **Core Dependencies**: `@radix-ui/react-checkbox`, `@radix-ui/react-switch`, `@radix-ui/react-radio-group`
- **Representative Components**:
  | ID | Canonical Slug | Key Props | Source Origin | Typical Use Case |
  | :--- | :--- | :--- | :--- | :--- |
  | `switch--shadcn-ui` | `switch--shadcn-ui` | `checked`, `onCheckedChange` | `shadcn-ui` | iOS-style sliding on/off toggle |
  | `checkbox--radix-ui` | `checkbox--radix-ui` | `checked`, `indeterminate` | `radix-ui` | Accessible checkable box with checkmark svg |
  | `radio-group` | `radio-group` | `value`, `onValueChange`, `options` | `radix-ui` | Mutually exclusive list options with radio bullets |
  | `combobox` | `combobox` | `options`, `value`, `searchable` | `base-ui` | Searchable dropdown with typeahead autocomplete |
  | `segmented-control` | `segmented-control` | `data`, `value`, `onChange` | `mantine` | Sliding background pill selector |
  | `multi-select` | `multi-select` | `items`, `selected`, `maxCount` | `tremor` | Tag/pill multi-item select with chip removals |

---

### Category 7: `buttons`
- **Path**: `corpus/components/buttons/`
- **Component Count**: **169**
- **UX Purpose**: Primary, secondary, outline, ghost, icon, magnetic, shiny, and animated trigger buttons.
- **Core Dependencies**: `motion`, `lucide-react`
- **Representative Components**:
  | ID | Canonical Slug | Key Props | Source Origin | Typical Use Case |
  | :--- | :--- | :--- | :--- | :--- |
  | `button--shadcn-ui` | `button--shadcn-ui` | `variant`, `size`, `asChild` | `shadcn-ui` | Versatile base button supporting cva variants |
  | `shimmer-button` | `shimmer-button` | `shimmerColor`, `background` | `magic-ui` | Premium glowing border beam marketing button |
  | `magnetic-button` | `magnetic-button` | `strength`, `children` | `react-bits` | Mouse-following magnetic attraction button |
  | `icon-button` | `icon-button` | `icon`, `label`, `size` | `heroui` | Compact square action button with tooltip |
  | `split-button` | `split-button` | `primaryAction`, `menuItems` | `mui` | Main button with secondary dropdown arrow |
  | `ripple-button` | `ripple-button` | `rippleColor`, `onClick` | `magic-ui` | Material-style click wave expansion trigger |

---

### Category 8: `feedback`
- **Path**: `corpus/components/feedback/`
- **Component Count**: **207**
- **UX Purpose**: Notification banners, toast alerts, loading spinners, skeleton placeholders, empty state screens, and progress indicators.
- **Core Dependencies**: `@radix-ui/react-toast`, `lucide-react`, `motion`
- **Representative Components**:
  | ID | Canonical Slug | Key Props | Source Origin | Typical Use Case |
  | :--- | :--- | :--- | :--- | :--- |
  | `toast--sonner` | `toast--sonner` | `message`, `type`, `action` | `shadcn-ui` | Stacked floating corner toast notification |
  | `alert--shadcn-ui` | `alert--shadcn-ui` | `variant`, `title`, `description` | `shadcn-ui` | In-page callout banner (info, warning, error) |
  | `skeleton` | `skeleton` | `className`, `animate` | `shadcn-ui` | Pulsing placeholder for loading cards and text |
  | `progress--radix-ui` | `progress--radix-ui` | `value`, `max` | `radix-ui` | Rounded completion bar with fluid progress fill |
  | `spinner` | `spinner` | `size`, `color` | `heroui` | Smooth circular rotating loader |
  | `empty-state` | `empty-state` | `title`, `action`, `illustration` | `mantine` | Zero-data screen with call to create action |

---

### Category 9: `hero-and-marketing-sections`
- **Path**: `corpus/components/hero-and-marketing-sections/`
- **Component Count**: **77**
- **UX Purpose**: High-converting landing page heroes, feature showcases, pricing comparison matrices, testimonial walls, and CTA banners.
- **Core Dependencies**: `motion`, `lucide-react`
- **Representative Components**:
  | ID | Canonical Slug | Key Props | Source Origin | Typical Use Case |
  | :--- | :--- | :--- | :--- | :--- |
  | `hero` | `hero` | `headline`, `ctaText`, `badge` | `magic-ui` | Full-width landing page hero with ambient glow |
  | `pricing-table` | `pricing-table` | `plans`, `billingInterval` | `tremor` | Monthly/annual tiered pricing cards with feature ticks |
  | `feature-grid` | `feature-grid` | `features`, `columns` | `magic-ui` | Bento-box layout highlighting key product features |
  | `testimonial-wall` | `testimonial-wall` | `testimonials`, `speed` | `react-bits` | Infinite horizontal marquee of user reviews |
  | `cta-section` | `cta-section` | `heading`, `buttonText`, `href` | `square-ui` | Bottom-of-page high-contrast sign-up banner |
  | `footer-section` | `footer-section` | `columns`, `copyright`, `socials` | `square-ui` | Multi-column responsive website footer |

---

### Category 10: `text-effects`
- **Path**: `corpus/components/text-effects/`
- **Component Count**: **94**
- **UX Purpose**: Kinetic typography, scrolling number odometers, typewriter characters, word flippers, and shimmering gradient headings.
- **Core Dependencies**: `motion`, `react`
- **Representative Components**:
  | ID | Canonical Slug | Key Props | Source Origin | Typical Use Case |
  | :--- | :--- | :--- | :--- | :--- |
  | `scrolling-number` | `scrolling-number` | `value`, `duration` | `animate-ui` | Odometer digit roll animation on value change |
  | `typewriter-effect` | `typewriter-effect` | `words`, `cursorColor` | `magic-ui` | Terminal-style sequential character typing |
  | `flip-words` | `flip-words` | `words`, `interval` | `magic-ui` | Smooth 3D rotating keyword switcher in hero copy |
  | `sparkles-text` | `sparkles-text` | `text`, `sparklesCount` | `magic-ui` | Floating twinkling star particles around bold header |
  | `wavy-text` | `wavy-text` | `text`, `delay` | `animata` | Ocean wave letter ripple on viewport scroll |
  | `gradual-spacing` | `gradual-spacing` | `text`, `duration` | `magic-ui` | Letter-spacing expansion fade-in for title reveals |

---

### Category 11: `backgrounds`
- **Path**: `corpus/components/backgrounds/`
- **Component Count**: **32**
- **UX Purpose**: Atmospheric canvas backgrounds, particle fields, floating bubbles, animated grid matrices, and starfields.
- **Core Dependencies**: `motion`, `react`
- **Representative Components**:
  | ID | Canonical Slug | Key Props | Source Origin | Typical Use Case |
  | :--- | :--- | :--- | :--- | :--- |
  | `particles--magic-ui` | `particles--magic-ui` | `quantity`, `color`, `ease` | `magic-ui` | Interactive particle field responding to cursor mouse |
  | `components-backgrounds-stars` | `components-backgrounds-stars` | `starCount`, `speed` | `animate-ui` | Ambient twinkling night sky background |
  | `bubble-background` | `bubble-background` | `bubbleCount`, `colors` | `animate-ui` | Floating soft blurred watercolor orbs |
  | `dot-pattern` | `dot-pattern` | `width`, `height`, `cx`, `cy` | `magic-ui` | Modern subtle dotted canvas matrix |
  | `grid-pattern` | `grid-pattern` | `squares`, `strokeDasharray` | `magic-ui` | Tech-style isometric blueprint grid lines |
  | `border-beam` | `border-beam` | `duration`, `borderWidth` | `magic-ui` | Highlighting border light ray tracing a container |

---

### Category 12: `media`
- **Path**: `corpus/components/media/`
- **Component Count**: **72**
- **UX Purpose**: Image carousels, responsive video containers, audio visualizers, before/after comparison sliders, and lightbox galleries.
- **Core Dependencies**: `embla-carousel-react`, `motion`, `lucide-react`
- **Representative Components**:
  | ID | Canonical Slug | Key Props | Source Origin | Typical Use Case |
  | :--- | :--- | :--- | :--- | :--- |
  | `carousel--shadcn-ui` | `carousel--shadcn-ui` | `opts`, `orientation` | `shadcn-ui` | Touch-swipeable carousel using Embla engine |
  | `image-comparison` | `image-comparison` | `before`, `after`, `position` | `react-bits` | Draggable divider comparing two images |
  | `video-player` | `video-player` | `src`, `poster`, `autoPlay` | `heroui` | Custom video container with glass controls |
  | `lightbox` | `lightbox` | `images`, `initialIndex` | `mantine` | Fullscreen zoomable image viewer |
  | `audio-waveform` | `audio-waveform` | `audioUrl`, `waveColor` | `react-bits` | Interactive audio player with scrubbable wave bars |
  | `backlight-image` | `backlight-image` | `src`, `blurRadius` | `magic-ui` | Ambient image edge color diffusion glow |

---

### Category 13: `charts`
- **Path**: `corpus/components/charts/`
- **Component Count**: **20**
- **UX Purpose**: Business intelligence, time-series data, category comparisons, multi-axis analytics, and performance radar charts.
- **Core Dependencies**: `recharts`, `lucide-react`
- **Representative Components**:
  | ID | Canonical Slug | Key Props | Source Origin | Typical Use Case |
  | :--- | :--- | :--- | :--- | :--- |
  | `performance-chart` | `performance-chart` | `data`, `categories`, `index` | `tremor` | Multi-line trend graph with hover tooltips |
  | `revenue-flow-chart` | `revenue-flow-chart` | `data`, `bars`, `colors` | `tremor` | Stacked or grouped bar chart comparing quarters |
  | `monthly-views-chart` | `monthly-views-chart` | `series`, `dateRange` | `tremor` | Smooth gradient area chart |
  | `radar` | `radar` | `data`, `keys`, `indexBy` | `assistant-ui` | Multi-variable polygonal competency radar chart |
  | `donut-chart` | `donut-chart` | `data`, `category`, `value` | `tremor` | Proportional category ring chart with center metric |
  | `sparkline` | `sparkline` | `data`, `trend` | `tremor` | Compact inline metric mini-chart inside a table row |

---

### Category 14: `animation-primitives`
- **Path**: `corpus/components/animation-primitives/`
- **Component Count**: **83**
- **UX Purpose**: Reusable layout animations, morphing containers, staggered child item reveals, and physics spring wrappers.
- **Core Dependencies**: `motion`, `react`
- **Representative Components**:
  | ID | Canonical Slug | Key Props | Source Origin | Typical Use Case |
  | :--- | :--- | :--- | :--- | :--- |
  | `morphing-dialog` | `morphing-dialog` | `layoutId`, `children` | `motion-primitives` | Fluidly expands an inline card into a full modal |
  | `stagger-container` | `stagger-container` | `staggerDelay`, `children` | `motion-primitives` | Cascading sequential fade-in for list items |
  | `animated-tabs` | `animated-tabs` | `tabs`, `activeTab` | `motion-primitives` | Sliding layoutId indicator pill behind active tab |
  | `accordion-motion` | `accordion-motion` | `expanded`, `duration` | `motion-primitives` | Smooth hardware-accelerated height expander |
  | `in-view-reveal` | `in-view-reveal` | `variants`, `threshold` | `motion-primitives` | Viewport entry trigger revealing content |
  | `tilt-container` | `tilt-container` | `maxTilt`, `perspective` | `motion-primitives` | 3D perspective card tilt tracking mouse cursor |

---

### Category 15: `scroll-and-parallax`
- **Path**: `corpus/components/scroll-and-parallax/`
- **Component Count**: **43**
- **UX Purpose**: Viewport scroll effects, horizontal scroll velocity, smooth sticky containers, and multi-layer parallax depth.
- **Core Dependencies**: `motion`, `react`
- **Representative Components**:
  | ID | Canonical Slug | Key Props | Source Origin | Typical Use Case |
  | :--- | :--- | :--- | :--- | :--- |
  | `scroll-based-velocity` | `scroll-based-velocity` | `text`, `defaultVelocity` | `magic-ui` | Text marquee accelerating when user scrolls faster |
  | `parallax-scroll` | `parallax-scroll` | `images`, `offset` | `magic-ui` | Multi-column image gallery scrolling at varied speeds |
  | `sticky-scroll-reveal` | `sticky-scroll-reveal` | `content`, `children` | `magic-ui` | Pinned viewport section transitioning items as page moves |
  | `scroll-area` | `scroll-area` | `orientation`, `scrollHideDelay` | `radix-ui` | Custom stylized scrollbar replacing native browser bar |
  | `scroll-progress-bar` | `scroll-progress-bar` | `height`, `color` | `magic-ui` | Top-of-page reading progress indicator bar |
  | `smooth-scroll-wrapper` | `smooth-scroll-wrapper` | `damping`, `children` | `react-bits` | Momentum-damped inertia page scroller |

---

### Category 16: `cursors-and-pointer`
- **Path**: `corpus/components/cursors-and-pointer/`
- **Component Count**: **13**
- **UX Purpose**: Custom cursor effects, mouse-following coordinate labels, precision crosshairs, and pointer trails.
- **Core Dependencies**: `motion`, `react`
- **Representative Components**:
  | ID | Canonical Slug | Key Props | Source Origin | Typical Use Case |
  | :--- | :--- | :--- | :--- | :--- |
  | `smooth-cursor` | `smooth-cursor` | `springConfig`, `size` | `animate-ui` | Spring-physics damped circular cursor replacer |
  | `crosshair` | `crosshair` | `color`, `opacity` | `react-bits` | Full-screen coordinate targeting grid for data apps |
  | `pointer-trail` | `pointer-trail` | `trailLength`, `decay` | `magic-ui` | Glowing fading ribbon or particle trail behind pointer |
  | `follow-cursor-tooltip` | `follow-cursor-tooltip` | `label`, `offset` | `mantine` | Floating contextual card attached directly to mouse |
  | `magnetic-pointer` | `magnetic-pointer` | `snapDistance`, `target` | `react-bits` | Snaps cursor center over actionable buttons |
  | `cursor-glow` | `cursor-glow` | `radius`, `blur` | `magic-ui` | Large subtle radial flashlight gradient behind dark cards |

---

### Category 17: `3d-and-canvas`
- **Path**: `corpus/components/3d-and-canvas/`
- **Component Count**: **8**
- **UX Purpose**: WebGL interactive globes, isometric 3D cubes, procedural flow canvas, and canvas simulations.
- **Core Dependencies**: `cobe`, `motion`, `react`
- **Representative Components**:
  | ID | Canonical Slug | Key Props | Source Origin | Typical Use Case |
  | :--- | :--- | :--- | :--- | :--- |
  | `globe` | `globe` | `markers`, `phi`, `theta` | `magic-ui` | 60 FPS lightweight WebGL interactive Earth globe (`cobe`) |
  | `flow-canvas` | `flow-canvas` | `speed`, `nodeDensity` | `react-bits` | Interactive generative canvas with connecting lines |
  | `cubes-3d` | `cubes-3d` | `rotations`, `lighting` | `react-bits` | Interactive CSS 3D transformed geometric cubes |
  | `noise-canvas` | `noise-canvas` | `opacity`, `grain` | `magic-ui` | Procedural film-grain canvas overlay for vintage vibe |
  | `matrix-rain` | `matrix-rain` | `characters`, `speed` | `react-bits` | Classic vertical falling terminal cipher stream |
  | `liquid-canvas` | `liquid-canvas` | `viscosity`, `color` | `animate-ui` | Organic metaball liquid canvas simulation |

---

### Category 18: `layout`
- **Path**: `corpus/components/layout/`
- **Component Count**: **147**
- **UX Purpose**: Responsive grid containers, resizable panel splitters, aspect-ratio boxes, stacks, masonry columns, and app shells.
- **Core Dependencies**: `react-resizable-panels`, `@radix-ui/react-aspect-ratio`
- **Representative Components**:
  | ID | Canonical Slug | Key Props | Source Origin | Typical Use Case |
  | :--- | :--- | :--- | :--- | :--- |
  | `resizable-panel-group` | `resizable-panel-group` | `direction`, `onLayout` | `shadcn-ui` | IDE-style draggable splitter panes (e.g. code/preview) |
  | `aspect-ratio` | `aspect-ratio` | `ratio`, `children` | `radix-ui` | Strict 16:9 or 1:1 image/video container |
  | `bento-grid` | `bento-grid` | `children`, `className` | `magic-ui` | Responsive grid organizing varied-size cards |
  | `masonry` | `masonry` | `columns`, `gap`, `items` | `mantine` | Pinterest-style staggered height image column layout |
  | `app-shell` | `app-shell` | `header`, `navbar`, `main` | `mantine` | Fixed header + fixed sidebar + scrollable body container |
  | `split-screen` | `split-screen` | `left`, `right`, `ratio` | `heroui` | 50/50 authentication screen (form left, artwork right) |

---

### Category 19: `hooks`
- **Path**: `corpus/components/hooks/`
- **Component Count**: **143**
- **UX Purpose**: Non-visual React custom hooks managing viewport media queries, local storage, copy-to-clipboard, keyboard hotkeys, and intersections.
- **Core Dependencies**: `react`
- **Representative Components**:
  | ID | Canonical Slug | Key Props | Source Origin | Typical Use Case |
  | :--- | :--- | :--- | :--- | :--- |
  | `use-clipboard` | `use-clipboard` | `timeout` | `mantine` | Returns `{ copied, copy }` with auto-resetting boolean |
  | `use-media-query` | `use-media-query` | `query` | `mantine` | Subscribes to responsive CSS breakpoint changes |
  | `use-hotkeys` | `use-hotkeys` | `hotkeys`, `callback` | `mantine` | Binds global or element-scoped keyboard shortcuts (`Cmd+K`) |
  | `use-intersection-observer` | `use-intersection-observer` | `threshold`, `rootMargin` | `react-aria` | Detects when element enters or exits viewport |
  | `use-local-storage` | `use-local-storage` | `key`, `defaultValue` | `mantine` | Synchronizes state with browser `localStorage` |
  | `use-debounce` | `use-debounce` | `value`, `delay` | `mantine` | Throttles rapid search input keystrokes |

---

### Category 20: `misc`
- **Path**: `corpus/components/misc/`
- **Component Count**: **4,182**
- **UX Purpose**: Specialized utilities, internal component sub-primitives, contextual providers, testing fixtures, and advanced adapters.
- **Core Dependencies**: Varies (`react`, `clsx`, `tailwind-merge`)
- **Key Insight for Agents**: When looking for foundational primitives (e.g. sub-parts of Mantine, Material UI, or Radix composable atoms like `portal`, `visually-hidden`, `popper-anchor`, or custom state providers), browse `corpus/components/misc/` or query `catalog/index.json`.

---

## 4. Markdown Component Anatomy & Parsing Guide

Every component in the corpus is saved in a unified, deterministic format. Agents can reliably parse any file using standard regular expressions or a YAML frontmatter parser like `gray-matter`.

### 4.1 File Layout Schema

```markdown
---
id: <slug>
name: "<Component Title>"
category: <taxonomy-category>
tags: ["<category>", "react", "tailwind", ...]
framework: react
styling: tailwind
language: tsx
deps: ["<npm-package-1>", "<npm-package-2>"]
registry_deps: ["<optional-internal-subcomponent>"]
shared: ["utils/cn"]
license: <SPDX-License-Id>
canonical_source: <source-id>
sources:
  - { source: "<source-id>", url: "<raw-url>", relation: "canonical" }
hashes: { content: "sha256:<hash>", ast: "sha256:<hash>" }
fetched: YYYY-MM-DD
---

# <Component Title>

<Human-readable description of what the component does and its visual role.>

## Usage
```tsx
<ComponentUsageExample />
```

## Props
| Prop | Type | Default | Description |
|---|---|---|---|
| `propA` | `string` | `undefined` | Purpose of propA |

## Code
```tsx
'use client';

// Clean, standalone TypeScript JSX code
```
```

### 4.2 How an Agent Extracts Code in Node/TypeScript

```typescript
import fs from 'node:fs';
import matter from 'gray-matter';

export interface ExtractedComponent {
  id: string;
  name: string;
  category: string;
  deps: string[];
  shared: string[];
  description: string;
  code: string;
}

export function loadCorpusComponent(filePath: string): ExtractedComponent {
  const rawContent = fs.readFileSync(filePath, 'utf8');
  const parsed = matter(rawContent);
  
  // Extract code block between ```tsx and ```
  const codeMatch = parsed.content.match(/## Code\s*```tsx\s*([\s\S]*?)```/);
  const code = codeMatch ? codeMatch[1].trim() : '';

  // Extract description
  const descMatch = parsed.content.match(/^# [^\n]+\n+([^\n#]+)/m);
  const description = descMatch ? descMatch[1].trim() : '';

  return {
    id: parsed.data.id,
    name: parsed.data.name,
    category: parsed.data.category,
    deps: parsed.data.deps || [],
    shared: parsed.data.shared || [],
    description,
    code,
  };
}
```

---

## 5. API & Model Context Protocol (MCP) Server Specification

To enable interactive querying from Claude Desktop, Cursor, or Antigravity agents, an MCP server or REST API can be mounted directly on top of `corpus/catalog/index.json`.

### 5.1 MCP Tool Signatures & Request/Response Payloads

#### Tool 1: `list_components`
Returns a paginated list of components filtered by category, tag, or framework without transmitting the entire code body.

**Input Schema**:
```json
{
  "name": "list_components",
  "parameters": {
    "type": "object",
    "properties": {
      "category": { "type": "string", "enum": ["ai-chat", "overlays", "data-display", "navigation", "inputs-forms", "selection", "buttons", "feedback", "hero-and-marketing-sections", "text-effects", "backgrounds", "media", "charts", "animation-primitives", "scroll-and-parallax", "cursors-and-pointer", "3d-and-canvas", "layout", "hooks", "misc"] },
      "tag": { "type": "string" },
      "limit": { "type": "number", "default": 20 },
      "offset": { "type": "number", "default": 0 }
    }
  }
}
```

**Response Example**:
```json
{
  "total": 313,
  "limit": 2,
  "offset": 0,
  "components": [
    {
      "id": "composer",
      "name": "Composer",
      "category": "ai-chat",
      "tags": ["ai-chat", "react", "tailwind", "composer"],
      "deps": ["lucide-react"],
      "shared": ["utils/cn"],
      "path": "corpus/components/ai-chat/composer.md",
      "bytes": 3412
    },
    {
      "id": "thread",
      "name": "Thread",
      "category": "ai-chat",
      "tags": ["ai-chat", "react", "tailwind", "thread"],
      "deps": ["motion"],
      "shared": ["utils/cn"],
      "path": "corpus/components/ai-chat/thread.md",
      "bytes": 5240
    }
  ]
}
```

---

#### Tool 2: `get_component`
Fetches the full Markdown document and parsed TypeScript source code for a specific component.

**Input Schema**:
```json
{
  "name": "get_component",
  "parameters": {
    "type": "object",
    "properties": {
      "id": { "type": "string", "description": "Unique canonical ID from the catalog" }
    },
    "required": ["id"]
  }
}
```

**Response Example**:
```json
{
  "id": "particles--magic-ui",
  "name": "Particles",
  "category": "backgrounds",
  "deps": ["motion"],
  "shared": ["utils/cn"],
  "path": "corpus/components/backgrounds/particles--magic-ui.md",
  "code": "'use client';\n\nimport React, { useEffect, useRef } from 'react';\nimport { cn } from 'utils/cn';\n\nexport const Particles = ({ className, quantity = 50 }) => { ... };",
  "usage": "<Particles quantity={80} className=\"absolute inset-0 z-0\" />"
}
```

---

#### Tool 3: `search_components`
Ranks components using BM25 keyword matching over `name`, `tags`, `category`, and `deps`.

**Input Schema**:
```json
{
  "name": "search_components",
  "parameters": {
    "type": "object",
    "properties": {
      "query": { "type": "string", "description": "Search query keywords (e.g. 'modal backdrop blur', 'particle starfield', 'pricing table')" },
      "category": { "type": "string" },
      "limit": { "type": "number", "default": 10 }
    },
    "required": ["query"]
  }
}
```

**Response Example**:
```json
{
  "query": "animated particle stars",
  "results": [
    {
      "id": "components-backgrounds-stars",
      "name": "Components Backgrounds Stars",
      "category": "backgrounds",
      "score": 8.42,
      "path": "corpus/components/backgrounds/components-backgrounds-stars.md"
    },
    {
      "id": "particles--magic-ui",
      "name": "Particles",
      "category": "backgrounds",
      "score": 6.89,
      "path": "corpus/components/backgrounds/particles--magic-ui.md"
    }
  ]
}
```

---

#### Tool 4: `get_shared_asset`
Returns shared utility code required by components (e.g. `utils/cn`).

**Input Schema**:
```json
{
  "name": "get_shared_asset",
  "parameters": {
    "type": "object",
    "properties": {
      "name": { "type": "string", "enum": ["utils/cn"] }
    },
    "required": ["name"]
  }
}
```

**Response Example**:
```json
{
  "name": "utils/cn",
  "path": "corpus/shared/utils/cn.md",
  "install": "pnpm add clsx tailwind-merge",
  "code": "import { type ClassValue, clsx } from 'clsx';\nimport { twMerge } from 'tailwind-merge';\n\nexport function cn(...inputs: ClassValue[]) {\n  return twMerge(clsx(inputs));\n}"
}
```

---

### 5.2 Standalone In-Memory Search Engine Implementation (Zero External DB)

Any MCP server can implement lightning-fast (<2ms) searching directly over `corpus/catalog/index.json` using this zero-dependency in-memory TypeScript module:

```typescript
import fs from 'node:fs';
import path from 'node:path';

export interface CatalogItem {
  id: string;
  name: string;
  category: string;
  tags: string[];
  deps: string[];
  shared: string[];
  path: string;
  bytes: number;
}

export class CorpusSearchEngine {
  private items: CatalogItem[] = [];

  constructor(catalogPath = 'corpus/catalog/index.json') {
    const raw = fs.readFileSync(catalogPath, 'utf8');
    this.items = JSON.parse(raw);
  }

  public search(query: string, categoryFilter?: string, limit = 10): CatalogItem[] {
    const tokens = query.toLowerCase().split(/\s+/).filter(t => t.length > 1);
    if (tokens.length === 0) return [];

    const scored = this.items
      .filter(item => !categoryFilter || item.category === categoryFilter)
      .map(item => {
        let score = 0;
        const nameLower = item.name.toLowerCase();
        const idLower = item.id.toLowerCase();
        const tags = item.tags.map(t => t.toLowerCase());

        for (const token of tokens) {
          if (idLower === token) score += 10;
          if (nameLower.includes(token)) score += 5;
          if (idLower.includes(token)) score += 3;
          if (tags.some(t => t.includes(token))) score += 2;
          if (item.category.toLowerCase().includes(token)) score += 1.5;
        }

        return { item, score };
      })
      .filter(res => res.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(res => res.item);

    return scored;
  }
}
```

---

## 6. Frontend Agent Step-by-Step Assembly Playbook

Follow this systematic workflow when synthesizing complete applications or pages from the corpus:

```
Step 1: Resolve Project Foundation (clsx, tailwind-merge, cn utility)
   ↓
Step 2: Install Core Runtime Libraries (motion, lucide-react, @radix-ui)
   ↓
Step 3: Query Catalog / Search for Specific UI Roles
   ↓
Step 4: Extract Code & Strip Relative Package Aliases
   ↓
Step 5: Assemble Layout & Inject Aesthetic Polish Tokens
```

### 6.1 Prerequisites & Installation Recipe
Ensure the target project has the standard utility and animation dependencies installed:

```bash
pnpm add clsx tailwind-merge framer-motion lucide-react @radix-ui/react-dialog @radix-ui/react-popover @radix-ui/react-tooltip @radix-ui/react-slot
```

Create `lib/utils.ts` (derived directly from `corpus/shared/utils/cn.md`):
```typescript
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

---

### 6.2 Assembly Scenario: Building a High-Converting Marketing Landing Page

When generating a landing page, compose the following component stack:

1. **Background**: Retrieve `particles--magic-ui` from `corpus/components/backgrounds/particles--magic-ui.md`.
2. **Hero Header**: Retrieve `hero` from `corpus/components/hero-and-marketing-sections/hero.md`.
3. **Animated Copy**: Retrieve `flip-words` or `typewriter-effect` from `corpus/components/text-effects/flip-words.md`.
4. **Primary Action**: Retrieve `shimmer-button` from `corpus/components/buttons/shimmer-button.md`.
5. **Feature Highlights**: Retrieve `bento-grid` from `corpus/components/layout/bento-grid.md`.
6. **Social Proof**: Retrieve `testimonial-wall` from `corpus/components/hero-and-marketing-sections/testimonial-wall.md`.
7. **Pricing**: Retrieve `pricing-table` from `corpus/components/hero-and-marketing-sections/pricing-table.md`.
8. **Footer**: Retrieve `footer-section` from `corpus/components/hero-and-marketing-sections/footer-section.md`.

#### Page Assembly Example:
```tsx
'use client';

import React from 'react';
import { Particles } from '@/components/ui/particles';
import { ShimmerButton } from '@/components/ui/shimmer-button';
import { FlipWords } from '@/components/ui/flip-words';
import { BentoGrid } from '@/components/ui/bento-grid';
import { PricingTable } from '@/components/ui/pricing-table';

export default function LandingPage() {
  const dynamicWords = ["Scalable", "Intelligent", "Beautiful", "Lightning-Fast"];

  return (
    <div className="relative min-h-screen bg-background text-foreground overflow-hidden">
      {/* 1. Atmospheric Particle Field */}
      <Particles quantity={70} className="absolute inset-0 z-0 opacity-40 pointer-events-none" />

      {/* 2. Hero Section */}
      <section className="relative z-10 mx-auto max-w-6xl px-6 pt-32 pb-20 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium text-accent backdrop-blur-md mb-8">
          <span>✨ Component Corpus Builder v1.0</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight">
          Ship Interfaces That Are <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
            <FlipWords words={dynamicWords} />
          </span>
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground leading-relaxed">
          Over 8,000 modular, accessible, and deduplicated components ready for copy-paste injection.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <ShimmerButton className="px-8 py-3.5 text-base font-semibold">
            Explore 8,072 Components
          </ShimmerButton>
          <button className="rounded-xl border border-white/10 bg-white/5 px-6 py-3.5 text-base font-medium text-foreground hover:bg-white/10 transition-colors backdrop-blur-md">
            Documentation
          </button>
        </div>
      </section>

      {/* 3. Bento Feature Grid */}
      <section className="relative z-10 mx-auto max-w-6xl px-6 py-20">
        <h2 className="text-3xl font-bold tracking-tight text-center mb-12">Engineered For Autonomous Speed</h2>
        <BentoGrid />
      </section>

      {/* 4. Tiered Pricing Matrix */}
      <section className="relative z-10 mx-auto max-w-6xl px-6 py-20">
        <PricingTable />
      </section>
    </div>
  );
}
```

---

### 6.3 Assembly Scenario: Building a Modern SaaS Dashboard

When generating an interactive SaaS app, compose this component stack:

1. **App Shell**: Retrieve `resizable-panel-group` from `corpus/components/layout/resizable-panel-group.md` or `sidebar--square-ui` from `corpus/components/navigation/sidebar--square-ui.md`.
2. **Top Bar**: Retrieve `breadcrumbs` from `corpus/components/navigation/breadcrumbs.md` and `avatar--shadcn-ui` from `corpus/components/data-display/avatar--shadcn-ui.md`.
3. **KPI Metrics**: Retrieve `stat-group` from `corpus/components/data-display/stat-group.md` and `card--tremor`.
4. **Primary Chart**: Retrieve `performance-chart` or `monthly-views-chart` from `corpus/components/charts/performance-chart.md`.
5. **Data Grid**: Retrieve `data-table` from `corpus/components/data-display/data-table.md` with selection toggles from `corpus/components/selection/switch--shadcn-ui.md`.
6. **Action Modals**: Retrieve `dialog--radix-ui` from `corpus/components/overlays/dialog--radix-ui.md`.
7. **Live Toast Notifications**: Retrieve `toast--sonner` from `corpus/components/feedback/toast--sonner.md`.

---

### 6.4 Assembly Scenario: Building an AI Copilot / Assistant Interface

When generating an AI chat or agent workspace:

1. **Chat Window Shell**: Retrieve `chat` from `corpus/components/ai-chat/chat.md`.
2. **Message Streamer**: Retrieve `messageprimitive` from `corpus/components/ai-chat/messageprimitive.md`.
3. **Prompt Box**: Retrieve `composer` from `corpus/components/ai-chat/composer.md`.
4. **Tool Call Inspector**: Retrieve `toolcall-card` from `corpus/components/ai-chat/toolcall-card.md`.
5. **Branch Switcher**: Retrieve `branchpicker` from `corpus/components/ai-chat/branchpicker.md`.
6. **Smooth Typing Animation**: Retrieve `typewriter-effect` from `corpus/components/text-effects/typewriter-effect.md`.

---

## 7. Common Pitfalls & Agent Self-Correction Rules

1. **Missing `'use client'` Directive**:
   - *Problem*: Next.js App Router errors when components using `React.useState`, `React.useEffect`, or `framer-motion` are imported without the client boundary.
   - *Fix*: Always verify that components utilizing hooks or motion begin with `'use client';` at the top of the file.
2. **Import Path Aliases (`@/components/...`)**:
   - *Problem*: Raw scraped components may reference internal package paths like `@/components/animate-ui/primitives/...`.
   - *Fix*: Flatten internal subcomponent imports into local project directories or replace them with standard primitives from `@radix-ui/react-*`.
3. **Shared `cn()` Import Syntax**:
   - *Problem*: Components reference `import { cn } from 'utils/cn'`.
   - *Fix*: Replace `utils/cn` with your local utility path (e.g. `@/lib/utils`).
4. **Peer Dependency Clashes**:
   - *Problem*: Some components specify `motion` while older projects use `framer-motion`.
   - *Fix*: Both share identical API surfaces. In `package.json`, install `framer-motion` and add `"motion": "npm:framer-motion@^11.0.0"` or use `motion/react`.
5. **Z-Index Layering on Translucent Backdrops**:
   - *Problem*: Fixed background particles or 3D canvas intercept pointer events or render above cards.
   - *Fix*: Set background containers to `pointer-events-none z-0` and interactive content containers to `relative z-10`.

---

## 8. Summary & Quick Reference Sheet

| Resource | File Location | Description |
| :--- | :--- | :--- |
| **Full Catalog (JSON)** | `corpus/catalog/index.json` | 8,072 items with IDs, categories, tags, paths, dependencies |
| **Catalog Table (Markdown)** | `corpus/catalog/INDEX.md` | Human-readable categorized component table |
| **Harvest Audit Report** | `corpus/REPORT.md` | Per-source item counts, deduplication levels, and storage metrics |
| **Shared Utility** | `corpus/shared/utils/cn.md` | Universal `cn()` Tailwind class merge implementation |
| **MCP Integration Notes** | `corpus/catalog/MCP-NOTES.md` | Architectural tool signatures and search specifications |
| **Database State** | `state/db.sqlite` | SQLite WAL state database with complete provenance records |
