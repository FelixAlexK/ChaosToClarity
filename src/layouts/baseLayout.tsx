export function BaseLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full flex-col flex py-8 px-1 md:p-4">
      {children}
    </div>
  )
}
