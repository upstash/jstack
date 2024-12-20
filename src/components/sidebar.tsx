import {
  Home,
  LucideIcon,
  ShoppingBag,
  PackageOpen,
  Settings,
  BookA,
} from "lucide-react"
import { PinTopIcon } from "@radix-ui/react-icons"
import Link from "next/link"
import { buttonVariants } from "./ui/button"
import UserButton from "../features/auth/components/user-button"
import { cn } from "../lib/utils"
import { BsBoxSeamFill, BsPeopleFill } from "react-icons/bs"
import { usePathname } from "next/navigation"
import { useState, useEffect } from "react"

interface SidebarItem {
  href: string
  icon: LucideIcon | any
  text: string
}

interface SidebarCategory {
  category: string
  items: SidebarItem[]
}

const SIDEBAR_ITEMS: SidebarCategory[] = [
  {
    category: "Overview",
    items: [{ href: "/dashboard", icon: Home, text: "Dashboard" }],
  },
  {
    category: "Products",
    items: [
      { href: "/dashboard/products", icon: PackageOpen, text: "All Products" },
    ],
  },
  {
    category: "Orders",
    items: [
      { href: "/dashboard/orders", icon: BsBoxSeamFill, text: "All Orders" },
      {
        href: "/dashboard/orders/pending",
        icon: ShoppingBag,
        text: "Pending Orders",
      },
    ],
  },
  {
    category: "Blog",
    items: [
      {
        href: "/dashboard/blogs",
        icon: BookA,
        text: "Blog Posts",
      },
    ],
  },
  {
    category: "Customers",
    items: [
      {
        href: "/dashboard/customers",
        icon: BsPeopleFill,
        text: "All Customers",
      },
    ],
  },
  {
    category: "Settings",
    items: [
      {
        href: "/dashboard/account-settings",
        icon: Settings,
        text: "Account Settings",
      },
      { href: "/dashboard/topbar", icon: PinTopIcon, text: "Topbar Settings" },
    ],
  },
]

export const Sidebar = ({ onClose }: { onClose?: () => void }) => {
  const pathName = usePathname()

  return (
    <div className="space-y-4 md:space-y-6 relative z-20 flex flex-col h-full">
      {/* logo */}
      <p className="hidden sm:block text-lg/7 font-semibold text-brand-900">
        My<span className="text-brand-700"> Store</span>
      </p>

      {/* navigation items */}
      <div className="flex-grow">
        <ul>
          {SIDEBAR_ITEMS.map(({ category, items }) => (
            <li key={category} className="mb-4 md:mb-8">
              <p className="text-xs font-medium leading-6 text-zinc-500">
                {category}
              </p>
              <div className="-mx-2 flex flex-1 flex-col">
                {items.map((item, i) => (
                  <Link
                    key={i}
                    href={item.href}
                    className={cn(
                      buttonVariants({ variant: "ghost" }),
                      "w-full justify-start group flex items-center gap-x-2.5 rounded-md px-2 py-1.5 text-sm font-medium leading-6",
                      pathName === item.href
                        ? "bg-gray-100 text-zinc-900"
                        : "text-zinc-700 hover:bg-gray-50 transition"
                    )}
                    onClick={onClose}
                  >
                    <item.icon
                      className={cn(
                        "size-4",
                        pathName === item.href
                          ? "text-zinc-700"
                          : "text-zinc-500 group-hover:text-zinc-700"
                      )}
                    />
                    {item.text}
                  </Link>
                ))}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
