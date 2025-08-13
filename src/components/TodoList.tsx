import React, { useMemo, useState } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { CalendarIcon, Edit3, Trash2 } from 'lucide-react';

const emptyForm = { title: '', description: '', due_at: '' as string | null };

const TodoList: React.FC = () => {
  const { todos, addTodo, updateTodo, deleteTodo, toggleTodoCompleted } = useAppContext();

  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);

  // order: incomplete first -> nearest due date -> newest created
  const sorted = useMemo(() => {
    return [...todos].sort((a, b) => {
      if (a.completed !== b.completed) return a.completed ? 1 : -1;
      const ad = a.due_at ? new Date(a.due_at).getTime() : Infinity;
      const bd = b.due_at ? new Date(b.due_at).getTime() : Infinity;
      if (ad !== bd) return ad - bd;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }, [todos]);

  const startAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
  };

  const startEdit = (id: string) => {
    const t = todos.find(x => x.id === id);
    if (!t) return;
    setEditingId(id);
    setForm({
      title: t.title ?? '',
      description: t.description ?? '',
      due_at: t.due_at ?? '' as string | null,
    });
  };

  const handleSave = async () => {
    if (!form.title.trim()) return;
    if (editingId) {
      await updateTodo(editingId, {
        title: form.title,
        description: form.description || undefined,
        due_at: form.due_at || null,
      });
    } else {
      await addTodo({
        title: form.title,
        description: form.description || undefined,
        due_at: form.due_at || null,
      });
    }
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleDelete = async (id: string) => {
    await deleteTodo(id);
    if (editingId === id) {
      setEditingId(null);
      setForm(emptyForm);
    }
  };

  return (
    <div className="p-4 space-y-4">
      {/* Form */}
      <div className="flex flex-col gap-2 bg-gray-50 p-4 rounded-md">
        <div className="grid sm:grid-cols-2 gap-2">
          <Input
            placeholder="Title *"
            value={form.title}
            onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))}
          />
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-4 h-4" />
            <Input
              type="datetime-local"
              value={form.due_at ?? ''}
              onChange={(e) =>
                setForm(f => ({
                  ...f,
                  due_at: e.target.value ? new Date(e.target.value).toISOString() : ''
                }))
              }
              placeholder="Due / required by"
            />
          </div>
        </div>
        <Textarea
          placeholder="Description (optional)"
          value={form.description}
          onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
        />
        <div className="flex gap-2">
          <Button onClick={handleSave} className="bg-blue-600 text-white">
            {editingId ? 'Update To‑Do' : 'Add To‑Do'}
          </Button>
          {editingId && (
            <Button variant="secondary" onClick={startAdd}>
              Cancel
            </Button>
          )}
        </div>
      </div>

      {/* List */}
      <div className="space-y-2">
        {sorted.length === 0 ? (
          <p className="text-sm text-gray-500">No to‑dos yet.</p>
        ) : (
          sorted.map((todo) => (
            <div
              key={todo.id}
              className="flex items-center justify-between bg-white shadow-sm rounded-md p-3"
            >
              <div className="flex items-start gap-3">
                <Checkbox
                  checked={!!todo.completed}
                  onCheckedChange={(checked) => toggleTodoCompleted(todo.id, !!checked)}
                />
                <div>
                  <p className={`font-semibold ${todo.completed ? 'line-through text-gray-500' : ''}`}>
                    {todo.title}
                  </p>
                  {todo.description && (
                    <p className={`text-sm ${todo.completed ? 'line-through text-gray-400' : 'text-gray-600'}`}>
                      {todo.description}
                    </p>
                  )}
                  <p className="text-xs text-gray-500">
                    {todo.due_at ? `Due: ${new Date(todo.due_at).toLocaleString()}` : 'No due date'}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="icon" variant="ghost" onClick={() => startEdit(todo.id)}>
                  <Edit3 className="w-4 h-4" />
                </Button>
                <Button size="icon" variant="ghost" onClick={() => handleDelete(todo.id)}>
                  <Trash2 className="w-4 h-4 text-red-500" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TodoList;
