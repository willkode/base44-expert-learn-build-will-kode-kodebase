// 3D UI Element Kit — catalog of element specs and the prompts that recreate them.
// Prompts live server-side so they are only ever sent to buyers.

export type ThreeUiElement = {
  id: string;
  name: string;
  category: string;
  description: string;
  tags: string[];
  prompt: string;
};

export const THREE_UI_ELEMENTS: ThreeUiElement[] = [
  {
    id: 'glass-depth-card',
    name: 'Glass Depth Card',
    category: 'Cards',
    description: 'Frosted glass card that tilts toward the cursor with layered inner shadows and a soft rim light.',
    tags: ['glassmorphism', 'tilt', 'hover'],
    prompt: `Create a reusable React component "GlassDepthCard" in src/components/three-ui/GlassDepthCard.jsx.

Structure: a rounded-3xl container with backdrop-blur-xl, a translucent white/5 fill, a 1px white/10 border and two stacked inner highlights (a top rim light using an absolutely positioned gradient line at 40% opacity, and a bottom ambient glow).
Interaction: track pointer position over the card and apply a CSS 3D transform — perspective 1000px, rotateX/rotateY up to 8 degrees toward the cursor, translateZ 0. Reset smoothly to neutral on pointer leave using a 400ms cubic-bezier(0.22, 1, 0.36, 1) transition.
Add a parallax layer: children wrapped in a div that translates 6px opposite the tilt so content feels to float above the glass.
Props: title, description, icon (lucide component), children, className.
Accessibility: the card is not focus-trapping; if an onClick is passed render a button element with a visible focus ring.
Styling: Tailwind only, use design tokens (bg-card, border-border, text-foreground) so it inherits the app theme. No hardcoded hex.`,
  },
  {
    id: 'orbit-hero-object',
    name: 'Orbit Hero Object',
    category: 'Hero',
    description: 'Slowly rotating three.js object with orbiting particles, sized for a landing page hero.',
    tags: ['three.js', 'hero', 'particles'],
    prompt: `Create a hero visual component "OrbitHeroObject" in src/components/three-ui/OrbitHeroObject.jsx using three.js (already installed).

Scene: a PerspectiveCamera at z=6, an IcosahedronGeometry (detail 1) with a MeshStandardMaterial — metalness 0.6, roughness 0.25 — rendered as both a solid mesh and a slightly larger wireframe overlay at 20% opacity.
Lighting: one ambient light at low intensity plus two point lights placed left and right in warm coral and amber tones so the object reads with high contrast on a dark background.
Motion: rotate the mesh on Y at 0.15 rad/s and on X at 0.05 rad/s inside requestAnimationFrame. Add 400 Points arranged on a sphere shell that counter-rotate slowly.
Responsiveness: resize the renderer to the container via ResizeObserver, cap devicePixelRatio at 2, and respect prefers-reduced-motion by rendering a single static frame.
Cleanup: dispose geometries, materials and the renderer on unmount and cancel the animation frame.
Props: size ("sm" | "lg"), className. Render inside a relative container with pointer-events-none so it never blocks hero CTAs.`,
  },
  {
    id: 'extruded-button',
    name: 'Extruded Press Button',
    category: 'Buttons',
    description: 'Physical-feeling button with a colored base edge that compresses on press.',
    tags: ['button', 'press', 'micro-interaction'],
    prompt: `Create "ExtrudedButton" in src/components/three-ui/ExtrudedButton.jsx.

Look: two stacked layers — a "base" div with a darker shade offset 4px down, and a "face" div sitting on top with the primary fill, rounded-xl and a subtle top inner highlight. The visible base edge creates the extrusion.
Interaction: on :active translate the face down by 4px so it meets the base (transition 80ms ease-out) and reduce the face's inner highlight opacity. On hover raise the face 1px and brighten the fill 5%.
Variants: primary (gradient coral → orange → amber face, dark text), secondary (card fill, foreground text), ghost (no base edge, hover fill only). Sizes: sm, default, lg.
Implementation: build variants with class-variance-authority to match the app's existing button API, forward refs, support asChild via Radix Slot, and keep a visible focus-visible ring.
Never animate layout properties — only transform, opacity and background.`,
  },
  {
    id: 'depth-navbar',
    name: 'Depth Navbar',
    category: 'Navigation',
    description: 'Floating navigation bar that lifts off the page on scroll with a blurred shadow plane.',
    tags: ['navbar', 'scroll', 'blur'],
    prompt: `Create "DepthNavbar" in src/components/three-ui/DepthNavbar.jsx.

Resting state: full-width transparent bar, one row, links in muted foreground.
Scrolled state (window.scrollY > 20): the bar becomes a floating pill — max-width container, rounded-full, backdrop-blur-xl, card fill at 70% opacity, 1px border, plus a separate blurred shadow plane rendered as an absolutely positioned div behind it (scaled 0.96, blur-2xl, black at 35%) so the bar appears to hover above the page.
Motion: animate the transition with framer-motion layout-safe properties only (opacity, scale, y) over 250ms.
Active link: a framer-motion layoutId indicator pill that slides between links.
Mobile: below md, collapse links into a sheet-style panel; the trigger is a 44px touch target.
Props: links (array of { label, to }), right (ReactNode for actions). Use react-router-dom Link and Tailwind tokens.`,
  },
  {
    id: 'tilt-product-shot',
    name: 'Tilt Product Shot',
    category: 'Media',
    description: 'Screenshot frame in perspective with a reflective floor and edge glow.',
    tags: ['perspective', 'image', 'showcase'],
    prompt: `Create "TiltProductShot" in src/components/three-ui/TiltProductShot.jsx.

Frame: an image wrapped in a rounded-2xl bordered container with an outer ring glow (box-shadow using the primary color at low alpha) and a thin top rim light.
Perspective: apply transform perspective(1400px) rotateY(-12deg) rotateX(6deg) with a slight translateZ; on hover ease toward 0 degrees over 600ms so the shot "faces" the viewer.
Reflection: duplicate the image below, flipped with scaleY(-1), masked with a linear-gradient fade (mask-image) to 0 opacity, blurred 2px and dropped to 18% opacity.
Loading: reserve the aspect ratio to prevent layout shift, and fade the image in on load.
Props: src, alt (required), rotate ("left" | "right" | "flat"), className. Respect prefers-reduced-motion by disabling the hover transition.`,
  },
  {
    id: 'toggle-switch-3d',
    name: '3D Toggle Switch',
    category: 'Forms',
    description: 'Inset track with a raised knob that casts a shadow as it travels.',
    tags: ['toggle', 'form', 'inset'],
    prompt: `Create "Toggle3D" in src/components/three-ui/Toggle3D.jsx on top of Radix Switch (@radix-ui/react-switch is installed).

Track: inset look — muted fill with an inner top shadow and a 1px darker border. When checked, fill with the coral → amber gradient and keep the inset shadow.
Knob: a circle with a top-light gradient, a 1px white/40 top border and a drop shadow that shortens as the knob moves right (simulating it staying lifted).
Motion: translate the knob with a 220ms spring-like cubic-bezier(0.34, 1.56, 0.64, 1); scale it to 0.94 while the pointer is down.
States: disabled reduces opacity to 50% and removes the shadow; focus-visible shows a ring offset from the track.
Accessibility: keep Radix's role/aria wiring, support keyboard Space/Enter, and expose label + description props rendered beside the switch with a proper htmlFor association.`,
  },
  {
    id: 'stacked-modal',
    name: 'Stacked Depth Modal',
    category: 'Overlays',
    description: 'Dialog that scales the page behind it and stacks card layers for real depth.',
    tags: ['modal', 'dialog', 'stack'],
    prompt: `Create "StackedModal" in src/components/three-ui/StackedModal.jsx using the app's Radix Dialog primitives.

Backdrop: black at 60% with backdrop-blur-sm; fade in over 200ms.
Depth stack: render two decorative sibling panels behind the content panel, each scaled down 4% and offset 10px upward with decreasing opacity, so the dialog looks like a deck of cards.
Content panel: rounded-2xl, card fill, 1px border, a top rim highlight and a large soft shadow.
Enter/exit: framer-motion — content animates from opacity 0, scale 0.96, y 12 to rest with a 260ms ease-out; the stacked panels animate 40ms later for a cascade.
Behavior: preserve Radix focus trap, Escape to close, scroll lock, and an accessible title/description. Content must scroll internally on small viewports (max-h-[85vh] overflow-y-auto), never the page.
Props: open, onOpenChange, title, description, children, footer.`,
  },
  {
    id: 'gradient-mesh-backdrop',
    name: 'Gradient Mesh Backdrop',
    category: 'Backgrounds',
    description: 'Animated blurred blobs behind a blueprint grid — the signature section background.',
    tags: ['background', 'gradient', 'grid'],
    prompt: `Create "GradientMeshBackdrop" in src/components/three-ui/GradientMeshBackdrop.jsx.

Layers, back to front: (1) a solid deep navy base; (2) three large radial-gradient blobs in coral, orange and amber at 25-35% opacity, each blur-3xl, positioned off-center and animated with framer-motion on x/y/scale over 18-26s, infinite, easeInOut, with different delays; (3) a blueprint grid using two repeating linear-gradients at very low alpha and a 40px cell size; (4) a vignette gradient darkening the edges so foreground text stays readable.
Container: absolute inset-0, -z-10, pointer-events-none, overflow-hidden.
Performance: animate transform only, add will-change-transform, and render a static version when prefers-reduced-motion is set.
Props: intensity ("subtle" | "bold"), grid (boolean), className.`,
  },
  {
    id: 'carousel-coverflow',
    name: 'Coverflow Carousel',
    category: 'Media',
    description: 'Horizontal card carousel where side cards rotate away in 3D space.',
    tags: ['carousel', 'coverflow', 'drag'],
    prompt: `Create "CoverflowCarousel" in src/components/three-ui/CoverflowCarousel.jsx.

Layout: a perspective-[1600px] track holding slides. The active slide sits flat and full scale; each neighbour rotates on Y by ±35 degrees, scales to 0.86, drops to 60% opacity and translates toward the center so cards overlap.
Navigation: previous/next buttons, keyboard ArrowLeft/ArrowRight when the track has focus, and pointer drag (framer-motion drag="x" with dragConstraints and a velocity-based snap).
Motion: 380ms cubic-bezier(0.22, 1, 0.36, 1) on transform and opacity only.
State: controlled index with an onIndexChange callback, plus dot indicators with aria-current.
Accessibility: role="region" with aria-roledescription="carousel", each slide aria-hidden when not active, buttons labelled Previous/Next slide.
Props: items (array of ReactNode), index, onIndexChange, className.`,
  },
  {
    id: 'metric-tile-3d',
    name: 'Raised Metric Tile',
    category: 'Data',
    description: 'Dashboard stat tile with a lifted surface, gradient sparkline and depth shadow.',
    tags: ['dashboard', 'stat', 'sparkline'],
    prompt: `Create "MetricTile3D" in src/components/three-ui/MetricTile3D.jsx.

Surface: rounded-2xl card fill with a 1px border, a top-to-bottom subtle lightening gradient (simulating a lit top face) and a soft outer shadow. On hover, translate y by -3px and deepen the shadow (200ms ease-out).
Content: small uppercase label, large tabular-nums value in the heading font, a delta chip that is green for positive and red for negative with an arrow icon, and a recharts Area sparkline filling the bottom third with a coral → amber gradient fill at low opacity and no axes or grid.
Loading: render a skeleton with the same dimensions so the grid never shifts.
Props: label, value, delta (number), data (array of { x, y }), icon, className. Use recharts and Tailwind tokens only.`,
  },
  {
    id: 'pricing-column-3d',
    name: 'Elevated Pricing Column',
    category: 'Sections',
    description: 'Pricing card that physically rises above its siblings when featured.',
    tags: ['pricing', 'section', 'featured'],
    prompt: `Create "PricingColumn3D" in src/components/three-ui/PricingColumn3D.jsx.

Base card: rounded-2xl, card fill, 1px border, plan name, price with a tabular-nums figure and a billing note, feature list with check icons, and a CTA button pinned to the bottom via flex so all columns align.
Featured variant: a 1.5px gradient border implemented as a padded gradient wrapper, scale 1.04, translate y -8px, a coral glow shadow, and a small gradient badge pinned to the top edge. On desktop only — on mobile drop the scale and keep the glow so nothing overflows.
Motion: framer-motion whileInView fade + rise, staggered 80ms per column, animate once.
Props: name, price, period, description, features (string[]), featured (boolean), ctaLabel, onCta. Tokens only, no hardcoded hex outside the gradient stops.`,
  },
  {
    id: 'floating-action-orb',
    name: 'Floating Action Orb',
    category: 'Buttons',
    description: 'Spherical floating action button with a breathing glow and radial action menu.',
    tags: ['fab', 'orb', 'menu'],
    prompt: `Create "FloatingActionOrb" in src/components/three-ui/FloatingActionOrb.jsx.

Orb: a 56px circle, fixed bottom-right (bottom-5 right-5, z-40), filled with a radial gradient that is lighter at the top-left so it reads spherical, a 1px white/20 top border and a colored outer glow shadow.
Idle motion: a slow breathing scale between 1 and 1.04 over 3s, infinite. Disabled under prefers-reduced-motion.
Expanded state: on click, the icon rotates 45 degrees and up to four child actions fan out on an arc above the orb, each a smaller orb with a tooltip label, staggered 50ms.
Behavior: click outside or Escape collapses; the orb keeps a 44px minimum touch target; each action is a real button with an aria-label.
Props: actions (array of { label, icon, onClick }), className.`,
  },
];

export function previewElements() {
  return THREE_UI_ELEMENTS.map(({ id, name, category, description, tags }) => ({
    id,
    name,
    category,
    description,
    tags,
  }));
}