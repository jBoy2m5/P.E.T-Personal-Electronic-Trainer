package org.example.pettrainerbe.controller;

import org.example.pettrainerbe.model.Exercise;
import org.example.pettrainerbe.model.MuscleGroup;
import org.example.pettrainerbe.repository.ErrorLogRepository;
import org.example.pettrainerbe.repository.ExerciseRepository;
import org.example.pettrainerbe.repository.MuscleGroupRepository;
import org.example.pettrainerbe.repository.WorkoutDetailRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/seed")
public class SeedController {

    @Autowired private MuscleGroupRepository muscleGroupRepository;
    @Autowired private ExerciseRepository exerciseRepository;
    @Autowired private WorkoutDetailRepository workoutDetailRepository;
    @Autowired private ErrorLogRepository errorLogRepository;
    @Autowired private JdbcTemplate jdbcTemplate;

    @PostMapping
    public String seed() {
        // Xóa dữ liệu cũ theo đúng thứ tự FK
        errorLogRepository.deleteAll();
        workoutDetailRepository.deleteAll();
        exerciseRepository.deleteAll();
        muscleGroupRepository.deleteAll();

        // Reset AUTO_INCREMENT về 1 để đảm bảo group_id = 1-8, exercise_id = 1-73
        jdbcTemplate.execute("ALTER TABLE exercises AUTO_INCREMENT = 1");
        jdbcTemplate.execute("ALTER TABLE muscle_groups AUTO_INCREMENT = 1");

        List<Exercise> all = new ArrayList<>();

        // ===== 1. NGỰC =====
        MuscleGroup chest = saveGroup("Ngực", "Nhóm cơ ngực - phát triển toàn diện vòng 1.");
        all.add(ex(chest, "Push Up (Knee)",
                "Perform a push-up with knees on the floor while maintaining a straight line from shoulders to knees.",
                "Avoid arching the lower back and keep the core engaged.",
                "Keep elbows at approximately 45° from the torso.",
                null, 0.30f, 12, 3, "1", null));
        all.add(ex(chest, "Incline Push Up",
                "Place hands on an elevated surface and perform a controlled push-up.",
                "Do not let the hips sag during the movement.",
                "Hands slightly wider than shoulder width, elbows about 45°.",
                null, 0.35f, 12, 3, "1", null));
        all.add(ex(chest, "Machine Chest Press",
                "Press the handles forward until the arms are nearly extended, then return slowly.",
                "Avoid locking the elbows at the top.",
                "Wrists aligned with elbows, elbows at about 45°.",
                null, 0.45f, 10, 3, "1", null));
        all.add(ex(chest, "Pec Deck Fly",
                "Bring the handles together in front of the chest while squeezing the pectoral muscles.",
                "Do not overstretch the shoulders at the starting position.",
                "Maintain a slight bend in the elbows throughout the movement.",
                null, 0.40f, 12, 3, "1", null));
        all.add(ex(chest, "Barbell Bench Press",
                "Lower the barbell to the mid-chest under control, then press it upward until the arms are nearly straight.",
                "Use a spotter when lifting heavy weights and avoid bouncing the bar off the chest.",
                "Elbows approximately 45° from the torso, feet firmly planted.",
                null, 0.60f, 10, 4, "2", null));
        all.add(ex(chest, "Incline Dumbbell Press",
                "Press the dumbbells upward over the upper chest and lower them slowly.",
                "Keep the shoulder blades retracted throughout the exercise.",
                "Bench inclined 30°–45°, elbows around 45°.",
                null, 0.55f, 10, 4, "2", null));
        all.add(ex(chest, "Dumbbell Bench Press",
                "Press the dumbbells upward until the arms are almost fully extended, then lower under control.",
                "Do not allow the dumbbells to drop too quickly.",
                "Keep wrists straight and elbows at about 45°.",
                null, 0.55f, 10, 4, "2", null));
        all.add(ex(chest, "Weighted Push Up",
                "Perform a standard push-up while wearing a weighted vest or weight plate.",
                "Ensure the added weight is secure before beginning.",
                "Maintain a straight body line with elbows around 45°.",
                null, 0.65f, 8, 4, "3", null));
        all.add(ex(chest, "Ring Push Up",
                "Perform a push-up using gymnastics rings while maintaining control and balance.",
                "Use rings adjusted to an appropriate height and avoid excessive swinging.",
                "Keep wrists neutral and stabilize the rings throughout the movement.",
                null, 0.70f, 8, 4, "3", null));
        all.add(ex(chest, "Weighted Dips",
                "Lower the body until the upper arms are parallel to the floor, then press back up while wearing additional weight.",
                "Avoid descending too deep if shoulder mobility is limited.",
                "Lean the torso slightly forward with elbows tracking naturally.",
                null, 0.75f, 8, 4, "3", null));

        // ===== 2. LƯNG =====
        MuscleGroup back = saveGroup("Lưng", "Nhóm cơ lưng - rèn luyện tư thế vững chắc.");
        all.add(ex(back, "Assisted Pull Up",
                "Use an assisted pull-up machine to pull yourself until the chin clears the bar.",
                "Avoid swinging and keep the movement controlled.",
                "Pull until chin passes the bar.",
                null, 0.45f, 10, 3, "1", null));
        all.add(ex(back, "Lat Pulldown",
                "Pull the bar down toward the upper chest while squeezing the lats.",
                "Do not lean excessively backward.",
                "Pull bar to upper chest.",
                null, 0.45f, 12, 3, "1", null));
        all.add(ex(back, "Seated Cable Row",
                "Pull the handle toward the abdomen while retracting the shoulder blades.",
                "Avoid rounding the lower back.",
                "Keep torso upright.",
                null, 0.45f, 12, 3, "1", null));
        all.add(ex(back, "Pull Up",
                "Pull your body upward until the chin passes the bar.",
                "Do not use momentum.",
                "Full arm extension at the bottom.",
                null, 0.60f, 8, 4, "2", null));
        all.add(ex(back, "Barbell Bent Over Row",
                "Row the barbell toward the lower chest while keeping the back neutral.",
                "Keep your spine straight.",
                "Torso about 45° to the floor.",
                null, 0.60f, 10, 4, "2", null));
        all.add(ex(back, "Single Arm Dumbbell Row",
                "Pull the dumbbell toward the hip while squeezing the back.",
                "Do not rotate the torso.",
                "Upper arm close to torso.",
                null, 0.55f, 10, 4, "2", null));
        all.add(ex(back, "Weighted Pull Up",
                "Perform pull-ups while wearing additional weight.",
                "Only attempt after mastering bodyweight pull-ups.",
                "Complete full range of motion.",
                null, 0.80f, 6, 4, "3", null));
        all.add(ex(back, "Deadlift",
                "Lift the barbell from the floor to a standing position.",
                "Never round your back.",
                "Neutral spine throughout.",
                null, 0.90f, 5, 5, "3", null));
        all.add(ex(back, "Chest-to-Bar Pull Up",
                "Pull explosively until the chest contacts the bar.",
                "Control the descent.",
                "Touch chest to the bar.",
                null, 0.85f, 6, 4, "3", null));

        // ===== 3. VAI =====
        MuscleGroup shoulders = saveGroup("Vai", "Nhóm cơ vai - vai rộng chuẩn form, sức mạnh thân trên.");
        all.add(ex(shoulders, "Machine Shoulder Press",
                "Press the handles upward in a controlled motion.",
                "Keep your back against the seat.",
                "Press overhead without locking elbows.",
                null, 0.45f, 12, 3, "1", null));
        all.add(ex(shoulders, "Dumbbell Front Raise",
                "Lift dumbbells forward until shoulder level.",
                "Avoid swinging.",
                "Raise to shoulder height.",
                null, 0.35f, 12, 3, "1", null));
        all.add(ex(shoulders, "Dumbbell Lateral Raise",
                "Raise dumbbells sideways until shoulder height.",
                "Use light weight.",
                "Slight bend in elbows.",
                null, 0.35f, 12, 3, "1", null));
        all.add(ex(shoulders, "Overhead Press",
                "Press the barbell overhead until arms are extended.",
                "Brace the core.",
                "Bar travels vertically.",
                null, 0.60f, 10, 4, "2", null));
        all.add(ex(shoulders, "Arnold Press",
                "Press dumbbells overhead while rotating the wrists.",
                "Do not rush the movement.",
                "Rotate palms during the press.",
                null, 0.55f, 10, 4, "2", null));
        all.add(ex(shoulders, "Face Pull",
                "Pull the rope while externally rotating the shoulders.",
                "Keep elbows high.",
                "Pull rope toward the face.",
                null, 0.45f, 12, 4, "2", null));
        all.add(ex(shoulders, "Handstand Push Up",
                "Lower your head toward the floor before pressing back up.",
                "Use a wall if necessary.",
                "Body vertical.",
                null, 0.90f, 5, 5, "3", null));
        all.add(ex(shoulders, "Pike Push Up",
                "Perform a push-up while keeping the hips high.",
                "Control the descent.",
                "Hips elevated.",
                null, 0.65f, 8, 4, "3", null));
        all.add(ex(shoulders, "Barbell Push Press",
                "Use leg drive to help press the bar overhead.",
                "Maintain a stable core.",
                "Drive with legs then press.",
                null, 0.80f, 6, 4, "3", null));

        // ===== 4. TAY =====
        MuscleGroup arms = saveGroup("Tay", "Nhóm cơ tay - bắp tay săn chắc mạnh mẽ.");
        all.add(ex(arms, "Dumbbell Curl",
                "Curl the dumbbells toward the shoulders.",
                "Avoid swinging.",
                "Elbows fixed at the sides.",
                null, 0.30f, 12, 3, "1", null));
        all.add(ex(arms, "Cable Curl",
                "Curl the cable attachment upward under control.",
                "Keep your wrists neutral.",
                "Elbows stay close to torso.",
                null, 0.30f, 12, 3, "1", null));
        all.add(ex(arms, "Tricep Pushdown",
                "Push the cable downward until the arms are straight.",
                "Keep elbows tucked.",
                "Fully extend elbows.",
                null, 0.35f, 12, 3, "1", null));
        all.add(ex(arms, "Barbell Curl",
                "Curl the barbell to shoulder height.",
                "Avoid using momentum.",
                "Maintain upright posture.",
                null, 0.45f, 10, 4, "2", null));
        all.add(ex(arms, "Hammer Curl",
                "Curl dumbbells while keeping palms facing inward.",
                "Keep elbows close.",
                "Neutral grip throughout.",
                null, 0.40f, 10, 4, "2", null));
        all.add(ex(arms, "Overhead Tricep Extension",
                "Lower the weight behind the head then extend the elbows.",
                "Avoid flaring elbows.",
                "Upper arms stay vertical.",
                null, 0.40f, 10, 4, "2", null));
        all.add(ex(arms, "Preacher Curl",
                "Curl the weight while keeping upper arms on the preacher bench.",
                "Lower slowly.",
                "Arms supported on pad.",
                null, 0.45f, 8, 4, "3", null));
        all.add(ex(arms, "Skull Crusher",
                "Lower the bar toward the forehead then extend the elbows.",
                "Use an EZ bar if wrist discomfort occurs.",
                "Upper arms remain stationary.",
                null, 0.50f, 8, 4, "3", null));
        all.add(ex(arms, "Close Grip Bench Press",
                "Press the barbell while emphasizing the triceps.",
                "Keep wrists straight and elbows close to the body.",
                "Hands slightly narrower than shoulder width.",
                null, 0.65f, 6, 4, "3", null));

        // ===== 5. BỤNG =====
        MuscleGroup core = saveGroup("Bụng", "Nhóm cơ bụng - cơ cốt lõi vững chắc, rèn luyện 6 múi.");
        all.add(ex(core, "Crunch",
                "Lift your shoulders off the floor by contracting the abdominal muscles, then slowly return.",
                "Avoid pulling on your neck with your hands.",
                "Lower back remains on the floor throughout the movement.",
                null, 0.20f, 15, 3, "1", null));
        all.add(ex(core, "Sit Up",
                "Raise your torso until sitting upright, then slowly lower back down.",
                "Do not jerk your body upward.",
                "Feet flat on the floor and knees bent about 90°.",
                null, 0.25f, 15, 3, "1", null));
        all.add(ex(core, "Plank",
                "Support your body on forearms and toes while maintaining a neutral spine.",
                "Do not allow the hips to sag or rise excessively.",
                "Body forms a straight line from head to heels.",
                null, 1.00f, 1, 3, "1", null));
        all.add(ex(core, "Leg Raise",
                "Raise your legs until perpendicular to the floor, then lower under control.",
                "Press your lower back into the floor.",
                "Keep legs straight and lower them without touching the floor.",
                null, 0.35f, 12, 4, "2", null));
        all.add(ex(core, "Russian Twist",
                "Twist your torso from side to side while keeping your core engaged.",
                "Rotate from the torso, not just the arms.",
                "Rotate shoulders together with the torso.",
                null, 0.30f, 20, 4, "2", null));
        all.add(ex(core, "Hanging Knee Raise",
                "Hang from a pull-up bar and lift your knees toward your chest.",
                "Avoid swinging the body.",
                "Raise knees to at least hip level.",
                null, 0.45f, 10, 4, "2", null));
        all.add(ex(core, "Dragon Flag",
                "Raise and lower your entire body while only the shoulders remain on the bench.",
                "Attempt only with sufficient core strength.",
                "Maintain a straight body from shoulders to feet.",
                null, 0.80f, 6, 4, "3", null));
        all.add(ex(core, "Ab Wheel Rollout",
                "Roll the wheel forward until the body is nearly straight, then return.",
                "Do not allow your lower back to arch.",
                "Maintain a neutral spine throughout the rollout.",
                null, 0.75f, 8, 4, "3", null));
        all.add(ex(core, "Toes to Bar",
                "Raise your legs until your toes reach the pull-up bar.",
                "Control both the upward and downward phases.",
                "Touch the bar with your toes while hanging.",
                null, 0.80f, 8, 4, "3", null));

        // ===== 6. CHÂN =====
        MuscleGroup legs = saveGroup("Chân", "Nhóm cơ chân - đôi chân linh hoạt, sức mạnh bức phá.");
        all.add(ex(legs, "Bodyweight Squat",
                "Lower your hips by bending the knees and hips, then stand back up.",
                "Keep your knees tracking over your toes.",
                "Descend until thighs are parallel to the floor.",
                null, 0.35f, 15, 3, "1", null));
        all.add(ex(legs, "Leg Press",
                "Push the platform away until your legs are nearly straight, then lower slowly.",
                "Do not lock your knees.",
                "Knees bend to approximately 90°.",
                null, 0.50f, 12, 3, "1", null));
        all.add(ex(legs, "Leg Extension",
                "Lift the padded lever by extending your knees.",
                "Move slowly to reduce knee stress.",
                "Extend knees fully without locking.",
                null, 0.35f, 12, 3, "1", null));
        all.add(ex(legs, "Back Squat",
                "Squat with a barbell on your upper back before returning to standing.",
                "Keep the chest up and spine neutral.",
                "Hip crease below the top of the knees.",
                null, 0.70f, 8, 4, "2", null));
        all.add(ex(legs, "Romanian Deadlift",
                "Lower the barbell to mid-shin by pushing the hips back, then return upright.",
                "Do not round your back.",
                "Hinge at the hips while maintaining a neutral spine.",
                null, 0.70f, 10, 4, "2", null));
        all.add(ex(legs, "Walking Lunges",
                "Step forward into a lunge and alternate legs while walking.",
                "Keep your torso upright.",
                "Front knee approximately 90°.",
                null, 0.50f, 12, 4, "2", null));
        all.add(ex(legs, "Front Squat",
                "Squat with the barbell resting on the front shoulders.",
                "Maintain an upright torso.",
                "Elbows stay high throughout the movement.",
                null, 0.75f, 6, 5, "3", null));
        all.add(ex(legs, "Bulgarian Split Squat",
                "Place one foot behind you on a bench and perform a single-leg squat.",
                "Maintain your balance throughout the exercise.",
                "Front knee tracks over the toes.",
                null, 0.60f, 8, 4, "3", null));
        all.add(ex(legs, "Pistol Squat",
                "Perform a full squat using only one leg while keeping the other leg extended.",
                "Requires excellent balance, ankle mobility, and leg strength.",
                "Keep the extended leg off the floor.",
                null, 0.80f, 6, 4, "3", null));

        // ===== 7. MÔNG =====
        MuscleGroup glutes = saveGroup("Mông", "Nhóm cơ mông - phát triển vòng 3 săn chắc.");
        all.add(ex(glutes, "Glute Bridge",
                "Push through your heels to raise your hips until your body forms a straight line from shoulders to knees.",
                "Avoid overextending the lower back.",
                "Shoulders remain on the floor and knees bent about 90°.",
                null, 0.35f, 15, 3, "1", null));
        all.add(ex(glutes, "Bodyweight Hip Thrust",
                "Drive through the heels to lift the hips until fully extended.",
                "Keep your chin tucked and core engaged.",
                "Upper back supported on a bench.",
                null, 0.40f, 15, 3, "1", null));
        all.add(ex(glutes, "Step Up",
                "Step onto a bench or box and fully extend the leading leg before stepping down.",
                "Avoid pushing off excessively with the trailing leg.",
                "Entire foot stays on the platform.",
                null, 0.40f, 12, 3, "1", null));
        all.add(ex(glutes, "Hip Thrust",
                "Perform a hip thrust with a barbell across the hips while squeezing the glutes.",
                "Do not hyperextend the lower back.",
                "Hips fully extended at the top.",
                null, 0.65f, 10, 4, "2", null));
        all.add(ex(glutes, "Cable Kickback",
                "Kick one leg backward using a cable machine while squeezing the glutes.",
                "Keep your torso stable.",
                "Leg extends backward without rotating the hips.",
                null, 0.45f, 12, 4, "2", null));
        all.add(ex(glutes, "Goblet Squat",
                "Hold a dumbbell at chest level while performing a squat.",
                "Keep your chest lifted.",
                "Descend until thighs are parallel or lower.",
                null, 0.60f, 10, 4, "2", null));
        all.add(ex(glutes, "Barbell Hip Thrust",
                "Perform heavy hip thrusts with a barbell to maximize glute activation.",
                "Use a barbell pad to reduce hip discomfort.",
                "Pause briefly at full hip extension.",
                null, 0.80f, 8, 5, "3", null));
        all.add(ex(glutes, "Sumo Deadlift",
                "Lift the barbell using a wide stance while keeping the torso upright.",
                "Maintain a neutral spine throughout.",
                "Wide stance with toes pointed outward.",
                null, 0.90f, 5, 5, "3", null));
        all.add(ex(glutes, "Bulgarian Split Squat",
                "Place one foot on a bench behind you and perform a squat using the front leg.",
                "Maintain balance and avoid leaning forward.",
                "Front knee aligned with the toes.",
                null, 0.70f, 8, 4, "3", null));

        // ===== 8. SKILLS =====
        MuscleGroup skills = saveGroup("Skills", "Kỹ năng thể dục nâng cao - thách thức giới hạn cơ thể.");
        all.add(ex(skills, "Bear Crawl",
                "Move forward on hands and feet while keeping the core engaged.",
                "Maintain a neutral spine.",
                "Knees remain slightly off the ground.",
                null, 1.00f, 20, 3, "1", null));
        all.add(ex(skills, "Jump Rope",
                "Jump continuously while rotating the rope with your wrists.",
                "Keep jumps low to reduce joint impact.",
                "Land softly on the balls of your feet.",
                null, 0.20f, 100, 3, "1", true));
        all.add(ex(skills, "Wall Handstand Hold",
                "Hold a handstand position using a wall for support.",
                "Keep elbows locked and shoulders active.",
                "Body aligned vertically against the wall.",
                null, 1.00f, 1, 3, "1", null));
        all.add(ex(skills, "L-Sit",
                "Support yourself on parallel bars while keeping the legs extended forward.",
                "Maintain shoulder depression throughout.",
                "Legs parallel to the floor.",
                null, 1.20f, 1, 4, "2", null));
        all.add(ex(skills, "Box Jump",
                "Jump onto a stable box and step back down under control.",
                "Choose a box height appropriate for your ability.",
                "Land softly with knees slightly bent.",
                null, 0.80f, 10, 4, "2", true));
        all.add(ex(skills, "Muscle Up Progression",
                "Practice transition drills to develop the muscle-up movement.",
                "Master pull-ups and dips before attempting.",
                "Smooth transition over the bar.",
                null, 0.90f, 6, 4, "2", null));
        all.add(ex(skills, "Muscle Up",
                "Pull explosively over the bar and transition into a dip.",
                "Requires strong pull-up and dip technique.",
                "Chest passes over the bar before pressing up.",
                null, 1.20f, 5, 5, "3", null));
        all.add(ex(skills, "Front Lever",
                "Hold your body horizontally while hanging from a bar.",
                "Progress gradually using easier variations.",
                "Body held parallel to the floor.",
                null, 1.50f, 1, 5, "3", null));
        all.add(ex(skills, "Human Flag",
                "Support yourself on a vertical pole while holding your body parallel to the ground.",
                "Requires exceptional shoulder, core, and grip strength.",
                "Body remains horizontal throughout the hold.",
                null, 1.60f, 1, 5, "3", null));

        exerciseRepository.saveAll(all);

        return String.format("✅ Seed thành công! 8 nhóm cơ, %d bài tập đã được thêm vào database.", all.size());
    }

    private MuscleGroup saveGroup(String name, String description) {
        MuscleGroup group = new MuscleGroup();
        group.setName(name);
        group.setDescription(description);
        return muscleGroupRepository.save(group);
    }

    private Exercise ex(MuscleGroup group, String name, String technicalDescription, String safetyNotes,
                        String standardAngles, String mediaUrl, float estimatedCaloriesPerRep,
                        int reps, int sets, String level, Boolean isJump) {
        Exercise e = new Exercise();
        e.setMuscleGroup(group);
        e.setName(name);
        e.setTechnicalDescription(technicalDescription);
        e.setSafetyNotes(safetyNotes);
        e.setStandardAngles(standardAngles);
        e.setMediaUrl(mediaUrl);
        e.setEstimatedCaloriesPerRep(estimatedCaloriesPerRep);
        e.setReps(reps);
        e.setSets(sets);
        e.setLevel(level);
        e.setIsJump(isJump);
        return e;
    }
}
