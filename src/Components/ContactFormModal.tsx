import { CloseOutlined } from '@ant-design/icons'
import ContactForm from './ContactForm'

interface ContactFormModalProps {
  isOpen: boolean
  onClose: () => void
}

function ContactFormModal({ isOpen, onClose }: ContactFormModalProps) {
  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-[var(--surface)] border border-[var(--border)] rounded-xl w-full max-w-lg overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[var(--border)]">
          <div>
            <h2 className="text-2xl font-bold text-[var(--text-primary)]">Get In Touch</h2>
            <p className="text-sm text-[var(--text-muted)] mt-1">
              I'll get back to you as soon as possible
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
          >
            <CloseOutlined className="text-xl" />
          </button>
        </div>

        {/* Form Content */}
        <div className="p-6">
          <ContactForm
            showCancelButton
            onCancel={onClose}
            onSuccess={() => {
              setTimeout(onClose, 2000)
            }}
          />
        </div>
      </div>
    </div>
  )
}

export default ContactFormModal
