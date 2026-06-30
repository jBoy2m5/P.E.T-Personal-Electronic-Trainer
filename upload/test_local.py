import cv2
from ai_core import FitnessTracker

print("Đang khởi tạo Lõi AI cấp độ chính xác cao nhất (Heavy Model)...")
ai_engine = FitnessTracker(model_complexity=1)

cap = cv2.VideoCapture(0)
cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)

current_mode = "SQUAT"

print("Hệ thống chuẩn bị sẵn sàng! Bấm 1, 2, 3, 4, 5 để chuyển bài. Bấm Q để thoát.")

while cap.isOpened():
    ret, frame = cap.read()
    if not ret: 
        break
        
    frame = cv2.flip(frame, 1) 
    
    # AI Core tính toán mọi thứ ở hậu cảnh (Không vẽ gì cả)
    result = ai_engine.process_frame(frame, current_mode)
    
    # =========================================================
    # CHỈ VẼ BẢNG THÔNG SỐ VÀ CẢNH BÁO (CLEAN UI)
    # =========================================================
    cv2.rectangle(frame, (0,0), (640, 60), (30,30,30), -1)
    cv2.putText(frame, f"MODE: {result['mode']}", (10, 40), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (255, 200, 0), 2, cv2.LINE_AA)
    
    if result['mode'] == "PLANK":
        cv2.putText(frame, f"TIME: {result['timer']}s", (250, 40), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 255), 2, cv2.LINE_AA)
    else:
        cv2.putText(frame, f"REPS: {result['reps']}", (250, 40), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (255, 255, 255), 2, cv2.LINE_AA)
        
    feedback = result['feedback']
    box_color = (0, 255, 0) if feedback in ["FORM: GOOD", "FORM: PERFECT!", "PERFECT DEPTH!", "READY"] else (0, 0, 255)
    
    cv2.rectangle(frame, (0, 60), (640, 100), box_color, -1)
    cv2.putText(frame, feedback, (10, 85), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2, cv2.LINE_AA)
    
    cv2.putText(frame, "1: PUSH 2: SQUAT 3: PULL 4: PLANK 5: HANDSTAND", (15, 460), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1, cv2.LINE_AA)

    # Hiển thị cửa sổ (Lúc này video sẽ hoàn toàn sạch sẽ, chỉ có người bạn và bảng đếm)
    cv2.imshow('AI Fitness - Commercial Clean UI', frame)

    key = cv2.waitKey(1) & 0xFF
    if key == ord('q') or key == ord('Q'): 
        break
    elif key == ord('1'): current_mode = "PUSH-UP"
    elif key == ord('2'): current_mode = "SQUAT"
    elif key == ord('3'): current_mode = "PULL-UP"
    elif key == ord('4'): current_mode = "PLANK"
    elif key == ord('5'): current_mode = "HANDSTAND"

cap.release()
cv2.destroyAllWindows()