import Link from "next/link";

import PrintFormButton from "@/components/admin/PrintFormButton";
import { adminButtonStyles } from "@/components/admin/admin-button-styles";
import { requireAdminUser } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

const teamNumbers = Array.from({ length: 125 }, (_, index) => index + 1);
const cycleSections = Array.from({ length: 5 }, (_, sectionIndex) =>
  Array.from({ length: 5 }, (_, cycleIndex) => sectionIndex * 5 + cycleIndex + 1),
);

export default async function BassStackWeighLogPrintPage() {
  await requireAdminUser();

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto bg-white text-black print:static print:z-auto print:overflow-visible">
      <style>{`
        @page { size: landscape; margin: 0.35in; }
        @media print {
          .print-controls { display: none !important; }
          .cycle-section { break-before: page; }
          .cycle-section:first-of-type { break-before: auto; }
          .weigh-log-table { min-width: 0 !important; }
          .weigh-log-table thead { display: table-header-group; }
          .weigh-log-table tr { break-inside: avoid; }
        }
      `}</style>

      <main className="mx-auto max-w-[1500px] px-3 py-5 sm:px-6 print:max-w-none print:p-0">
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

        {cycleSections.map((cycles) => (
          <section
            key={cycles[0]}
            className="cycle-section mb-8 print:mb-0"
          >
            <header className="mb-3 border-b-2 border-black pb-2">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-[10px] font-black tracking-[0.22em]">AITT</p>
                  <h1 className="text-lg font-black uppercase sm:text-xl">
                    Bass Stack Weigh-In Log
                  </h1>
                </div>
                <p className="text-xs font-bold uppercase">
                  Cycles {cycles[0]}–{cycles.at(-1)} of 25
                </p>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-5 text-xs font-bold">
                <p>Tournament: __________________________________</p>
                <p>Date: ____________________</p>
                <p>End Time: ____________________</p>
              </div>
            </header>

            <div className="overflow-x-auto print:overflow-visible">
              <table className="weigh-log-table w-full min-w-[900px] table-fixed border-collapse text-[9px] leading-tight">
                <colgroup>
                  <col className="w-[5%]" />
                  <col className="w-[17%]" />
                  <col className="w-[7%]" />
                  <col className="w-[6%]" />
                  {cycles.flatMap((cycle) => [
                    <col key={`${cycle}-fish`} className="w-[5.5%]" />,
                    <col key={`${cycle}-weight`} className="w-[6.5%]" />,
                  ])}
                </colgroup>
                <thead>
                  <tr className="bg-neutral-200">
                    <th rowSpan={2} className="border border-black p-1">Boat #</th>
                    <th rowSpan={2} className="border border-black p-1 text-left">Team Name</th>
                    <th rowSpan={2} className="border border-black p-1">Total Weight</th>
                    <th rowSpan={2} className="border border-black p-1">Total Fish</th>
                    {cycles.map((cycle) => (
                      <th key={cycle} colSpan={2} className="border border-black p-1">
                        Weigh-In {cycle}
                      </th>
                    ))}
                  </tr>
                  <tr className="bg-neutral-100">
                    {cycles.flatMap((cycle) => [
                      <th key={`${cycle}-fish`} className="border border-black p-1">Fish</th>,
                      <th key={`${cycle}-weight`} className="border border-black p-1">Weight</th>,
                    ])}
                  </tr>
                </thead>
                <tbody>
                  {teamNumbers.map((boatNumber) => (
                    <tr key={boatNumber} className="h-7">
                      <td className="border border-black px-1 text-center font-bold">{boatNumber}</td>
                      <td className="border border-black px-1" />
                      <td className="border border-black px-1" />
                      <td className="border border-black px-1" />
                      {cycles.flatMap((cycle) => [
                        <td key={`${cycle}-${boatNumber}-fish`} className="border border-black px-1" />,
                        <td key={`${cycle}-${boatNumber}-weight`} className="border border-black px-1" />,
                      ])}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ))}
      </main>
    </div>
  );
}
