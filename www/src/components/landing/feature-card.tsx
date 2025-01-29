export type FeatureCardProps = {
  icon: React.ReactNode
  title: string
  description: string
}

export const FeatureCard = ({ icon, title, description }: FeatureCardProps) => {
  return (
    <div className="bg-black/20 p-6 rounded-xl">
      <div className="flex flex-col items-center">
        <div className="w-12 h-12 bg-black/20 rounded-full flex items-center justify-center">{icon}</div>

        <h3 className="text-lg text-center font-semibold mt-4 mb-2 text-muted-light">{title}</h3>
        <p className="text-muted-dark text-sm text-center">{description}</p>
      </div>
    </div>
  )
}
