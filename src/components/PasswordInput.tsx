import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export function PasswordInput(props: PasswordInputProps) {
  const [show, setShow] = useState(false)

  return (
    <div className="relative">
      <input
        {...props}
        type={show ? 'text' : 'password'}
        className={`w-full rounded-lg px-3 py-2 text-sm bg-bg border border-amber outline-none focus:border-amber pr-10 ${props.className || ''}`}
      />
      <button
        type="button"
        onClick={() => setShow(!show)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink transition-colors"
        tabIndex={-1}
      >
        {show ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
  )
}
