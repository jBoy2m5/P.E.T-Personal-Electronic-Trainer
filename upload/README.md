# AI Fitness Trainer 🏋️‍♂️

Hệ thống theo dõi và đánh giá tư thế tập luyện (Push-up, Squat, Plank, Handstand) thời gian thực sử dụng Computer Vision (MediaPipe & OpenCV).

## 🚀 Hướng dẫn Cài đặt

Dự án này yêu cầu Python 3.9 - 3.11.

**1. Clone dự án về máy:**
`git clone [Link-GitHub-của-bạn]`

**2. Tạo và kích hoạt môi trường ảo (Khuyên dùng):**
* Trên Windows:
  `python -m venv myenv`
  `.\myenv\Scripts\activate`
* Trên Mac/Linux:
  `python3 -m venv myenv`
  `source myenv/bin/activate`

**3. Cài đặt thư viện:**
`pip install -r requirements.txt`

**4. Chạy ứng dụng:**
`python fitness_app.py`

## 🎮 Cách sử dụng
* Nhấn `1`: Chế độ Strict Push-up (Yêu cầu ngực chạm mốc khuỷu tay).
* Nhấn `2`: Chế độ Squat (Yêu cầu hông song song đầu gối).
* Nhấn `4`: Chế độ Plank (Tích hợp đồng hồ thông minh, dừng đếm khi sai form).
* Nhấn `5`: Chế độ Handstand Push-up.
* Nhấn `Q`: Thoát chương trình.