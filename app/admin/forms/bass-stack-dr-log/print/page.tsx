import Link from "next/link";

import PrintFormButton from "@/components/admin/PrintFormButton";
import { adminButtonStyles } from "@/components/admin/admin-button-styles";
import { requireAdminUser } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

const logLines = Array.from({ length: 100 }, (_, index) => index + 1);

export default async function BassStackDrLogPrintPage() {
  await requireAdminUser();

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto bg-white text-black print:static print:z-auto print:overflow-visible">
      <style>{`
        @page { size: portrait; margin: 0.45in; }
        @media print {
          .print-controls { display: none !important; }
          .dr-log-table thead { display: table-header-group; }
          .dr-log-table tr { break-inside: avoid; }
        }
      `}</style>

      <main className="mx-auto max-w-4xl px-3 py-5 sm:px-6 print:max-w-none print:p-0">
        <div className="print-controls mb-5 flex flex-wrap gap-3">
          <PrintFormButton />
          <Link
            href="/admin/forms"
            className={adminButtonStyles(
              "secondary",
              "border-black/20 text-black hover:text-black",
            )}
          >
            Back to Forms
          </Link>
        </div>

        <header className="mb-4 border-b-2 border-black pb-3">
          <p className="text-xs font-black tracking-[0.22em]">AITT</p>
          <h1 className="mt-1 text-2xl font-black uppercase">
            Bass Stack DR Weigh-In Log
          </h1>
          <p className="mt-1 text-xs">
            Enter one line every time a team weighs in. Repeat the Boat # and Team Name for each additional weigh-in.
          </p>
          <div className="mt-4 grid grid-cols-2 gap-8 text-sm font-bold">
            <p>Tournament: __________________________________</p>
            <p>Date: ______________________________</p>
          </div>
        </header>

        <table className="dr-log-table w-full table-fixed border-collapse text-xs">
          <colgroup>
            <col className="w-[9%]" />
            <col className="w-[11%]" />
            <col className="w-[38%]" />
            <col className="w-[12%]" />
            <col className="w-[17%]" />
            <col className="w-[13%]" />
          </colgroup>
          <thead>
            <tr className="bg-neutral-200">
              {[
                "Line #",
                "Boat #",
                "Team Name",
                "# Fish",
                "Weight",
                "Initials",
              ].map((label) => (
                <th key={label} className="border border-black p-2 text-left font-black">
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {logLines.map((line) => (
              <tr key={line} className="h-10">
                <td className="border border-black px-2 text-center font-bold">{line}</td>
                <td className="border border-black px-2" />
                <td className="border border-black px-2" />
                <td className="border border-black px-2" />
                <td className="border border-black px-2" />
                <td className="border border-black px-2" />
              </tr>
            ))}
          </tbody>
        </table>
      </main>
    </div>
  );
}
