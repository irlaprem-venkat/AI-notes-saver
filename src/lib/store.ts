import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Folder = {
  id: string
  name: string
  icon?: string
}

export type Note = {
  id: string
  title: string
  content: string
  tags: string[]
  folder_id?: string
  last_modified: string
  is_pinned?: boolean
  is_archived?: boolean
}

interface NoteState {
  notes: Note[]
  folders: Folder[]
  currentNote: Note | null
  selectedNoteIds: string[]
  searchQuery: string
  activeFolderId: string | null
  activeTag: string | null
  
  // Note Actions
  setCurrentNote: (note: Note | null) => void
  addNote: (note: Note) => void
  updateNote: (id: string, updates: Partial<Note>) => void
  deleteNote: (id: string) => void
  setNotes: (notes: Note[]) => void
  
  // Selection Actions
  toggleNoteSelection: (id: string) => void
  clearSelection: () => void
  
  // Filter Actions
  setSearchQuery: (query: string) => void
  setActiveFolder: (id: string | null) => void
  setActiveTag: (tag: string | null) => void
  
  // Folder Actions
  addFolder: (folder: Folder) => void
}

export const useNoteStore = create<NoteState>()(
  persist(
    (set) => ({
      notes: [],
      folders: [],
      currentNote: null,
      selectedNoteIds: [],
      searchQuery: '',
      activeFolderId: null,
      activeTag: null,

      setCurrentNote: (note) => set({ currentNote: note }),
      addNote: (note) => set((state) => {
        const exists = state.notes.some((n) => n.id === note.id)
        if (exists) {
          // Upsert: update existing note in place to avoid duplicate keys
          return { notes: state.notes.map((n) => n.id === note.id ? { ...n, ...note } : n) }
        }
        return { notes: [note, ...state.notes] }
      }),
      updateNote: (id, updates) => set((state) => ({
        notes: state.notes.map((n) => (n.id === id ? { ...n, ...updates } : n)),
        currentNote: state.currentNote?.id === id ? { ...state.currentNote, ...updates } : state.currentNote
      })),
      deleteNote: (id) => set((state) => ({
        notes: state.notes.filter((n) => n.id !== id),
        currentNote: state.currentNote?.id === id ? null : state.currentNote,
        selectedNoteIds: state.selectedNoteIds.filter(sid => sid !== id)
      })),
      setNotes: (notes) => set({ notes }),

      toggleNoteSelection: (id) => set((state) => ({
        selectedNoteIds: state.selectedNoteIds.includes(id) 
          ? state.selectedNoteIds.filter(sid => sid !== id)
          : [...state.selectedNoteIds, id]
      })),
      clearSelection: () => set({ selectedNoteIds: [] }),

      setSearchQuery: (searchQuery) => set({ searchQuery }),
      setActiveFolder: (activeFolderId) => set({ activeFolderId, activeTag: null }),
      setActiveTag: (activeTag) => set({ activeTag, activeFolderId: null }),

      addFolder: (folder) => set((state) => ({ folders: [...state.folders, folder] })),
    }),
    {
      name: 'lumina-notes-storage-v2',
    }
  )
)
