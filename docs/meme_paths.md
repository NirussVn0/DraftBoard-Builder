# Danh sách tài nguyên Meme cần thiết

Dưới đây là danh sách các Card có sử dụng hiệu ứng Meme (gif/video/image) và đường dẫn tương ứng mà bạn cần thêm file vào thư mục của dự án (cụ thể là vào thư mục `public/assets/memes/`).

| Tên Thẻ (Card ID) | Tên Hiển Thị | Tên File Yêu Cầu | Đường Dẫn Đầy Đủ trong Code | Gợi ý nội dung Meme |
| :--- | :--- | :--- | :--- | :--- |
| **DEADLINE_BOMB** | Quả Bom Deadline | `megumin-explosion.gif` | `/assets/memes/megumin-explosion.gif` | Meme cháy nổ, Megumin (Konosuba) niệm chú Explosion hoặc bom nổ cực mạnh. |
| **ZA_WARUDO** | Za Warudo! | `dio-zawarudo.gif` | `/assets/memes/dio-zawarudo.gif` | Cảnh Dio (JoJo) hô "Za Warudo!", màu sắc chuyển sang âm bản, đồng hồ ngừng trôi. |
| **AMENOTEJIKARA** | Isekai | `isekai.gif` | `/assets/memes/isekai.gif` | Meme Truck-kun tông hoặc cảnh main anime bị chuyển sinh. |
| **COUNTER_ARGUMENT** | Phản Biện | `meliodas-counter.gif` | `/assets/memes/meliodas-counter.gif` | Meme Meliodas (Thất Hình Đại Tội) dùng "Full Counter" hoặc meme giơ thẻ bài lật ngược (Uno Reverse). |
| **BLACKOUT** | Cúp Điện | `blackout.gif` | `/assets/memes/blackout.gif` | Meme phụt tắt đèn (như cúp điện), hoặc meme giật điện nhấp nháy. |
| **POP_QUIZ** | Trả Bài Miệng | `domain-expansion.gif` | `/assets/memes/domain-expansion.gif` | Cảnh Gojo hoặc Sukuna (Jujutsu Kaisen) hô Bành Trướng Lãnh Địa (Domain Expansion). |

## Hướng dẫn thêm file

1. Vào thư mục gốc của project (nơi chứa thư mục `src`).
2. Mở thư mục `public` (nếu chưa có thư mục `assets` thì tạo mới).
3. Trong `assets`, tạo thêm thư mục `memes`.
4. Bỏ các file gif hoặc video/mp4 (bạn có thể dùng cả ảnh tĩnh `.png`, `.jpg` nhưng gif sẽ mang lại cảm giác tốt nhất) và **phải đổi tên chính xác** như cột **Tên File Yêu Cầu** ở bảng trên.
5. Nếu bạn muốn đổi sang file video (mp4), bạn có thể đổi đường dẫn trong file `src/components/PlayMenu/CardEffectOverlay.tsx` để khớp với tên file mp4 của bạn.

> Lời khuyên
> Do hiệu ứng overlay đã được cấu hình chiếm **full màn hình**, bạn nên chọn các ảnh GIF có độ phân giải ngang đủ lớn hoặc chất lượng tốt để khi phóng to không bị vỡ hạt quá mức. Overlay đã được cài sẵn filter `object-cover` để tự động lấp đầy viền đen mà không bị móp méo hình!
