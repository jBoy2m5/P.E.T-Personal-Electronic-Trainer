import cv2
import mediapipe as mp
import numpy as np
import time

class FitnessTracker:
    def __init__(self, model_complexity=1, min_detection_confidence=0.7, min_tracking_confidence=0.7):
        self.mp_pose = mp.solutions.pose
        self.pose = self.mp_pose.Pose(
            model_complexity=model_complexity,
            min_detection_confidence=min_detection_confidence,
            min_tracking_confidence=min_tracking_confidence
        )
        
        self.current_mode = None
        self.counter = 0
        self.stage = None
        self.total_plank_time = 0
        self.plank_start_time = 0
        self.is_planking = False
        
        # Biến lưu trữ trạng thái thông báo cuối cùng (Tránh nhấp nháy)
        self.last_feedback = "WAITING FOR DETECTIONS..."

    def _reset_state(self):
        self.counter = 0
        self.stage = None
        self.total_plank_time = 0
        self.plank_start_time = 0
        self.is_planking = False
        self.last_feedback = "READY"

    def _calculate_angle(self, a, b, c):
        a, b, c = np.array(a), np.array(b), np.array(c)
        radians = np.arctan2(c[1]-b[1], c[0]-b[0]) - np.arctan2(a[1]-b[1], a[0]-b[0])
        angle = np.abs(radians * 180.0 / np.pi)
        if angle > 180.0: angle = 360 - angle
        return angle

    def _calculate_3d_distance(self, p1, p2):
        return np.sqrt((p1.x - p2.x)**2 + (p1.y - p2.y)**2 + (p1.z - p2.z)**2)

    def _check_visibility(self, landmarks, indices, threshold=0.5):
        """Giới hạn tầm nhìn: Kiểm tra xem các điểm trọng yếu có bị che khuất không"""
        for idx in indices:
            if landmarks[idx].visibility < threshold:
                return False
        return True

    def process_frame(self, frame, app_mode):
        if app_mode != self.current_mode:
            self.current_mode = app_mode
            self._reset_state()

        image = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        image.flags.writeable = False 
        results = self.pose.process(image)
        
        display_time = self.total_plank_time
        landmarks_export = []

        if results.pose_landmarks:
            landmarks = results.pose_landmarks.landmark
            landmarks_export = [{"x": lm.x, "y": lm.y, "z": lm.z, "visibility": lm.visibility} for lm in landmarks]

            # Danh sách index các khớp quan trọng
            LEFT_SH, RIGHT_SH = self.mp_pose.PoseLandmark.LEFT_SHOULDER.value, self.mp_pose.PoseLandmark.RIGHT_SHOULDER.value
            LEFT_EL, RIGHT_EL = self.mp_pose.PoseLandmark.LEFT_ELBOW.value, self.mp_pose.PoseLandmark.RIGHT_ELBOW.value
            LEFT_WR, RIGHT_WR = self.mp_pose.PoseLandmark.LEFT_WRIST.value, self.mp_pose.PoseLandmark.RIGHT_WRIST.value
            LEFT_HIP, RIGHT_HIP = self.mp_pose.PoseLandmark.LEFT_HIP.value, self.mp_pose.PoseLandmark.RIGHT_HIP.value
            LEFT_KN, RIGHT_KN = self.mp_pose.PoseLandmark.LEFT_KNEE.value, self.mp_pose.PoseLandmark.RIGHT_KNEE.value
            LEFT_AN, RIGHT_AN = self.mp_pose.PoseLandmark.LEFT_ANKLE.value, self.mp_pose.PoseLandmark.RIGHT_ANKLE.value

            shoulder = [landmarks[LEFT_SH].x, landmarks[LEFT_SH].y]
            elbow = [landmarks[LEFT_EL].x, landmarks[LEFT_EL].y]
            wrist = [landmarks[LEFT_WR].x, landmarks[LEFT_WR].y]
            hip = [landmarks[LEFT_HIP].x, landmarks[LEFT_HIP].y]
            knee = [landmarks[LEFT_KN].x, landmarks[LEFT_KN].y]
            ankle = [landmarks[LEFT_AN].x, landmarks[LEFT_AN].y]

            # ==========================================
            # KIỂM TRA TẦM NHÌN (VISIBILITY CHECK)
            # ==========================================
            is_visible = False
            if app_mode == "SQUAT":
                is_visible = self._check_visibility(landmarks, [LEFT_SH, RIGHT_SH, LEFT_HIP, LEFT_KN, LEFT_AN, RIGHT_AN])
            elif app_mode in ["PUSH-UP", "HANDSTAND", "PULL-UP"]: # Thêm PULL-UP vào đây
                is_visible = self._check_visibility(landmarks, [LEFT_SH, LEFT_EL, LEFT_WR, LEFT_HIP, LEFT_AN])
            elif app_mode == "PLANK":
                is_visible = self._check_visibility(landmarks, [LEFT_SH, LEFT_HIP, LEFT_AN])

            if not is_visible:
                self.last_feedback = "PLEASE SHOW FULL BODY!"
                # Nếu đang plank mà mất hình, tạm dừng đồng hồ
                if self.is_planking:
                    self.is_planking = False
                    self.total_plank_time += (time.time() - self.plank_start_time)
            else:
                # ==========================================
                # LOGIC BÀI TẬP (Chỉ chạy khi nhìn rõ toàn thân)
                # ==========================================
                if app_mode == "SQUAT":
                    l_sh, r_sh = landmarks[LEFT_SH], landmarks[RIGHT_SH]
                    l_ankle, r_ankle = landmarks[LEFT_AN], landmarks[RIGHT_AN]
                    
                    knee_angle = self._calculate_angle(hip, knee, ankle)
                    back_angle = self._calculate_angle(shoulder, hip, [hip[0], 0.0])
                    stance_ratio = self._calculate_3d_distance(l_ankle, r_ankle) / (self._calculate_3d_distance(l_sh, r_sh) + 0.0001)

                    feedback = "FORM: GOOD"
                    if knee_angle > 150: 
                        if stance_ratio < 0.8: feedback = "WIDEN STANCE!"
                        elif stance_ratio > 1.6: feedback = "NARROW STANCE!"
                    if back_angle > 65: 
                        feedback = "KEEP CHEST UP!"
                    
                    if knee_angle > 160:
                        if self.stage == 'down': self.counter += 1
                        self.stage = 'up'
                    elif knee_angle < 140:
                        if hip[1] >= (knee[1] - 0.04):
                            self.stage = 'down'
                            if feedback == "FORM: GOOD": feedback = "PERFECT DEPTH!"
                        elif self.stage != 'down':
                            if feedback == "FORM: GOOD": feedback = "GO DEEPER!"
                    self.last_feedback = feedback

                elif app_mode == "PUSH-UP":
                    arm_angle = self._calculate_angle(shoulder, elbow, wrist)
                    body_angle = self._calculate_angle(shoulder, hip, ankle)
                    torso_angle = self._calculate_angle(shoulder, hip, [hip[0], 0.0])
                    
                    if torso_angle < 45:
                        self.last_feedback = "WARNING: STANDING!"
                        self.stage = None
                    elif body_angle < 155:
                        self.last_feedback = "KEEP BODY STRAIGHT!"
                        self.stage = None 
                    else:
                        self.last_feedback = "FORM: GOOD"
                        if arm_angle > 160:
                            if self.stage == 'down': self.counter += 1
                            self.stage = "up"
                        elif arm_angle < 110:
                            if shoulder[1] >= (elbow[1] - 0.05):
                                self.stage = "down"
                                self.last_feedback = "PERFECT DEPTH!"
                            elif self.stage != 'down':
                                self.last_feedback = "GO LOWER!"

                elif app_mode == "PLANK":
                    body_angle = self._calculate_angle(shoulder, hip, ankle)
                    torso_angle = self._calculate_angle(shoulder, hip, [hip[0], 0.0])
                    
                    if torso_angle < 45:
                        self.last_feedback = "GET DOWN ON THE FLOOR!"
                        if self.is_planking:
                            self.is_planking = False
                            self.total_plank_time += (time.time() - self.plank_start_time)
                    else:
                        ref_y = (shoulder[1] + ankle[1]) / 2 
                        if body_angle > 165:
                            self.last_feedback = "FORM: PERFECT!"
                            if not self.is_planking:
                                self.is_planking = True
                                self.plank_start_time = time.time()
                            display_time = self.total_plank_time + (time.time() - self.plank_start_time)
                        else:
                            if self.is_planking:
                                self.is_planking = False
                                self.total_plank_time += (time.time() - self.plank_start_time)
                            if hip[1] < ref_y - 0.05: self.last_feedback = "LOWER YOUR HIPS!" 
                            elif hip[1] > ref_y + 0.05: self.last_feedback = "RAISE YOUR HIPS!" 
                            else: self.last_feedback = "STRAIGHTEN YOUR LEGS!"

# ==========================================
                # 5. LOGIC: PULL-UP (KÉO XÀ CHUẨN XÔ)
                # ==========================================
                elif app_mode == "PULL-UP":
                    # Trích xuất thêm các điểm đặc thù
                    l_sh, r_sh = landmarks[LEFT_SH], landmarks[RIGHT_SH]
                    l_wr, r_wr = landmarks[LEFT_WR], landmarks[RIGHT_WR]
                    nose = landmarks[self.mp_pose.PoseLandmark.NOSE.value]
                    
                    # 1. Xác nhận người dùng đang treo người (Tay giơ cao hơn vai)
                    if l_wr.y > l_sh.y:
                        self.last_feedback = "HANG ON THE BAR!"
                        self.stage = None
                    else:
                        # 2. Đo độ rộng của tay (Grip Width) bằng tọa độ 3D
                        shoulder_width = self._calculate_3d_distance(l_sh, r_sh)
                        grip_width = self._calculate_3d_distance(l_wr, r_wr)
                        grip_ratio = grip_width / (shoulder_width + 0.0001)
                        
                        # 3. Tính toán các góc động học
                        arm_angle = self._calculate_angle(shoulder, elbow, wrist)
                        torso_angle = self._calculate_angle(shoulder, hip, [hip[0], 0.0])
                        bar_y = (l_wr.y + r_wr.y) / 2 # Đường ngang giả lập của thanh xà
                        
                        # --- BỘ LỌC CHỐNG GIAN LẬN & BẢO VỆ CƠ XÔ ---
                        if grip_ratio < 1.2:
                            # Tay cầm quá hẹp, mất tác dụng vào cơ lưng xô
                            self.last_feedback = "WIDEN GRIP (TARGET LATS)!"
                        elif torso_angle > 25:
                            # Đong đưa người lấy đà (Kipping)
                            self.last_feedback = "NO SWINGING! ENGAGE CORE."
                        else:
                            self.last_feedback = "FORM: GOOD"
                            
                            # --- TRỌNG TÀI ĐẾM REP & ĐỘ SÂU ---
                            # Pha 1: Thả lỏng người (Hanging - Góc tay duỗi thẳng > 140)
                            if arm_angle > 140:
                                if self.stage == 'up': 
                                    self.counter += 1
                                self.stage = "down"
                                
                            # Pha 2: Kéo người lên (Bắt đầu gập khuỷu tay)
                            elif arm_angle < 110:
                                # KIỂM TRA ĐỘ SÂU: Cằm (đại diện bởi mũi) phải vượt qua thanh xà
                                # (Cộng thêm 0.05 để bù trừ khoảng cách từ Mũi xuống Cằm)
                                if nose.y <= bar_y + 0.05:
                                    self.stage = "up"
                                    if self.last_feedback == "FORM: GOOD": 
                                        self.last_feedback = "CHIN OVER BAR!"
                                elif self.stage != 'up':
                                    if self.last_feedback == "FORM: GOOD":
                                        self.last_feedback = "PULL HIGHER!"


                elif app_mode == "HANDSTAND":
                    arm_angle = self._calculate_angle(shoulder, elbow, wrist)
                    body_angle = self._calculate_angle(shoulder, hip, ankle)
                    
                    if hip[1] > shoulder[1]:
                        self.last_feedback = "KICK UP INTO HANDSTAND!"
                        self.stage = None
                    elif body_angle < 160:
                        self.last_feedback = "KEEP CORE TIGHT!"
                        self.stage = None
                    else:
                        self.last_feedback = "FORM: GOOD"
                        if arm_angle > 150:
                            if self.stage == 'down': self.counter += 1
                            self.stage = "up"
                        elif arm_angle < 110:
                            if shoulder[1] >= (elbow[1] - 0.05):
                                self.stage = "down"
                                self.last_feedback = "PERFECT DEPTH!"
                            elif self.stage != 'down':
                                self.last_feedback = "GO LOWER!"
        else:
            # Nếu hoàn toàn không thấy người, giữ nguyên các thông số, chỉ cảnh báo
            self.last_feedback = "NO PERSON DETECTED"
            if self.is_planking:
                self.is_planking = False
                self.total_plank_time += (time.time() - self.plank_start_time)

        # Trả về dữ liệu luôn mượt mà và ổn định
        return {
            "mode": app_mode,
            "reps": self.counter,
            "timer": round(display_time, 2) if app_mode == "PLANK" else 0.0,
            "feedback": self.last_feedback,
            "stage": self.stage,
            "landmarks": landmarks_export
        }