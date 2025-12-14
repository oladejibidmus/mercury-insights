import { useAchievements, useUserAchievements } from "@/hooks/useAchievements";
import { AchievementBadge } from "./AchievementBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Loader2 } from "lucide-react";

interface AchievementsDisplayProps {
  userId?: string;
  compact?: boolean;
}

export function AchievementsDisplay({ userId, compact = false }: AchievementsDisplayProps) {
  const { data: allAchievements = [], isLoading: loadingAll } = useAchievements();
  const { data: userAchievements = [], isLoading: loadingUser } = useUserAchievements(userId);

  const earnedIds = new Set(userAchievements.map((ua) => ua.achievement_id));
  const totalPoints = userAchievements.reduce(
    (acc, ua) => acc + (ua.achievement?.points || 0),
    0
  );

  const categories = [...new Set(allAchievements.map((a) => a.category))];

  if (loadingAll || loadingUser) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (compact) {
    return (
      <div className="flex flex-wrap gap-2">
        {userAchievements.slice(0, 6).map((ua) =>
          ua.achievement ? (
            <AchievementBadge
              key={ua.id}
              achievement={ua.achievement}
              earned
              earnedAt={ua.earned_at}
              size="sm"
            />
          ) : null
        )}
        {userAchievements.length > 6 && (
          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs text-muted-foreground">
            +{userAchievements.length - 6}
          </div>
        )}
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-primary" /> Achievements
          </span>
          <span className="text-sm font-normal text-muted-foreground">
            {userAchievements.length}/{allAchievements.length} • {totalPoints} pts
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue={categories[0] || "general"}>
          <TabsList className="mb-4">
            {categories.map((cat) => (
              <TabsTrigger key={cat} value={cat} className="capitalize">
                {cat}
              </TabsTrigger>
            ))}
          </TabsList>

          {categories.map((cat) => (
            <TabsContent key={cat} value={cat}>
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-4">
                {allAchievements
                  .filter((a) => a.category === cat)
                  .map((achievement) => {
                    const userAchievement = userAchievements.find(
                      (ua) => ua.achievement_id === achievement.id
                    );
                    return (
                      <div key={achievement.id} className="flex flex-col items-center gap-1">
                        <AchievementBadge
                          achievement={achievement}
                          earned={earnedIds.has(achievement.id)}
                          earnedAt={userAchievement?.earned_at}
                        />
                        <span className="text-xs text-center text-muted-foreground truncate w-full">
                          {achievement.name}
                        </span>
                      </div>
                    );
                  })}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}
