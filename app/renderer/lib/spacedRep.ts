export interface SpacedRepItem {
  id: string;
  prompt: string;
  answer: string;
  interval: number;
  repetitions: number;
  easiness: number;
  due: string;
}

export function createItem(id: string, prompt: string, answer: string): SpacedRepItem {
  return {
    id,
    prompt,
    answer,
    interval: 1,
    repetitions: 0,
    easiness: 2.5,
    due: new Date().toISOString()
  };
}

export function gradeItem(item: SpacedRepItem, quality: 0 | 1 | 2 | 3 | 4 | 5): SpacedRepItem {
  const easiness = Math.max(1.3, item.easiness + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)));
  const repetitions = quality < 3 ? 0 : item.repetitions + 1;
  let interval = 1;
  if (repetitions === 0) {
    interval = 1;
  } else if (repetitions === 1) {
    interval = 1;
  } else if (repetitions === 2) {
    interval = 6;
  } else {
    interval = Math.round(item.interval * easiness);
  }
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + interval);
  return {
    ...item,
    easiness,
    repetitions,
    interval,
    due: dueDate.toISOString()
  };
}

export function dueItems(items: SpacedRepItem[], now: Date = new Date()): SpacedRepItem[] {
  return items.filter((item) => new Date(item.due) <= now).sort((a, b) => new Date(a.due).getTime() - new Date(b.due).getTime());
}
