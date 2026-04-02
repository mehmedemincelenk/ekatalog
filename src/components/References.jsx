import { REFERENCES } from '../data/config';

export default function References() {
  return (
    <section className="bg-stone-50 border-t border-stone-200 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-center text-xs font-bold uppercase tracking-widest text-stone-400 mb-6">
          Referanslarımız &amp; Çalıştığımız Kurumlar
        </h2>
        <div className="grid grid-cols-4 gap-4">
          {REFERENCES.map((ref) => (
            <div
              key={ref.id}
              className="flex flex-col items-center justify-center gap-1 bg-white border border-stone-200 rounded-lg py-4 px-2 hover:border-stone-400 transition-colors"
            >
              <span className="text-2xl" aria-hidden="true">{ref.logo}</span>
              <span className="text-xs font-medium text-stone-500 text-center">{ref.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
