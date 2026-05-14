export default function PortfolioFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white mt-12">
      <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between gap-4 flex-wrap text-xs text-slate-500">
        <div>
          Built by{' '}
          <a
            href="https://seoho-youn.github.io"
            target="_blank"
            rel="noreferrer"
            className="font-semibold text-slate-700 hover:text-blue-600"
          >
            Seoho Youn
          </a>
          {' · '}
          Engineering portfolio at{' '}
          <a
            href="https://seoho-youn.github.io"
            target="_blank"
            rel="noreferrer"
            className="hover:text-blue-600 underline"
          >
            seoho-youn.github.io
          </a>
        </div>
        <div className="text-slate-400">
          Tool 1 of 7 in the Engineering Program Manager Tools Portfolio
        </div>
      </div>
    </footer>
  )
}
