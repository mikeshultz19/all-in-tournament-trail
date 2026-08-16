import { adminButtonStyles } from "@/components/admin/admin-button-styles";

const forms = [
  {
    name: "Tournament-Morning Registration Form",
    description:
      "Printable one-page registration form for anglers registering at the ramp.",
    href: "/forms/AITT-Tournament-Morning-Registration-Form.pdf",
    downloadName: "AITT-Tournament-Morning-Registration-Form.pdf",
  },
] as const;

export default function AdminFormsPage() {
  return (
    <section className="max-w-5xl space-y-8">
      <div className="border-b border-white/10 pb-7">
        <p className="text-xs font-black uppercase tracking-[0.24em] text-red-500">
          Admin Center
        </p>
        <h1 className="mt-3 text-3xl font-black uppercase tracking-tight text-white sm:text-4xl">
          AITT Forms
        </h1>
        <p className="mt-3 text-neutral-400">
          View, print, or download operational tournament forms.
        </p>
      </div>

      <div className="space-y-4">
        {forms.map((form) => (
          <article
            key={form.href}
            className="flex flex-col gap-5 border border-white/10 bg-[#111111] p-5 sm:p-7 lg:flex-row lg:items-center lg:justify-between"
          >
            <div className="min-w-0">
              <h2 className="text-lg font-black uppercase tracking-tight text-white">
                {form.name}
              </h2>
              <p className="mt-2 text-sm leading-6 text-neutral-400">
                {form.description}
              </p>
            </div>

            <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
              <a
                href={form.href}
                target="_blank"
                rel="noopener noreferrer"
                className={adminButtonStyles("primary")}
              >
                View / Print PDF
              </a>
              <a
                href={form.href}
                download={form.downloadName}
                className={adminButtonStyles("secondary")}
              >
                Download PDF
              </a>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
