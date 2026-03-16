# 樟庭徊路 🌙

Một blog cá nhân **Astro** dựa trên template **Fuwari** đã được tùy chỉnh, hiện đang lưu trữ những giấc mơ, những lời tâm sự và sáng tạo của <span style="color: #87CEFA; font-weight: 700;">琴泠</span>.

---

## Mục lục

- [Về dự án](#về-dự-án)
- [Tính năng gốc của Fuwari](#tính-năng-gốc-của-fuwari)
- [Nội dung tôi đã tùy chỉnh](#nội-dung-tôi-đã-tùy-chỉnh)
- [Tech Stack](#tech-stack)
- [Chạy cục bộ](#chạy-cục-bộ)
- [Cấu trúc nội dung](#cấu-trúc-nội-dung)
- [Giấy phép](#giấy-phép)

---

## Về dự án

Đây là một trang web kiểu vườn riêng đang được bảo trì. Tôi sử dụng nó để lưu trữ những thứ không phù hợp để đăng trên nền tảng công cộng:

- Những suy nghĩ chưa chín muồi nhưng chân thật
- Thế giới quan bị gián đoạn
- Nguyên mẫu trò chơi và câu chuyện
- Thử nghiệm code
- Và những điều chỉ muốn nói với chính mình
- Nhật ký và tác phẩm cá nhân

Bạn có thể hiểu đây là: **Blog + Tâm sự + Kho sáng tạo + Ghi chú nội tâm**

---

## Tính năng gốc của Fuwari

Dự án này được xây dựng trên template [saicaca/fuwari](https://github.com/saicaca/fuwari), template gốc cung cấp các tính năng cốt lõi sau:

### Tính năng cốt lõi
- Xây dựng trên nền tảng site tĩnh **Astro**
- Hệ thống style **Tailwind CSS**
- Animation mượt mà và chuyển trang (dựa trên Swup)
- Chuyển đổi theme sáng/tối
- Màu theme và Banner tùy chỉnh được
- Thiết kế responsive
- Tìm kiếm trong trang (dựa trên Pagefind)
- cú pháp Markdown mở rộng
- Mục lục (TOC)
- Đăng ký RSS

### Cấu trúc trang gốc
- Trang chủ (danh sách bài viết)
- Trang lưu trữ
- Trang giới thiệu
- Trang chi tiết bài viết

---

## Những gì tôi đã viết lại:

### Trang mới và loại nội dung

#### 1. 叙梦协定 (`/dream`)
Trang chuyên dụng để ghi lại giấc mơ. Nơi giấc mơ và thực tế giao nhau, lưu giữ những thế giới kỳ lạ xuất hiện trong giấc ngủ.

> Những thứ thoáng qua, nếu không cẩn thận giữ lại, sẽ mãi mất đi.

#### 2. 心灵碎片 (`/rant`)
Nơi lưu trữ những lời than vãn ngắn, mảnh cảm xúc, suy nghĩ nhất thời. Nói gì đó tùy theo tâm trạng. Phần này sẽ không hiển thị mục bài viết với tiêu đề, mà hiển thị đầy đủ bỏ qua thông tin tiêu đề, nhưng bạn vẫn có thể truy cập trang bài viết qua URL tương ứng (các mục bài viết có trường "mess" sẽ không vào trang lưu trữ)

#### 3. 回廊画架 (`gallery`)

Phần chức năng lưu trữ tác phẩm hội họa cá nhân, sử dụng bố cục giống pixiv. Image hosting là `postimg`, yêu cầu file md phải có title img, nếu không sẽ không hiển thị.

#### 4. 截光求影 (`photo`)

Nơi lưu trữ tác phẩm nhiếp ảnh cá nhân, đang trong quá trình phát triển, hãy chờ đợi.

#### 5. Menu 剪影

Thêm menu thả xuống "剪影" vào thanh điều hướng, tích hợp quyền truy cập vào các trang đặc biệt khác nhau. Có thể sẽ thêm mục mới trong tương lai tùy theo việc bảo trì. 剪影 đã được điều chỉnh bố cục cho thiết bị di động, có thể nhấp để mở rộng.

### Mở rộng phân loại nội dung

Thêm trường `mood` để ghi lại tâm trạng khi tạo mỗi bài viết.

Trường `mood` tương ứng với sáu cảm xúc, mỗi cảm xúc có mã hex:

```
Cảm xúc tích cực:
平和 Hồng
振奋 Cam
开心 Xanh

Cảm xúc tiêu cực:
怨恨 Tím
烦躁 Đỏ
消沉 Xám
```

Nếu bạn muốn thêm màu khác, hãy kiểm tra đoạn code tương ứng trong .astro (tôi đã viết comment rồi)

### Cách tổ chức nội dung

- **Bài viết blog**: Bài viết kỹ thuật, nội dung dài, nội dung đã được sắp xếp

- **Giấc mơ (dream)**: Ghi lại giấc mơ, được phân loại bằng tag `dream`

- **Tâm sự (message)**: Những lời than vãn ngắn, mảnh cảm xúc, được phân loại bằng tag `mess`, file md có trường `mess` sẽ không vào lưu trữ. Tâm sự có trường mood với mã hex tương ứng, bảng màu tương ứng là:

  ```typescript
  焦躁: "#E06C75",
  消沉: "#7F8C8D",
  怨恨: "#C792EA",
  开心: "#3CB371",
  平和: "#FFB6C1",
  振奋: "#F4A460",
  ```

  Nếu thêm trường không tồn tại, sẽ sử dụng màu style global của astro.

  > Khuyến nghị mạnh mẽ tạo mã hex mới.

- **Ảnh (photo)**: Tác phẩm nhiếp ảnh, được phân loại bằng tag `photo`, file md có trường `photo` sẽ không vào lưu trữ
- **Gallery (gallery)**: Tác phẩm hội họa, được phân loại bằng tag `gallery`, file md có trường `gallery` sẽ không vào lưu trữ

### Liên kết mạng xã hội

Tích hợp liên kết mạng xã hội cá nhân:
- Bilibili
- Bangumi (sử dụng icon SVG tùy chỉnh, đã sử dụng icon SVG cục bộ)
- Pixiv
- Steam
- GitHub

---

Đang thử phát triển mục友链

## Tech Stack

| Công nghệ | Sử dụng |
|-----------|----------|
| Astro | Framework site tĩnh |
| Tailwind CSS | Hệ thống style |
| Svelte | Component tương tác |
| Swup | Animation chuyển trang |
| Pagefind | Tìm kiếm trong trang |
| KaTeX | Render công thức toán học |
| Expressive Code | Nâng cao code block |
| Markdown / MDX | Viết nội dung |

---

## Chạy cục bộ

```bash
# Cài đặt dependencies (cần pnpm >= 9)
pnpm install
# Khởi động server phát triển
pnpm dev
# Tạo bài viết mới
pnpm new-post <filename>
# Build phiên bản production
pnpm build
# Xem trước kết quả build
pnpm preview
# Kiểm tra code
pnpm check
# Định dạng code
pnpm format
```

---

## Cấu trúc nội dung

```
src/
├── assets/           # Tài nguyên tĩnh
│   ├── images/       # Tài nguyên hình ảnh
│   └── svg/         # Icon SVG tùy chỉnh
├── components/       # Component
│   ├── DreamPage.astro      # Component trang giấc mơ (mới)
│   ├── RantPage.astro       # Component trang tâm sự (mới)
│   └── widget/
│       └── SilhouetteDropdown.astro  # Menu thả xuống 剪影 (mới)
├── content/          # File nội dung
│   ├── posts/        # Bài viết
│   │   ├── dream/    # Thư mục bài viết giấc mơ (mới)
│   │   └── message/  # Thư mục bài viết tâm sự (mới)
│   └── spec/         # Nội dung trang đặc biệt
├── layouts/          # Layout
├── pages/           # Route trang
│   ├── dream/[...page].astro  # Trang danh sách giấc mơ (mới)
│   └── rant/[...page].astro   # Trang danh sách tâm sự (mới)
├── styles/           # File style
├── utils/           # Hàm tiện ích
│   ├── dream-utils.ts    # Xử lý nội dung giấc mơ (mới)
│   └── mess-utils.ts     # Xử lý nội dung tâm sự (mới)
└── config.ts         # Cấu hình trang
```

### Frontmatter bài viết

```yaml
---
title: Tiêu đề bài viết
published: 2024-01-01
description: Mô tả bài viết
image: ./cover.jpg
tags: [dream]      # dream: giấc mơ, mess: tâm sự
category: Danh mục
draft: false
mood: 焦躁          # Tâm trạng (trường mới), chỉ dùng cho phần tâm sự
lang: zh_CN
---
---

## Lời cảm ơn

- [Fuwari](https://github.com/saicaca/fuwari) - Template blog tuyệt vời
- [Astro](https://astro.build) - Framework site tĩnh mạnh mẽ
- Vilstia - Người bạn tốt nhất của tôi

---

## Giấy phép

Nội dung dự án này được cấp phép theo [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/).

Template gốc của Fuwari sử dụng MIT License, xem [Fuwari License](https://github.com/saicaca/fuwari/blob/main/LICENSE) để biết chi tiết.
