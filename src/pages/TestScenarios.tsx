import type { Scenario } from '../types';

const scenarios: Scenario[] = [
  {
    id: 'SC01',
    title: 'Basic Checkbox Interaction',
    description: 'Find and toggle a checkbox',
    steps: [
      'Navigate to Controls Lab',
      'Locate the single checkbox',
      'Click to check it',
      'Verify it is checked',
    ],
    expectedResult: 'Checkbox state changes from unchecked to checked',
    difficulty: 'easy',
    controls: ['checkbox'],
  },
  {
    id: 'SC02',
    title: 'Form Validation - Invalid Email',
    description: 'Trigger and recover from email validation error',
    steps: [
      'Navigate to Form Playground',
      'Enter invalid email (e.g., "notanemail")',
      'Blur the field or submit',
      'Observe validation error',
      'Correct email to valid format',
      'Verify error clears',
    ],
    expectedResult: 'Error message appears then disappears when corrected',
    difficulty: 'medium',
    controls: ['input', 'validation'],
  },
  {
    id: 'SC03',
    title: 'Password Strength Validation',
    description: 'Progressively strengthen password',
    steps: [
      'Navigate to Form Playground',
      'Enter weak password (e.g., "pass")',
      'Observe strength indicator shows "weak"',
      'Add uppercase, numbers, special chars',
      'Observe strength improves to "strong"',
    ],
    expectedResult: 'Password strength indicator updates dynamically',
    difficulty: 'medium',
    controls: ['input', 'validation', 'dynamic-state'],
  },
  {
    id: 'SC04',
    title: 'Dynamic Form - Advanced Settings',
    description: 'Reveal hidden fields by toggling checkbox',
    steps: [
      'Navigate to Form Playground',
      'Scroll to "Enable advanced settings" checkbox',
      'Check the checkbox',
      'Verify additional fields appear',
    ],
    expectedResult: 'Advanced settings panel becomes visible',
    difficulty: 'easy',
    controls: ['checkbox', 'conditional-display'],
  },
  {
    id: 'SC05',
    title: 'Data Table Search and Filter',
    description: 'Search and filter table data',
    steps: [
      'Navigate to Data Table',
      'Enter search term in search box',
      'Verify table filters to matching rows',
      'Select status filter dropdown',
      'Choose "Active" status',
      'Verify only active rows shown',
    ],
    expectedResult: 'Table shows only rows matching search and filter',
    difficulty: 'medium',
    controls: ['input', 'select', 'table'],
  },
  {
    id: 'SC06',
    title: 'Table Sorting',
    description: 'Sort table by column',
    steps: [
      'Navigate to Data Table',
      'Click "Name" column header',
      'Verify table sorts ascending',
      'Click "Name" header again',
      'Verify table sorts descending',
    ],
    expectedResult: 'Table data reorders based on sort direction',
    difficulty: 'easy',
    controls: ['table', 'sorting'],
  },
  {
    id: 'SC07',
    title: 'Table Pagination',
    description: 'Navigate through table pages',
    steps: [
      'Navigate to Data Table',
      'Note current page number',
      'Click "Next" button',
      'Verify page number increases',
      'Verify different rows displayed',
    ],
    expectedResult: 'Table shows next page of results',
    difficulty: 'easy',
    controls: ['pagination', 'buttons'],
  },
  {
    id: 'SC08',
    title: 'Modal Open and Close',
    description: 'Open modal and close it multiple ways',
    steps: [
      'Navigate to Modal & Overlay Lab',
      'Click "Open Basic Modal"',
      'Verify modal appears',
      'Click outside modal to close',
      'Open modal again',
      'Click Close button',
    ],
    expectedResult: 'Modal opens and closes correctly',
    difficulty: 'easy',
    controls: ['button', 'modal'],
  },
  {
    id: 'SC09',
    title: 'Confirmation Dialog',
    description: 'Handle confirmation workflow',
    steps: [
      'Navigate to Modal & Overlay Lab',
      'Click "Open Confirmation"',
      'Read confirmation message',
      'Click "Confirm"',
      'Verify success toast appears',
    ],
    expectedResult: 'Confirmation triggers action and shows feedback',
    difficulty: 'medium',
    controls: ['modal', 'buttons', 'toast'],
  },
  {
    id: 'SC10',
    title: 'Form in Modal',
    description: 'Submit form within modal',
    steps: [
      'Navigate to Modal & Overlay Lab',
      'Click "Open Form Modal"',
      'Fill in name and message fields',
      'Click Submit',
      'Verify modal closes and toast appears',
    ],
    expectedResult: 'Form submits successfully from modal',
    difficulty: 'medium',
    controls: ['modal', 'form', 'input', 'toast'],
  },
  {
    id: 'SC11',
    title: 'Drag and Drop - Kanban',
    description: 'Move kanban card between columns',
    steps: [
      'Navigate to Drag & Drop Lab',
      'Locate a card in "To Do" column',
      'Use "Move to..." dropdown',
      'Select "In Progress"',
      'Verify card moves to new column',
    ],
    expectedResult: 'Card successfully moves between columns',
    difficulty: 'medium',
    controls: ['select', 'dynamic-state'],
  },
  {
    id: 'SC12',
    title: 'File Upload Success',
    description: 'Upload a file successfully',
    steps: [
      'Navigate to File & Media Lab',
      'Click "Choose File"',
      'Select a valid file',
      'Click "Upload" button',
      'Wait for progress to complete',
      'Verify success indicator',
    ],
    expectedResult: 'File uploads and shows success state',
    difficulty: 'medium',
    controls: ['file-input', 'button', 'progress'],
  },
  {
    id: 'SC13',
    title: 'File Upload Retry',
    description: 'Handle upload failure and retry',
    steps: [
      'Navigate to File & Media Lab',
      'Upload multiple files',
      'If upload fails, click Retry',
      'Verify file uploads successfully',
    ],
    expectedResult: 'Failed upload can be retried',
    difficulty: 'hard',
    controls: ['file-input', 'button', 'error-handling'],
  },
  {
    id: 'SC14',
    title: 'State Dependency - Country/State',
    description: 'Interact with dependent dropdowns',
    steps: [
      'Navigate to State Playground',
      'Note that State dropdown is disabled',
      'Select a country from dropdown',
      'Verify State dropdown becomes enabled',
      'Verify State dropdown shows relevant options',
    ],
    expectedResult: 'State dropdown enables and populates based on country',
    difficulty: 'medium',
    controls: ['select', 'conditional-enable'],
  },
  {
    id: 'SC15',
    title: 'Toast Notifications',
    description: 'Trigger different toast types',
    steps: [
      'Navigate to Modal & Overlay Lab',
      'Click "Show Success"',
      'Verify success toast appears',
      'Click "Show Error"',
      'Verify error toast appears',
      'Wait for toasts to auto-dismiss',
    ],
    expectedResult: 'Different toast types appear and auto-dismiss',
    difficulty: 'easy',
    controls: ['button', 'toast'],
  },
  {
    id: 'SC16',
    title: 'Tab Navigation',
    description: 'Switch between tabs',
    steps: [
      'Navigate to Controls Lab',
      'Locate the tabs component',
      'Click "Tab 2"',
      'Verify Tab 2 content displays',
      'Click "Tab 1"',
      'Verify Tab 1 content displays',
    ],
    expectedResult: 'Tab content changes when tab is clicked',
    difficulty: 'easy',
    controls: ['tabs'],
  },
  {
    id: 'SC17',
    title: 'Accordion Expand/Collapse',
    description: 'Open and close accordion items',
    steps: [
      'Navigate to Controls Lab',
      'Locate accordion component',
      'Click an accordion header',
      'Verify content expands',
      'Click header again',
      'Verify content collapses',
    ],
    expectedResult: 'Accordion toggles between expanded and collapsed',
    difficulty: 'easy',
    controls: ['accordion'],
  },
  {
    id: 'SC18',
    title: 'Dropdown Selection',
    description: 'Select item from dropdown',
    steps: [
      'Navigate to Controls Lab',
      'Click dropdown trigger',
      'Verify menu opens',
      'Click an option',
      'Verify dropdown closes and selection updates',
    ],
    expectedResult: 'Dropdown opens, selection is made, dropdown closes',
    difficulty: 'easy',
    controls: ['dropdown'],
  },
  {
    id: 'SC19',
    title: 'Global Search',
    description: 'Use global search to find pages',
    steps: [
      'Click search icon in header',
      'Type "form" in search box',
      'Verify search results appear',
      'Click a result',
      'Verify navigation to that page',
    ],
    expectedResult: 'Search finds and navigates to pages',
    difficulty: 'medium',
    controls: ['input', 'search', 'navigation'],
  },
  {
    id: 'SC20',
    title: 'Theme Switching',
    description: 'Change application theme',
    steps: [
      'Locate theme selector in header',
      'Note current theme',
      'Click different theme button',
      'Verify visual theme changes',
    ],
    expectedResult: 'Application theme changes when button clicked',
    difficulty: 'easy',
    controls: ['button', 'theme'],
  },
  {
    id: 'SC21',
    title: 'Form Submission - Complete Workflow',
    description: 'Fill and submit entire form',
    steps: [
      'Navigate to Form Playground',
      'Fill all required fields with valid data',
      'Accept terms checkbox',
      'Click Submit',
      'Wait for submission to complete',
      'Verify success toast',
    ],
    expectedResult: 'Form submits successfully with all valid data',
    difficulty: 'hard',
    controls: ['form', 'input', 'select', 'checkbox', 'button', 'validation'],
  },
  {
    id: 'SC22',
    title: 'Table Row Selection',
    description: 'Select multiple table rows',
    steps: [
      'Navigate to Data Table',
      'Click checkbox on first row',
      'Click checkbox on second row',
      'Verify selection count shows 2',
      'Click "Select All"',
      'Verify all visible rows selected',
      'Click "Clear"',
      'Verify all selections cleared',
    ],
    expectedResult: 'Multiple rows can be selected and deselected',
    difficulty: 'medium',
    controls: ['checkbox', 'table', 'select-all'],
  },
  {
    id: 'SC23',
    title: 'Keyboard Navigation',
    description: 'Navigate using only keyboard',
    steps: [
      'Use Tab to navigate to Controls Lab link',
      'Press Enter to navigate',
      'Tab to a button',
      'Press Space or Enter to activate',
      'Verify button action occurs',
    ],
    expectedResult: 'All interactions work via keyboard',
    difficulty: 'medium',
    controls: ['keyboard', 'accessibility'],
  },
  {
    id: 'SC24',
    title: 'Error Recovery - Form Validation',
    description: 'Submit invalid form, fix errors, resubmit',
    steps: [
      'Navigate to Form Playground',
      'Leave required fields empty',
      'Click Submit',
      'Observe validation errors',
      'Fill all required fields correctly',
      'Click Submit again',
      'Verify successful submission',
    ],
    expectedResult: 'User can recover from validation errors',
    difficulty: 'hard',
    controls: ['form', 'validation', 'error-handling'],
  },
];

export function TestScenarios() {
  return (
    <div data-testid="page-scenarios">
      <div className="page-header">
        <h1>Test Scenarios</h1>
        <p>{scenarios.length} scenarios from easy to hard — steps, expected results, and controls involved</p>
      </div>

      <div className="scenarios-list">
        {scenarios.map(s => (
          <div key={s.id} className="card scenario-card" data-testid={`scenario-${s.id}`}>
            <div className="scenario-header card-header">
              <span className="scenario-id">{s.id}</span>
              <span style={{ flex: 1, marginLeft: 12, fontWeight: 500, fontSize: 14, color: 'var(--text-strong)' }}>{s.title}</span>
              <span className={`badge badge-${s.difficulty}`}>{s.difficulty}</span>
            </div>
            <div className="card-body scenario-body">
              <p className="text-muted text-sm mb-12">{s.description}</p>
              <strong style={{ fontSize: 12 }}>Steps</strong>
              <ol className="scenario-steps">
                {s.steps.map((step, i) => <li key={i}>{step}</li>)}
              </ol>
              <strong style={{ fontSize: 12 }}>Expected result</strong>
              <p className="text-sm mt-4 mb-12">{s.expectedResult}</p>
              <div className="scenario-tags">
                {s.controls.map(c => <span key={c} className="tag">{c}</span>)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
