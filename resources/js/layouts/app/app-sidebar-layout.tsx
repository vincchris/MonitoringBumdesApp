import NavMain from '@/components/nav-main';

export default function AppSidebarLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r">
        {/* Logo */}
        <div className="flex items-center justify-center h-20 border-b">
          <img src="/assets/images/Bumdes Logo.png" className="h-10" alt="Logo" />
          <img src="/assets/images/SumberJaya Logo.png" className="h-10" alt="Logo" />
        </div>

        {/* Navigation */}
        <NavMain />
      </aside>

      {/* Main Content */}
      <main className="flex-1 bg-gray-100 p-6">
        {children}
      </main>
    </div>
  );
}
