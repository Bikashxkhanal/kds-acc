const Card = ({ title, subtitle, children, className = "", actions }) => (
  <div className={`kds-card p-5 ${className}`}>
    {(title || actions) && (
      <div className="flex items-start justify-between mb-4">
        <div>
          {title && <h3 className="text-base font-semibold text-[#12355b]">{title}</h3>}
          {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
        </div>
        {actions && <div className="flex gap-2">{actions}</div>}
      </div>
    )}
    {children}
  </div>
);

export default Card;
