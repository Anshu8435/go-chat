# NexusChat UI Kit

## Design direction

NexusChat embraces an Aurora dark-mode system built to balance premium glow, focus, and clarity. The interface uses deep obsidian surfaces, vivid accent gradients, and soft glass layering to keep the experience energetic without sacrificing legibility.

## Color system

### Base surfaces
- Obsidian: #0B0E14
- Midnight: #111827
- Panel glass: rgba(15, 23, 42, 0.72)
- Border line: rgba(255, 255, 255, 0.10)

### Text
- Primary text: #E2E8F0
- Secondary text: #94A3B8
- Muted text: #64748B

### Accent gradients
- Cyber Sunset: #FF007A -> #00F0FF
- Neon Mint: #3AF7B6 -> #6C63FF
- Plasma Violet: #A855F7 -> #22D3EE
- Solar Pop: #FF7A18 -> #FFB019

### Utility highlights
- Emerald success: #34D399
- Cyan glow: #00F0FF
- Pink energy: #FF007A
- Violet accent: #9B5DE5

## Motion language

### Easing curves
- Standard ease: cubic-bezier(0.4, 0, 0.2, 1)
- Spring: cubic-bezier(0.22, 1, 0.36, 1)
- Soft bounce: cubic-bezier(0.16, 1, 0.3, 1)

### Motion principles
- Hover lift: translateY(-2px) with 220ms ease-out
- Bubble entrance: opacity + y-slide + subtle scale-up
- Typing indicator: three-dot wave with staggered delays
- Reaction pop: scale from 0.88 to 1 and fade in

## Component notes

### Chat bubbles
- Sent message fill: linear-gradient(135deg, rgba(255, 0, 122, 0.9), rgba(0, 240, 255, 0.8))
- Received message fill: rgba(15, 23, 42, 0.8)
- Border radius: 20px with slight asymmetry for sent messages

### Contact cards
- Hover transform: translateX(4px) and scale(1.01)
- Selected state: luminous cyan/pink gradient overlay
- Presence ring: 3px border with 0.8s glow pulse

### Input + send actions
- Pill input radius: 20px
- Send button: gradient fill, lift on hover, 0.25s easing
- Attachment/emoji actions: soft glass background with hover luminance

## Accessibility notes
- Keep text contrast above WCAG AA for core labels and messages.
- Preserve readable dark surfaces with warm accent glows but avoid overly bright backgrounds.
- Allow hover interactions to remain subtle and not block message readability.

## Implementation summary

The live prototype includes:
- Aurora dark-mode chat shell
- Interactive theme customizer with gradient presets
- Motion-rich message bubbles and typing indicator
- Hover states, reactions, and polished glass surfaces
