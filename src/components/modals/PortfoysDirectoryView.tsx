import { useState } from 'react';
import * as Lucide from 'lucide-react';
import Button from '../ui/Button';
import Loading from '../ui/Loading';
import { SavedLead } from '../../hooks/usePortfoysScraper';

interface PortfoysDirectoryViewProps {
  savedDirectory: SavedLead[];
  loadingDirectory: boolean;
}

export default function PortfoysDirectoryView({
  savedDirectory,
  loadingDirectory,
}: PortfoysDirectoryViewProps) {
  const [expandedGroups, setExpandedGroups] = useState<{ [key: string]: boolean }>({});

  if (loadingDirectory) {
    return (
      <Loading size="md" variant="dark" label="Kişiler Yükleniyor..." className="py-16" />
    );
  }

  if (savedDirectory.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-4">
        <div className="w-16 h-16 bg-stone-50 rounded-full flex items-center justify-center text-stone-400 shadow-inner">
          <Lucide.Users size={32} />
        </div>
        <div className="text-center space-y-1">
          <h4 className="text-xs font-black uppercase tracking-wider text-stone-600">Rehberiniz Boş</h4>
          <p className="text-[9px] font-bold text-stone-400 max-w-xs leading-relaxed">
            Müşteri Ara sekmesinden arama yapıp rehberinize yeni dükkanlar ekleyebilirsiniz.
          </p>
        </div>
      </div>
    );
  }

  // Helper to group by search context
  const getGroupKey = (lead: SavedLead) => {
    // 1. Safely handle stringified metadata if any
    let meta = lead.metadata;
    if (typeof meta === 'string') {
      try {
        meta = JSON.parse(meta);
      } catch {
        meta = {};
      }
    }

    const country = meta?.country || 'Türkiye';
    const city = meta?.city || 'Diğer';
    const district = meta?.district || '';
    
    // 2. Resolve keyword with segment fallback
    let keyword = meta?.keyword || lead.segment || 'Müşteri';

    // 3. Fallback dictionary for historical searches
    const fallbackKeywords: { [key: string]: string } = {
      'istanbul_bakırköy': 'Coffee',
      'ankara_elmadağ': 'Kuaför',
      'adana_aladağ': 'Kozmetik',
    };
    
    const locKey = `${city}_${district}`.toLowerCase().trim();
    if (['silver', 'gold', 'bronze', 'other'].includes(keyword.toLowerCase())) {
      keyword = fallbackKeywords[locKey] || 'Müşteri';
    }

    const label = district
      ? `${keyword} & ${country}, ${city}, ${district}`
      : `${keyword} & ${country}, ${city}`;

    return {
      key: `${country}_${city}_${district}_${keyword}`.toLowerCase().replace(/\s+/g, '_'),
      label,
      city,
      district,
      segment: keyword,
    };
  };

  const groupsMap: {
    [key: string]: {
      key: string;
      label: string;
      city: string;
      district: string;
      segment: string;
      leads: SavedLead[];
    };
  } = {};

  savedDirectory.forEach((lead) => {
    const { key, label, city, district, segment } = getGroupKey(lead);
    if (!groupsMap[key]) {
      groupsMap[key] = { key, label, city, district, segment, leads: [] };
    }
    groupsMap[key].leads.push(lead);
  });

  const groups = Object.values(groupsMap);

  const toggleGroup = (groupKey: string) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [groupKey]: !prev[groupKey],
    }));
  };

  return (
    <div className="space-y-3 max-h-[55vh] overflow-y-auto pr-1 custom-scrollbar animate-in fade-in duration-300">
      {groups.map((group) => {
        const isExpanded = !!expandedGroups[group.key];
        return (
          <div
            key={group.key}
            className="border border-stone-100 rounded-2xl overflow-hidden bg-stone-50/30 transition-all duration-200"
          >
            {/* Group Header Accordion Button */}
            <button
              onClick={() => toggleGroup(group.key)}
              className="w-full flex items-center justify-between p-3.5 bg-stone-50 hover:bg-stone-100 transition-colors text-left"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0">
                  <Lucide.FolderOpen size={18} strokeWidth={2} />
                </div>
                <div className="min-w-0">
                  <h4 className="text-[11px] font-black uppercase text-stone-900 tracking-tight truncate">
                    {group.label}
                  </h4>
                  <p className="text-[9px] text-stone-400 font-bold mt-0.5">
                    {group.leads.length} Kayıtlı Müşteri
                  </p>
                </div>
              </div>
              <div className="text-stone-450 pl-2 shrink-0">
                {isExpanded ? <Lucide.ChevronDown size={18} strokeWidth={3} /> : <Lucide.ChevronRight size={18} strokeWidth={3} />}
              </div>
            </button>

            {/* Group Body (Leads List) */}
            {isExpanded && (
              <div className="divide-y divide-stone-100 bg-white border-t border-stone-100 animate-in slide-in-from-top-2 duration-200">
                {group.leads.map((lead) => (
                  <div
                    key={lead.id}
                    className="p-3.5 flex items-center justify-between gap-4 hover:bg-stone-50 transition-all duration-150"
                  >
                    {/* Lead Info */}
                    <div className="flex-1 min-w-0 space-y-0.5">
                      <div className="flex items-center gap-2">
                        <h5 className="text-[11px] font-bold uppercase text-stone-900 truncate">
                          {lead.company_name}
                        </h5>
                      </div>
                      {lead.metadata?.address && (
                        <div className="flex items-center gap-1.5 text-[9px] text-stone-400 font-medium">
                          <Lucide.MapPin size={9} className="shrink-0 text-stone-300" />
                          <span className="truncate">{lead.metadata.address}</span>
                        </div>
                      )}
                    </div>

                    {/* Contact Actions */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      {lead.phone && (
                        <>
                          <a href={`tel:${lead.phone.replace(/\s+/g, '')}`}>
                            <Button
                              variant="phone"
                              size="xs"
                              mode="circle"
                              icon={<Lucide.PhoneCall size={10} strokeWidth={3} />}
                              className="w-8 h-8 hover:scale-105 active:scale-95"
                              title="Telefonla Ara"
                            />
                          </a>
                          <a
                            href={`https://wa.me/${lead.phone.replace(/\D/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Button
                              variant="whatsapp"
                              size="xs"
                              mode="circle"
                              icon={<Lucide.MessageSquare size={10} strokeWidth={3} />}
                              className="w-8 h-8 hover:scale-105 active:scale-95"
                              title="WhatsApp'tan Yaz"
                            />
                          </a>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
