import Image from "next/image"
import { Icons } from "../icons"

export const LamboSection = () => {
  return (
    <section className="w-full py-24 border-y-2 border-dashed bg-black/20 border-dark-gray/50">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="relative w-full aspect-[4/3]">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-brand-400/20 to-brand-200/20" />
            <Image
              src="/mylamboreally.png"
              fill
              alt="JStack Next.js TypeScript stack for Vercel, AWS, Netlify and more"
              className="object-cover rounded-xl"
            />
            <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/10" />
          </div>

          <div className="flex flex-col gap-8">
            <blockquote>
              <p className="text-xl/8 font-light text-muted-light italic">
                "JStack is built on top of some of the highest quality web software. It's the framework I wish
                I'd had when I started — crafted from years of experience building production Next.js apps. <span className="text-brand-400">Lambos
                are not just for PHP devs anymore :^)</span>"
              </p>
            </blockquote>

            <div className="flex flex-col gap-3">
              <Icons.signature className="w-48 lg:w-56 text-zinc-200" />
              <div>
                <h4 className="text-lg font-medium text-muted-light">Josh</h4>
                <p className="text-sm text-muted-dark">Creator of JStack (and doesnt even own a car)</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
