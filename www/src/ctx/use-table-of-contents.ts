import { create } from "zustand"

interface Heading {
  level: number
  text: string
}

interface State {
  allHeadings: Heading[]
  activeHeadingIds: number[]
  visibleSections: Array<string | number>
  setVisibleSections: (visibleSections: Array<string | number>) => void
  setAllHeadings: (headings: Heading[]) => void
}

export const useTableOfContents = create<State>()((set) => ({
  allHeadings: [],
  activeHeadingIds: [],
  visibleSections: [],
  setAllHeadings: (allHeadings) => set(() => ({ allHeadings })),
  setVisibleSections: (visibleSections) =>
    set((state) => (state.visibleSections.join() === visibleSections.join() ? state : { ...state, visibleSections })),
}))
