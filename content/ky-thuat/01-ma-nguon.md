---
title: Khối mã nguồn
description: Tô màu cú pháp cho nhiều ngôn ngữ, kèm nút sao chép.
tags: [mã nguồn, ví dụ]
---

# Khối mã nguồn

Mỗi khối mã có nhãn ngôn ngữ và nút **Sao chép**. Dòng quá dài sẽ cuộn ngang bên trong khối, không làm trang bị tràn.

## TypeScript

```ts
interface Doc {
  title: string;
  minutes: number;
}

export function label(doc: Doc): string {
  return `${doc.title} (~${doc.minutes} phút đọc)`;
}
```

## Python

```python
def reading_time(text: str, wpm: int = 200) -> int:
    words = len(text.split())
    return max(1, -(-words // wpm))  # làm tròn lên

print(reading_time("Xin chào thế giới"))
```

## Bash

```bash
npm install
npm run dev
# mở http://localhost:3000
```

## JSON, CSS và SQL

```json
{ "name": "markdown-reader", "private": true }
```

```css
.card {
  border: 1px solid #3a372e;
  border-radius: 8px;
}
```

```sql
SELECT title, minutes FROM docs WHERE minutes < 10 ORDER BY title;
```

## Dòng rất dài

```text
Đây là một dòng rất dài để kiểm tra việc cuộn ngang nằm bên trong khối mã chứ không làm cả trang bị tràn ra ngoài màn hình nhỏ.
```

Mã trong dòng như `npm run build` hiển thị trên nền nhạt hơn một chút.
