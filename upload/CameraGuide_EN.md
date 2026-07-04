# 📸 Camera Placement Guide
*Optimize your setup for the highest AI tracking accuracy.*

---

For 2D/3D AI body tracking to work flawlessly, your body must be fully visible and not occlude (hide) its own joints. Follow these golden rules for each exercise:

### 1. Push-up
* **Golden Angle:** **90° Side-profile** strictly (camera perpendicular to your body).
* **Camera Height:** Floor level — align with your chest/stomach height when lying down.
* **Distance:** 1.5–2.5 meters. Ensure your entire body from head to heels is fully visible in the frame.
* **Stand Position:** Place yourself at the **center** of the frame. The Auto Focus system will lock onto you automatically.
* **Why?** This is the only angle that lets the AI accurately measure your spine alignment (to prevent sagging hips), track the vertical drop of your shoulders relative to elbows, and detect whether you're actually going low enough. A front-facing view would stack your arms over your body, making depth impossible to measure.
* **⚠️ Common Mistake:** Filming from above or from a 45° angle — this distorts the body line and causes false "KEEP BODY STRAIGHT" warnings.

### 2. Squat
* **Golden Angle:** **45° Diagonal** (front-side) or **90° Side-profile**.
* **Camera Height:** Waist level (approximately 80–100 cm from the floor).
* **Distance:** 2–3 meters. Your full body from head to feet must be visible — including the feet touching the floor.
* **Stand Position:** Stand at the **center** of the frame before starting. Face the camera diagonally (not directly).
* **Why?** The 45° angle allows the AI to measure the exact distance between your feet (stance width) while simultaneously tracking the depth of your hips and the bend of your knees without one leg blocking the other. The side-profile works well too for knee angle tracking, but loses stance width accuracy.
* **⚠️ Common Mistake:** Filming from directly in front — both legs overlap, making knee tracking unreliable. Or placing the camera too high, cutting off your feet.

### 3. Pull-up
* **Golden Angle:** **45° Diagonal** (front-side) — never directly from the front.
* **Camera Height:** Chest to head level while you are **hanging** (approximately 120–160 cm from the floor, depending on bar height).
* **Distance:** 2–3 meters. Your upper body from hands on the bar down to at least your hips must be visible.
* **Stand Position:** Position yourself so the pull-up bar is at the **top-center** of the frame. Your body hangs in the center.
* **Why?** The AI needs to see both your grip width (distance between wrists) and your shoulder movement simultaneously. A direct front view stacks your elbows behind your wrists, making arm angle unmeasurable. The diagonal view reveals grip width, elbow flexion, and chin-over-bar position clearly.
* **⚠️ Common Mistake:** Placing the camera too low (looking up) — this distorts the shoulder-to-wrist line and causes false "NO AIR PULL-UPS" warnings. Or filming from behind — the AI can't see your face to check chin position.

### 4. Plank
* **Golden Angle:** **90° Side-profile** strictly (identical setup to Push-up).
* **Camera Height:** Floor level — align with your chest/stomach height when lying down.
* **Distance:** 1.5–2.5 meters. Your entire body from head to heels must be in frame.
* **Stand Position:** Center yourself in the frame. The AI will start the timer automatically once your form is correct.
* **Why?** The AI measures your body as a straight line from shoulder → hip → ankle. Any angle other than 90° side-view will distort this line and cause constant "RAISE/LOWER YOUR HIPS" warnings even when your form is perfect.
* **⚠️ Common Mistake:** Filming from a corner or from above — this makes the hip position ambiguous. The AI cannot distinguish between a sagging hip and perspective distortion.

### 5. Handstand
* **Golden Angle:** **45° Diagonal** or **90° Side-profile**.
* **Camera Height:** Low — approximately 30–50 cm from the floor (shoulder level *while you are inverted*).
* **Distance:** 2–3 meters. Your entire body from hands on the floor to your feet in the air must be visible.
* **Stand Position:** Get into position at the **center** of the frame. The AI will start the timer once your body is straight and arms are locked.
* **Why?** If filmed straight from the front, your arms will block your head. A diagonal or side angle gives the AI a clear view of your full body alignment (shoulder → hip → ankle line) and your arm lock status. The timer only counts when your form is correct.
* **⚠️ Common Mistake:** Camera too close — your feet get cut off at the top of the frame. Or placing the camera at standing height — looking down at a handstand compresses the body line.

---

### 💡 General Tips (Apply to ALL exercises)

#### Lighting (Crucial)
**Avoid Backlighting!** Do not place your camera facing a bright window or a strong light source. Backlighting turns your body into a dark silhouette, reducing the AI's joint-tracking confidence by up to 40%. Always ensure the light source is **in front of you** or **above you**.

#### Auto Focus System
The AI will automatically lock onto the person standing closest to the **center of the frame**. You don't need to press any button — just position yourself in the middle and start exercising. If there are other people in the background, they will be automatically ignored.

#### Clothing
Wear **fitted clothing** that contrasts with your background. Baggy clothes can hide joint positions. Avoid wearing the same color as your wall/floor.

#### Background
A **plain, uncluttered background** works best. Avoid mirrors, moving objects, or other people walking through the frame during your exercise.
