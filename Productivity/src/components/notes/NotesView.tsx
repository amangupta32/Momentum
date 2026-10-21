import React, { useState } from 'react';
import {
  FileText,
  Plus,
  Search,
  Pin,
  Trash2,
  FolderOpen,
  Calendar,
  Save,
  Check,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Note } from '../../types';

export const NotesView: React.FC = () => {
  const {
    notes,
    goals,
    activeWorkspace,
    currentUser,
    createNote,
    updateNote,
    deleteNote,
    selectedNoteId,
    setSelectedNoteId,
    setSelectedGoalId,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeNoteId, setActiveNoteId] = useState<string | null>(() => {
    if (selectedNoteId) return selectedNoteId;
    const wsNotes = notes.filter((n) => n.workspaceId === activeWorkspace.id);
    return wsNotes[0]?.id || null;
  });

  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editTags, setEditTags] = useState('');
  const [isSavedFeedback, setIsSavedFeedback] = useState(false);

  const workspaceNotes = notes.filter((n) => n.workspaceId === activeWorkspace.id);

  const filteredNotes = workspaceNotes.filter((n) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      n.title.toLowerCase().includes(q) ||
      n.content.toLowerCase().includes(q) ||
      n.tags.some((t) => t.toLowerCase().includes(q))
    );
  });

  // Current active note
  const currentNote = workspaceNotes.find((n) => n.id === activeNoteId) || filteredNotes[0];

  // Sync editor when active note changes
  React.useEffect(() => {
    if (currentNote) {
      setEditTitle(currentNote.title);
      setEditContent(currentNote.content);
      setEditTags(currentNote.tags.join(', '));
    }
  }, [currentNote?.id]);

  const handleCreateNewNote = () => {
    const newDoc = createNote({
      title: 'Untitled Document',
      content: '# New Document\n\nWrite your thoughts, objectives, or meeting notes here...',
      workspaceId: activeWorkspace.id,
      authorId: currentUser.id,
      tags: ['Draft'],
    });
    setActiveNoteId(newDoc.id);
  };

  const handleSaveNote = () => {
    if (!currentNote) return;
    updateNote(currentNote.id, {
      title: editTitle.trim() || 'Untitled Document',
      content: editContent,
      tags: editTags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
    });
    setIsSavedFeedback(true);
    setTimeout(() => setIsSavedFeedback(false), 2000);
  };

  const togglePin = (note: Note) => {
    updateNote(note.id, { isPinned: !note.isPinned });
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this document?')) {
      deleteNote(id);
      if (activeNoteId === id) {
        setActiveNoteId(null);
      }
    }
  };

  const linkedGoal = currentNote?.linkedGoalId
    ? goals.find((g) => g.id === currentNote.linkedGoalId)
    : null;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E8E4DA]">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#737C76]">
            <FileText size={14} className="text-[#1E3A2F]" />
            <span>Knowledge Base</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#1C221F] font-display mt-0.5">
            Notes & Documents
          </h1>
          <p className="text-xs text-[#5C6560] mt-1">
            Product requirements, meeting syntheses, technical reflections, and habit systems.
          </p>
        </div>

        <button
          onClick={handleCreateNewNote}
          className="flex items-center gap-1.5 px-4 py-2 bg-[#1E3A2F] hover:bg-[#162A22] text-white text-xs font-semibold rounded-xl shadow-xs transition-all shrink-0"
        >
          <Plus size={15} />
          <span>New Document</span>
        </button>
      </div>

      {/* Main split view */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Left side list: 4 cols */}
        <div className="md:col-span-4 bg-white rounded-2xl border border-[#E8E4DA] p-4 shadow-2xs space-y-3">
          {/* Search bar */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-[#E8E4DA] bg-[#FAF8F5]">
            <Search size={14} className="text-[#8E9892]" />
            <input
              type="text"
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs bg-transparent outline-none text-[#1C221F]"
            />
          </div>

          {/* List of notes */}
          <div className="space-y-1.5 max-h-[65vh] overflow-y-auto">
            {filteredNotes.length === 0 ? (
              <div className="py-8 text-center text-xs text-[#8E9892]">
                No documents found.
              </div>
            ) : (
              filteredNotes.map((note) => {
                const isActive = currentNote?.id === note.id;
                return (
                  <div
                    key={note.id}
                    onClick={() => setActiveNoteId(note.id)}
                    className={`cursor-pointer p-3 rounded-xl border text-xs transition-all flex flex-col gap-1.5 ${
                      isActive
                        ? 'bg-[#FAF8F5] border-[#1E3A2F] shadow-xs'
                        : 'border-[#E8E4DA] hover:bg-[#FAF8F5] hover:border-[#1E3A2F]/40'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h4
                        className={`font-bold text-xs truncate flex-1 ${
                          isActive ? 'text-[#1E3A2F]' : 'text-[#1C221F]'
                        }`}
                      >
                        {note.title}
                      </h4>
                      {note.isPinned && (
                        <Pin size={12} className="text-amber-600 fill-amber-500 shrink-0" />
                      )}
                    </div>

                    <p className="text-[11px] text-[#5C6560] line-clamp-2 leading-relaxed">
                      {note.content.replace(/^#+\s+/gm, '')}
                    </p>

                    <div className="flex items-center justify-between text-[10px] text-[#8E9892] pt-1">
                      <div className="flex flex-wrap gap-1">
                        {note.tags.slice(0, 2).map((t, idx) => (
                          <span
                            key={idx}
                            className="bg-[#F2EFE9] px-1.5 py-0.2 rounded text-[#5C6560]"
                          >
                            #{t}
                          </span>
                        ))}
                      </div>
                      <span>{new Date(note.updatedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right side editor: 8 cols */}
        <div className="md:col-span-8 bg-white rounded-2xl border border-[#E8E4DA] p-6 shadow-2xs space-y-4 min-h-[500px]">
          {currentNote ? (
            <>
              {/* Document Actions Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#E8E4DA]">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => togglePin(currentNote)}
                    className={`p-1.5 rounded-lg border text-xs flex items-center gap-1 transition-colors ${
                      currentNote.isPinned
                        ? 'bg-amber-50 text-amber-800 border-amber-200'
                        : 'border-[#E8E4DA] text-[#5C6560] hover:bg-[#FAF8F5]'
                    }`}
                    title="Toggle pin to top"
                  >
                    <Pin size={13} className={currentNote.isPinned ? 'fill-amber-500' : ''} />
                    <span>{currentNote.isPinned ? 'Pinned' : 'Pin'}</span>
                  </button>

                  {linkedGoal && (
                    <button
                      onClick={() => setSelectedGoalId(linkedGoal.id)}
                      className="p-1.5 rounded-lg border border-[#E8E4DA] bg-[#FAF8F5] text-xs text-[#1E3A2F] font-semibold flex items-center gap-1 hover:bg-[#F2EFE9]"
                    >
                      <FolderOpen size={13} />
                      <span className="truncate max-w-[140px]">Goal: {linkedGoal.title}</span>
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDelete(currentNote.id)}
                    className="p-1.5 text-[#8E9892] hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                    title="Delete document"
                  >
                    <Trash2 size={16} />
                  </button>

                  <button
                    onClick={handleSaveNote}
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      isSavedFeedback
                        ? 'bg-emerald-600 text-white'
                        : 'bg-[#1E3A2F] hover:bg-[#162A22] text-white shadow-xs'
                    }`}
                  >
                    {isSavedFeedback ? <Check size={14} /> : <Save size={14} />}
                    <span>{isSavedFeedback ? 'Saved' : 'Save'}</span>
                  </button>
                </div>
              </div>

              {/* Title input */}
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="Document Title"
                className="w-full text-xl sm:text-2xl font-bold font-display text-[#1C221F] outline-none border-b border-transparent focus:border-[#E8E4DA] py-1"
              />

              {/* Tags editor */}
              <div className="flex items-center gap-2 text-xs">
                <span className="text-[11px] font-semibold text-[#8E9892] uppercase">Tags:</span>
                <input
                  type="text"
                  value={editTags}
                  onChange={(e) => setEditTags(e.target.value)}
                  placeholder="e.g. Strategy, UX, Habit (comma separated)"
                  className="flex-1 text-xs border-b border-[#E8E4DA] focus:border-[#1E3A2F] py-0.5 outline-none text-[#5C6560]"
                />
              </div>

              {/* Content editor */}
              <textarea
                rows={16}
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                placeholder="Write in Markdown or plain text..."
                className="w-full p-4 text-xs font-mono text-[#1C221F] leading-relaxed rounded-xl border border-[#E8E4DA] focus:border-[#1E3A2F] focus:ring-1 focus:ring-[#1E3A2F] outline-none bg-[#FAF8F5]/50"
              />

              {/* Helper footnote */}
              <div className="flex items-center justify-between text-[11px] text-[#8E9892] pt-2">
                <span>Supports Markdown formatting (# headings, - bullet lists, etc.)</span>
                <span>Auto-persisted in local storage</span>
              </div>
            </>
          ) : (
            <div className="py-20 text-center text-xs text-[#8E9892]">
              Select a document from the left or create a new one.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
