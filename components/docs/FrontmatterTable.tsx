import { MarkdownTable } from "@/components/docs/MarkdownTable";
import type { FrontmatterEntry } from "@/lib/frontmatter";

function renderValue(value: string) {
  if (/^https?:\/\/\S+$/i.test(value)) {
    return (
      <a href={value} target="_blank" rel="noopener noreferrer">
        {value}
        <span className="sr-only"> (mở trong tab mới)</span>
      </a>
    );
  }
  return value;
}

export function FrontmatterTable({ entries }: { entries: FrontmatterEntry[] }) {
  if (entries.length === 0) {
    return null;
  }

  return (
    <MarkdownTable>
      <thead>
        <tr>
          <th scope="col">Thuộc tính</th>
          <th scope="col">Giá trị</th>
        </tr>
      </thead>
      <tbody>
        {entries.map((entry) => (
          <tr key={entry.key}>
            <td>{entry.key}</td>
            <td>{renderValue(entry.value)}</td>
          </tr>
        ))}
      </tbody>
    </MarkdownTable>
  );
}
