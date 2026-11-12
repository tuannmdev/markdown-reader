"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import { IconButton } from "@/components/ui/IconButton";
import { IconClose } from "@/components/ui/IconClose";
import { IconTextSize } from "@/components/ui/IconTextSize";
import { prefsStore, type FontSize, type LineWidth } from "@/lib/prefs";
import styles from "@/components/docs/ReadingPrefs.module.css";

const SIZES: { value: FontSize; label: string }[] = [
  { value: 1, label: "Nhỏ" },
  { value: 2, label: "Vừa" },
  { value: 3, label: "Lớn" },
];

const WIDTHS: { value: LineWidth; label: string }[] = [
  { value: "narrow", label: "Hẹp" },
  { value: "normal", label: "Vừa" },
  { value: "wide", label: "Rộng" },
];

export function ReadingPrefs() {
  const prefs = useSyncExternalStore(prefsStore.subscribe, prefsStore.getSnapshot, prefsStore.getServerSnapshot);
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    document.documentElement.dataset.fs = String(prefs.size);
    document.documentElement.dataset.lw = prefs.width;
  }, [prefs]);

  function close(): void {
    dialogRef.current?.close();
  }

  return (
    <>
      <IconButton label="Tuỳ chỉnh hiển thị chữ" aria-haspopup="dialog" onClick={() => dialogRef.current?.showModal()}>
        <IconTextSize />
      </IconButton>
      <dialog
        ref={dialogRef}
        className={styles.dialog}
        aria-labelledby="reading-prefs-title"
        onClick={(event) => {
          if (event.target === dialogRef.current) {
            close();
          }
        }}
      >
        <div className={styles.head}>
          <h2 id="reading-prefs-title" className={styles.title}>
            Hiển thị chữ
          </h2>
          <IconButton label="Đóng" onClick={close}>
            <IconClose />
          </IconButton>
        </div>

        <fieldset className={styles.group}>
          <legend className={styles.legend}>Cỡ chữ</legend>
          <div className={styles.options}>
            {SIZES.map((option) => (
              <label key={option.value} className={styles.option}>
                <input
                  type="radio"
                  name="font-size"
                  className="sr-only"
                  checked={prefs.size === option.value}
                  onChange={() => prefsStore.set({ ...prefs, size: option.value })}
                />
                <span className={styles.pill}>{option.label}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className={styles.group}>
          <legend className={styles.legend}>Độ rộng dòng</legend>
          <div className={styles.options}>
            {WIDTHS.map((option) => (
              <label key={option.value} className={styles.option}>
                <input
                  type="radio"
                  name="line-width"
                  className="sr-only"
                  checked={prefs.width === option.value}
                  onChange={() => prefsStore.set({ ...prefs, width: option.value })}
                />
                <span className={styles.pill}>{option.label}</span>
              </label>
            ))}
          </div>
        </fieldset>
      </dialog>
    </>
  );
}
