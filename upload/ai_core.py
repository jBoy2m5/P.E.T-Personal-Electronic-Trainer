import cv2
import mediapipe as mp
import numpy as np
import time
import math

class FitnessTracker:
    def __init__(self, model_complexity=1, min_detection_confidence=0.7, min_tracking_confidence=0.7):
        self.mp_pose = mp.solutions.pose
        self.pose = self.mp_pose.Pose(
            model_complexity=model_complexity,
            min_detection_confidence=min_detection_confidence,
            min_tracking_confidence=min_tracking_confidence
        )
        
        # State Machine (Máy trạng thái)
        self.current_mode = None
        self.counter = 0
        self.stage = None
        self.last_feedback = "WAITING FOR DETECTIONS..."
        self.current_angle = 0
        
        # Các biến đặc thù
        self.total_plank_time = 0
        self.plank_start_time = 0
        self.is_planking = False
        self.hang_shoulder_y = 0  # Mỏ neo chống gian lận Pull-up
        
        # HỆ THỐNG FOCUS LOCK (Khóa mục tiêu) [MỚI]
        self.target_locked = False
        self.locked_center_x = 0.5
        self.locked_center_y = 0.5
        self.focus_tolerance = 0.35  # Biên độ nhiễu 35% khung hình

    def toggle_focus_lock(self):
        """Bật/Tắt khóa mục tiêu từ Frontend"""
        self.target_locked = not self.target_locked
        return self.target_locked

    def _reset_state(self):
        self.counter = 0
        self.stage = None
        self.total_plank_time = 0
        self.plank_start_time = 0
        self.is_planking = False
        self.last_feedback = "READY"
        self.hang_shoulder_y = 0
        self.current_angle = 0

    def _calculate_angle(self, a, b, c):
        a, b, c = np.array(a), np.array(b), np.array(c)
        radians = np.arctan2(c[1]-b[1], c[0]-b[0]) - np.arctan2(a[1]-b[1], a[0]-b[0])
        angle = np.abs(radians * 180.0 / np.pi)
        return 360 - angle if angle > 180.0 else angle

    def _calculate_3d_distance(self, p1, p2):
        return math.sqrt((p1.x - p2.x)**2 + (p1.y - p2.y)**2 + (p1.z - p2.z)**2)

    def _check_visibility(self, landmarks, indices, threshold=0.6):
        """Kiểm tra xem các điểm trọng yếu có bị che khuất không"""
        for idx in indices:
            if landmarks[idx].visibility < threshold: return False
        return True

    def process_frame(self, frame, app_mode):
        if app_mode != self.current_mode:
            self.current_mode = app_mode
            self._reset_state()

        image = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        image.flags.writeable = False 
        results = self.pose.process(image)
        
        display_time = self.total_plank_time
        
        # Dữ liệu API chuẩn bị gửi đi
        api_response = {
            "mode": app_mode,
            "reps": self.counter,
            "timer": round(display_time, 2),
            "feedback": self.last_feedback,
            "stage": self.stage,
            "angle": int(self.current_angle),
            "is_locked": self.target_locked,
            "raw_landmarks": results.pose_landmarks  # Object thô để Frontend vẽ khung xương
        }

        if not results.pose_landmarks:
            api_response["feedback"] = "NO PERSON DETECTED"
            # [FIX] Tạm dừng plank timer khi mất người hoàn toàn
            if self.is_planking:
                self.is_planking = False
                self.total_plank_time += (time.time() - self.plank_start_time)
            return api_response

        landmarks = results.pose_landmarks.landmark

        # Danh sách khớp trọng yếu
        LEFT_SH, RIGHT_SH = self.mp_pose.PoseLandmark.LEFT_SHOULDER.value, self.mp_pose.PoseLandmark.RIGHT_SHOULDER.value
        LEFT_EL = self.mp_pose.PoseLandmark.LEFT_ELBOW.value
        LEFT_WR, RIGHT_WR = self.mp_pose.PoseLandmark.LEFT_WRIST.value, self.mp_pose.PoseLandmark.RIGHT_WRIST.value
        LEFT_HIP, RIGHT_HIP = self.mp_pose.PoseLandmark.LEFT_HIP.value, self.mp_pose.PoseLandmark.RIGHT_HIP.value
        LEFT_KN = self.mp_pose.PoseLandmark.LEFT_KNEE.value
        LEFT_AN, RIGHT_AN = self.mp_pose.PoseLandmark.LEFT_ANKLE.value, self.mp_pose.PoseLandmark.RIGHT_ANKLE.value

        # ==========================================
        # 1. BỘ LỌC FOCUS LOCK (KHÓA TRỌNG TÂM) [MỚI]
        # ==========================================
        center_x = (landmarks[LEFT_SH].x + landmarks[RIGHT_SH].x + landmarks[LEFT_HIP].x + landmarks[RIGHT_HIP].x) / 4
        center_y = (landmarks[LEFT_SH].y + landmarks[RIGHT_SH].y + landmarks[LEFT_HIP].y + landmarks[RIGHT_HIP].y) / 4

        if self.target_locked:
            dist = math.hypot(center_x - self.locked_center_x, center_y - self.locked_center_y)
            if dist > self.focus_tolerance:
                api_response["feedback"] = "BACKGROUND PERSON IGNORED"
                api_response["raw_landmarks"] = None  # Không vẽ người ở nền
                return api_response
            else:
                self.locked_center_x = (self.locked_center_x * 0.8) + (center_x * 0.2)
                self.locked_center_y = (self.locked_center_y * 0.8) + (center_y * 0.2)

        # ==========================================
        # 2. KIỂM TRA TẦM NHÌN PHÂN VÙNG
        # ==========================================
        is_visible = False
        if app_mode == "SQUAT":
            is_visible = self._check_visibility(landmarks, [LEFT_SH, RIGHT_SH, LEFT_HIP, LEFT_KN, LEFT_AN, RIGHT_AN])
        elif app_mode in ["PUSH-UP", "PLANK"]:
            is_visible = self._check_visibility(landmarks, [LEFT_SH, LEFT_EL, LEFT_WR, LEFT_HIP, LEFT_AN])
        elif app_mode in ["PULL-UP", "HANDSTAND"]:
            is_visible = self._check_visibility(landmarks, [LEFT_SH, RIGHT_SH, LEFT_EL, LEFT_WR, LEFT_HIP])

        if not is_visible:
            self.last_feedback = "SHOW UPPER BODY!" if app_mode in ["PULL-UP", "HANDSTAND"] else "SHOW FULL BODY!"
            api_response["feedback"] = self.last_feedback
            # [FIX] Tạm dừng plank timer khi mất visibility
            if self.is_planking:
                self.is_planking = False
                self.total_plank_time += (time.time() - self.plank_start_time)
            return api_response

        # ==========================================
        # 3. KINEMATICS (ĐỘNG HỌC & LOGIC ĐẾM)
        # ==========================================
        shoulder = [landmarks[LEFT_SH].x, landmarks[LEFT_SH].y]
        elbow = [landmarks[LEFT_EL].x, landmarks[LEFT_EL].y]
        wrist = [landmarks[LEFT_WR].x, landmarks[LEFT_WR].y]
        hip = [landmarks[LEFT_HIP].x, landmarks[LEFT_HIP].y]
        knee = [landmarks[LEFT_KN].x, landmarks[LEFT_KN].y]
        ankle = [landmarks[LEFT_AN].x, landmarks[LEFT_AN].y]

        # --------------------------------------------------
        # PUSH-UP: Chống gian lận đứng + feedback chi tiết
        # --------------------------------------------------
        if app_mode == "PUSH-UP":
            arm_angle = self._calculate_angle(shoulder, elbow, wrist)
            body_angle = self._calculate_angle(shoulder, hip, ankle)
            torso_angle = self._calculate_angle(shoulder, hip, [hip[0], 0.0])
            self.current_angle = arm_angle
            
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

        # --------------------------------------------------
        # SQUAT: Stance width + Back angle + feedback chi tiết
        # --------------------------------------------------
        elif app_mode == "SQUAT":
            l_sh, r_sh = landmarks[LEFT_SH], landmarks[RIGHT_SH]
            l_ankle, r_ankle = landmarks[LEFT_AN], landmarks[RIGHT_AN]
            
            knee_angle = self._calculate_angle(hip, knee, ankle)
            back_angle = self._calculate_angle(shoulder, hip, [hip[0], 0.0])
            stance_ratio = self._calculate_3d_distance(l_ankle, r_ankle) / (self._calculate_3d_distance(l_sh, r_sh) + 0.0001)
            self.current_angle = knee_angle

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

        # --------------------------------------------------
        # PULL-UP: Grip + Kipping + Anti-Air Pull-up [MERGE]
        # --------------------------------------------------
        elif app_mode == "PULL-UP":
            l_sh, r_sh = landmarks[LEFT_SH], landmarks[RIGHT_SH]
            l_wr, r_wr = landmarks[LEFT_WR], landmarks[RIGHT_WR]
            nose = landmarks[self.mp_pose.PoseLandmark.NOSE.value]
            
            arm_angle = self._calculate_angle(shoulder, elbow, wrist)
            self.current_angle = arm_angle
            
            # Bước 1: Xác nhận đang treo người
            if l_wr.y > l_sh.y:
                self.last_feedback = "HANG ON THE BAR!"
                self.stage = None
            else:
                # Bước 2: Đo Grip Width bằng 3D
                shoulder_width = self._calculate_3d_distance(l_sh, r_sh)
                grip_width = self._calculate_3d_distance(l_wr, r_wr)
                grip_ratio = grip_width / (shoulder_width + 0.0001)
                
                torso_angle = self._calculate_angle(shoulder, hip, [hip[0], 0.0])
                bar_y = (l_wr.y + r_wr.y) / 2
                
                # Bước 3: Bộ lọc chống gian lận
                if grip_ratio < 1.2:
                    self.last_feedback = "WIDEN GRIP (TARGET LATS)!"
                elif torso_angle > 25:
                    self.last_feedback = "NO SWINGING! ENGAGE CORE."
                else:
                    self.last_feedback = "FORM: GOOD"
                    
                    # Pha 1: Thả lỏng (Hanging)
                    if arm_angle > 140:
                        if self.stage == 'up': self.counter += 1
                        self.stage = "down"
                        self.hang_shoulder_y = shoulder[1]  # Khóa mỏ neo [MỚI]
                        
                    # Pha 2: Kéo lên
                    elif arm_angle < 110:
                        # [MỚI] Chống Air Pull-up: Vai phải thực sự di chuyển lên
                        if self.hang_shoulder_y != 0 and (self.hang_shoulder_y - shoulder[1]) < 0.04:
                            self.last_feedback = "NO AIR PULL-UPS!"
                            self.stage = None
                        # Kiểm tra cằm qua xà
                        elif nose.y <= bar_y + 0.05:
                            self.stage = "up"
                            self.last_feedback = "CHIN OVER BAR!"
                        elif self.stage != 'up':
                            self.last_feedback = "PULL HIGHER!"

        # --------------------------------------------------
        # HANDSTAND: Body alignment + Core check chi tiết
        # --------------------------------------------------
        elif app_mode == "HANDSTAND":
            arm_angle = self._calculate_angle(shoulder, elbow, wrist)
            body_angle = self._calculate_angle(shoulder, hip, ankle)
            self.current_angle = arm_angle
            
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

        # --------------------------------------------------
        # PLANK: Chống đứng + Feedback hông chi tiết
        # --------------------------------------------------
        elif app_mode == "PLANK":
            body_angle = self._calculate_angle(shoulder, hip, ankle)
            torso_angle = self._calculate_angle(shoulder, hip, [hip[0], 0.0])
            self.current_angle = body_angle
            
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
                
        # Cập nhật kết quả cuối cùng trước khi trả về Frontend
        api_response["reps"] = self.counter
        api_response["feedback"] = self.last_feedback
        api_response["stage"] = self.stage
        api_response["timer"] = round(display_time, 2)
        api_response["angle"] = int(self.current_angle)
        
        return api_response