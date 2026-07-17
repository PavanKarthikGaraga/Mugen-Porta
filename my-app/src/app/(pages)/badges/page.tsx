import React from "react";
import { ACTIVITIES } from "@/app/Data/activities-mock";
import { ActivityBadge } from "@/components/ui/ActivityBadge";

export default function BadgesShowcasePage() {
  // Group activities by level for better display
  const groupedActivities = ACTIVITIES.reduce((acc, activity) => {
    const level = activity.level;
    if (!acc[level]) acc[level] = [];
    acc[level].push(activity);
    return acc;
  }, {} as Record<string, typeof ACTIVITIES>);

  const levelOrder = ["explorer", "foundation", "practitioner", "leader", "fellow"];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8 md:p-16">
      <div className="max-w-7xl mx-auto space-y-16">
        
        <header className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-fuchsia-500">
            SAMAM Activity Badges
          </h1>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg">
            Professional digital credentials representing all {ACTIVITIES.length} flagship learning pathways.
          </p>
        </header>

        {levelOrder.map((level) => {
          const activities = groupedActivities[level];
          if (!activities || activities.length === 0) return null;

          return (
            <section key={level} className="space-y-8">
              <div className="border-b border-slate-800 pb-4">
                <h2 className="text-3xl font-bold capitalize flex items-center gap-4">
                  {level} Level 
                  <span className="text-sm font-normal text-slate-500 bg-slate-900 px-3 py-1 rounded-full border border-slate-800">
                    {activities.length} Badges
                  </span>
                </h2>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12 place-items-center">
                {activities.map((activity) => (
                  <div key={activity.id} className="flex flex-col items-center gap-6">
                    <ActivityBadge 
                      level={activity.level as any} 
                      pack={activity.pack} 
                      badgeName={activity.badge || activity.name}
                      size="lg"
                    />
                    <div className="text-center max-w-[220px]">
                      <p className="text-xs text-slate-500 font-mono mb-1">{activity.code}</p>
                      <p className="text-sm font-semibold text-slate-300 leading-tight">
                        {activity.pack}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
