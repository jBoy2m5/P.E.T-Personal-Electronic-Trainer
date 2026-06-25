# AI-Powered Real-Time Fitness Tracker Core (Edge AI)

An enterprise-grade, low-latency AI fitness tracking module powered by **MediaPipe Pose** and **OpenCV**. This core system analyzes human biomechanics from a video stream to count repetitions, track time, and provide real-time form validation (anti-cheat) for advanced exercises.

Built as a pure algorithmic "black box" (independent of GUI), this core is designed to be easily integrated into Web applications (via WebSockets/FastAPI), Mobile apps (Flutter/React Native), or Desktop interfaces.

---

## 🌟 Key Features & Anti-Cheat Logic

### 1. Strict Push-Up
* **Rep Counter:** Tracks arm flexion and extension cycles.
* **Anti-Cheat (Standing Filter):** Automatically freezes and resets if the user attempts to cheat by standing and moving their arms vertically.
* **Form Guard (Plank Alignment):** Requires the body (Shoulder-Hip-Ankle) to maintain a straight line ($> 155^\circ$).
* **Depth Check:** Validates that the chest/shoulder drops parallel to the elbow line before recording a valid rep.

### 2. Pro-Level Squat
* **Rep Counter:** Tracks knee joint angles.
* **Stance Width Validator (3D Depth):** Uses 3D spatial coordinates ($Z$-axis) to calculate the exact ratio between ankle width and shoulder width. Warns users if their feet are too narrow (`WIDEN STANCE!`) or too wide (`NARROW STANCE!`).
* **Posture Guard:** Detects excessive forward torso lean (`KEEP CHEST UP!`).
* **Depth Check (Parallel Rule):** Ensures the hips drop lower or equal to the knees ($Y$-axis check) to eliminate "half-reps".

### 3. Smart Plank Timer
* **Dynamic Timer:** Counts execution time in seconds, **automatically pausing** the moment the user breaks form.
* **Anti-Cheat (Floor Filter):** Rejects activation if the user is standing upright.
* **Hips Level Monitor:** Detects and warns if the hips are sagging (`RAISE YOUR HIPS!`) or lifting too high into a V-shape (`LOWER YOUR HIPS!`).

### 4. Handstand Push-Up (Advanced Calisthenics)
* **Anti-Cheat (Inversion Filter):** Verifies the user is completely inverted (Hips positioned above Shoulders in the $Y$-axis) to prevent cheating via standing shoulder presses.
* **Spine Alignment:** Ensures a rigid core to protect the lower back.
* **Parallel Depth:** Validates that the head approaches the ground, bringing shoulders level with elbows.

---

## 🛠️ Installation & Setup

### Prerequisites
* Python 3.9, 3.10, or 3.11
* An active virtual environment (recommended)

### Installation
Clone this repository and install the dependencies listed in `requirements.txt`:

```bash
pip install -r requirements.txt