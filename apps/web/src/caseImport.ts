import type { CaseCategory, CaseRecord, Gender } from "@smart-care/shared";

const categoryMap: Record<string, CaseCategory> = {
  healthy: "healthy",
  subhealthy: "subhealthy",
  chronic: "chronic",
  健康: "healthy",
  亚健康: "subhealthy",
  慢性病: "chronic"
};

const genderMap: Record<string, Gender> = {
  female: "female",
  male: "male",
  女: "female",
  男: "male"
};

export function parseCaseImportText(text: string, fileName = "cases.csv"): CaseRecord[] {
  const trimmed = text.trim();
  if (!trimmed) return [];

  if (fileName.endsWith(".json") || trimmed.startsWith("[")) {
    const rows = JSON.parse(trimmed) as Array<Partial<CaseRecord>>;
    return rows.map(normalizeCaseRow).filter((item): item is CaseRecord => item !== null);
  }

  return parseCsv(trimmed)
    .map(normalizeCaseRow)
    .filter((item): item is CaseRecord => item !== null);
}

function parseCsv(text: string): Array<Record<string, string>> {
  const lines = text.split(/\r?\n/).filter(Boolean);
  const headers = parseCsvLine(lines[0]).map((header) => header.trim());

  return lines.slice(1).map((line) => {
    const values = parseCsvLine(line);
    return headers.reduce<Record<string, string>>((row, header, index) => {
      row[header] = values[index]?.trim() ?? "";
      return row;
    }, {});
  });
}

function parseCsvLine(line: string) {
  const values: string[] = [];
  let current = "";
  let quoted = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const next = line[index + 1];

    if (char === "\"" && quoted && next === "\"") {
      current += "\"";
      index += 1;
      continue;
    }

    if (char === "\"") {
      quoted = !quoted;
      continue;
    }

    if (char === "," && !quoted) {
      values.push(current);
      current = "";
      continue;
    }

    current += char;
  }

  values.push(current);
  return values;
}

function normalizeCaseRow(row: Partial<CaseRecord> & Record<string, unknown>): CaseRecord | null {
  const category = categoryMap[String(row.category ?? row["分类"] ?? "").trim()];
  const gender = genderMap[String(row.gender ?? row["性别"] ?? "").trim()];
  const name = String(row.name ?? row["名称"] ?? row["案例名称"] ?? "").trim();
  const ageRange = String(row.ageRange ?? row["年龄"] ?? row["年龄段"] ?? "").trim();
  const condition = String(row.condition ?? row["身体状况"] ?? row["状态"] ?? "").trim();

  if (!category || !gender || !name || !ageRange || !condition) return null;

  return {
    id: String(row.id ?? `case-import-${Date.now()}-${Math.random().toString(16).slice(2)}`),
    category,
    name,
    gender,
    ageRange,
    condition,
    diseases: toList(row.diseases ?? row["疾病"] ?? row["疾病种类"]),
    tags: toList(row.tags ?? row["标签"]),
    summary: String(row.summary ?? row["摘要"] ?? row["教学用途"] ?? "")
  };
}

function toList(value: unknown) {
  if (Array.isArray(value)) return value.map(String).map((item) => item.trim()).filter(Boolean);
  return String(value ?? "")
    .split(/[|;；、]/)
    .map((item) => item.trim())
    .filter(Boolean);
}
