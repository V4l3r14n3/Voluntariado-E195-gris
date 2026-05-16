import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useOpportunities, useApplyToOpportunity } from "@/lib/queries/opportunities";
import type { Opportunity } from "@/lib/mock-data";
import { toast } from "sonner";
import { Search as SearchIcon, MapPin, Calendar, Building2, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/search")({
  component: SearchPage,
});

function SearchPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: opportunities = [], isLoading } = useOpportunities({ onlyPublished: true });
  const applyMutation = useApplyToOpportunity();
  const [titleFilter, setTitleFilter] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [orgFilter, setOrgFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [applyConfirm, setApplyConfirm] = useState<Opportunity | null>(null);

  if (!user) { navigate({ to: "/" }); return null; }

  const filtered = opportunities.filter(o =>
    (!titleFilter || o.title.toLowerCase().includes(titleFilter.toLowerCase())) &&
    (!cityFilter || o.city.toLowerCase().includes(cityFilter.toLowerCase())) &&
    (!orgFilter || o.organizationName.toLowerCase().includes(orgFilter.toLowerCase())) &&
    (!dateFilter || o.date === dateFilter)
  );

  const handleApply = async (opp: Opportunity) => {
    try {
      await applyMutation.mutateAsync({ opportunityId: opp.id, userId: user.id });
      toast.success("Successfully registered for " + opp.title + "!");
    } catch (e) {
      toast.error((e as Error).message);
    }
    setApplyConfirm(null);
  };

  const isApplied = (opp: Opportunity) => opp.applicants.includes(user.id);

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Find Opportunities</h1>
        <p className="text-sm text-muted-foreground mt-1">Browse and apply to volunteer opportunities</p>
      </div>

      <div className="bg-card border border-border rounded-sm shadow-sm p-4 mb-6">
        <div className="grid grid-cols-4 gap-3">
          <div className="relative">
            <SearchIcon className="size-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <input type="text" value={titleFilter} onChange={e => setTitleFilter(e.target.value)} className="w-full pl-9 pr-3 py-2 text-sm border border-input rounded-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring" placeholder="Search by title..." />
          </div>
          <div className="relative">
            <MapPin className="size-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <input type="text" value={cityFilter} onChange={e => setCityFilter(e.target.value)} className="w-full pl-9 pr-3 py-2 text-sm border border-input rounded-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring" placeholder="Filter by city..." />
          </div>
          <div className="relative">
            <Building2 className="size-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <input type="text" value={orgFilter} onChange={e => setOrgFilter(e.target.value)} className="w-full pl-9 pr-3 py-2 text-sm border border-input rounded-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring" placeholder="Filter by org..." />
          </div>
          <input type="date" value={dateFilter} onChange={e => setDateFilter(e.target.value)} className="w-full px-3 py-2 text-sm border border-input rounded-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {filtered.map(opp => (
          <div key={opp.id} className="bg-card border border-border rounded-sm shadow-sm p-5 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-base font-semibold">{opp.title}</h3>
              {isApplied(opp) && (
                <span className="flex items-center gap-1 px-2 py-1 text-xs font-medium bg-primary/10 text-primary rounded-sm">
                  <CheckCircle2 className="size-3" /> Registered
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{opp.description}</p>
            <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mb-4">
              <span className="flex items-center gap-1"><Calendar className="size-3" />{opp.date} at {opp.time}</span>
              <span className="flex items-center gap-1"><MapPin className="size-3" />{opp.city}, {opp.location}</span>
              <span className="flex items-center gap-1"><Building2 className="size-3" />{opp.organizationName}</span>
            </div>
            {!isApplied(opp) ? (
              <button onClick={() => setApplyConfirm(opp)} className="w-full py-2 text-sm font-medium bg-primary text-primary-foreground rounded-sm hover:bg-primary/90 transition-colors">Apply Now</button>
            ) : (
              <div className="w-full py-2 text-sm font-medium text-center text-primary bg-primary/5 rounded-sm">Already Registered</div>
            )}
          </div>
        ))}
        {!isLoading && filtered.length === 0 && (
          <div className="col-span-2 text-center py-12 text-muted-foreground">
            <SearchIcon className="size-8 mx-auto mb-3 opacity-50" />
            <p className="text-sm">No opportunities found matching your filters.</p>
          </div>
        )}
        {isLoading && (
          <div className="col-span-2 text-center py-12 text-muted-foreground text-sm">Loading…</div>
        )}
      </div>

      {applyConfirm && (
        <div className="fixed inset-0 bg-foreground/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-sm shadow-lg max-w-sm w-full p-6 text-center">
            <CheckCircle2 className="size-10 text-primary mx-auto mb-3" />
            <h3 className="text-lg font-semibold mb-2">Confirm Application</h3>
            <p className="text-sm text-muted-foreground mb-4">Apply to <strong>{applyConfirm.title}</strong> on {applyConfirm.date}?</p>
            <div className="flex gap-2 justify-center">
              <button onClick={() => setApplyConfirm(null)} className="px-4 py-2 text-sm font-medium border border-border rounded-sm hover:bg-accent transition-colors">Cancel</button>
              <button onClick={() => handleApply(applyConfirm)} className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-sm hover:bg-primary/90 transition-colors">Confirm</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
