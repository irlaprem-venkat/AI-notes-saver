import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useNoteStore } from '@/lib/store'
import { getNotes } from '@/app/actions/notes'

export function useRealtimeNotes() {
  const { updateNote, addNote, deleteNote, setNotes } = useNoteStore()

  useEffect(() => {
    // Initial fetch
    const fetchNotes = async () => {
      try {
        const data = await getNotes()
        setNotes(data.map((n: any) => ({
          ...n,
          last_modified: new Date(n.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          tags: n.tags?.map((t: any) => t.name) || []
        })))
      } catch (error) {
        console.error('Failed to fetch initial notes:', error)
      }
    }

    fetchNotes()

    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notes',
        },
        (payload) => {
          console.log('Realtime change received:', payload)
          
          if (payload.eventType === 'INSERT') {
            addNote(payload.new as any)
          } else if (payload.eventType === 'UPDATE') {
            updateNote(payload.new.id, payload.new as any)
          } else if (payload.eventType === 'DELETE') {
            deleteNote(payload.old.id)
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [addNote, updateNote, deleteNote])
}
