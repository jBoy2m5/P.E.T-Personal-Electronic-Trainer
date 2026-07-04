# 📸 Hướng dẫn Đặt Góc Camera
*Tối ưu hóa không gian của bạn để AI nhận diện chuẩn xác nhất.*

---

Để hệ thống AI nhận diện cơ thể 2D/3D hoạt động hoàn hảo, toàn bộ cơ thể bạn phải nằm trong khung hình và các khớp không được tự che khuất lẫn nhau. Hãy tuân thủ các quy tắc vàng sau cho từng bài tập:

### 1. Bài tập Push-up (Hít đất)
* **Góc quay Vàng:** Tuyệt đối giữ góc ngang **90°** (Side-view) so với thân người.
* **Độ cao Camera:** Đặt sát mặt đất, ngang tầm với ngực/bụng khi bạn nằm.
* **Khoảng cách:** 1.5–2.5 mét. Đảm bảo bao quát toàn bộ từ đỉnh đầu đến gót chân.
* **Vị trí đứng:** Đặt mình ở **giữa** khung hình. Hệ thống Auto Focus sẽ tự động khóa vào bạn.
* **Lý do:** Đây là góc duy nhất giúp AI tính toán chính xác biên độ thẳng của cột sống (chống võng lưng), đo lường khoảng cách từ Vai hạ xuống Khuỷu tay theo trục đứng, và phát hiện bạn có hạ đủ sâu hay chưa.
* **⚠️ Lỗi thường gặp:** Quay từ trên xuống hoặc góc 45° — làm méo đường thân người, gây ra cảnh báo giả "KEEP BODY STRAIGHT".

### 2. Bài tập Squat
* **Góc quay Vàng:** Góc chéo **45°** (từ phía trước hơi chếch sang bên) hoặc Góc ngang **90°**.
* **Độ cao Camera:** Đặt ngang tầm thắt lưng (khoảng 80–100 cm từ mặt đất).
* **Khoảng cách:** 2–3 mét. Toàn bộ cơ thể từ đầu đến bàn chân phải nằm trong khung — bao gồm cả bàn chân chạm sàn.
* **Vị trí đứng:** Đứng ở **giữa** khung hình trước khi bắt đầu. Quay chéo so với camera (không quay thẳng mặt).
* **Lý do:** Góc chéo 45° cho phép AI nhìn thấy khoảng cách giữa 2 bàn chân (để đo độ rộng stance) và vẫn thấy rõ sự gấp khúc của đầu gối và hông mà không bị đầu gối bên này che lấp chân bên kia.
* **⚠️ Lỗi thường gặp:** Quay thẳng từ phía trước — hai chân chồng lên nhau, khiến AI không đo được góc gối chính xác. Hoặc đặt camera quá cao, cắt mất bàn chân.

### 3. Bài tập Pull-up (Kéo xà)
* **Góc quay Vàng:** Góc chéo **45°** (từ phía trước chếch sang bên) — tuyệt đối không quay thẳng từ phía trước.
* **Độ cao Camera:** Ngang tầm ngực đến đầu khi bạn đang **treo** (khoảng 120–160 cm từ mặt đất, tùy chiều cao xà).
* **Khoảng cách:** 2–3 mét. Phần trên cơ thể từ tay nắm xà xuống ít nhất đến hông phải nằm trong khung hình.
* **Vị trí đứng:** Đặt sao cho thanh xà nằm ở **giữa-trên** khung hình. Thân người treo ở chính giữa.
* **Lý do:** AI cần nhìn thấy cả độ rộng tay nắm (khoảng cách giữa 2 cổ tay) và sự di chuyển của vai cùng lúc. Quay thẳng từ phía trước sẽ làm khuỷu tay chồng lên cổ tay, không thể đo góc cánh tay. Góc chéo giúp thấy rõ grip width, độ gập khuỷu tay, và vị trí cằm qua xà.
* **⚠️ Lỗi thường gặp:** Đặt camera quá thấp (ngước lên) — làm méo đường vai-cổ tay, gây cảnh báo giả "NO AIR PULL-UPS". Hoặc quay từ phía sau — AI không thấy mặt để kiểm tra vị trí cằm.

### 4. Bài tập Plank
* **Góc quay Vàng:** Tuyệt đối giữ góc ngang **90°** (cách đặt giống hệt Push-up).
* **Độ cao Camera:** Đặt sát mặt đất, ngang tầm với ngực/bụng khi bạn nằm.
* **Khoảng cách:** 1.5–2.5 mét. Toàn bộ cơ thể từ đỉnh đầu đến gót chân phải nằm trong khung hình.
* **Vị trí đứng:** Đặt mình ở giữa khung hình. AI sẽ tự động bấm giờ khi form của bạn đúng.
* **Lý do:** AI đo cơ thể bạn như một đường thẳng từ Vai → Hông → Mắt cá chân. Bất kỳ góc nào khác 90° đều làm méo đường thẳng này và gây ra cảnh báo liên tục "RAISE/LOWER YOUR HIPS" dù form bạn đã chuẩn.
* **⚠️ Lỗi thường gặp:** Quay từ góc phòng hoặc từ trên xuống — làm cho vị trí hông trở nên mơ hồ, AI không phân biệt được giữa hông võng thật và biến dạng phối cảnh.

### 5. Bài tập Handstand (Trồng chuối)
* **Góc quay Vàng:** Góc chéo **45°** hoặc Góc ngang **90°**.
* **Độ cao Camera:** Thấp — khoảng 30–50 cm từ mặt đất (ngang tầm vai khi bạn đang lộn ngược).
* **Khoảng cách:** 2–3 mét. Toàn bộ cơ thể từ tay chống sàn đến bàn chân trên không phải nằm trong khung hình.
* **Vị trí đứng:** Vào tư thế ở **giữa** khung hình. AI sẽ tự bấm giờ khi thân người thẳng và tay khóa cứng.
* **Lý do:** Khi lộn ngược, hai tay sẽ che khuất phần đầu nếu nhìn thẳng từ phía trước. Góc chéo/ngang giúp AI thấy rõ được toàn bộ đường thẳng cơ thể (Vai → Hông → Mắt cá chân) và trạng thái khóa tay. Timer chỉ chạy khi form đúng.
* **⚠️ Lỗi thường gặp:** Camera quá gần — bàn chân bị cắt mất ở phía trên khung hình. Hoặc đặt camera ở chiều cao đứng — nhìn xuống tư thế trồng chuối làm nén đường thân người.

---

### 💡 Mẹo chung (Áp dụng cho TẤT CẢ bài tập)

#### Chiếu sáng (Cực kỳ quan trọng)
**Tránh ngược sáng!** Không đặt camera quay mặt về phía cửa sổ có nắng gắt hoặc nguồn sáng mạnh. Camera ngược sáng sẽ biến cơ thể bạn thành một cái bóng đen (silhouette), làm giảm đi 40% khả năng bắt dính khớp xương của AI. Luôn đảm bảo nguồn sáng hắt **từ phía trước** hoặc chiếu **từ trên xuống** cơ thể bạn.

#### Hệ thống Auto Focus
AI sẽ tự động khóa vào người đứng gần **tâm khung hình** nhất. Bạn không cần nhấn bất kỳ nút nào — chỉ cần đứng ở giữa và bắt đầu tập. Nếu có người khác ở phía sau, họ sẽ được tự động bỏ qua.

#### Trang phục
Mặc **quần áo vừa người** có màu tương phản với nền phía sau. Quần áo rộng thùng thình có thể che khuất vị trí các khớp. Tránh mặc cùng màu với tường/sàn nhà.

#### Nền phía sau
**Nền trơn, gọn gàng** hoạt động tốt nhất. Tránh gương, vật thể di động, hoặc người khác đi qua khung hình trong lúc bạn đang tập.
