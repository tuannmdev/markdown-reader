# Markdown Reader

Trang đọc Markdown tối giản (Next.js App Router, TypeScript strict, CSS Modules). Nền đen ấm có hạt phim, một màu nhấn vàng, không backend, không biến môi trường.

## Chạy cục bộ

```bash
npm install
npm run dev      # http://localhost:3000
npm run lint
npm run build && npm start
```

## Triển khai

Import repo vào Vercel (không cần cấu hình), hoặc chạy `vercel` trong thư mục dự án. Mọi trang được tạo tĩnh.

## Thêm tài liệu mới

1. Tạo file `content/ten-tai-lieu.md` (hoặc trong thư mục con, ví dụ `content/huong-dan/`).
2. Tuỳ chọn thêm frontmatter: `title`, `description`, `order`, `tags`. Thiếu `title` thì dùng `# heading` đầu tiên, rồi tên file.
3. Tiền tố số (`01-bat-dau.md`) dùng để sắp xếp và được bỏ khỏi URL.
4. Đặt tên có dấu cho thư mục bằng `content/<thu-muc>/_meta.json`: `{ "title": "Hướng dẫn", "order": 2 }`.
5. Triển khai lại.

Ảnh đặt trong `public/` và gọi bằng đường dẫn tuyệt đối (`/images/a.svg`). Nếu có `public/deep-work.svg`, trang chủ sẽ hiển thị minh hoạ cạnh phần hero.

## Sách từ thư mục (`/books`)

Backend là Supabase (Edge Functions `markdown-reader-*`). Sao chép `.env.example` thành `.env.local` và điền `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (chỉ dùng anon/publishable key, không bao giờ dùng service role key).

- Đăng nhập bằng email/mật khẩu (Supabase Auth). Tài khoản phải được owner mời vào app; lần đăng nhập đầu app tự chấp nhận lời mời, nếu không có lời mời sẽ báo chưa được cấp quyền.
- Chọn hoặc kéo thả cả một thư mục Markdown. Mục lục lấy từ `README.md` (hoặc `index.md`, `SUMMARY.md`), không có thì dùng cấu trúc thư mục. Link tương đối giữa các trang được nối lại theo đường dẫn file.
- Sách nhỏ gửi trong một request; sách lớn gửi chia lô (có tiến độ, nút hủy) và chỉ tải các trang mới hoặc đã đổi. Có thể chọn "Tạo sách mới" hoặc "Cập nhật sách" đã có.
- Chia sẻ công khai: nút "Chia sẻ công khai" trên thẻ sách cho link `/read/<bookId>`, người chưa đăng nhập vẫn đọc được.
- Một trang được nhận diện bằng `path` (`?p=`), không dùng node id vì node id đổi mỗi lần cập nhật sách.
- Lệnh: `npm run lint`, `npm run typecheck`, `npm test`.

## Cấu trúc chính

```
app/            layout, home, docs/[...slug], open, not-found, error, globals.css
components/     site/ docs/ books/ auth/ open/ ui/  (mỗi component một file + .module.css)
lib/            content.ts (đọc content/), toc.ts, filterTree.ts, prefs/history (localStorage), api/ (client Supabase), book/ (dựng sách)
content/        tài liệu mẫu
```

## Kiểm tra thủ công

- [ ] Trang chủ: nút "Mở tài liệu đầu tiên" và "Mở file .md" hoạt động.
- [ ] Tài liệu: cây thư mục thu gọn được, ô tìm kiếm lọc theo tiêu đề (không cần gõ dấu).
- [ ] Mục lục "Trên trang này" đổi mục vàng khi cuộn; thanh tiến độ vàng chạy.
- [ ] Khối mã: "Sao chép" đổi thành "Đã sao chép".
- [ ] Dưới 1100px: nút "Danh sách tài liệu" mở ngăn kéo; Esc đóng.
- [ ] Nút Aa: đổi cỡ chữ và độ rộng dòng, giữ sau khi tải lại; Esc đóng.
- [ ] /open: kéo thả hoặc dán Markdown; lịch sử tối đa 10; "Xóa lịch sử" xoá hết.
- [ ] Trang "Bảo mật nội dung": không có hộp thoại alert nào hiện lên.
- [ ] Chỉ dùng bàn phím: skip link, tiêu điểm vàng luôn thấy.

## Hạn chế đã biết

- Nội dung tạo lúc build; thêm/sửa file cần triển khai lại.
- HTML thô trong Markdown bị vô hiệu hoàn toàn (không bật `rehype-raw`), nên không có thẻ HTML tuỳ ý.
- Ảnh từ URL ngoài trong file mở ở `/open` vẫn do trình duyệt tải (chỉ nội dung file là không tải lên).
- Lịch sử `/open` lưu trong localStorage, bị giới hạn dung lượng ~5 MB; nếu đầy hoặc bị chặn, lịch sử chỉ giữ trong phiên.
- Chưa chạy Lighthouse tự động; cần kiểm tra thủ công.
