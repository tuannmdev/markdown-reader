import { useId } from "react";
import { IconSearch } from "@/components/ui/IconSearch";
import styles from "@/components/docs/DocSearch.module.css";

interface DocSearchProps {
  value: string;
  onChange: (value: string) => void;
}

export function DocSearch({ value, onChange }: DocSearchProps) {
  const id = useId();

  return (
    <div className={styles.search}>
      <label htmlFor={id} className="sr-only">
        Tìm tài liệu theo tiêu đề
      </label>
      <IconSearch className={styles.icon} size={16} />
      <input
        id={id}
        type="search"
        className={styles.input}
        placeholder="Tìm tài liệu…"
        autoComplete="off"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}
