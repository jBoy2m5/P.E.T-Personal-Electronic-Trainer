import cv2
import mediapipe as mp
import numpy as np
import time

class FitnessTracker:
    def __init__(self, model_complexity=1, min_detection_confidence=0.7, min_tracking_confidence=0.7):
        """
        Khởi tạo AI Core. 
        - model_complexity: 0 (Nhanh nhất), 1 (Cân bằng), 2 (Chính xác nhất nhưng nặng)
        """
        self.mp_pose = mp.solutions.pose
        self.pose = self.mp_pose.Pose(
            model_complexity=model_complexity,
            min_detection_confidence=min_detection_confidence,
            min_tracking_confidence=min_tracking_confidence
        )
        
        # Biến theo dõi hệ thống
        self.current_mode = None
        
        # Biến đếm chung (Squat, Push-up, Handstand)
        self.counter = 0
        self.stage = None
        
        # Biến riêng cho Plank
        self.total_plank_time = 0
        self.plank_start_time = 0
        self.is_planking = False

    def _reset_state(self):
        """Đưa toàn bộ thông số về 0 khi chuyển đổi bài tập"""
        self.counter = 0
        self.stage = None
        self.total_plank_time = 0
        self.plank_start_time = 0
        self.is_planking = False

    def _calculate_angle(self, a, b, c):
        """Tính góc 2D giữa 3 điểm (Tính bằng độ)"""
        a, b, c = np.array(a), np.array(b), np.array(c)
        radians = np.arctan2(c[1]-b[1], c[0]-b[0]) - np.arctan2(a[1]-b[1], a[0]-b[0])
        angle = np.abs(radians * 180.0 / np.pi)
        if angle > 180.0: angle = 360 - angle
        return angle

    def _calculate_3d_distance(self, p1, p2):
        """Tính khoảng cách 3D (X, Y, Z) bằng Pytago không gian"""
        return np.sqrt((p1.x - p2.x)**2 + (p1.y - p2.y)**2 + (p1.z - p2.z)**2)

    def process_frame(self, frame, app_mode):
        """
        Xử lý 1 khung hình từ Frontend gửi tới.
        """
        # Nếu Frontend yêu cầu đổi bài tập -> Reset data cũ
        if app_mode != self.current_mode:
            self.current_mode = app_mode
            self._reset_state()

        # Tiền xử lý ảnh (Tối ưu RAM & Tốc độ)
        image = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        image.flags.writeable = False 
        results = self.pose.process(image)
        
        # Giá trị mặc định trả về nếu không thấy người
        feedback = "NO PERSON DETECTED"
        display_time = self.total_plank_time
        landmarks_export = [] # Gửi tọa độ 33 điểm cho Frontend tự vẽ xương (nếu cần)

        if results.pose_landmarks:
            landmarks = results.pose_landmarks.landmark
            
            # Xuất tọa độ thô cho Frontend (Dành cho hiệu ứng UI)
            landmarks_export = [{"x": lm.x, "y": lm.y, "z": lm.z, "visibility": lm.visibility} for lm in landmarks]

            # Khai báo các điểm mốc dùng chung (Dùng bên Trái làm chuẩn cho 2D)
            shoulder = [landmarks[self.mp_pose.PoseLandmark.LEFT_SHOULDER.value].x, landmarks[self.mp_pose.PoseLandmark.LEFT_SHOULDER.value].y]
            elbow = [landmarks[self.mp_pose.PoseLandmark.LEFT_ELBOW.value].x, landmarks[self.mp_pose.PoseLandmark.LEFT_ELBOW.value].y]
            wrist = [landmarks[self.mp_pose.PoseLandmark.LEFT_WRIST.value].x, landmarks[self.mp_pose.PoseLandmark.LEFT_WRIST.value].y]
            hip = [landmarks[self.mp_pose.PoseLandmark.LEFT_HIP.value].x, landmarks[self.mp_pose.PoseLandmark.LEFT_HIP.value].y]
            knee = [landmarks[self.mp_pose.PoseLandmark.LEFT_KNEE.value].x, landmarks[self.mp_pose.PoseLandmark.LEFT_KNEE.value].y]
            ankle = [landmarks[self.mp_pose.PoseLandmark.LEFT_ANKLE.value].x, landmarks[self.mp_pose.PoseLandmark.LEFT_ANKLE.value].y]

            # ==========================================
            # 1. LOGIC: SQUAT (PRO-LEVEL 3D)
            # ==========================================
            if app_mode == "SQUAT":
                l_sh = landmarks[self.mp_pose.PoseLandmark.LEFT_SHOULDER.value]
                r_sh = landmarks[self.mp_pose.PoseLandmark.RIGHT_SHOULDER.value]
                l_ankle = landmarks[self.mp_pose.PoseLandmark.LEFT_ANKLE.value]
                r_ankle = landmarks[self.mp_pose.PoseLandmark.RIGHT_ANKLE.value]
                
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

            # ==========================================
            # 2. LOGIC: STRICT PUSH-UP
            # ==========================================
            elif app_mode == "PUSH-UP":
                arm_angle = self._calculate_angle(shoulder, elbow, wrist)
                body_angle = self._calculate_angle(shoulder, hip, ankle)
                torso_angle = self._calculate_angle(shoulder, hip, [hip[0], 0.0])
                
                if torso_angle < 45:
                    feedback = "WARNING: STANDING!"
                    self.stage = None
                elif body_angle < 155:
                    feedback = "KEEP BODY STRAIGHT!"
                    self.stage = None 
                else:
                    feedback = "FORM: GOOD"
                    if arm_angle > 160:
                        if self.stage == 'down': self.counter += 1
                        self.stage = "up"
                    elif arm_angle < 110:
                        if shoulder[1] >= (elbow[1] - 0.05):
                            self.stage = "down"
                            feedback = "PERFECT DEPTH!"
                        elif self.stage != 'down':
                            feedback = "GO LOWER!"

            # ==========================================
            # 3. LOGIC: PLANK TIMER
            # ==========================================
            elif app_mode == "PLANK":
                body_angle = self._calculate_angle(shoulder, hip, ankle)
                torso_angle = self._calculate_angle(shoulder, hip, [hip[0], 0.0])
                
                if torso_angle < 45:
                    feedback = "GET DOWN ON THE FLOOR!"
                    if self.is_planking:
                        self.is_planking = False
                        self.total_plank_time += (time.time() - self.plank_start_time)
                else:
                    ref_y = (shoulder[1] + ankle[1]) / 2 
                    if body_angle > 165:
                        feedback = "FORM: PERFECT!"
                        if not self.is_planking:
                            self.is_planking = True
                            self.plank_start_time = time.time()
                        display_time = self.total_plank_time + (time.time() - self.plank_start_time)
                    else:
                        if self.is_planking:
                            self.is_planking = False
                            self.total_plank_time += (time.time() - self.plank_start_time)
                        
                        if hip[1] < ref_y - 0.05: feedback = "LOWER YOUR HIPS!" 
                        elif hip[1] > ref_y + 0.05: feedback = "RAISE YOUR HIPS!" 
                        else: feedback = "STRAIGHTEN YOUR LEGS!"

            # ==========================================
            # 4. LOGIC: HANDSTAND PUSH-UP
            # ==========================================
            elif app_mode == "HANDSTAND":
                arm_angle = self._calculate_angle(shoulder, elbow, wrist)
                body_angle = self._calculate_angle(shoulder, hip, ankle)
                
                if hip[1] > shoulder[1]:
                    feedback = "KICK UP INTO HANDSTAND!"
                    self.stage = None
                elif body_angle < 160:
                    feedback = "KEEP CORE TIGHT!"
                    self.stage = None
                else:
                    feedback = "FORM: GOOD"
                    if arm_angle > 150:
                        if self.stage == 'down': self.counter += 1
                        self.stage = "up"
                    elif arm_angle < 110:
                        if shoulder[1] >= (elbow[1] - 0.05):
                            self.stage = "down"
                            feedback = "PERFECT DEPTH!"
                        elif self.stage != 'down':
                            feedback = "GO LOWER!"

        # ==========================================
        # ĐÓNG GÓI KẾT QUẢ CHO FRONTEND
        # ==========================================
        return {
            "mode": app_mode,
            "reps": self.counter,
            "timer": round(display_time, 2), # Trả về số giây (vd: 12.5 giây)
            "feedback": feedback,
            "stage": self.stage,
            "landmarks": landmarks_export # Để Frontend tự vẽ khung xương lấp lánh (nếu thích)
        }