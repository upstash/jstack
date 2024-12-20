import { useMediaQuery } from "@/src/hooks/use-media-query"
import { cn } from "@/src/utils"
import { Dispatch, ReactNode, SetStateAction } from "react"
import { Drawer } from "vaul"
import { Dialog, DialogContent, DialogTitle } from "./dialog"

interface ModalProps {
  children?: ReactNode
  className?: string
  showModal?: boolean
  setShowModal?: Dispatch<SetStateAction<boolean>>
  onClose?: () => void
  desktopOnly?: boolean
  preventDefaultClose?: boolean
}

export const Modal = ({
  children,
  className,
  desktopOnly,
  onClose,
  preventDefaultClose,
  setShowModal,
  showModal,
}: ModalProps) => {
  const closeModal = ({ dragged }: { dragged?: boolean }) => {
    if (preventDefaultClose && !dragged) {
      return
    }

    onClose && onClose()

    if (setShowModal) {
      setShowModal(false)
    }
  }

  const { isMobile } = useMediaQuery()

  if (isMobile && !desktopOnly) {
    return (
      <Drawer.Root
        open={setShowModal ? showModal : true}
        onOpenChange={(open) => {
          if (!open) {
            closeModal({ dragged: true })
          }
        }}
      >
        <Drawer.Overlay className="fixed inset-0 z-40 bg-gray-100 bg-opacity-10 backdrop-blur" />
        <Drawer.Portal>
          <Drawer.Content
            className={cn(
              "fixed !max-w-none bottom-0 left-0 right-0 z-50 mt-24 rounded-t-[10px] border-t border-gray-200 bg-white",
              className
            )}
          >
            <div className="sticky top-0 z-20 flex w-full items-center justify-center rounded-t-[10px] bg-inherit">
              <div className="my-3 h-1 w-12 rounded-full bg-gray-300" />
            </div>

            {children}
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    )
  }

  return (
    <Dialog
      open={setShowModal ? showModal : true}
      onOpenChange={(open) => {
        if (!open) {
          closeModal({ dragged: true })
        }
      }}
    >
      <DialogTitle className="sr-only">Dialog</DialogTitle>
      <DialogContent>{children}</DialogContent>
    </Dialog>
  )
}
