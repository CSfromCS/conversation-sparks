# Planning Guide

A web app that generates contextually relevant conversation questions based on the current social environment to facilitate meaningful connections and engaging dialogue.

**Experience Qualities**:
1. **Thoughtful** - The app should feel like a considerate friend who understands the room and suggests questions that genuinely enhance connection
2. **Approachable** - Simple, unintimidating interface that doesn't interrupt the social flow but enhances it naturally
3. **Adaptive** - Responses feel personalized to the specific group dynamics rather than generic conversation starters

**Complexity Level**: Light Application (multiple features with basic state)
  - The app captures social context, generates custom questions, and maintains a history of generated sets while allowing users to iterate on results

## Essential Features

### Context Input Form
- **Functionality**: Captures social environment details (number of people, age range, vibe, interests, closeness level)
- **Purpose**: Provides the LLM with rich context to generate appropriate, relevant questions
- **Trigger**: User opens the app or clicks to generate new questions
- **Progression**: User sees form → fills in context fields → clicks generate → questions appear
- **Success criteria**: All fields are intuitive, optional fields don't block generation, form validates before submission

### Question Generation
- **Functionality**: Uses LLM to create 10 questions with varying depth levels (icebreaker, intermediate, deep)
- **Purpose**: Provides conversation starters tailored to the specific group dynamics
- **Trigger**: User submits context form
- **Progression**: Form submitted → loading state → questions appear categorized by difficulty → user can regenerate or refine
- **Success criteria**: Questions feel contextually appropriate, range from light to deep, appear within 3-5 seconds

### Question Display
- **Functionality**: Shows generated questions organized by difficulty with visual hierarchy
- **Purpose**: Makes it easy to scan and select appropriate questions for the current moment
- **Trigger**: Successful question generation
- **Progression**: Questions appear → user reads/shares → can copy individual questions and entire set → can generate new set
- **Success criteria**: Questions are readable, difficulty levels are clear, individual questions can be copied

### URL-Based Context Sharing
- **Functionality**: Encodes social context in URL query parameters and prefills form from URL on load
- **Purpose**: Allows users to share pre-configured contexts with others via link
- **Trigger**: User modifies any context field or shares URL with query parameters
- **Progression**: User fills context → URL updates automatically → user shares link → recipient opens link with prefilled context → can generate questions immediately
- **Success criteria**: URL updates smoothly without page reload, all context fields properly encode/decode, shared links open with correct prefilled values

## Edge Case Handling
- **Empty Context**: If minimal context provided, generate general but still useful questions
- **Inappropriate Requests**: Filter out context that might lead to uncomfortable questions
- **Generation Failures**: Show friendly error with option to retry
- **Very Large Groups**: Cap or warn about group size for question relevance
- **Conflicting Context**: If age/interests/vibe conflict, prioritize safety and inclusivity

## Design Direction
The design should feel warm, approachable, and social - like a conversation facilitator rather than a corporate tool. A balanced interface with generous spacing to avoid feeling cluttered, allowing the questions themselves to be the hero content.

## Color Selection
Analogous warm palette creating a welcoming, social atmosphere that feels inviting and comfortable for group settings.

- **Primary Color**: Warm coral (oklch(0.70 0.15 25)) - Communicates warmth, friendliness, and approachability
- **Secondary Colors**: Soft peach (oklch(0.85 0.10 45)) for backgrounds and less prominent elements
- **Accent Color**: Deep terracotta (oklch(0.55 0.18 35)) for CTAs and emphasis
- **Foreground/Background Pairings**:
  - Background (Cream White oklch(0.98 0.01 75)): Dark slate text (oklch(0.25 0.02 260)) - Ratio 12.8:1 ✓
  - Card (White oklch(1 0 0)): Dark slate text (oklch(0.25 0.02 260)) - Ratio 13.5:1 ✓
  - Primary (Warm Coral oklch(0.70 0.15 25)): White text (oklch(1 0 0)) - Ratio 5.2:1 ✓
  - Secondary (Soft Peach oklch(0.85 0.10 45)): Dark slate text (oklch(0.25 0.02 260)) - Ratio 8.5:1 ✓
  - Accent (Deep Terracotta oklch(0.55 0.18 35)): White text (oklch(1 0 0)) - Ratio 7.1:1 ✓
  - Muted (Light Peach oklch(0.95 0.02 50)): Medium slate text (oklch(0.45 0.03 260)) - Ratio 5.8:1 ✓

## Font Selection
Typography should feel friendly and conversational while maintaining excellent readability - selecting Inter for its humanist qualities and excellent screen optimization.

- **Typographic Hierarchy**:
  - H1 (App Title): Inter SemiBold/32px/tight leading/-0.02em tracking
  - H2 (Section Headers): Inter Medium/24px/tight leading/-0.01em tracking
  - H3 (Difficulty Labels): Inter Medium/16px/normal leading/0em tracking  
  - Body (Questions): Inter Regular/18px/relaxed leading (1.6)/0em tracking
  - Labels (Form Fields): Inter Medium/14px/normal leading/0em tracking
  - Small (Helper Text): Inter Regular/13px/normal leading/0em tracking

## Animations
Animations should feel organic and social - like content naturally flowing into the conversation rather than mechanical transitions.

- **Purposeful Meaning**: Gentle fades and subtle scale transforms communicate the thoughtful generation of questions; stagger animations for question lists create a sense of reveal and anticipation
- **Hierarchy of Movement**: Primary focus on question appearance (staggered fade-up), secondary on form transitions, minimal motion on inputs to avoid distraction

## Component Selection
- **Components**: 
  - Card (shadcn) - For question display and form container, with subtle shadows for depth
  - Input (shadcn) - For text inputs with soft focus states
  - Select (shadcn) - For dropdown selections (age range, group size) with smooth transitions
  - Button (shadcn) - Primary for generation, ghost variants for secondary actions, with slight press animations
  - Badge (shadcn) - For difficulty level indicators, customized with warm palette colors
  - Textarea (shadcn) - For interests/vibe multi-line input
  - Skeleton (shadcn) - For loading states during generation
  - Separator (shadcn) - For visual hierarchy between sections
  
- **Customizations**: 
  - Custom question card component with copy-to-clipboard functionality
  - Staggered animation wrapper for question list reveals
  
- **States**: 
  - Buttons: Resting with subtle shadow → Hover with slight lift → Active with press effect → Loading with spinner → Disabled with reduced opacity
  - Inputs: Default with soft border → Focus with warm glow → Filled with subtle background shift → Error with gentle red accent
  
- **Icon Selection**: 
  - Phosphor Users icon for group size
  - Phosphor Sparkle for generate action
  - Phosphor Copy for copy-to-clipboard
  - Phosphor ArrowClockwise for regenerate
  - Phosphor Chats for conversation/questions
  
- **Spacing**: 
  - Container padding: p-6 (24px) on mobile, p-8 (32px) on desktop
  - Section gaps: gap-8 (32px) for major sections, gap-4 (16px) for related elements
  - Card padding: p-6 (24px) consistently
  - Form field spacing: gap-4 (16px) between fields
  
- **Mobile**: 
  - Mobile-first with single column layout
  - Form fields stack vertically on mobile, potentially 2-column grid on tablet+
  - Questions remain single column on all screen sizes for readability
  - Bottom-anchored generate button becomes full-width on mobile
  - Touch targets minimum 44px height for all interactive elements
