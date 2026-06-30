import cv2
import mediapipe as mp
import numpy as np
import time  # Thư viện để làm bộ đếm thời gian

mp_drawing = mp.solutions.drawing_utils
mp_pose = mp.solutions.pose

def calculate_angle(a, b, c):
    a, b, c = np.array(a), np.array(b), np.array(c)
    radians = np.arctan2(c[1]-b[1], c[0]-b[0]) - np.arctan2(a[1]-b[1], a[0]-b[0])
    angle = np.abs(radians*180.0/np.pi)
    if angle > 180.0: angle = 360 - angle
    return angle

cap = cv2.VideoCapture(0)

# --- BIẾN HỆ THỐNG TRUNG TÂM ---
app_mode = "MENU"
counter = 0
stage = None
form_feedback = ""

# --- BIẾN RIÊNG CHO PLANK ---
total_plank_time = 0      # Tổng thời gian đã plank đúng form
plank_start_time = 0      # Mốc thời gian bắt đầu đếm
is_planking = False       # Trạng thái cờ (Flag) xem có đang đúng form không
display_time = 0          # Thời gian hiển thị ra màn hình

with mp_pose.Pose(min_detection_confidence=0.7, min_tracking_confidence=0.7) as pose:
    while cap.isOpened():
        ret, frame = cap.read()
        if not ret: break
        
        frame = cv2.flip(frame, 1)
        image = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        image.flags.writeable = False 
        results = pose.process(image)
        image.flags.writeable = True
        image = cv2.cvtColor(image, cv2.COLOR_RGB2BGR)
        
        if results.pose_landmarks:
            for i in range(11):
                results.pose_landmarks.landmark[i].visibility = 0.0

        # ==========================================
        # MÀN HÌNH MENU CHÍNH
        # ==========================================
       # ==========================================
        # MÀN HÌNH MENU CHÍNH
        # ==========================================
        if app_mode == "MENU":
            cv2.rectangle(image, (0, 0), (640, 480), (0, 0, 0), -1)
            cv2.putText(image, "AI FITNESS TRAINER", (120, 80), cv2.FONT_HERSHEY_SIMPLEX, 1.2, (255, 255, 255), 3, cv2.LINE_AA)
            cv2.putText(image, "Press '1' - STRICT PUSH-UP", (150, 150), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 0), 2, cv2.LINE_AA)
            cv2.putText(image, "Press '2' - SQUAT", (150, 200), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 0), 2, cv2.LINE_AA)
            cv2.putText(image, "Press '4' - PLANK TIMER", (150, 250), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 255), 2, cv2.LINE_AA)
            
            # --- TÍNH NĂNG MỚI ĐƯỢC THÊM VÀO ---
            cv2.putText(image, "Press '5' - HANDSTAND PUSH-UP", (150, 300), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (255, 100, 100), 2, cv2.LINE_AA)
            
            cv2.putText(image, "Press 'Q' to Quit", (200, 450), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 0, 255), 1, cv2.LINE_AA)
        # ==========================================
        # LOGIC CÁC BÀI TẬP
        # ==========================================
        elif results.pose_landmarks:
            landmarks = results.pose_landmarks.landmark
            
            
            # --- CHẾ ĐỘ PLANK ---
            if app_mode == "PLANK":
                shoulder = [landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER.value].x, landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER.value].y]
                hip = [landmarks[mp_pose.PoseLandmark.LEFT_HIP.value].x, landmarks[mp_pose.PoseLandmark.LEFT_HIP.value].y]
                ankle = [landmarks[mp_pose.PoseLandmark.LEFT_ANKLE.value].x, landmarks[mp_pose.PoseLandmark.LEFT_ANKLE.value].y]
                
                # 1. Tính độ thẳng của trục cơ thể
                body_angle = calculate_angle(shoulder, hip, ankle)
                
                # 2. LỚP BẢO VỆ MỚI: Tính độ nghiêng cơ thể so với trục dọc (Chống đứng thẳng)
                torso_angle = calculate_angle(shoulder, hip, [hip[0], 0.0])
                
                # 3. Trọng tài Plank
                if torso_angle < 45:
                    # Lỗi 1: Đang đứng hoặc chưa nằm hẳn xuống sàn
                    form_feedback = "GET DOWN ON THE FLOOR!"
                    if is_planking:
                        is_planking = False
                        total_plank_time += (time.time() - plank_start_time)
                else:
                    # Đã nằm xuống sàn, bắt đầu chấm điểm Form
                    ref_y = (shoulder[1] + ankle[1]) / 2 
                    
                    if body_angle > 165:
                        form_feedback = "FORM: PERFECT!"
                        if not is_planking:
                            is_planking = True
                            plank_start_time = time.time()
                        # Cập nhật thời gian hiển thị liên tục
                        display_time = total_plank_time + (time.time() - plank_start_time)
                    else:
                        # Sai form (Võng lưng hoặc nhô mông) -> Đóng băng thời gian
                        if is_planking:
                            is_planking = False
                            total_plank_time += (time.time() - plank_start_time)
                        
                        # Bắt lỗi chi tiết
                        if hip[1] < ref_y - 0.05: # Trừ hao 0.05 để tránh báo lỗi quá nhạy
                            form_feedback = "LOWER YOUR HIPS!" 
                        elif hip[1] > ref_y + 0.05:
                            form_feedback = "RAISE YOUR HIPS!" 
                        else:
                            form_feedback = "STRAIGHTEN YOUR LEGS!"

                            
            # --- CHẾ ĐỘ HANDSTAND PUSH-UP (TRỒNG CHUỐI CHỐNG ĐẨY) ---
            elif app_mode == "HANDSTAND":
                shoulder = [landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER.value].x, landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER.value].y]
                elbow = [landmarks[mp_pose.PoseLandmark.LEFT_ELBOW.value].x, landmarks[mp_pose.PoseLandmark.LEFT_ELBOW.value].y]
                wrist = [landmarks[mp_pose.PoseLandmark.LEFT_WRIST.value].x, landmarks[mp_pose.PoseLandmark.LEFT_WRIST.value].y]
                hip = [landmarks[mp_pose.PoseLandmark.LEFT_HIP.value].x, landmarks[mp_pose.PoseLandmark.LEFT_HIP.value].y]
                ankle = [landmarks[mp_pose.PoseLandmark.LEFT_ANKLE.value].x, landmarks[mp_pose.PoseLandmark.LEFT_ANKLE.value].y]
                
                arm_angle = calculate_angle(shoulder, elbow, wrist)
                body_angle = calculate_angle(shoulder, hip, ankle)
                
                # 1. BỘ LỌC CHỐNG GIAN LẬN: XÁC NHẬN TRẠNG THÁI LỘN NGƯỢC
                # Trục Y hướng xuống. Lộn ngược nghĩa là Hông phải nằm phía trên Vai.
                if hip[1] > shoulder[1]:
                    form_feedback = "KICK UP INTO HANDSTAND!" # Bắt buộc phải đá chân lên tường/trời
                    stage = None
                
                # 2. BỘ LỌC FORM CHUẨN: Lưng phải thẳng
                elif body_angle < 160:
                    form_feedback = "KEEP CORE TIGHT!" # Không được cong lưng hình quả chuối
                    stage = None
                    
                # 3. TRỌNG TÀI BẮT ĐỘ SÂU & ĐẾM REP
                else:
                    form_feedback = "FORM: GOOD"
                    
                    # Pha 1: Đẩy lên (Khóa khớp tay > 150 độ)
                    if arm_angle > 150:
                        if stage == 'down':
                            counter += 1
                        stage = "up"
                        
                    # Pha 2: Hạ người xuống
                    elif arm_angle < 110:
                        # KIỂM TRA ĐỘ SÂU: Vai và Khuỷu tay song song
                        # Khi hạ người trồng chuối, Vai đi xuống gần mặt đất -> Y_Vai tiến dần tới Y_Khuỷu_tay
                        if shoulder[1] >= (elbow[1] - 0.05):
                            stage = "down"
                            form_feedback = "PERFECT DEPTH!"
                        elif stage != 'down':
                            form_feedback = "GO LOWER!"

            # --- CHẾ ĐỘ STRICT PUSH-UP (SIẾT CHẶT FORM & ĐỘ SÂU) ---
            elif app_mode == "PUSH-UP":
                shoulder = [landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER.value].x, landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER.value].y]
                elbow = [landmarks[mp_pose.PoseLandmark.LEFT_ELBOW.value].x, landmarks[mp_pose.PoseLandmark.LEFT_ELBOW.value].y]
                wrist = [landmarks[mp_pose.PoseLandmark.LEFT_WRIST.value].x, landmarks[mp_pose.PoseLandmark.LEFT_WRIST.value].y]
                hip = [landmarks[mp_pose.PoseLandmark.LEFT_HIP.value].x, landmarks[mp_pose.PoseLandmark.LEFT_HIP.value].y]
                ankle = [landmarks[mp_pose.PoseLandmark.LEFT_ANKLE.value].x, landmarks[mp_pose.PoseLandmark.LEFT_ANKLE.value].y]
                
                # Tính các góc quan trọng
                arm_angle = calculate_angle(shoulder, elbow, wrist) # Đo độ gập tay
                body_angle = calculate_angle(shoulder, hip, ankle)  # Đo độ thẳng lưng
                torso_angle = calculate_angle(shoulder, hip, [hip[0], 0.0]) # Đo độ nghiêng cơ thể so với trục dọc
                
                # 1. BỘ LỌC CHỐNG ĐỨNG THẲNG
                if torso_angle < 45:
                    form_feedback = "WARNING: STANDING!"
                    stage = None # Hủy ngay chu kỳ nếu phát hiện đứng
                    
                # 2. BỘ LỌC CHỐNG VÕNG LƯNG (Phải thẳng như Plank)
                elif body_angle < 155:
                    form_feedback = "KEEP BODY STRAIGHT!"
                    stage = None 
                    
                # 3. TRỌNG TÀI BẮT ĐỘ SÂU & ĐẾM REP
                else:
                    form_feedback = "FORM: GOOD"
                    
                    # Pha 1: Đẩy lên (Tay duỗi thẳng > 160 độ)
                    if arm_angle > 160:
                        if stage == 'down': 
                            counter += 1
                        stage = "up"
                        
                    # Pha 2: Hạ người (Bắt đầu khuỵu tay < 110 độ)
                    elif arm_angle < 110:
                        # KIỂM TRA ĐỘ SÂU: Trục Y của Vai phải tiến sát đến Y của Khuỷu tay
                        # (Trừ hao 0.05 vì vai hiếm khi chạm hẳn xuống đường ngang của cùi chỏ)
                        if shoulder[1] >= (elbow[1] - 0.05):
                            stage = "down"
                            form_feedback = "PERFECT DEPTH!"
                        elif stage != 'down':
                            # Nếu đang gập tay nhưng Vai chưa xuống đủ sâu
                            form_feedback = "GO LOWER!"

                            
            # --- (Bạn có thể copy lại đoạn SQUAT PRO-LEVEL vào đây nếu muốn dùng tiếp) ---
# --- CHẾ ĐỘ SQUAT (PRO LEVEL) ---
            if app_mode == "SQUAT":
                # 1. Trích xuất mốc cơ thể (Lấy cả 2 bên Trái/Phải để đo khoảng cách 3D)
                l_sh = landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER.value]
                r_sh = landmarks[mp_pose.PoseLandmark.RIGHT_SHOULDER.value]
                l_ankle = landmarks[mp_pose.PoseLandmark.LEFT_ANKLE.value]
                r_ankle = landmarks[mp_pose.PoseLandmark.RIGHT_ANKLE.value]
                
                # Tọa độ 2D góc nghiêng (Dùng thân trái làm chuẩn)
                hip = [landmarks[mp_pose.PoseLandmark.LEFT_HIP.value].x, landmarks[mp_pose.PoseLandmark.LEFT_HIP.value].y]
                knee = [landmarks[mp_pose.PoseLandmark.LEFT_KNEE.value].x, landmarks[mp_pose.PoseLandmark.LEFT_KNEE.value].y]
                ankle = [landmarks[mp_pose.PoseLandmark.LEFT_ANKLE.value].x, landmarks[mp_pose.PoseLandmark.LEFT_ANKLE.value].y]
                shoulder = [landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER.value].x, landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER.value].y]
                
                # 2. Tính toán Động học (Kinematics)
                knee_angle = calculate_angle(hip, knee, ankle)
                back_angle = calculate_angle(shoulder, hip, [hip[0], 0.0])
                
                # Tính khoảng cách 3D (Bao gồm trục X, Y và Z) bằng định lý Pytago không gian
                shoulder_width = np.sqrt((l_sh.x - r_sh.x)**2 + (l_sh.y - r_sh.y)**2 + (l_sh.z - r_sh.z)**2)
                stance_width = np.sqrt((l_ankle.x - r_ankle.x)**2 + (l_ankle.y - r_ankle.y)**2 + (l_ankle.z - r_ankle.z)**2)
                
                # Lập tỷ lệ: Độ rộng chân / Độ rộng vai
                stance_ratio = stance_width / (shoulder_width + 0.0001) # Cộng 0.0001 để chống lỗi chia cho 0

                # 3. TRỌNG TÀI BẮT LỖI (Form Validator)
                form_feedback = "FORM: GOOD"
                
                # LỖI 1: Khoảng cách chân (Chỉ check khi đang đứng thẳng chuẩn bị)
                if knee_angle > 150: 
                    if stance_ratio < 0.8:
                        form_feedback = "WIDEN STANCE!" # Chân đứng quá chụm
                    elif stance_ratio > 1.6:
                        form_feedback = "NARROW STANCE!" # Chân đứng quá doãng
                
                # LỖI 2: Cụp lưng, đổ người về trước (Check liên tục)
                if back_angle > 65: 
                    form_feedback = "KEEP CHEST UP!"
                
                # 4. MÁY TRẠNG THÁI & ĐẾM REP
                # Pha đứng lên
                if knee_angle > 160:
                    if stage == 'down': 
                        counter += 1
                    stage = 'up'
                    
                # Pha hạ người
                elif knee_angle < 140:
                    # LỖI 3: Check độ sâu (Hông song song Đầu gối)
                    if hip[1] >= (knee[1] - 0.04): # Sai số nhẹ 0.04 do phối cảnh camera
                        stage = 'down'
                        # Ưu tiên hiện cảnh báo form lỗi (nếu có) trước khi khen
                        if form_feedback == "FORM: GOOD": 
                            form_feedback = "PERFECT DEPTH!"
                    elif stage != 'down':
                        if form_feedback == "FORM: GOOD":
                            form_feedback = "GO DEEPER!"
            # ==========================================
            # GIAO DIỆN CHUNG
            # ==========================================
            cv2.rectangle(image, (0,0), (640, 60), (30,30,30), -1)
            cv2.putText(image, f"MODE: {app_mode}", (10, 40), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (255, 200, 0), 2, cv2.LINE_AA)
            
            # Hiển thị Reps (Cho Push-up/Squat) hoặc Time (Cho Plank)
            if app_mode == "PLANK":
                # Định dạng giây thành MM:SS
                mins = int(display_time // 60)
                secs = int(display_time % 60)
                timer_str = f"{mins:02d}:{secs:02d}"
                cv2.putText(image, f"TIME: {timer_str}", (250, 40), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 255), 2, cv2.LINE_AA)
            else:
                cv2.putText(image, f"REPS: {counter}", (250, 40), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (255, 255, 255), 2, cv2.LINE_AA)
                
            cv2.putText(image, "[M] Menu", (520, 40), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (200, 200, 200), 1, cv2.LINE_AA)
            
            # Cảnh báo dáng tập
            box_color = (0, 255, 0) if form_feedback in ["FORM: GOOD", "FORM: PERFECT!"] else (0, 0, 255)
            cv2.rectangle(image, (0, 60), (450, 100), box_color, -1)
            cv2.putText(image, form_feedback, (10, 85), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2, cv2.LINE_AA)
            
            mp_drawing.draw_landmarks(image, results.pose_landmarks, mp_pose.POSE_CONNECTIONS)               
        
        cv2.imshow('AI Fitness Tracker', image)

        # ==========================================
        # ĐIỀU KHIỂN BÀN PHÍM
        # ==========================================
       # ==========================================
        # ĐIỀU KHIỂN BÀN PHÍM
        # ==========================================
        key = cv2.waitKey(10) & 0xFF
        if key == ord('q'): break
        elif key == ord('1'): 
            app_mode = "PUSH-UP"
            counter, stage, form_feedback = 0, None, ""
        elif key == ord('2'): 
            app_mode = "SQUAT"
            counter, stage, form_feedback = 0, None, ""
        elif key == ord('4'): 
            app_mode = "PLANK"
            total_plank_time, plank_start_time, is_planking, display_time = 0, 0, False, 0
            form_feedback = ""
            
        # --- THÊM PHÍM SỐ 5 ---
        elif key == ord('5'): 
            app_mode = "HANDSTAND"
            counter, stage, form_feedback = 0, None, ""
            
        elif key == ord('m') or key == ord('M'): 
            app_mode = "MENU"

cap.release()
cv2.destroyAllWindows()