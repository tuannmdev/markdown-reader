---
title: Bắt đầu nhanh
description: Thêm tài liệu đầu tiên của bạn và xuất bản trong vài phút.
tags: [hướng dẫn, nhanh]
---

# Bắt đầu nhanh

Phần này hướng dẫn bạn thêm một tài liệu mới vào thư viện.

> [!NOTE]
> Mọi file `.md` trong thư mục `content/` đều tự động trở thành một trang. Không cần cấu hình thêm.

## Các bước

- [x] Tạo file `content/ten-tai-lieu.md`
- [x] Viết nội dung bằng Markdown
- [ ] Triển khai lại trang web
- [ ] Chia sẻ đường dẫn cho đồng nghiệp

## Frontmatter tuỳ chọn

Đầu file có thể có một khối thông tin:

```yaml
---
title: Tiêu đề hiển thị
description: Mô tả ngắn cho thẻ tài liệu
order: 5
tags: [ví dụ, mẫu]
---
```

Nếu không có `title`, trang sẽ dùng tiêu đề `#` đầu tiên, rồi đến tên file.

> [!TIP]
> Đặt số ở đầu tên file, như `01-bat-dau.md`, để sắp xếp thứ tự mà không cần `order`.

## Tổ chức thư mục

Thư mục con trở thành nhóm có thể thu gọn. Thêm `_meta.json` để đặt tên có dấu cho nhóm:

```json
{ "title": "Hướng dẫn", "order": 2 }
```

> [!IMPORTANT]
> Tên file và thư mục nên dùng chữ không dấu, viết thường, nối bằng dấu gạch ngang để đường dẫn gọn gàng.

## Lưu ý khi triển khai

> [!WARNING]
> Nội dung được tạo tĩnh lúc build. Sau khi thêm hoặc sửa file, bạn cần triển khai lại để thấy thay đổi.

Xem tiếp [cú pháp Markdown](/docs/huong-dan/cu-phap) để biết những gì được hỗ trợ.
