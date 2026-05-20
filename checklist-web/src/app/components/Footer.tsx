export function Footer() {
  return (
    <footer className="border-t border-cyan-200/30 bg-gradient-to-r from-cyan-700 via-emerald-700 to-teal-800 shadow-sm">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-4 text-sm text-white sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
        <p className="font-semibold">ChecklistHub helps teams and individuals prepare with confidence.</p>
        <p className="text-white/90">&copy; {new Date().getFullYear()} ChecklistHub</p>
      </div>
    </footer>
  );
}
