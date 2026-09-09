import { useEffect, useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../api';
import type { TableRow } from '../types';
import { IconChevronRight } from '../components/icons';

export function DataTable() {
  const { addToast } = useApp();
  const [rows, setRows]         = useState<TableRow[]>([]);
  const [loading, setLoading]   = useState(true);
  const [searchQ, setSearchQ]   = useState('');
  const [statusF, setStatusF]   = useState('all');
  const [sortCol, setSortCol]   = useState<keyof TableRow>('id');
  const [sortDir, setSortDir]   = useState<'asc' | 'desc'>('asc');
  const [page, setPage]         = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [expanded, setExpanded] = useState<number | null>(null);
  const [addOpen, setAddOpen]   = useState(false);
  const [editRow, setEditRow]   = useState<TableRow | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [newRow, setNewRow]     = useState({ name: '', email: '', status: 'active', role: '', department: '' });

  const load = async () => {
    setLoading(true);
    try {
      const data = await api.get<TableRow[]>('/api/users');
      setRows(data);
    } catch { addToast('error', 'Failed to load table data'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    let r = rows;
    if (searchQ) {
      const q = searchQ.toLowerCase();
      r = r.filter(x =>
        x.name.toLowerCase().includes(q) ||
        x.email.toLowerCase().includes(q) ||
        (x.department ?? '').toLowerCase().includes(q)
      );
    }
    if (statusF !== 'all') r = r.filter(x => x.status === statusF);
    return r;
  }, [rows, searchQ, statusF]);

  const sorted = useMemo(() => [...filtered].sort((a, b) => {
    const av = String(a[sortCol] ?? '');
    const bv = String(b[sortCol] ?? '');
    const m  = sortDir === 'asc' ? 1 : -1;
    return av < bv ? -m : av > bv ? m : 0;
  }), [filtered, sortCol, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const paginated  = sorted.slice((page - 1) * pageSize, page * pageSize);

  const toggleSort = (col: keyof TableRow) => {
    if (col === sortCol) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortCol(col); setSortDir('asc'); }
  };
  const sortInd = (col: keyof TableRow) =>
    col === sortCol ? (sortDir === 'asc' ? ' ↑' : ' ↓') : '';

  const handleSelectAll = () => {
    if (selected.size === paginated.length && paginated.length > 0) {
      setSelected(new Set());
    } else {
      setSelected(new Set(paginated.map(r => r.id)));
    }
  };

  const toggleSelect = (id: number) => {
    const s = new Set(selected);
    s.has(id) ? s.delete(id) : s.add(id);
    setSelected(s);
  };

  const handleAdd = async () => {
    if (!newRow.name.trim() || !newRow.email.trim()) {
      addToast('error', 'Name and email are required');
      return;
    }
    try {
      await api.post('/api/users', newRow);
      await api.post('/api/activities', { action: `User added: ${newRow.name}`, status: 'success' });
      addToast('success', 'User added');
      setAddOpen(false);
      setNewRow({ name: '', email: '', status: 'active', role: '', department: '' });
      load();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to add user';
      addToast('error', msg);
    }
  };

  const handleEdit = async () => {
    if (!editRow) return;
    try {
      await api.patch(`/api/users/${editRow.id}`, {
        name: editRow.name,
        email: editRow.email,
        status: editRow.status,
        role: editRow.role,
        department: editRow.department,
      });
      addToast('success', 'User updated');
      setEditRow(null);
      load();
    } catch { addToast('error', 'Failed to update user'); }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/api/users/${id}`);
      await api.post('/api/activities', { action: `User deleted (id ${id})`, status: 'info' });
      addToast('info', 'User deleted');
      setDeleteId(null);
      load();
    } catch { addToast('error', 'Failed to delete user'); }
  };

  return (
    <div data-testid="page-table">
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <h1>Data Table</h1>
            <p>Persisted user records — search, filter, sort, paginate, edit, delete</p>
          </div>
          <button className="btn btn-primary btn-sm" onClick={() => setAddOpen(true)} data-testid="add-user-btn">
            Add User
          </button>
        </div>
      </div>

      {rows.length === 0 && !loading && (
        <div className="alert alert-info mb-16" data-testid="table-empty-hint">
          No records yet. Click "Add User" to create records for testing.
        </div>
      )}

      <div className="tbl-controls">
        <input
          className="field tbl-search"
          type="search"
          placeholder="Search name, email, department…"
          value={searchQ}
          onChange={e => { setSearchQ(e.target.value); setPage(1); }}
          data-testid="table-search"
          aria-label="Search table"
        />
        <select
          className="field tbl-filter"
          value={statusF}
          onChange={e => { setStatusF(e.target.value); setPage(1); }}
          data-testid="table-filter-status"
          aria-label="Filter by status"
        >
          <option value="all">All statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="pending">Pending</option>
        </select>
        <select
          className="field"
          style={{ width: 130 }}
          value={pageSize}
          onChange={e => { setPageSize(Number(e.target.value)); setPage(1); }}
          data-testid="table-pagesize"
          aria-label="Rows per page"
        >
          {[10, 25, 50].map(n => <option key={n} value={n}>{n} per page</option>)}
        </select>
      </div>

      {selected.size > 0 && (
        <div className="tbl-selection-bar" data-testid="selection-info">
          <span>{selected.size} row(s) selected</span>
          <button className="btn btn-ghost btn-xs" onClick={() => setSelected(new Set())} data-testid="clear-selection">
            Clear selection
          </button>
        </div>
      )}

      <div className="tbl-wrap">
        <table className="tbl" data-testid="data-table">
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  checked={selected.size === paginated.length && paginated.length > 0}
                  onChange={handleSelectAll}
                  data-testid="select-all"
                  aria-label="Select all rows"
                />
              </th>
              <th style={{ width: 28 }} />
              <th className="sortable" onClick={() => toggleSort('id')} data-testid="sort-id">ID{sortInd('id')}</th>
              <th className="sortable" onClick={() => toggleSort('name')} data-testid="sort-name">Name{sortInd('name')}</th>
              <th className="sortable" onClick={() => toggleSort('email')} data-testid="sort-email">Email{sortInd('email')}</th>
              <th className="sortable" onClick={() => toggleSort('status')} data-testid="sort-status">Status{sortInd('status')}</th>
              <th className="sortable" onClick={() => toggleSort('role')} data-testid="sort-role">Role{sortInd('role')}</th>
              <th className="sortable" onClick={() => toggleSort('department')} data-testid="sort-department">Department{sortInd('department')}</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={9} className="tbl-empty">Loading…</td></tr>}
            {!loading && paginated.length === 0 && (
              <tr>
                <td colSpan={9} className="tbl-empty" data-testid="table-empty">
                  No records match the current filter
                </td>
              </tr>
            )}
            {!loading && paginated.flatMap(row => {
              const dataRow = (
                <tr key={`row-${row.id}`} className={selected.has(row.id) ? 'row-selected' : ''}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selected.has(row.id)}
                      onChange={() => toggleSelect(row.id)}
                      data-testid={`select-${row.id}`}
                      aria-label={`Select row ${row.id}`}
                    />
                  </td>
                  <td>
                    <button
                      className={`tbl-expand-btn${expanded === row.id ? ' open' : ''}`}
                      onClick={() => setExpanded(expanded === row.id ? null : row.id)}
                      data-testid={`expand-${row.id}`}
                      aria-label={expanded === row.id ? 'Collapse row' : 'Expand row'}
                    >
                      <IconChevronRight />
                    </button>
                  </td>
                  <td>{row.id}</td>
                  <td style={{ fontWeight: 500, color: 'var(--text-strong)' }}>{row.name}</td>
                  <td>{row.email}</td>
                  <td><span className={`badge badge-${row.status}`}>{row.status}</span></td>
                  <td>{row.role}</td>
                  <td>{row.department}</td>
                  <td>
                    <button
                      className="tbl-action-btn"
                      data-testid={`edit-${row.id}`}
                      onClick={() => setEditRow({ ...row })}
                      aria-label={`Edit ${row.name}`}
                    >
                      Edit
                    </button>
                    <button
                      className="tbl-action-btn danger"
                      data-testid={`delete-${row.id}`}
                      onClick={() => setDeleteId(row.id)}
                      aria-label={`Delete ${row.name}`}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              );

              if (expanded !== row.id) return [dataRow];

              return [
                dataRow,
                <tr key={`exp-${row.id}`} className="expanded-row">
                  <td colSpan={9} style={{ padding: '12px 40px' }}>
                    <div className="expanded-detail" data-testid={`expanded-${row.id}`}>
                      <strong>{row.name}</strong> &nbsp;—&nbsp;
                      ID: {row.id} &nbsp;·&nbsp;
                      Email: {row.email} &nbsp;·&nbsp;
                      Role: {row.role || '—'} &nbsp;·&nbsp;
                      Dept: {row.department || '—'} &nbsp;·&nbsp;
                      Created: {row.createdAt ? new Date(row.createdAt).toLocaleDateString() : 'N/A'}
                    </div>
                  </td>
                </tr>,
              ];
            })}
          </tbody>
        </table>
      </div>

      <div className="tbl-pagination">
        <span className="tbl-pagination-info">
          {sorted.length === 0
            ? 'No results'
            : `${(page - 1) * pageSize + 1}–${Math.min(page * pageSize, sorted.length)} of ${sorted.length}`
          }
        </span>
        <div className="tbl-pagination-controls">
          <button className="tbl-page-btn" disabled={page === 1} onClick={() => setPage(1)} data-testid="page-first">First</button>
          <button className="tbl-page-btn" disabled={page === 1} onClick={() => setPage(p => p - 1)} data-testid="page-prev">Prev</button>
          <span style={{ padding: '0 8px', fontSize: 13 }} data-testid="page-indicator">Page {page} of {totalPages}</span>
          <button className="tbl-page-btn" disabled={page === totalPages} onClick={() => setPage(p => p + 1)} data-testid="page-next">Next</button>
          <button className="tbl-page-btn" disabled={page === totalPages} onClick={() => setPage(totalPages)} data-testid="page-last">Last</button>
        </div>
      </div>

      {/* ── Add user modal ── */}
      {addOpen && (
        <div className="overlay" onClick={() => setAddOpen(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} data-testid="add-user-modal">
            <div className="modal-header">
              <span className="modal-title">Add User</span>
              <button className="modal-close" onClick={() => setAddOpen(false)} aria-label="Close">×</button>
            </div>
            <div className="modal-body">
              <div className="form-row">
                <label className="field-label" htmlFor="nu-name">Name <span className="required-mark">*</span></label>
                <input id="nu-name" className="field" value={newRow.name}
                  onChange={e => setNewRow({ ...newRow, name: e.target.value })}
                  onKeyDown={e => e.key === 'Enter' && handleAdd()}
                  data-testid="new-user-name" />
              </div>
              <div className="form-row">
                <label className="field-label" htmlFor="nu-email">Email <span className="required-mark">*</span></label>
                <input id="nu-email" className="field" type="email" value={newRow.email}
                  onChange={e => setNewRow({ ...newRow, email: e.target.value })}
                  onKeyDown={e => e.key === 'Enter' && handleAdd()}
                  data-testid="new-user-email" />
              </div>
              <div className="form-cols-2">
                <div className="form-row">
                  <label className="field-label" htmlFor="nu-role">Role</label>
                  <input id="nu-role" className="field" placeholder="e.g. Developer" value={newRow.role}
                    onChange={e => setNewRow({ ...newRow, role: e.target.value })}
                    data-testid="new-user-role" />
                </div>
                <div className="form-row">
                  <label className="field-label" htmlFor="nu-dept">Department</label>
                  <input id="nu-dept" className="field" placeholder="e.g. Engineering" value={newRow.department}
                    onChange={e => setNewRow({ ...newRow, department: e.target.value })}
                    data-testid="new-user-dept" />
                </div>
              </div>
              <div className="form-row">
                <label className="field-label" htmlFor="nu-status">Status</label>
                <select id="nu-status" className="field" value={newRow.status}
                  onChange={e => setNewRow({ ...newRow, status: e.target.value })}
                  data-testid="new-user-status">
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setAddOpen(false)} data-testid="add-user-cancel">Cancel</button>
              <button className="btn btn-primary" onClick={handleAdd} data-testid="add-user-submit">Add User</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Edit user modal ── */}
      {editRow && (
        <div className="overlay" onClick={() => setEditRow(null)}>
          <div className="modal" onClick={e => e.stopPropagation()} data-testid="edit-user-modal">
            <div className="modal-header">
              <span className="modal-title">Edit User #{editRow.id}</span>
              <button className="modal-close" onClick={() => setEditRow(null)} aria-label="Close">×</button>
            </div>
            <div className="modal-body">
              <div className="form-row">
                <label className="field-label" htmlFor="eu-name">Name</label>
                <input id="eu-name" className="field" value={editRow.name}
                  onChange={e => setEditRow({ ...editRow, name: e.target.value })}
                  data-testid="edit-user-name" />
              </div>
              <div className="form-row">
                <label className="field-label" htmlFor="eu-email">Email</label>
                <input id="eu-email" className="field" type="email" value={editRow.email}
                  onChange={e => setEditRow({ ...editRow, email: e.target.value })}
                  data-testid="edit-user-email" />
              </div>
              <div className="form-cols-2">
                <div className="form-row">
                  <label className="field-label" htmlFor="eu-role">Role</label>
                  <input id="eu-role" className="field" value={editRow.role ?? ''}
                    onChange={e => setEditRow({ ...editRow, role: e.target.value })}
                    data-testid="edit-user-role" />
                </div>
                <div className="form-row">
                  <label className="field-label" htmlFor="eu-dept">Department</label>
                  <input id="eu-dept" className="field" value={editRow.department ?? ''}
                    onChange={e => setEditRow({ ...editRow, department: e.target.value })}
                    data-testid="edit-user-dept" />
                </div>
              </div>
              <div className="form-row">
                <label className="field-label" htmlFor="eu-status">Status</label>
                <select id="eu-status" className="field" value={editRow.status}
                  onChange={e => setEditRow({ ...editRow, status: e.target.value as TableRow['status'] })}
                  data-testid="edit-user-status">
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setEditRow(null)} data-testid="edit-user-cancel">Cancel</button>
              <button className="btn btn-primary" onClick={handleEdit} data-testid="edit-user-submit">Save Changes</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete confirm ── */}
      {deleteId !== null && (
        <div className="overlay" onClick={() => setDeleteId(null)}>
          <div className="modal" onClick={e => e.stopPropagation()} data-testid="confirm-delete-modal">
            <div className="modal-header"><span className="modal-title">Delete User</span></div>
            <div className="modal-body">
              <p style={{ fontSize: 13 }}>
                Are you sure you want to delete user #{deleteId}? This cannot be undone.
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setDeleteId(null)} data-testid="confirm-delete-cancel">Cancel</button>
              <button className="btn btn-danger" onClick={() => handleDelete(deleteId!)} data-testid="confirm-delete-ok">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
