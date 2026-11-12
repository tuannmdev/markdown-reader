---
title: Bảo mật nội dung
description: HTML thô trong Markdown không bao giờ được thực thi.
tags: [bảo mật]
---

# Bảo mật nội dung

Trang này cố tình chứa mã độc giả định để chứng minh rằng chúng **không** chạy.

## HTML thô bị vô hiệu

Dòng dưới đây chứa một thẻ script và một ảnh có `onerror`. Nếu bạn thấy hộp thoại hiện lên, có lỗi nghiêm trọng:

<script>alert("XSS")</script>

<img src="x" onerror="alert('XSS')">

Các thẻ HTML bị loại bỏ (chỉ giữ lại phần chữ), không bao giờ được thực thi.

## Liên kết nguy hiểm

Liên kết [bấm vào đây](javascript:alert(1)) bị loại bỏ phần địa chỉ nguy hiểm.

## Liên kết ngoài

Liên kết ngoài luôn mở bằng `rel="noopener noreferrer"`, ví dụ [Vercel](https://vercel.com).

> [!CAUTION]
> Đừng bật HTML thô trong Markdown trừ khi bạn đã lọc qua một bộ làm sạch như `rehype-sanitize`.
