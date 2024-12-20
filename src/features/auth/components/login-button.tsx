"use client"

import { useRouter } from "next/navigation"

interface Props {
    children: React.ReactNode,
    mode?: "modal" | "redirect",
    asChild?: boolean
}

const LoginButton = ({children, mode = "redirect", asChild}: Props) => {
    const router = useRouter()
    const onClick = () => {
        router.push("/auth/login")
    }

    // TODO: Implement Modal
  return (
    <span onClick={onClick} className='cursor-pointer'>
        {children}
    </span>
  )
}

export default LoginButton
