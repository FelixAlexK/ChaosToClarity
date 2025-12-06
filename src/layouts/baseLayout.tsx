export function BaseLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="w-full flex-col flex p-1 md:p-4">
            {children}
        </div>
    )
}