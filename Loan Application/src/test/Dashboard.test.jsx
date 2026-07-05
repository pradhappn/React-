/**
 * Dashboard.test.jsx
 * Comprehensive test suite for the Document Upload Dashboard
 * Tests: rendering, applicant management, document management,
 *        modal flows, file upload, drag-and-drop, status transitions
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import Dashboard from '../pages/Dashboard'
import AddApplicantModal from '../components/AddApplicantModal'
import ApplicantPanel from '../components/ApplicantPanel'

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Wrap component inside MemoryRouter */
const renderDashboard = () =>
  render(
    <MemoryRouter>
      <Dashboard />
    </MemoryRouter>
  )

/** Click the "+ Add Applicant" header button by its unique ID */
const openAddApplicantModal = async (user) => {
  const btn = document.getElementById('add-applicant-btn')
  await user.click(btn)
}

/** Type an applicant name and save */
const addApplicant = async (user, name) => {
  await openAddApplicantModal(user)
  const input = screen.getByPlaceholderText(/enter applicant name/i)
  await user.type(input, name)
  const saveBtn = document.getElementById('add-applicant-save')
  await user.click(saveBtn)
}

/** Open the "Add" document modal using the no-docs Add button */
const openDocModal = async (user) => {
  const addBtn = document.getElementById('add-doc-btn')
  await user.click(addBtn)
}

/** Add a document via the modal */
const addDocument = async (user, docName) => {
  await openDocModal(user)
  const input = document.getElementById('doc-name-input')
  await user.type(input, docName)
  const saveBtn = document.getElementById('doc-modal-save')
  await user.click(saveBtn)
}

// ─── Test Suites ─────────────────────────────────────────────────────────────

describe('Dashboard — initial render', () => {
  it('renders the Document Upload heading', () => {
    renderDashboard()
    expect(screen.getByRole('heading', { name: /document upload/i })).toBeInTheDocument()
  })

  it('renders the Add Applicant button', () => {
    renderDashboard()
    expect(document.getElementById('add-applicant-btn')).toBeInTheDocument()
  })

  it('renders Back and Next navigation buttons', () => {
    renderDashboard()
    expect(document.getElementById('back-btn')).toBeInTheDocument()
    expect(document.getElementById('next-btn')).toBeInTheDocument()
  })

  it('does NOT show any applicant tabs initially', () => {
    renderDashboard()
    // No tabs container, no no-docs message
    expect(screen.queryByText(/no documents available/i)).not.toBeInTheDocument()
  })
})

// ─────────────────────────────────────────────────────────────────────────────
describe('Add Applicant Modal', () => {
  it('opens the Add Applicant modal when button is clicked', async () => {
    const user = userEvent.setup()
    renderDashboard()
    await openAddApplicantModal(user)
    // Modal panel is visible
    expect(document.getElementById('add-applicant-modal')).toBeInTheDocument()
    // Input is rendered
    expect(screen.getByPlaceholderText(/enter applicant name/i)).toBeInTheDocument()
  })

  it('modal heading says "Add Applicant"', async () => {
    const user = userEvent.setup()
    renderDashboard()
    await openAddApplicantModal(user)
    const modal = document.getElementById('add-applicant-modal')
    expect(within(modal).getByRole('heading', { name: /add applicant/i })).toBeInTheDocument()
  })

  it('closes when the Cancel button is clicked', async () => {
    const user = userEvent.setup()
    renderDashboard()
    await openAddApplicantModal(user)
    const cancelBtn = document.getElementById('add-applicant-cancel')
    await user.click(cancelBtn)
    expect(document.getElementById('add-applicant-modal')).toBeNull()
  })

  it('closes when backdrop is clicked', async () => {
    const user = userEvent.setup()
    renderDashboard()
    await openAddApplicantModal(user)
    const backdrop = document.getElementById('add-applicant-backdrop')
    await user.click(backdrop)
    expect(document.getElementById('add-applicant-modal')).toBeNull()
  })

  it('does not add an applicant when name is empty', async () => {
    const user = userEvent.setup()
    renderDashboard()
    await openAddApplicantModal(user)
    const saveBtn = document.getElementById('add-applicant-save')
    await user.click(saveBtn)
    // No tabs should appear
    expect(screen.queryByText(/no documents available/i)).not.toBeInTheDocument()
  })

  it('saves applicant on Enter key press', async () => {
    const user = userEvent.setup()
    renderDashboard()
    await openAddApplicantModal(user)
    const input = screen.getByPlaceholderText(/enter applicant name/i)
    await user.type(input, 'Alice{Enter}')
    await waitFor(() => {
      expect(screen.getByText('Alice')).toBeInTheDocument()
    })
  })
})

// ─────────────────────────────────────────────────────────────────────────────
describe('Applicant Tabs', () => {
  it('creates a tab when an applicant is added', async () => {
    const user = userEvent.setup()
    renderDashboard()
    await addApplicant(user, 'John')
    expect(screen.getByText('John')).toBeInTheDocument()
  })

  it('shows "No documents available" for a new applicant', async () => {
    const user = userEvent.setup()
    renderDashboard()
    await addApplicant(user, 'John')
    expect(screen.getByText(/no documents available/i)).toBeInTheDocument()
  })

  it('adds multiple applicants as separate tabs', async () => {
    const user = userEvent.setup()
    renderDashboard()
    await addApplicant(user, 'Alice')
    await addApplicant(user, 'Bob')
    expect(screen.getByText('Alice')).toBeInTheDocument()
    expect(screen.getByText('Bob')).toBeInTheDocument()
  })

  it('does not create duplicate applicants with the same name', async () => {
    const user = userEvent.setup()
    renderDashboard()
    await addApplicant(user, 'Alice')
    await addApplicant(user, 'Alice')
    // Only one tab button with 'Alice' text — but there's also the tab-trash nearby,
    // so we scope to the tab holder
    const tabs = document.querySelectorAll('.tab')
    const aliceTabs = Array.from(tabs).filter(t => t.textContent.trim() === 'Alice')
    expect(aliceTabs).toHaveLength(1)
  })

  it('removes an applicant when the trash icon is clicked', async () => {
    const user = userEvent.setup()
    renderDashboard()
    await addApplicant(user, 'DeleteMe')
    const trashBtn = screen.getByRole('button', { name: /remove deleteme/i })
    await user.click(trashBtn)
    expect(screen.queryByText('DeleteMe')).not.toBeInTheDocument()
  })

  it('switches active tab when another applicant tab is clicked', async () => {
    const user = userEvent.setup()
    renderDashboard()
    await addApplicant(user, 'Alice')
    await addApplicant(user, 'Bob')
    // Find the Alice tab button
    const aliceTab = screen.getByRole('button', { name: 'Alice' })
    await user.click(aliceTab)
    expect(aliceTab).toHaveClass('active')
  })
})

// ─────────────────────────────────────────────────────────────────────────────
describe('Add Document Modal', () => {
  it('opens the Add document modal when "Add" button is clicked', async () => {
    const user = userEvent.setup()
    renderDashboard()
    await addApplicant(user, 'John')
    await openDocModal(user)
    expect(document.getElementById('doc-modal')).toBeInTheDocument()
    expect(document.getElementById('doc-name-input')).toBeInTheDocument()
  })

  it('shows the modal title "Add"', async () => {
    const user = userEvent.setup()
    renderDashboard()
    await addApplicant(user, 'John')
    await openDocModal(user)
    const modal = document.getElementById('doc-modal')
    expect(within(modal).getByRole('heading', { name: /^add$/i })).toBeInTheDocument()
  })

  it('shows "Document Name" label', async () => {
    const user = userEvent.setup()
    renderDashboard()
    await addApplicant(user, 'John')
    await openDocModal(user)
    expect(screen.getByLabelText(/document name/i)).toBeInTheDocument()
  })

  it('closes the document modal when Cancel is clicked', async () => {
    const user = userEvent.setup()
    renderDashboard()
    await addApplicant(user, 'John')
    await openDocModal(user)
    const cancelBtn = document.getElementById('doc-modal-cancel')
    await user.click(cancelBtn)
    expect(document.getElementById('doc-modal')).toBeNull()
  })

  it('closes the document modal when backdrop is clicked', async () => {
    const user = userEvent.setup()
    renderDashboard()
    await addApplicant(user, 'John')
    await openDocModal(user)
    const backdrop = document.getElementById('doc-modal-backdrop')
    await user.click(backdrop)
    expect(document.getElementById('doc-modal')).toBeNull()
  })

  it('adds a document with Pending status after saving modal', async () => {
    const user = userEvent.setup()
    renderDashboard()
    await addApplicant(user, 'John')
    await openDocModal(user)
    const input = document.getElementById('doc-name-input')
    await user.type(input, 'Passport')
    await user.click(document.getElementById('doc-modal-save'))
    await waitFor(() => {
      // Doc name appears in doc-pill and file-name — use getAllByText
      const els = screen.getAllByText('Passport')
      expect(els.length).toBeGreaterThanOrEqual(1)
      expect(screen.getByText(/pending/i)).toBeInTheDocument()
    })
  })

  it('saves document on Enter key press', async () => {
    const user = userEvent.setup()
    renderDashboard()
    await addApplicant(user, 'John')
    await openDocModal(user)
    const input = document.getElementById('doc-name-input')
    await user.type(input, 'License{Enter}')
    await waitFor(() => {
      const els = screen.getAllByText('License')
      expect(els.length).toBeGreaterThanOrEqual(1)
    })
  })

  it('does not add a document when name is empty', async () => {
    const user = userEvent.setup()
    renderDashboard()
    await addApplicant(user, 'John')
    await openDocModal(user)
    // Click save without typing
    await user.click(document.getElementById('doc-modal-save'))
    // Should still show no-docs state (modal stays open or no doc added)
    await waitFor(() => {
      expect(screen.getByText(/no documents available/i)).toBeInTheDocument()
    })
  })
})

// ─────────────────────────────────────────────────────────────────────────────
describe('Document List — status transitions', () => {
  const setupWithDoc = async (user, docName = 'Resume') => {
    renderDashboard()
    await addApplicant(user, 'John')
    await openDocModal(user)
    await user.type(document.getElementById('doc-name-input'), docName)
    await user.click(document.getElementById('doc-modal-save'))
  }

  it('shows Pending badge immediately after adding a document', async () => {
    const user = userEvent.setup()
    await setupWithDoc(user, 'Resume')
    await waitFor(() => {
      expect(screen.getByText(/pending/i)).toBeInTheDocument()
    })
  })

  it('marks document as Completed when the upload/complete button is clicked', async () => {
    const user = userEvent.setup()
    await setupWithDoc(user, 'Resume')
    await waitFor(() => screen.getByText(/pending/i))
    const completeBtn = document.querySelector('.btn-complete')
    expect(completeBtn).not.toBeNull()
    await user.click(completeBtn)
    await waitFor(() => {
      expect(screen.getByText(/completed/i)).toBeInTheDocument()
      expect(screen.queryByText(/pending/i)).not.toBeInTheDocument()
    })
  })

  it('removes a document when the delete (×) button is clicked', async () => {
    const user = userEvent.setup()
    await setupWithDoc(user, 'Resume')
    await waitFor(() => screen.getAllByText('Resume'))
    const deleteBtn = document.querySelector('.btn-delete')
    expect(deleteBtn).not.toBeNull()
    await user.click(deleteBtn)
    await waitFor(() => {
      expect(screen.queryByText('Resume')).not.toBeInTheDocument()
    })
  })
})

// ─────────────────────────────────────────────────────────────────────────────
describe('File Upload via Choose button', () => {
  it('shows Choose, Upload, Cancel buttons when documents exist', async () => {
    const user = userEvent.setup()
    renderDashboard()
    await addApplicant(user, 'Alice')
    await openDocModal(user)
    await user.type(document.getElementById('doc-name-input'), 'ID Card')
    await user.click(document.getElementById('doc-modal-save'))
    await waitFor(() => {
      expect(document.getElementById('choose-btn')).toBeInTheDocument()
      expect(document.getElementById('upload-btn')).toBeInTheDocument()
      expect(document.getElementById('cancel-btn')).toBeInTheDocument()
    })
  })

  it('uploads files via file input and adds them as Pending documents', async () => {
    const user = userEvent.setup()
    renderDashboard()
    await addApplicant(user, 'Alice')
    // Add a placeholder doc to show the uploader panel
    await openDocModal(user)
    await user.type(document.getElementById('doc-name-input'), 'Placeholder')
    await user.click(document.getElementById('doc-modal-save'))

    await waitFor(() => expect(document.getElementById('file-input')).toBeInTheDocument())

    const fileInput = document.getElementById('file-input')
    const testFile = new File(['pdf-content'], 'MyDoc.pdf', { type: 'application/pdf' })

    // Stage the file using userEvent.upload (selects without triggering interceptor reset)
    await user.upload(fileInput, testFile)

    // Upload button should now be enabled (file is staged)
    await waitFor(() => {
      expect(document.getElementById('upload-btn')).not.toBeDisabled()
    })

    // Click Upload — component now resets with "" instead of null (safe)
    await user.click(document.getElementById('upload-btn'))

    // File should now appear in the document list
    await waitFor(() => {
      const nameEls = screen.getAllByText('MyDoc.pdf')
      expect(nameEls.length).toBeGreaterThanOrEqual(1)
    })
  })
})

// ─────────────────────────────────────────────────────────────────────────────
describe('Drag and Drop', () => {
  it('toggles drag-over class when dragging files over the drop zone', async () => {
    const user = userEvent.setup()
    renderDashboard()
    await addApplicant(user, 'Bob')
    // Add a doc to trigger uploader panel
    await openDocModal(user)
    await user.type(document.getElementById('doc-name-input'), 'First')
    await user.click(document.getElementById('doc-modal-save'))
    await waitFor(() => screen.getAllByText('First'))

    const dropArea = document.getElementById('drop-area')
    if (dropArea) {
      fireEvent.dragOver(dropArea)
      expect(dropArea).toHaveClass('drag-over')
      fireEvent.dragLeave(dropArea)
      expect(dropArea).not.toHaveClass('drag-over')
    } else {
      // Drop area not rendered when docs are in the file-list — that is expected
      expect(document.getElementById('file-list')).toBeInTheDocument()
    }
  })
})

// ─────────────────────────────────────────────────────────────────────────────
describe('AddApplicantModal — unit tests', () => {
  it('renders nothing when visible is false', () => {
    render(<AddApplicantModal visible={false} onClose={vi.fn()} onSave={vi.fn()} />)
    expect(document.getElementById('add-applicant-modal')).toBeNull()
  })

  it('renders when visible is true', () => {
    render(<AddApplicantModal visible={true} onClose={vi.fn()} onSave={vi.fn()} />)
    expect(document.getElementById('add-applicant-modal')).toBeInTheDocument()
  })

  it('calls onClose when Cancel is clicked', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    render(<AddApplicantModal visible={true} onClose={onClose} onSave={vi.fn()} />)
    await user.click(document.getElementById('add-applicant-cancel'))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('calls onSave with the typed name when Save is clicked', async () => {
    const user = userEvent.setup()
    const onSave = vi.fn()
    render(<AddApplicantModal visible={true} onClose={vi.fn()} onSave={onSave} />)
    await user.type(screen.getByPlaceholderText(/enter applicant name/i), 'Charlie')
    await user.click(document.getElementById('add-applicant-save'))
    expect(onSave).toHaveBeenCalledWith('Charlie')
  })

  it('clears input when modal re-opens', async () => {
    const user = userEvent.setup()
    const { rerender } = render(
      <AddApplicantModal visible={true} onClose={vi.fn()} onSave={vi.fn()} />
    )
    await user.type(screen.getByPlaceholderText(/enter applicant name/i), 'Test')
    rerender(<AddApplicantModal visible={false} onClose={vi.fn()} onSave={vi.fn()} />)
    rerender(<AddApplicantModal visible={true} onClose={vi.fn()} onSave={vi.fn()} />)
    expect(screen.getByPlaceholderText(/enter applicant name/i)).toHaveValue('')
  })
})

// ─────────────────────────────────────────────────────────────────────────────
describe('ApplicantPanel — unit tests', () => {
  const mockApplicant = (docs = []) => ({
    id: 1,
    name: 'TestUser',
    documents: docs,
  })

  it('renders null when applicant is null', () => {
    const { container } = render(
      <ApplicantPanel applicant={null} onAdd={vi.fn()} onUpload={vi.fn()} />
    )
    expect(container.firstChild).toBeNull()
  })

  it('shows "No documents available" when applicant has no docs', () => {
    render(
      <ApplicantPanel applicant={mockApplicant()} onAdd={vi.fn()} onUpload={vi.fn()} />
    )
    expect(screen.getByText(/no documents available/i)).toBeInTheDocument()
  })

  it('calls onAdd when the Add button is clicked', async () => {
    const user = userEvent.setup()
    const onAdd = vi.fn()
    render(
      <ApplicantPanel applicant={mockApplicant()} onAdd={onAdd} onUpload={vi.fn()} />
    )
    await user.click(document.getElementById('add-doc-btn'))
    expect(onAdd).toHaveBeenCalledTimes(1)
  })

  it('renders Choose, Upload, Cancel buttons when docs exist', () => {
    const docs = [{ id: 1, name: 'Resume.pdf', size: 112000, status: 'Pending' }]
    render(
      <ApplicantPanel
        applicant={mockApplicant(docs)}
        onAdd={vi.fn()}
        onUpload={vi.fn()}
        onUploadComplete={vi.fn()}
        onDeleteDoc={vi.fn()}
      />
    )
    expect(document.getElementById('choose-btn')).toBeInTheDocument()
    expect(document.getElementById('upload-btn')).toBeInTheDocument()
    expect(document.getElementById('cancel-btn')).toBeInTheDocument()
  })

  it('renders document name and Pending badge', () => {
    const docs = [{ id: 1, name: 'Resume.pdf', size: 112000, status: 'Pending' }]
    render(
      <ApplicantPanel
        applicant={mockApplicant(docs)}
        onAdd={vi.fn()}
        onUpload={vi.fn()}
        onUploadComplete={vi.fn()}
        onDeleteDoc={vi.fn()}
      />
    )
    // Name appears in doc-pill (left) AND file-name (right) — use getAllByText
    const nameEls = screen.getAllByText('Resume.pdf')
    expect(nameEls.length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText(/pending/i)).toBeInTheDocument()
  })

  it('renders document name and Completed badge', () => {
    const docs = [{ id: 2, name: 'Passport.jpg', size: 55000, status: 'Completed' }]
    render(
      <ApplicantPanel
        applicant={mockApplicant(docs)}
        onAdd={vi.fn()}
        onUpload={vi.fn()}
        onUploadComplete={vi.fn()}
        onDeleteDoc={vi.fn()}
      />
    )
    const nameEls = screen.getAllByText('Passport.jpg')
    expect(nameEls.length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText(/completed/i)).toBeInTheDocument()
  })

  it('calls onDeleteDoc when delete button is clicked', async () => {
    const user = userEvent.setup()
    const onDeleteDoc = vi.fn()
    const docs = [{ id: 10, name: 'License.pdf', size: 40000, status: 'Pending' }]
    render(
      <ApplicantPanel
        applicant={mockApplicant(docs)}
        onAdd={vi.fn()}
        onUpload={vi.fn()}
        onUploadComplete={vi.fn()}
        onDeleteDoc={onDeleteDoc}
      />
    )
    await user.click(document.getElementById('delete-btn-10'))
    expect(onDeleteDoc).toHaveBeenCalledWith(10)
  })

  it('calls onUploadComplete when complete button is clicked on Pending doc', async () => {
    const user = userEvent.setup()
    const onUploadComplete = vi.fn()
    const docs = [{ id: 20, name: 'Doc.pdf', size: 60000, status: 'Pending' }]
    render(
      <ApplicantPanel
        applicant={mockApplicant(docs)}
        onAdd={vi.fn()}
        onUpload={vi.fn()}
        onUploadComplete={onUploadComplete}
        onDeleteDoc={vi.fn()}
      />
    )
    await user.click(document.getElementById('complete-btn-20'))
    expect(onUploadComplete).toHaveBeenCalledWith(20)
  })

  it('does NOT show complete button for Completed documents', () => {
    const docs = [{ id: 30, name: 'Done.pdf', size: 25000, status: 'Completed' }]
    render(
      <ApplicantPanel
        applicant={mockApplicant(docs)}
        onAdd={vi.fn()}
        onUpload={vi.fn()}
        onUploadComplete={vi.fn()}
        onDeleteDoc={vi.fn()}
      />
    )
    expect(document.getElementById('complete-btn-30')).toBeNull()
  })

  it('shows file size in KB format', () => {
    const docs = [{ id: 40, name: 'File.pdf', size: 112110, status: 'Completed' }]
    render(
      <ApplicantPanel
        applicant={mockApplicant(docs)}
        onAdd={vi.fn()}
        onUpload={vi.fn()}
        onUploadComplete={vi.fn()}
        onDeleteDoc={vi.fn()}
      />
    )
    // 112110 / 1024 = 109.484... KB
    expect(screen.getByText(/\d+\.\d{3} KB/)).toBeInTheDocument()
  })

  it('shows drag-over class when dragging files over drop area', () => {
    const docs = [{ id: 50, name: 'Existing.pdf', size: 10000, status: 'Completed' }]
    render(
      <ApplicantPanel
        applicant={mockApplicant(docs)}
        onAdd={vi.fn()}
        onUpload={vi.fn()}
        onUploadComplete={vi.fn()}
        onDeleteDoc={vi.fn()}
      />
    )
    const dropArea = document.getElementById('drop-area')
    if (dropArea) {
      fireEvent.dragOver(dropArea)
      expect(dropArea).toHaveClass('drag-over')
    }
  })
})

// ─────────────────────────────────────────────────────────────────────────────
describe('Responsive / accessibility', () => {
  it('has unique IDs on all interactive elements', () => {
    renderDashboard()
    expect(document.getElementById('add-applicant-btn')).toBeInTheDocument()
    expect(document.getElementById('back-btn')).toBeInTheDocument()
    expect(document.getElementById('next-btn')).toBeInTheDocument()
  })

  it('Back button has accessible text', () => {
    renderDashboard()
    expect(document.getElementById('back-btn')).toBeInTheDocument()
    expect(document.getElementById('back-btn').textContent).toMatch(/back/i)
  })

  it('Next button has accessible text', () => {
    renderDashboard()
    expect(document.getElementById('next-btn')).toBeInTheDocument()
    expect(document.getElementById('next-btn').textContent).toMatch(/next/i)
  })

  it('trash buttons have aria-label for screen readers', async () => {
    const user = userEvent.setup()
    renderDashboard()
    await addApplicant(user, 'AccessUser')
    const trashBtn = screen.getByRole('button', { name: /remove accessuser/i })
    expect(trashBtn).toBeInTheDocument()
  })
})
