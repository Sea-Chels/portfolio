/** The numbered rule that opens each section. */
function SectionMarker({ num, className = 'mb-8' }: { num: string; className?: string }) {
  return (
    <div className={`flex items-center gap-4 ${className}`}>
      <span className="section-num font-mono text-accent text-base">{num}</span>
      <div className="h-px flex-1 bg-gradient-to-r from-accent/50 to-transparent" />
    </div>
  )
}

export default SectionMarker
