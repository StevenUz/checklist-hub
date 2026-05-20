import { useEffect, useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";

type ChecklistSectionProps = {
  section: {
    id: number;
    title: string;
    items: Array<{
      id: number;
      text: string;
      isCompleted: boolean;
    }>;
  };
  onToggleItem: (itemId: number) => void;
};

export function ChecklistSection({ section, onToggleItem }: ChecklistSectionProps) {
  const isComplete = useMemo(
    () => section.items.length > 0 && section.items.every((item) => item.isCompleted),
    [section.items],
  );
  const [isCollapsed, setIsCollapsed] = useState(isComplete);

  useEffect(() => {
    if (isComplete) {
      setIsCollapsed(true);
    }
  }, [isComplete]);

  return (
    <View className="gap-3 rounded-lg border border-line bg-surface p-4">
      <Pressable onPress={() => setIsCollapsed((current) => !current)} className="flex-row items-center justify-between">
        <Text className={`text-lg font-bold ${isComplete ? "text-brand-700" : "text-ink"}`}>
          {section.title}
        </Text>
        <Text className={`text-xs font-bold uppercase ${isComplete ? "text-brand-700" : "text-muted"}`}>
          {isCollapsed ? "Show" : "Hide"}
        </Text>
      </Pressable>

      {!isCollapsed ? (
        <View className="gap-3">
          {section.items.map((item) => (
            <Pressable
              key={item.id}
              className="flex-row items-center gap-3 rounded-lg border border-slate-100 bg-slate-50 px-3 py-3"
              onPress={() => onToggleItem(item.id)}
            >
              <View
                className={`h-6 w-6 items-center justify-center rounded-full border ${
                  item.isCompleted ? "border-brand-700 bg-brand-700" : "border-slate-300 bg-white"
                }`}
              >
                <Text className={item.isCompleted ? "text-xs font-bold text-white" : "text-xs font-bold text-muted"}>
                  {item.isCompleted ? "✓" : ""}
                </Text>
              </View>
              <Text className={`flex-1 text-sm leading-5 ${item.isCompleted ? "text-brand-700" : "text-ink"}`}>
                {item.text}
              </Text>
              <Text className="text-xs font-bold uppercase text-muted">{item.isCompleted ? "Done" : "Open"}</Text>
            </Pressable>
          ))}
        </View>
      ) : null}
    </View>
  );
}