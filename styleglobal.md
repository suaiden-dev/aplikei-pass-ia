# UI Design System Guidelines

This document defines the **design rules and UI standards** that must be followed when generating or modifying any interface in this project.

All components, pages, layouts and UI elements **must follow these rules strictly** to ensure a consistent design system across the application.

---

# 1. Design Principles

The UI must follow these principles:

• Clean  
• Minimal  
• Modern SaaS style  
• Consistent spacing  
• Clear hierarchy  
• Soft shadows  
• Subtle animations

Avoid visual clutter and inconsistent styling.

---

# 2. Color System

All colors must use **design tokens** instead of hardcoded values.

## Primary Colors

--color-primary: #2F7EF7  
--color-primary-hover: #1E6AE1

## Status Colors

--color-success: #22C55E  
--color-warning: #F59E0B  
--color-danger: #EF4444

## Neutral Colors

--color-bg: #F8FAFC  
--color-card: #FFFFFF  
--color-border: #E5E7EB

--color-text-primary: #0F172A  
--color-text-secondary: #64748B

Rules:

• Never use random hex colors  
• Always use tokens  
• Backgrounds must remain light and neutral

---

# 3. Typography

Use a single global font.

Preferred fonts:

Inter  
or  
Lexend

## Font Scale

Title XL → 32px / weight 600  
Title → 24px / weight 600  
Subtitle → 18px / weight 500  
Body → 16px / weight 400  
Small → 14px / weight 400  
Label → 12px / weight 500

Rules:

• Do not introduce random font sizes  
• Use the typography scale above

---

# 4. Spacing System

Spacing must follow an **8px scale**.

Spacing tokens:

--space-1: 4px  
--space-2: 8px  
--space-3: 16px  
--space-4: 24px  
--space-5: 32px  
--space-6: 48px

Rules:

• Never use arbitrary spacing values like 13px or 27px  
• Always use spacing tokens

Example:

padding: var(--space-3);  
gap: var(--space-2);  
margin-bottom: var(--space-4);

---

# 5. Border Radius

Use soft rounded corners.

--radius-sm: 6px  
--radius-md: 10px  
--radius-lg: 16px

Cards → radius-md  
Buttons → radius-sm

---

# 6. Shadows

Use subtle shadows only.

--shadow-sm → 0 1px 2px rgba(0,0,0,0.05)

--shadow-md →  
0 4px 12px rgba(0,0,0,0.08)

--shadow-lg →  
0 10px 30px rgba(0,0,0,0.12)

Rules:

• Do not use heavy shadows  
• Prefer soft elevation

---

# 7. Animations

Animations must be subtle and fast.

Timing:

fast → 150ms  
normal → 250ms  
slow → 400ms

Easing:

cubic-bezier(0.4, 0, 0.2, 1)

Rules:

• No exaggerated animations  
• Use hover transitions only where necessary

Example:

transition: all 200ms cubic-bezier(0.4, 0, 0.2, 1);

---

# 8. Components

## Buttons

Primary buttons must follow:

• Primary color background  
• White text  
• Small radius  
• Subtle hover state

## Cards

Cards must include:

• White background  
• Border with neutral color  
• Soft shadow  
• Medium radius  
• Padding 24px

---

# 9. Layout

Containers must use:

max-width: 1200px  
margin: auto  
padding: 24px

Grids must use:

gap: 24px

---

# 10. UI States

Success → Green  
Warning → Yellow  
Error → Red  
Info → Blue

Example badges:

Success badge background → #DCFCE7  
Success badge text → #166534

---

# 11. Responsiveness

Breakpoints:

Mobile → 640px  
Tablet → 768px  
Laptop → 1024px  
Desktop → 1280px

Layouts must adapt gracefully between breakpoints.

---

# 12. Rules for Generated UI

The AI must always:

• Use the defined color tokens  
• Respect the typography scale  
• Follow the spacing system  
• Keep components visually consistent  
• Avoid inline styles when possible  
• Reuse existing components before creating new ones

Never introduce new design patterns that conflict with this system.

---

# 13. Folder Structure Recommendation

styles/
tokens.css
typography.css
animations.css

components/
Button
Card
Modal
Input
Badge

layout/
Container
Grid

---

# 14. Goal

The goal of this system is to maintain:

• Visual consistency  
• Scalable UI architecture  
• Clean and professional SaaS interface
