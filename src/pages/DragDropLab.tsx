import { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../api';

interface Column { id: number; name: string; }
interface Card   { id: number; title: string; columnId: number; createdAt?: string; }

export function DragDropLab() {
  const { addToast } = useApp();
  const [columns, setColumns]       = useState<Column[]>([]);
  const [cards,   setCards]         = useState<Card[]>([]);
  const [loading, setLoading]       = useState(true);
  const [newColName, setNewColName] = useState('');
  const [newCardTitle, setNewCardTitle] = useState<Record<number, string>>({});
  const [addingCard, setAddingCard] = useState<number | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const [cols, cds] = await Promise.all([
        api.get<Column[]>('/api/kanban/columns'),
        api.get<Card[]>('/api/kanban/cards'),
      ]);
      setColumns(cols);
      setCards(cds);
    } catch { addToast('error', 'Failed to load board'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const addColumn = async () => {
    const name = newColName.trim();
    if (!name) { addToast('error', 'Column name cannot be empty'); return; }
    try {
      await api.post('/api/kanban/columns', { name });
      setNewColName('');
      await load();
      addToast('success', `Column "${name}" added`);
    } catch { addToast('error', 'Failed to add column'); }
  };

  const deleteColumn = async (id: number, name: string) => {
    try {
      await api.delete(`/api/kanban/columns/${id}`);
      await load();
      addToast('info', `Column "${name}" removed`);
    } catch { addToast('error', 'Failed to remove column'); }
  };

  const addCard = async (columnId: number) => {
    const title = (newCardTitle[columnId] || '').trim();
    if (!title) { addToast('error', 'Card title cannot be empty'); return; }
    try {
      await api.post('/api/kanban/cards', { title, columnId });
      setNewCardTitle(prev => ({ ...prev, [columnId]: '' }));
      setAddingCard(null);
      await load();
      addToast('success', 'Card added');
    } catch { addToast('error', 'Failed to add card'); }
  };

  const moveCard = async (cardId: number, toColumnId: number, fromColumnId: number) => {
    if (toColumnId === fromColumnId) return;
    try {
      await api.patch(`/api/kanban/cards/${cardId}`, { columnId: toColumnId });
      await load();
      const dest = columns.find(c => c.id === toColumnId);
      addToast('info', `Card moved to "${dest?.name ?? toColumnId}"`);
    } catch { addToast('error', 'Failed to move card'); }
  };

  const deleteCard = async (cardId: number) => {
    try {
      await api.delete(`/api/kanban/cards/${cardId}`);
      await load();
    } catch { addToast('error', 'Failed to remove card'); }
  };

  if (loading) {
    return (
      <div data-testid="page-drag-drop">
        <div className="page-header"><h1>Drag and Drop Lab</h1></div>
        <p className="text-muted text-sm">Loading board...</p>
      </div>
    );
  }

  return (
    <div data-testid="page-drag-drop">
      <div className="page-header">
        <h1>Drag and Drop Lab</h1>
        <p>Kanban board persisted via API. Add columns, add cards, and move cards between columns.</p>
      </div>

      <div className="card mb-16">
        <div className="card-header"><span className="card-title">Add Column</span></div>
        <div className="card-body">
          <div className="btn-row">
            <input
              className="field"
              style={{ maxWidth: 280 }}
              placeholder="Column name (e.g. To Do, In Progress)"
              value={newColName}
              onChange={e => setNewColName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addColumn()}
              data-testid="new-column-input"
              aria-label="New column name"
            />
            <button className="btn btn-primary btn-sm" onClick={addColumn} data-testid="add-column-btn">
              Add Column
            </button>
          </div>
        </div>
      </div>

      {columns.length === 0 && (
        <div className="alert alert-info" data-testid="board-empty">
          No columns yet. Add your first column above to start building the board.
        </div>
      )}

      <div className="kanban-board" data-testid="kanban-board">
        {columns.map(col => {
          const colCards = cards.filter(c => c.columnId === col.id);
          const otherCols = columns.filter(c => c.id !== col.id);

          return (
            <div key={col.id} className="kanban-col" data-testid={`kanban-col-${col.id}`}>
              <div className="kanban-col-header">
                <span>{col.name}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span className="badge badge-num" style={{ fontSize: 11 }} data-testid={`col-count-${col.id}`}>
                    {colCards.length}
                  </span>
                  <button
                    className="btn btn-ghost btn-xs"
                    onClick={() => deleteColumn(col.id, col.name)}
                    data-testid={`delete-col-${col.id}`}
                    style={{ color: 'var(--error)' }}
                  >
                    Remove
                  </button>
                </span>
              </div>

              <div className="kanban-cards" data-testid={`kanban-cards-${col.id}`}>
                {colCards.length === 0 && (
                  <p className="text-muted text-sm" style={{ textAlign: 'center', padding: '16px 0' }} data-testid={`col-empty-${col.id}`}>
                    No cards
                  </p>
                )}

                {colCards.map(card => (
                  <div key={card.id} className="kanban-card" data-testid={`card-${card.id}`}>
                    <div className="kanban-card-title">{card.title}</div>

                    {otherCols.length > 0 && (
                      <div className="form-row" style={{ marginTop: 8, marginBottom: 0 }}>
                        <label className="field-label" htmlFor={`move-${card.id}`} style={{ fontSize: 11, marginBottom: 3 }}>
                          Move to column
                        </label>
                        <select
                          id={`move-${card.id}`}
                          className="field"
                          style={{ fontSize: 12 }}
                          value=""
                          onChange={e => {
                            const val = Number(e.target.value);
                            if (val) moveCard(card.id, val, col.id);
                          }}
                          data-testid={`move-card-${card.id}`}
                          aria-label={`Move card to column`}
                        >
                          <option value="" disabled>Select column...</option>
                          {otherCols.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                          ))}
                        </select>
                      </div>
                    )}

                    <button
                      className="btn btn-ghost btn-xs"
                      onClick={() => deleteCard(card.id)}
                      data-testid={`delete-card-${card.id}`}
                      style={{ color: 'var(--error)', marginTop: 6, width: '100%' }}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: 10, borderTop: '1px solid var(--border)', paddingTop: 10 }}>
                {addingCard === col.id ? (
                  <>
                    <input
                      className="field"
                      placeholder="Card title"
                      value={newCardTitle[col.id] || ''}
                      onChange={e => setNewCardTitle(prev => ({ ...prev, [col.id]: e.target.value }))}
                      onKeyDown={e => {
                        if (e.key === 'Enter') addCard(col.id);
                        if (e.key === 'Escape') setAddingCard(null);
                      }}
                      autoFocus
                      data-testid={`new-card-input-${col.id}`}
                      aria-label="New card title"
                    />
                    <div className="btn-row" style={{ marginTop: 6 }}>
                      <button className="btn btn-primary btn-xs" style={{ flex: 1 }} onClick={() => addCard(col.id)} data-testid={`add-card-btn-${col.id}`}>
                        Add Card
                      </button>
                      <button className="btn btn-ghost btn-xs" onClick={() => { setAddingCard(null); setNewCardTitle(prev => ({ ...prev, [col.id]: '' })); }} data-testid={`cancel-card-btn-${col.id}`}>
                        Cancel
                      </button>
                    </div>
                  </>
                ) : (
                  <button className="btn btn-secondary btn-xs" style={{ width: '100%' }} onClick={() => setAddingCard(col.id)} data-testid={`show-add-card-${col.id}`}>
                    + Add Card
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
