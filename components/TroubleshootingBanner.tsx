export default function TroubleshootingBanner() {
  return (
    <aside className="border-l-4 border-red-600 bg-[#181818] px-5 py-5 sm:flex sm:items-center sm:gap-5 sm:px-6" aria-labelledby="troubleshooting-title">
      <h2 id="troubleshooting-title" className="shrink-0 text-sm font-black uppercase tracking-[0.12em] text-white">Having Trouble Watching?</h2>
      <p className="mt-2 text-sm text-zinc-400 sm:mt-0">Try refreshing the page or check back closer to weigh-in time.</p>
    </aside>
  );
}
