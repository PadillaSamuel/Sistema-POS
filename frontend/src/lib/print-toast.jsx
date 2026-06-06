import { toast } from 'react-toastify'

export const mostrarErrorImpresion = (mensaje, reintentar) => {
  toast.error(
    ({ closeToast }) => (
      <div className="flex flex-col gap-1.5">
        <span className="text-sm">{mensaje}</span>
        {typeof reintentar === 'function' && (
          <button
            type="button"
            onClick={() => {
              reintentar()
              closeToast()
            }}
            className="self-start rounded-sm text-xs font-semibold text-white underline underline-offset-2 hover:opacity-90"
          >
            Reintentar
          </button>
        )}
      </div>
    ),
    { autoClose: false, closeOnClick: false, draggable: false }
  )
}
