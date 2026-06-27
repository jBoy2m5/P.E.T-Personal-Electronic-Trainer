# Lõi AI Huấn luyện viên Thể hình Thời gian thực (Edge AI)

Một module theo dõi thể hình AI chuẩn doanh nghiệp, độ trễ thấp, được hỗ trợ bởi **MediaPipe Pose** và **OpenCV**. Hệ thống lõi này phân tích cơ sinh học của con người từ luồng video để đếm số lần tập (reps), tính thời gian và cung cấp đánh giá tư thế theo thời gian thực (chống gian lận) cho các bài tập nâng cao.

Được xây dựng như một "hộp đen" thuật toán thuần túy (không phụ thuộc vào giao diện đồ họa), lõi này được thiết kế để dễ dàng tích hợp vào các ứng dụng Web (thông qua WebSockets/FastAPI), ứng dụng Di động (Flutter/React Native), hoặc giao diện máy tính (Desktop).

---

## 🌟 Tính năng Chính & Logic Chống Gian lận

### 1. Chống đẩy Chuẩn xác (Strict Push-Up)
* **Bộ đếm Reps:** Theo dõi chu kỳ gập và duỗi tay.
* **Chống gian lận (Lọc tư thế đứng):** Tự động đóng băng và reset nếu người dùng cố tình ăn gian bằng cách đứng thẳng và vẩy tay.
* **Bảo vệ tư thế (Thẳng lưng như Plank):** Bắt buộc cơ thể (Vai - Hông - Mắt cá chân) phải tạo thành một đường thẳng ($> 155^\circ$).
* **Kiểm tra độ sâu:** Đảm bảo ngực/vai hạ xuống ngang bằng với trục khuỷu tay trước khi ghi nhận 1 rep hợp lệ.

### 2. Squat Chuyên nghiệp (Pro-Level Squat)
* **Bộ đếm Reps:** Theo dõi góc thay đổi của khớp gối.
* **Đánh giá độ rộng chân (Không gian 3D):** Sử dụng tọa độ không gian 3 chiều (Trục $Z$) để tính toán chính xác tỷ lệ giữa độ rộng hai mắt cá chân và độ rộng vai. Cảnh báo ngay nếu đứng quá hẹp (`WIDEN STANCE!`) hoặc quá doãng (`NARROW STANCE!`).
* **Bảo vệ cột sống:** Phát hiện lỗi cụp lưng, đổ người về phía trước quá nhiều (`KEEP CHEST UP!`).
* **Kiểm tra độ sâu (Định luật song song):** Đảm bảo hông hạ thấp bằng hoặc thấp hơn đầu gối (Trục $Y$) để loại bỏ hoàn toàn các pha tập "nửa rep" (half-reps).

### 3. Đồng hồ Plank Thông minh (Smart Plank Timer)
* **Đồng hồ Động:** Đếm thời gian thực hiện bằng giây, **tự động tạm dừng** ngay khoảnh khắc người dùng sai tư thế.
* **Chống gian lận:** Từ chối kích hoạt thời gian nếu người dùng đang đứng thẳng.
* **Cảnh báo võng/nhô hông:** Phát hiện và yêu cầu điều chỉnh nếu hông bị võng xuống sàn (`RAISE YOUR HIPS!`) hoặc nhô lên quá cao tạo thành hình chữ V ngược (`LOWER YOUR HIPS!`).

### 4. Trồng chuối Chống đẩy (Handstand Push-Up)
* **Chống gian lận (Lọc lộn ngược):** Xác minh người dùng đang lộn ngược hoàn toàn (Hông nằm cao hơn Vai theo Trục $Y$) để ngăn chặn việc ăn gian bằng tư thế đứng đẩy tạ vai.
* **Cột sống thẳng:** Đảm bảo cơ lõi (core) được siết chặt, không bị võng lưng để bảo vệ thắt lưng.
* **Kiểm tra độ sâu:** Đảm bảo đầu tiến sát mặt đất, vai ngang bằng với khuỷu tay khi hạ người.

---

## 🛠️ Hướng dẫn Cài đặt

### Yêu cầu hệ thống
* Python 3.9, 3.10, hoặc 3.11
* Khuyên dùng môi trường ảo (Virtual Environment)

### Cài đặt
Tải dự án (Clone) về máy và cài đặt các thư viện cần thiết có trong file `requirements.txt`:

```bash
pip install -r requirements.txt