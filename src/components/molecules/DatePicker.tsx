import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
} from 'react'
import {
  RiArrowLeftSLine,
  RiArrowRightSLine,
  RiCalendarLine,
} from 'react-icons/ri'
import { useLocale } from '../../i18n'
import { cn } from '../../utils/cn'

interface DatePickerProps {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  placeholder?: string
  className?: string
  buttonClassName?: string
}

const LOCALE_MAP = {
  pt: 'pt-BR',
  en: 'en-US',
  es: 'es-ES',
} as const

function parseIsoDate(value: string) {
  if (!value) return null
  const [year, month, day] = value.split('-').map(Number)
  if (!year || !month || !day) return null
  return new Date(year, month - 1, day)
}

function toIsoDate(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function isSameDay(a: Date | null, b: Date | null) {
  if (!a || !b) return false
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

export function DatePicker({
  value,
  onChange,
  disabled = false,
  placeholder = 'Select a date',
  className,
  buttonClassName,
}: DatePickerProps) {
  const { lang } = useLocale()
  const rootRef = useRef<HTMLDivElement | null>(null)
  const selectedDate = useMemo(() => parseIsoDate(value), [value])
  const [isOpen, setIsOpen] = useState(false)
  const [displayedMonth, setDisplayedMonth] = useState<Date>(
    selectedDate ?? new Date(),
  )

  useEffect(() => {
    if (selectedDate) {
      setDisplayedMonth(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1))
    }
  }, [selectedDate])

  useEffect(() => {
    if (!isOpen) return

    const handleOutsideClick = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleOutsideClick)
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick)
    }
  }, [isOpen])

  const locale = LOCALE_MAP[lang]
  const monthLabel = new Intl.DateTimeFormat(locale, {
    month: 'long',
    year: 'numeric',
  }).format(displayedMonth)

  const weekdayLabels = Array.from({ length: 7 }, (_, index) => {
    const baseDate = new Date(2024, 0, 7 + index)
    return new Intl.DateTimeFormat(locale, { weekday: 'short' }).format(baseDate)
  })

  const firstDayOfMonth = new Date(
    displayedMonth.getFullYear(),
    displayedMonth.getMonth(),
    1,
  )
  const startOffset = firstDayOfMonth.getDay()
  const calendarStart = new Date(firstDayOfMonth)
  calendarStart.setDate(firstDayOfMonth.getDate() - startOffset)

  const calendarDays = Array.from({ length: 42 }, (_, index) => {
    const current = new Date(calendarStart)
    current.setDate(calendarStart.getDate() + index)
    return current
  })

  const formattedValue = selectedDate
    ? new Intl.DateTimeFormat(locale, {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }).format(selectedDate)
    : ''

  const handlePrevMonth = (event: ReactMouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    setDisplayedMonth(
      new Date(displayedMonth.getFullYear(), displayedMonth.getMonth() - 1, 1),
    )
  }

  const handleNextMonth = (event: ReactMouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    setDisplayedMonth(
      new Date(displayedMonth.getFullYear(), displayedMonth.getMonth() + 1, 1),
    )
  }

  return (
    <div ref={rootRef} className={cn('relative', className)}>
      <button
        type='button'
        disabled={disabled}
        onClick={() => setIsOpen((open) => !open)}
        className={cn(
          'w-full rounded-xl border px-4 py-3 text-left text-sm font-medium outline-none transition-all disabled:cursor-not-allowed disabled:opacity-70 flex items-center justify-between gap-3',
          buttonClassName,
        )}
        >
          <span className={cn(!formattedValue && 'text-slate-400')}>
            {formattedValue || placeholder}
          </span>
          <span className='shrink-0'>
            <RiCalendarLine className='text-lg text-slate-400' />
          </span>
        </button>

      {isOpen && !disabled && (
        <div className='absolute left-0 top-[calc(100%+0.5rem)] z-50 w-[min(100vw-2rem,20rem)] rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_24px_70px_rgba(15,23,42,0.16)]'>
          <div className='mb-4 flex items-center justify-between gap-3'>
            <button
              type='button'
              onClick={handlePrevMonth}
              className='flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-700'
              aria-label='Previous month'
            >
              <RiArrowLeftSLine className='text-lg' />
            </button>
            <div className='text-sm font-black capitalize text-slate-800'>
              {monthLabel}
            </div>
            <button
              type='button'
              onClick={handleNextMonth}
              className='flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-700'
              aria-label='Next month'
            >
              <RiArrowRightSLine className='text-lg' />
            </button>
          </div>

          <div className='grid grid-cols-7 gap-1 text-center text-[11px] font-black uppercase tracking-wider text-slate-400'>
            {weekdayLabels.map((label) => (
              <div key={label} className='py-1'>
                {label}
              </div>
            ))}
          </div>

          <div className='mt-2 grid grid-cols-7 gap-1'>
            {calendarDays.map((day) => {
              const isoDate = toIsoDate(day)
              const isCurrentMonth = day.getMonth() === displayedMonth.getMonth()
              const isSelected = isSameDay(day, selectedDate)
              const isToday = isSameDay(day, new Date())

              return (
                <button
                  key={isoDate}
                  type='button'
                  onClick={() => {
                    onChange(isoDate)
                    setIsOpen(false)
                  }}
                  className={cn(
                    'h-10 rounded-xl text-sm font-bold transition-all',
                    isSelected
                      ? 'bg-primary text-white shadow-lg shadow-primary/20'
                      : isCurrentMonth
                        ? 'text-slate-700 hover:bg-slate-100'
                        : 'text-slate-300 hover:bg-slate-50',
                    isToday && !isSelected && 'border border-primary/20 text-primary',
                  )}
                >
                  {day.getDate()}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
