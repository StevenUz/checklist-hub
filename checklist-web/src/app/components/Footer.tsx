export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-4 py-6 text-sm text-slate-600 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
        <p>ChecklistHub helps teams and individuals prepare with confidence.</p>
        <p>&copy; {new Date().getFullYear()} ChecklistHub</p>
      </div>
    </footer>
  );
}
