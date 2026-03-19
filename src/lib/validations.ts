import { z } from "zod"

export const NoteSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, "Title is required").max(200, "Title is too long"),
  content: z.string().min(1, "Content is required"),
  tags: z.array(z.string()).optional(),
  folder_id: z.string().uuid().optional().nullable(),
  is_pinned: z.boolean().optional(),
  is_archived: z.boolean().optional(),
})

export const FolderSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Folder name is required").max(50, "Folder name is too long"),
  icon: z.string().optional(),
})

export type NoteInput = z.infer<typeof NoteSchema>
export type FolderInput = z.infer<typeof FolderSchema>
