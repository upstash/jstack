"use client"

import { useTableOfContents } from "@/ctx/use-table-of-contents"
import { useEffect } from "react"

interface ActiveSectionObserverProps {
  children: React.ReactNode
  headings: Array<{ level: number; text: string }>
}

export function ActiveSectionObserver({ children, headings }: ActiveSectionObserverProps) {
  const setVisibleSections = useTableOfContents((state) => state.setVisibleSections)
  const setAllHeadings = useTableOfContents((state) => state.setAllHeadings)

  useEffect(() => {
    setAllHeadings(headings.filter(({ level }) => level === 2 || level === 3))
  }, [headings, setAllHeadings])

  useEffect(() => {
    const observers: IntersectionObserver[] = []
    const headingElements = document.querySelectorAll("h1, h2")

    const callback: IntersectionObserverCallback = (entries) => {
      const visibleSections = entries.filter((entry) => entry.isIntersecting).map((entry) => entry.target.id)

      if (visibleSections.length === 0) {
        // if no section is visible, we might want to show the closest one
        // but i dont care right now
        return
      }

      setVisibleSections(visibleSections)
    }

    const observer = new IntersectionObserver(callback, {
      rootMargin: "-100px 0px -66%",
      threshold: 1,
    })

    headingElements.forEach((element) => {
      observer.observe(element)
    })

    return () => {
      headingElements.forEach((element) => {
        observer.unobserve(element)
      })
    }
  }, [setVisibleSections])

  return children
}
