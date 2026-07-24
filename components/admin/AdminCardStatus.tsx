export interface AdminCardStatusItem {
  label: string;
  value: string;
  needsAttention?: boolean;
}

interface AdminCardStatusProps {
  items: readonly AdminCardStatusItem[];
}

export default function AdminCardStatus({ items }: AdminCardStatusProps) {
  return (
    <dl className="mb-6 grid gap-3 border-t border-white/10 pt-5">
      {items.map((item) => (
        <div
          key={item.label}
          className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4"
        >
          <dt className="text-[0.65rem] font-black uppercase tracking-[0.12em] text-neutral-500">
            {item.label}
          </dt>
          <dd
            className={`text-sm font-semibold sm:text-right ${
              item.needsAttention ? "text-[#D4A017]" : "text-neutral-300"
            }`}
          >
            {item.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
