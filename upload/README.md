# P.E.T — Personal Electronic Trainer
### AI-Powered Real-Time Fitness Tracker Core (Edge AI)

An enterprise-grade, low-latency AI fitness tracking module powered by **MediaPipe Pose** and **OpenCV**. This core system analyzes human biomechanics from a video stream to count repetitions, track hold time, and provide real-time form validation with advanced anti-cheat logic for 5 exercises.

Built as a pure algorithmic "black box" (independent of GUI), this core is designed to be easily integrated into Web applications (via WebSockets/FastAPI), Mobile apps (Flutter/React Native), or Desktop interfaces.

---

## 🌟 Key Features

### Auto Focus System
The AI automatically locks onto the person standing closest to the **center of the frame** — no button press required. Once locked, the system smoothly tracks the target using Exponential Moving Average (EMA) and **ignores all other people** in the background. Press `R` to reset and switch to a different person.

### Intelligent Visibility Check
Each exercise requires a different set of body joints to be visible. The system automatically detects which joints are occluded and provides specific feedback (e.g., `SHOW FULL BODY!` or `SHOW UPPER BODY!`) based on the active exercise mode.

### Timer Auto-Pause
For time-based exercises (Plank, Handstand), the timer **automatically pauses** when:
- The person leaves the frame
- Critical joints become occluded
- Form breaks (e.g., hips sag, arms bend)

The timer resumes seamlessly when good form is restored — no manual intervention needed.

---

## 💪 Supported Exercises & Anti-Cheat Logic

### 1. Push-up (Rep-based)
**Target muscles:** Chest, Triceps, Anterior Deltoids, Core

| Feature | Description |
|---|---|
| **Rep Counter** | Tracks arm flexion/extension cycles (Shoulder-Elbow-Wrist angle) |
| **Anti-Standing Filter** | Freezes counting if the user is standing upright and waving arms (`torso_angle < 45°`) |
| **Plank Alignment Guard** | Requires Shoulder-Hip-Ankle to form a straight line (`> 155°`) to prevent sagging |
| **Depth Validation** | Shoulder must drop to elbow level before a valid rep is recorded |

**Feedback:** `FORM: GOOD` · `PERFECT DEPTH!` · `GO LOWER!` · `WARNING: STANDING!` · `KEEP BODY STRAIGHT!`

---

### 2. Squat (Rep-based)
**Target muscles:** Quadriceps, Glutes, Hamstrings, Core

| Feature | Description |
|---|---|
| **Rep Counter** | Tracks knee joint angle (Hip-Knee-Ankle) |
| **3D Stance Width** | Uses Z-axis depth to calculate ankle-to-shoulder width ratio. Warns if too narrow (`< 0.8×`) or too wide (`> 1.6×`) |
| **Posture Guard** | Detects excessive forward lean (`back_angle > 65°`) |
| **Parallel Depth Rule** | Hips must drop to or below knee level (Y-axis) to eliminate half-reps |

**Feedback:** `FORM: GOOD` · `PERFECT DEPTH!` · `GO DEEPER!` · `WIDEN STANCE!` · `NARROW STANCE!` · `KEEP CHEST UP!`

---

### 3. Pull-up (Rep-based)
**Target muscles:** Latissimus Dorsi, Biceps, Rear Deltoids, Forearms

| Feature | Description |
|---|---|
| **Rep Counter** | Tracks arm angle through hang → pull → chin-over-bar cycle |
| **Hang Verification** | Requires wrists above shoulders to confirm the user is hanging on a bar |
| **3D Grip Width** | Measures wrist-to-shoulder ratio in 3D space. Warns if grip is too narrow (`< 1.2×`) |
| **Anti-Kipping Filter** | Detects torso swing (`torso_angle > 25°`) to prevent momentum-based cheating |
| **Anti-Air Pull-up** | Anchors shoulder Y-position at hang; rejects reps where shoulders don't actually travel upward (`< 0.04` displacement) |
| **Chin-Over-Bar Check** | Nose must reach bar level for a valid rep |

**Feedback:** `FORM: GOOD` · `CHIN OVER BAR!` · `PULL HIGHER!` · `HANG ON THE BAR!` · `WIDEN GRIP (TARGET LATS)!` · `NO SWINGING! ENGAGE CORE.` · `NO AIR PULL-UPS!`

---

### 4. Plank (Time-based ⏱️)
**Target muscles:** Core (Rectus Abdominis, Transverse Abdominis, Obliques), Shoulders

| Feature | Description |
|---|---|
| **Smart Timer** | Counts hold time in seconds. Auto-pauses when form breaks, auto-resumes when corrected |
| **Anti-Standing Filter** | Rejects activation if user is standing upright (`torso_angle < 45°`) |
| **Hip Level Monitor** | Detects sagging hips (`RAISE YOUR HIPS!`) and pike/V-shape (`LOWER YOUR HIPS!`) |
| **Body Line Check** | Requires Shoulder-Hip-Ankle alignment (`> 165°`) for the timer to run |

**Feedback:** `FORM: PERFECT!` · `GET DOWN ON THE FLOOR!` · `RAISE YOUR HIPS!` · `LOWER YOUR HIPS!` · `STRAIGHTEN YOUR LEGS!`

---

### 5. Handstand (Time-based ⏱️)
**Target muscles:** Shoulders (all 3 heads), Triceps, Core, Trapezius

| Feature | Description |
|---|---|
| **Smart Timer** | Counts hold time in seconds. Only runs when form is correct |
| **Inversion Verification** | Confirms user is fully inverted (hips above shoulders in Y-axis) |
| **Core Alignment** | Requires Shoulder-Hip-Ankle to form a straight line (`> 160°`) |
| **Arm Lock Check** | Arms must be fully extended (`arm_angle > 160°`) for the timer to count |

**Feedback:** `FORM: PERFECT!` · `KICK UP INTO HANDSTAND!` · `KEEP CORE TIGHT!` · `LOCK YOUR ARMS!`

---

## 📡 API Response Format

Every call to `process_frame(frame, mode)` returns:

```python
{
    "mode": "PUSH-UP",        # Current exercise mode
    "reps": 12,               # Rep count (Push-up, Squat, Pull-up)
    "timer": 45.23,           # Hold time in seconds (Plank, Handstand)
    "feedback": "FORM: GOOD", # Real-time form feedback string
    "stage": "up",            # Current phase (up / down / None)
    "angle": 165,             # Primary joint angle in degrees
    "is_locked": True,        # Auto Focus status (always True)
    "raw_landmarks": <object> # Raw MediaPipe landmarks for frontend skeleton rendering
}
```

---

## 🛠️ Installation & Setup

### Prerequisites
* Python 3.9, 3.10, or 3.11
* An active virtual environment (recommended)

### Installation
Clone this repository and install the dependencies:

```bash
pip install -r requirements.txt
```

### Quick Test
Run the local webcam tester:

```bash
python test_local.py
```

**Controls:** `1-5` to switch exercises · `R` to reset focus · `Q` to quit

---

## 📸 Camera Setup

For optimal AI tracking accuracy, please refer to the camera placement guides:
- **English:** [CameraGuide_EN.md](CameraGuide_EN.md)
- **Tiếng Việt:** [CameraGuide_VI.md](CameraGuide_VI.md)

---

## 📁 Project Structure

```
upload/
├── ai_core.py            # Core AI engine (backend, no GUI dependency)
├── test_local.py          # Webcam demo client (OpenCV frontend)
├── requirements.txt       # Python dependencies
├── __init__.py            # Python package marker
├── .gitignore             # Git ignore rules
├── README.md              # Project documentation (English)
├── README_vi.md           # Project documentation (Vietnamese)
├── CameraGuide_EN.md      # Camera placement guide (English)
└── CameraGuide_VI.md      # Camera placement guide (Vietnamese)
```