# P.E.T — Personal Electronic Trainer
### Lõi AI Huấn luyện viên Thể hình Thời gian thực (Edge AI)

Một module theo dõi thể hình AI chuẩn doanh nghiệp, độ trễ thấp, được hỗ trợ bởi **MediaPipe Pose** và **OpenCV**. Hệ thống lõi này phân tích cơ sinh học của con người từ luồng video để đếm số lần tập (reps), tính thời gian giữ tư thế, và cung cấp đánh giá tư thế theo thời gian thực với logic chống gian lận nâng cao cho 5 bài tập.

Được xây dựng như một "hộp đen" thuật toán thuần túy (không phụ thuộc vào giao diện đồ họa), lõi này được thiết kế để dễ dàng tích hợp vào các ứng dụng Web (thông qua WebSockets/FastAPI), ứng dụng Di động (Flutter/React Native), hoặc giao diện máy tính (Desktop).

---

## 🌟 Tính năng Chính

### Hệ thống Auto Focus (Tự động lấy nét)
AI tự động khóa vào người đứng gần **tâm khung hình** nhất — không cần nhấn bất kỳ nút nào. Sau khi khóa, hệ thống theo dõi mục tiêu mượt mà bằng Exponential Moving Average (EMA) và **bỏ qua tất cả người khác** ở phía sau. Nhấn `R` để reset và chuyển sang người khác.

### Kiểm tra Tầm nhìn Thông minh
Mỗi bài tập yêu cầu một bộ khớp cơ thể khác nhau phải hiện rõ trong khung hình. Hệ thống tự động phát hiện khớp nào bị che khuất và đưa ra phản hồi cụ thể (ví dụ: `SHOW FULL BODY!` hoặc `SHOW UPPER BODY!`) dựa trên chế độ bài tập đang chọn.

### Tự động Tạm dừng Timer
Với các bài tập tính thời gian (Plank, Handstand), timer **tự động tạm dừng** khi:
- Người tập rời khỏi khung hình
- Các khớp trọng yếu bị che khuất
- Tư thế sai (ví dụ: hông võng, tay không thẳng)

Timer tự động tiếp tục khi tư thế đúng trở lại — không cần thao tác thủ công.

---

## 💪 Các bài tập được hỗ trợ & Logic chống gian lận

### 1. Push-up / Hít đất (Đếm rep)
**Nhóm cơ mục tiêu:** Ngực, Tay sau (Triceps), Vai trước, Cơ lõi (Core)

| Tính năng | Mô tả |
|---|---|
| **Bộ đếm Rep** | Theo dõi chu kỳ gập/duỗi tay (góc Vai-Khuỷu-Cổ tay) |
| **Lọc tư thế đứng** | Đóng băng bộ đếm nếu người dùng đứng thẳng vẩy tay (`torso_angle < 45°`) |
| **Bảo vệ đường thẳng Plank** | Yêu cầu Vai-Hông-Cá chân tạo đường thẳng (`> 155°`) để chống võng lưng |
| **Kiểm tra độ sâu** | Vai phải hạ xuống ngang bằng khuỷu tay trước khi ghi nhận 1 rep hợp lệ |

**Phản hồi:** `FORM: GOOD` · `PERFECT DEPTH!` · `GO LOWER!` · `WARNING: STANDING!` · `KEEP BODY STRAIGHT!`

---

### 2. Squat (Đếm rep)
**Nhóm cơ mục tiêu:** Đùi trước (Quadriceps), Mông (Glutes), Đùi sau (Hamstrings), Cơ lõi

| Tính năng | Mô tả |
|---|---|
| **Bộ đếm Rep** | Theo dõi góc khớp gối (Hông-Gối-Cá chân) |
| **Độ rộng chân 3D** | Dùng trục Z để tính tỷ lệ mắt cá chân/vai. Cảnh báo nếu quá hẹp (`< 0.8×`) hoặc quá rộng (`> 1.6×`) |
| **Bảo vệ cột sống** | Phát hiện cúi lưng quá nhiều (`back_angle > 65°`) |
| **Quy tắc song song** | Hông phải hạ bằng hoặc thấp hơn đầu gối (trục Y) để loại bỏ half-rep |

**Phản hồi:** `FORM: GOOD` · `PERFECT DEPTH!` · `GO DEEPER!` · `WIDEN STANCE!` · `NARROW STANCE!` · `KEEP CHEST UP!`

---

### 3. Pull-up / Kéo xà (Đếm rep)
**Nhóm cơ mục tiêu:** Lưng xòe (Lats), Tay trước (Biceps), Vai sau, Cẳng tay

| Tính năng | Mô tả |
|---|---|
| **Bộ đếm Rep** | Theo dõi góc tay qua chu kỳ treo → kéo → cằm qua xà |
| **Xác nhận treo** | Yêu cầu cổ tay phải cao hơn vai để xác nhận đang bám xà |
| **Grip width 3D** | Đo tỷ lệ cổ tay/vai trong không gian 3D. Cảnh báo nếu grip hẹp (`< 1.2×`) |
| **Chống Kipping** | Phát hiện đung đưa thân (`torso_angle > 25°`) để chống gian lận bằng quán tính |
| **Chống Air Pull-up** | Khóa vị trí Y của vai khi treo; từ chối rep nếu vai không thực sự di chuyển lên (`< 0.04` displacement) |
| **Cằm qua xà** | Mũi phải chạm mốc xà để tính rep hợp lệ |

**Phản hồi:** `FORM: GOOD` · `CHIN OVER BAR!` · `PULL HIGHER!` · `HANG ON THE BAR!` · `WIDEN GRIP (TARGET LATS)!` · `NO SWINGING! ENGAGE CORE.` · `NO AIR PULL-UPS!`

---

### 4. Plank (Tính giây ⏱️)
**Nhóm cơ mục tiêu:** Cơ lõi (Rectus Abdominis, Transverse Abdominis, Obliques), Vai

| Tính năng | Mô tả |
|---|---|
| **Timer thông minh** | Đếm thời gian giữ (giây). Tự dừng khi sai form, tự chạy lại khi đúng |
| **Lọc tư thế đứng** | Từ chối kích hoạt nếu người dùng đang đứng thẳng (`torso_angle < 45°`) |
| **Giám sát mức hông** | Phát hiện hông võng (`RAISE YOUR HIPS!`) và hông nhô hình chữ V (`LOWER YOUR HIPS!`) |
| **Kiểm tra đường thẳng** | Yêu cầu Vai-Hông-Cá chân thẳng hàng (`> 165°`) để timer được chạy |

**Phản hồi:** `FORM: PERFECT!` · `GET DOWN ON THE FLOOR!` · `RAISE YOUR HIPS!` · `LOWER YOUR HIPS!` · `STRAIGHTEN YOUR LEGS!`

---

### 5. Handstand / Trồng chuối (Tính giây ⏱️)
**Nhóm cơ mục tiêu:** Vai (cả 3 đầu), Tay sau (Triceps), Cơ lõi, Cơ thang (Trapezius)

| Tính năng | Mô tả |
|---|---|
| **Timer thông minh** | Đếm thời gian giữ (giây). Chỉ chạy khi tư thế đúng |
| **Xác nhận lộn ngược** | Kiểm tra hông phải cao hơn vai (trục Y) để xác nhận đang trồng chuối |
| **Đường thẳng Core** | Yêu cầu Vai-Hông-Cá chân thẳng hàng (`> 160°`) |
| **Kiểm tra khóa tay** | Tay phải duỗi thẳng hoàn toàn (`arm_angle > 160°`) để timer được chạy |

**Phản hồi:** `FORM: PERFECT!` · `KICK UP INTO HANDSTAND!` · `KEEP CORE TIGHT!` · `LOCK YOUR ARMS!`

---

## 📡 Định dạng API Response

Mỗi lần gọi `process_frame(frame, mode)` trả về:

```python
{
    "mode": "PUSH-UP",        # Chế độ bài tập hiện tại
    "reps": 12,               # Số rep (Push-up, Squat, Pull-up)
    "timer": 45.23,           # Thời gian giữ bằng giây (Plank, Handstand)
    "feedback": "FORM: GOOD", # Chuỗi phản hồi real-time
    "stage": "up",            # Pha hiện tại (up / down / None)
    "angle": 165,             # Góc khớp chính (độ)
    "is_locked": True,        # Trạng thái Auto Focus (luôn True)
    "raw_landmarks": <object> # Dữ liệu khung xương thô để Frontend vẽ
}
```

---

## 🛠️ Hướng dẫn Cài đặt

### Yêu cầu hệ thống
* Python 3.9, 3.10, hoặc 3.11
* Khuyên dùng môi trường ảo (Virtual Environment)

### Cài đặt
Tải dự án (Clone) về máy và cài đặt các thư viện cần thiết:

```bash
pip install -r requirements.txt
```

### Test nhanh
Chạy chương trình test bằng webcam:

```bash
python test_local.py
```

**Điều khiển:** `1-5` chuyển bài tập · `R` reset focus · `Q` thoát

---

## 📸 Cách đặt Camera

Để AI nhận diện chính xác nhất, hãy tham khảo hướng dẫn đặt góc camera:
- **English:** [CameraGuide_EN.md](CameraGuide_EN.md)
- **Tiếng Việt:** [CameraGuide_VI.md](CameraGuide_VI.md)

---

## 📁 Cấu trúc Dự án

```
upload/
├── ai_core.py            # Lõi AI chính (backend, không phụ thuộc GUI)
├── test_local.py          # Client test webcam (frontend OpenCV)
├── requirements.txt       # Thư viện Python phụ thuộc
├── __init__.py            # Đánh dấu Python package
├── .gitignore             # Quy tắc bỏ qua cho Git
├── README.md              # Tài liệu dự án (Tiếng Anh)
├── README_vi.md           # Tài liệu dự án (Tiếng Việt)
├── CameraGuide_EN.md      # Hướng dẫn đặt camera (Tiếng Anh)
└── CameraGuide_VI.md      # Hướng dẫn đặt camera (Tiếng Việt)
```