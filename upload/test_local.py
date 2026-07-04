import cv2
from ai_core import FitnessTracker

print("Khởi tạo API Lõi AI...")
ai_engine = FitnessTracker(model_complexity=1)

cap = cv2.VideoCapture(0)
cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)

current_mode = "PUSH-UP"

while cap.isOpened():
    ret, frame = cap.read()
    if not ret: break
    frame = cv2.flip(frame, 1)
    
    # 1. GỌI API BACKEND
    result = ai_engine.process_frame(frame, current_mode)

    # 3. VẼ GIAO DIỆN (UI/UX) TRỰC QUAN
    # Nền bảng thông số
    cv2.rectangle(frame, (0, 0), (640, 110), (20, 20, 20), -1)
    
    # Thông số Góc, Chế độ, Reps
    cv2.putText(frame, f"MODE: {result['mode']}", (15, 35), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 255), 2, cv2.LINE_AA)
    cv2.putText(frame, f"ANGLE: {result['angle']} deg", (450, 35), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2, cv2.LINE_AA)
    
    if result['mode'] in ["PLANK", "HANDSTAND"]:
        cv2.putText(frame, f"TIME: {result['timer']}s", (250, 35), cv2.FONT_HERSHEY_SIMPLEX, 0.9, (0, 255, 0), 2, cv2.LINE_AA)
    else:
        cv2.putText(frame, f"REPS: {result['reps']}", (250, 35), cv2.FONT_HERSHEY_SIMPLEX, 0.9, (0, 255, 0), 2, cv2.LINE_AA)
        
    # Feedback & Focus Lock
    feedback = result['feedback']
    # Màu xanh cho feedback tích cực, đỏ cho cảnh báo
    GOOD_KEYWORDS = ["GOOD", "PERFECT", "OVER BAR", "READY"]
    color = (0, 255, 0) if any(kw in feedback for kw in GOOD_KEYWORDS) else (0, 0, 255)
    
    cv2.putText(frame, f"STATE: {str(result['stage']).upper()}", (15, 80), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (200, 200, 200), 2, cv2.LINE_AA)
    cv2.putText(frame, feedback, (200, 80), cv2.FONT_HERSHEY_SIMPLEX, 0.8, color, 2, cv2.LINE_AA)
    
    lock_color = (0, 255, 0)
    cv2.putText(frame, "AUTO FOCUS: ON", (450, 80), cv2.FONT_HERSHEY_SIMPLEX, 0.6, lock_color, 2, cv2.LINE_AA)
    
    # Menu điều khiển
    cv2.putText(frame, "KEYS: 1:Push 2:Squat 3:Pull 4:Plank 5:Handstand | R:Reset Focus | Q:Quit", (10, 460), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (200, 200, 200), 1, cv2.LINE_AA)

    cv2.imshow('P.E.T - AI Fitness Tester', frame)

    # 4. TRÌNH LẮNG NGHE BÀN PHÍM
    key = cv2.waitKey(1) & 0xFF
    if key == ord('q') or key == ord('Q'): break
    elif key == ord('1'): current_mode = "PUSH-UP"
    elif key == ord('2'): current_mode = "SQUAT"
    elif key == ord('3'): current_mode = "PULL-UP"
    elif key == ord('4'): current_mode = "PLANK"
    elif key == ord('5'): current_mode = "HANDSTAND"
    elif key == ord('r') or key == ord('R'): 
        ai_engine.reset_focus()  # Reset focus về tâm khung hình

cap.release()
cv2.destroyAllWindows()