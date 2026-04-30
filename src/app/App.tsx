import { ExpenseFormPage } from '../features/expense-form/ExpenseFormPage'
import { TemplateCalibrator } from '../pages/TemplateCalibrator'

export default function App() {
  const basePath = import.meta.env.BASE_URL
  const currentPath = window.location.pathname
  const isTemplateCalibrator = /\/template-calibrator\/?$/.test(currentPath)
  const isLocalHost = ['localhost', '127.0.0.1', '::1'].includes(window.location.hostname)
  const canUseTemplateCalibrator = import.meta.env.DEV || isLocalHost

  return (
    <div className="fafa-shell min-h-screen bg-page pb-10 text-slate-900">
      <header>
        <div className="fafa-topbar py-2 text-xs">
          <div className="mx-auto flex w-[min(1200px,95vw)] items-center justify-between gap-3">
            <p className="tracking-wide text-emerald-50/90">Federacion Andaluza de Futbol Americano</p>
            <p className="text-[11px] uppercase tracking-[0.14em] text-emerald-100/90">Herramienta oficial interna</p>
          </div>
        </div>

        <nav className="mx-auto flex w-[min(1200px,95vw)] items-center justify-between gap-4 py-4 text-sm text-slate-100 md:py-5">
          <div>
            <p className="fafa-heading text-2xl font-bold leading-none text-white md:text-3xl">FAFA</p>
            <p className="text-xs uppercase tracking-[0.16em] text-emerald-50/90">Hoja de gastos arbitrales</p>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={basePath}
              className="rounded-md border border-emerald-200/70 bg-white px-3 py-1.5 font-semibold text-emerald-900 transition hover:bg-emerald-100/60"
            >
              Formulario
            </a>
            {canUseTemplateCalibrator ? (
              <a
                href={`${basePath}template-calibrator`}
                className="rounded-md border border-emerald-300/80 bg-[#dfefe6] px-3 py-1.5 font-semibold text-emerald-900 transition hover:bg-[#d4e8dc]"
              >
                TemplateCalibrator
              </a>
            ) : null}
          </div>
        </nav>
      </header>

      {isTemplateCalibrator && canUseTemplateCalibrator ? (
        <TemplateCalibrator />
      ) : (
        <main className="pt-3 md:pt-5">
          <div className="mx-auto w-[min(1200px,95vw)]">
            {isTemplateCalibrator && !canUseTemplateCalibrator ? (
              <div className="mb-4 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                TemplateCalibrator no esta disponible en produccion. Esta herramienta solo funciona en local.
              </div>
            ) : null}
            <ExpenseFormPage />
          </div>
        </main>
      )}
    </div>
  )
}
