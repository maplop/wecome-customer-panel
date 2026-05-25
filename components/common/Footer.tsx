export function Footer() {
  return (
    <footer className="py-4 px-5 text-center border-t border-border/60">
      <p className="text-xs text-muted-foreground">
        &copy; {new Date().getFullYear()} Wecome &mdash; Institución supervisada por la CNBV &middot; CONDUSEF: 800 999 8080
      </p>
    </footer>
  )
}