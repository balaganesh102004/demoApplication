# UI Testing Playground

A comprehensive test environment designed specifically for evaluating AI-powered UI and browser testing agents.

## Purpose

The UI Testing Playground provides a diverse set of real, functional, deterministic UI interactions that an AI testing agent must be able to discover, understand, interact with, validate, and navigate. This is not just a visually attractive website—it's a deliberately comprehensive AI UI-testing benchmark environment built to look like a real enterprise SaaS product.

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Technology Stack

- **React** 19.2.8
- **TypeScript** 6.0.2
- **Vite** 8.2.2
- **React Router** for navigation
- Clean CSS with CSS variables for theming

## Application Structure

### Routes

- `/` - Redirects to Dashboard
- `/dashboard` - Overview with state controls and quick actions
- `/forms` - Comprehensive form with extensive validation
- `/controls` - All UI control types (buttons, checkboxes, toggles, tabs, accordions, etc.)
- `/navigation` - Various navigation patterns (links, breadcrumbs, query params, anchors)
- `/table` - Full-featured data table with search, filter, sort, pagination, row selection
- `/overlays` - Modals, drawers, toasts, and confirmation dialogs
- `/drag-drop` - Drag and drop with accessible alternatives
- `/files` - File upload with progress and error states
- `/validation` - (Alias for forms page)
- `/accessibility` - Accessibility features and semantic HTML
- `/state` - State-dependent interactions
- `/scenarios` - 24 comprehensive test scenarios
- `/coverage` - Complete interaction inventory
- `/about` - Application documentation
- `/*` - 404 page with helpful navigation

### Key Features

#### 1. Form Playground
- Text, email, password, phone, age, website, date inputs
- Password strength validation
- Country/state dependent dropdowns
- Checkboxes, radios, selects, textareas, color picker, range slider
- Multiple validation modes: on blur, on change, on submit
- Comprehensive validation rules with error recovery
- Advanced settings toggle that reveals additional fields

#### 2. Controls Lab
- Buttons: primary, secondary, ghost, destructive, success, disabled, loading, with icons
- Checkboxes: single, groups, select all, disabled
- Radio buttons: groups, preselected, disabled
- Toggles: basic, disabled, confirmation
- Sliders: single value, range
- Tabs: basic, with badges, disabled
- Accordions: expandable/collapsible sections
- Dropdowns: with selection
- Tooltips: hover and keyboard focus
- Popovers: with interactive content

#### 3. Data Table
- 50 rows of deterministic mock data
- Search across multiple columns
- Filter by status
- Sort by any column (ascending/descending)
- Pagination with configurable page size
- Row selection (single and select all)
- Expandable rows
- Row actions (edit, delete)
- Empty state handling

#### 4. Modals & Overlays
- Basic modal
- Large modal
- Confirmation dialog
- Form modal
- Drawer/sidebar
- Toast notifications (success, error, warning, info, persistent)
- Multiple close methods: button, outside click, escape key

#### 5. Drag & Drop Lab
- Container transfer with button alternatives
- Sortable list with up/down controls
- Kanban board with dropdown-based movement
- All interactions have accessible alternatives

#### 6. File Upload
- Single and multiple file upload
- Image file upload
- Upload progress indicator
- Success and error states
- Retry failed uploads
- Remove files from list

#### 7. State Playground
- Advanced settings toggle (reveals hidden fields)
- Notification preferences (conditional panel)
- Country/state dependency (state field enables based on country)
- Role/permissions display (shows different permissions per role)
- Slider affecting visual display with warning threshold

#### 8. Accessibility Lab
- Semantic HTML examples
- Form labels and aria-label examples
- ARIA live regions
- Keyboard navigation examples
- Focus management
- Skip navigation
- ARIA roles and states
- Proper button vs link usage

#### 9. Test Scenarios
24 pre-defined test scenarios covering:
- Easy: Basic checkbox, buttons, tabs, accordion, dropdown, etc.
- Medium: Form validation, table operations, modal workflows, file upload, state dependencies
- Hard: Complete form submission, error recovery, multi-step workflows

Each scenario includes:
- Scenario ID
- Title and description
- Step-by-step instructions
- Expected result
- Difficulty level
- Controls involved

#### 10. Interaction Coverage
Comprehensive documentation of all components with:
- Component name
- Available interactions
- All possible states

### Global Features

- **Header**: Logo, global search, notifications, theme selector (light/dark/system), help, user menu
- **Sidebar**: Collapsible navigation with icons
- **Theme Switching**: Three themes (light, dark, system) that persist
- **Global Search**: Searches through all pages, shows results with count
- **User Menu**: Profile, settings, preferences, sign out (with confirmation)
- **Toast System**: Multiple simultaneous toasts, auto-dismiss and persistent options
- **Reset Environment**: Button to reset entire application to known state
- **Breadcrumbs**: Context-aware navigation
- **404 Page**: Helpful error page with navigation options

## Design Principles

### 1. Discoverability
- Controls have meaningful visible labels
- Semantic HTML throughout
- Predictable DOM structure
- Accessible names for all interactive elements

### 2. Determinism
- No random UI behavior
- Predictable delays for async operations
- Consistent mock data
- No flaky state transitions

### 3. Interactability
- Mouse support (click, hover)
- Keyboard support (Tab, Enter, Space, Escape, Arrow keys)
- Focus management with visible indicators
- Proper form controls

### 4. State Richness
- Default, hover, focus, active, disabled, loading, success, error states
- Empty states and error states
- Selected/unselected, expanded/collapsed, open/closed

### 5. Error Recovery
The application intentionally allows users to:
- Make mistakes
- Encounter errors
- Understand the error message
- Correct the input
- Continue the workflow successfully

## Testing Features

### Test IDs
Important elements include `data-testid` attributes for automation:
- `global-search`
- `sidebar-toggle`
- `theme-light`, `theme-dark`, `theme-system`
- `user-menu`, `sign-out`
- `form-email`, `form-password`, `form-submit`
- `table-search`, `table-filter-status`, `select-all`
- `open-basic-modal`, `modal-close-btn`
- `reset-test-environment`

### Semantic Testing
The application can also be tested using:
- Visible text
- Labels and accessible names
- Roles (button, link, checkbox, radio, tab, etc.)
- Semantic HTML elements

### Deterministic Data
- Table data: 50 fixed records
- No API calls required
- Mock uploads with predictable success/failure
- Consistent UI state

### Reset Environment
Click the "Reset Test Environment" button to return the application to a clean baseline state for reproducible testing.

## File Structure

```
src/
├── components/          # Reusable UI components
│   ├── Button.tsx
│   ├── Header.tsx
│   ├── Sidebar.tsx
│   ├── Layout.tsx
│   └── Toast.tsx
├── context/            # React context for global state
│   └── AppContext.tsx
├── pages/              # Route components
│   ├── Dashboard.tsx
│   ├── FormPlayground.tsx
│   ├── ControlsLab.tsx
│   ├── NavigationLab.tsx
│   ├── DataTable.tsx
│   ├── ModalLab.tsx
│   ├── DragDropLab.tsx
│   ├── FilesLab.tsx
│   ├── StatePlayground.tsx
│   ├── AccessibilityLab.tsx
│   ├── TestScenarios.tsx
│   ├── InteractionCoverage.tsx
│   ├── About.tsx
│   └── NotFound.tsx
├── types.ts            # TypeScript type definitions
├── App.tsx             # Main app with routing
├── App.css             # Application styles
├── main.tsx            # Application entry point
└── index.css           # Global styles with CSS variables
```

## Interaction Inventory

### Components
- Buttons (8 variants)
- Checkboxes (4 states)
- Radio buttons (3 states)
- Toggles/switches (3 states)
- Text inputs (6 types)
- Select/dropdown (4 types)
- Textarea (3 variants)
- Sliders (2 types)
- Date/time controls (3 types)
- File upload (3 modes)
- Tabs (4 states)
- Accordion (expandable)
- Tooltip (hover/focus)
- Popover (with content)
- Modal (5 variants)
- Drawer (sidebar)
- Toast (4 types)
- Table (full-featured)
- Pagination
- Drag & drop (3 types)

### Interactions
- Click, double-click, right-click
- Keyboard navigation (Tab, Enter, Space, Escape, Arrows)
- Hover states
- Focus management
- Text input and validation
- Search and filter
- Sort
- Selection (single and multiple)
- Expansion/collapse
- Open/close
- Submit/cancel
- Upload/retry/remove
- Drag/drop/reorder

### States
- Default, hover, focus, active
- Disabled, loading, readonly
- Valid, invalid, error, warning
- Empty, filled, selected
- Expanded, collapsed
- Open, closed
- Success, error, pending
- And 50+ more specific states

## Browser Support

The application works in modern browsers supporting:
- ES6+ JavaScript
- CSS Grid and Flexbox
- CSS Custom Properties (variables)
- HTML5 form controls

## For AI Testing Agents

This application is specifically designed as a benchmark for AI-powered browser testing agents. Key characteristics:

1. **Real Functionality**: All controls work, nothing is fake
2. **Deterministic**: Reproducible behavior without randomness
3. **Comprehensive**: Wide variety of interactions and scenarios
4. **Accessible**: Multiple ways to identify and interact with elements
5. **Error-Tolerant**: Allows mistakes and provides recovery paths
6. **Documented**: Clear scenarios with expected outcomes
7. **Resettable**: Can return to known baseline state
8. **Offline**: Works completely locally without external dependencies

## License

This is a test environment for AI evaluation purposes.

## Contributing

This project was created as a comprehensive UI testing playground. Feel free to extend it with additional components, interactions, or test scenarios.
