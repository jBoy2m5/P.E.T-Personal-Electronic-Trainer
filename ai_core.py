import cv2
import mediapipe as mp
import numpy as np
import time

class FitnessTracker:
    def __init__(self):
        # Khởi tạo MediaPipe
        self.mp_pose = mp.solutions.pose
        self.pose = self.mp_pose.Pose(min_detection_confidence=0.7, min_tracking_confidence=0.7)
        
        # Biến trạng thái toàn cục
        self.counter = 0
        self.stage = None
        self.total_plank_time = 0
        self.plank_start_time = 0
        self.is_planking = False

    def _calculate_angle(self, a, b, c):
        a, b, c = np.array(a), np.array(b), np.array(c)
        radians = np.arctan2(c[1]-b[1], c[0]-b[0]) - np.arctan2(a[1]-b[1], a[0]-b[0])
        angle = np.abs(radians*180.0/np.pi)
        if angle > 180.0: angle = 360 - angle
        return angle

    def process_frame(self, frame, app_mode):
        """
        Hàm này nhận vào 1 frame hình ảnh và chế độ tập.
        Trả về kết quả phân tích dưới dạng Dictionary (tương đương JSON) cho Frontend.
        """
        # Chuyển đổi màu cho MediaPipe xử lý
        image = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        image.flags.writeable = False 
        results = self.pose.process(image)
        
        feedback = "NO PERSON DETECTED"
        display_time = 0
        landmarks_data = [] # Gửi tọa độ khung xương cho Frontend tự vẽ (tùy chọn)

        if results.pose_landmarks:
            landmarks = results.pose_landmarks.landmark
            
            # (Bạn có thể bỏ qua việc lấy landmarks_data nếu Frontend không cần vẽ khung xương)
            # Dưới đây là logic mẫu cho SQUAT (Bạn sẽ copy các logic bài tập vào đây)
            if app_mode == "SQUAT":
                hip = [landmarks[self.mp_pose.PoseLandmark.LEFT_HIP.value].x, landmarks[self.mp_pose.PoseLandmark.LEFT_HIP.value].y]
                knee = [landmarks[self.mp_pose.PoseLandmark.LEFT_KNEE.value].x, landmarks[self.mp_pose.PoseLandmark.LEFT_KNEE.value].y]
                ankle = [landmarks[self.mp_pose.PoseLandmark.LEFT_ANKLE.value].x, landmarks[self.mp_pose.PoseLandmark.LEFT_ANKLE.value].y]
                shoulder = [landmarks[self.mp_pose.PoseLandmark.LEFT_SHOULDER.value].x, landmarks[self.mp_pose.PoseLandmark.LEFT_SHOULDER.value].y]
                
                knee_angle = self._calculate_angle(hip, knee, ankle)
                back_angle = self._calculate_angle(shoulder, hip, [hip[0], 0.0])
                
                if back_angle > 60:
                    feedback = "KEEP CHEST UP!"
                else:
                    feedback = "FORM: GOOD"
                    if knee_angle > 160:
                        if self.stage == 'down': self.counter += 1
                        self.stage = 'up'
                    elif knee_angle < 140:
                        if hip[1] >= (knee[1] - 0.04):
                            self.stage = 'down'
                            feedback = "PERFECT DEPTH!"
                        elif self.stage != 'down':
                            feedback = "GO DEEPER!"
                            
            # Thêm các khối PUSH-UP, PLANK tương tự vào đây...

        # TRẢ VỀ JSON CHO FRONTEND
        return {
            "mode": app_mode,
            "reps": self.counter,
            "timer": display_time,
            "feedback": feedback,
            "stage": self.stage
        }