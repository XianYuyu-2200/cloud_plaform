import type { CaseFilters, CaseRecord, LearningResource, ResourceFilters } from "./types";

export function filterCases(cases: CaseRecord[], filters: CaseFilters): CaseRecord[] {
  const keyword = filters.keyword?.trim().toLowerCase();

  return cases.filter((item) => {
    if (filters.category && item.category !== filters.category) return false;
    if (filters.gender && item.gender !== filters.gender) return false;
    if (filters.ageRange && item.ageRange !== filters.ageRange) return false;
    if (filters.disease && !item.diseases.includes(filters.disease)) return false;
    if (filters.tag && !item.tags.includes(filters.tag)) return false;
    if (keyword) {
      const searchable = [item.name, item.condition, item.summary, ...item.diseases, ...item.tags]
        .join(" ")
        .toLowerCase();
      if (!searchable.includes(keyword)) return false;
    }
    return true;
  });
}

export function filterResources(resources: LearningResource[], filters: ResourceFilters): LearningResource[] {
  const keyword = filters.keyword?.trim().toLowerCase();

  return resources.filter((item) => {
    if (filters.type && item.type !== filters.type) return false;
    if (filters.bodyPart && item.bodyPart !== filters.bodyPart) return false;
    if (filters.difficulty && item.difficulty !== filters.difficulty) return false;
    if (filters.audience && item.audience !== filters.audience) return false;
    if (filters.equipment && item.equipment !== filters.equipment) return false;
    if (keyword) {
      const searchable = [
        item.title,
        item.bodyPart,
        item.audience,
        item.equipment,
        ...item.keyPoints,
        ...item.cautions
      ]
        .join(" ")
        .toLowerCase();
      if (!searchable.includes(keyword)) return false;
    }
    return true;
  });
}
