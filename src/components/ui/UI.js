import React from "react";
import "./UI.css";

// ─── Button ──────────────────────────────────────────────────
export function Button({
  children,
  variant = "primary",
  size = "md",
  loading,
  icon,
  className = "",
  ...props
}) {
  return (
    <button
      className={`btn btn--${variant} btn--${size} ${loading ? "btn--loading" : ""} ${className}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading && <span className="btn__spinner" />}
      {!loading && icon && <span className="btn__icon">{icon}</span>}
      {children}
    </button>
  );
}

// ─── Card ────────────────────────────────────────────────────
export function Card({ children, className = "", padding = true, ...props }) {
  return (
    <div
      className={`card ${padding ? "card--padded" : ""} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

// ─── Badge ───────────────────────────────────────────────────
export function Badge({ children, color = "default" }) {
  return <span className={`badge badge--${color}`}>{children}</span>;
}

// ─── Input ───────────────────────────────────────────────────
export function Input({ label, error, icon, className = "", ...props }) {
  return (
    <div className={`field ${className}`}>
      {label && <label className="field__label">{label}</label>}
      <div className={`field__wrap ${icon ? "field__wrap--icon" : ""}`}>
        {icon && <span className="field__icon">{icon}</span>}
        <input
          className={`field__input ${error ? "field__input--error" : ""}`}
          {...props}
        />
      </div>
      {error && <span className="field__error">{error}</span>}
    </div>
  );
}

// ─── Select ──────────────────────────────────────────────────
export function Select({
  label,
  error,
  options = [],
  className = "",
  ...props
}) {
  return (
    <div className={`field ${className}`}>
      {label && <label className="field__label">{label}</label>}
      <select
        className={`field__input field__select ${error ? "field__input--error" : ""}`}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <span className="field__error">{error}</span>}
    </div>
  );
}

// ─── Textarea ────────────────────────────────────────────────
export function Textarea({ label, error, className = "", rows = 4, ...props }) {
  return (
    <div className={`field ${className}`}>
      {label && <label className="field__label">{label}</label>}
      <textarea
        className={`field__input field__textarea ${error ? "field__input--error" : ""}`}
        rows={rows}
        {...props}
      />
      {error && <span className="field__error">{error}</span>}
    </div>
  );
}

// ─── Spinner ─────────────────────────────────────────────────
export function Spinner({ size = "md" }) {
  return <div className={`spinner spinner--${size}`} />;
}

// ─── Page Loader ─────────────────────────────────────────────
export function PageLoader() {
  return (
    <div className="page-loader">
      <Spinner size="lg" />
    </div>
  );
}

// ─── Empty State ─────────────────────────────────────────────
export function EmptyState({ icon, title, description, action }) {
  return (
    <div className="empty-state">
      {icon && <div className="empty-state__icon">{icon}</div>}
      <h3 className="empty-state__title">{title}</h3>
      {description && <p className="empty-state__desc">{description}</p>}
      {action && <div className="empty-state__action">{action}</div>}
    </div>
  );
}

// ─── Stat Card ───────────────────────────────────────────────
export function StatCard({ label, value, icon, color = "blue", sub }) {
  return (
    <div className={`stat-card stat-card--${color}`}>
      <div className="stat-card__icon">{icon}</div>
      <div className="stat-card__body">
        <span className="stat-card__label">{label}</span>
        <span className="stat-card__value">{value}</span>
        {sub && <span className="stat-card__sub">{sub}</span>}
      </div>
    </div>
  );
}

// ─── Page Header ─────────────────────────────────────────────
export function PageHeader({ title, subtitle, actions }) {
  return (
    <div className="page-header">
      <div className="page-header__text">
        <h1 className="page-header__title">{title}</h1>
        {subtitle && <p className="page-header__sub">{subtitle}</p>}
      </div>
      {actions && <div className="page-header__actions">{actions}</div>}
    </div>
  );
}

// ─── Confirm Modal ───────────────────────────────────────────
export function ConfirmModal({
  open,
  title,
  message,
  onConfirm,
  onCancel,
  danger = false,
}) {
  if (!open) return null;
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3 className="modal__title">{title}</h3>
        <p className="modal__message">{message}</p>
        <div className="modal__actions">
          <Button variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant={danger ? "danger" : "primary"} onClick={onConfirm}>
            Confirm
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Avatar ──────────────────────────────────────────────────
export function Avatar({ src, name, size = "md" }) {
  return (
    <div className={`avatar avatar--${size}`}>
      {src ? (
        <img src={src} alt={name} />
      ) : (
        <span>{name?.[0]?.toUpperCase() || "?"}</span>
      )}
    </div>
  );
}

// ─── Modal ───────────────────────────────────────────────────
export function Modal({ show, onClose, title, children, width = "500px" }) {
  if (!show) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal modal--page"
        style={{ maxWidth: width }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal__header">
          <h3 className="modal__title">{title}</h3>
          <button className="modal__close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="modal__body">{children}</div>
      </div>
    </div>
  );
}
