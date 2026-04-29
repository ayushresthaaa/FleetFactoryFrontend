export default function Items() {
  return (
    <div style={styles.container}>
      <div style={styles.hero}>
        <div style={styles.icon}>
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--accent)"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="2" y="3" width="7" height="7" />
            <rect x="15" y="3" width="7" height="7" />
            <rect x="15" y="15" width="7" height="7" />
            <rect x="2" y="15" width="7" height="7" />
          </svg>
        </div>
        <h1 style={styles.title}>Items</h1>
        <p style={styles.sub}>
          Your inventory and item catalog will live here. Track stock,
          categories, and pricing all in one place.
        </p>
        <div style={styles.pill}>In Development</div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "60vh",
  },
  hero: { textAlign: "center", maxWidth: 400 },
  icon: {
    width: 64,
    height: 64,
    borderRadius: "var(--radius-lg)",
    background: "var(--accent-muted)",
    border: "1px solid var(--accent-border)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 20px",
    boxShadow: "var(--shadow-accent)",
  },
  title: {
    fontFamily: "var(--font-display)",
    fontWeight: 800,
    fontSize: 28,
    marginBottom: 10,
    letterSpacing: "-0.5px",
  },
  sub: {
    color: "var(--text-muted)",
    fontSize: 14,
    lineHeight: 1.7,
    marginBottom: 20,
  },
  pill: {
    display: "inline-block",
    padding: "6px 16px",
    borderRadius: 20,
    background: "var(--bg-elevated)",
    border: "1px solid var(--border-strong)",
    fontSize: 12,
    color: "var(--text-secondary)",
    fontWeight: 600,
  },
};
