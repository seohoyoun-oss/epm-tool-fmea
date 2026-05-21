export default function PortfolioFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white mt-12">
      <div className="w-full px-6 py-5 flex items-center justify-end gap-4 flex-wrap text-xs text-slate-500">
        <div>
          Built by{' '}
          <img src="/claude-logo.svg" alt="Claude" className="inline-block w-4 h-4 mx-0.5 align-middle" />
          <span className="text-slate-500"> and </span>
          <img src="/avatar_pixel_v2.png" alt="Seoho" className="inline-block w-4 h-4 mx-0.5 align-middle rounded-sm" />
        </div>
      </div>
    </footer>
  )
}
