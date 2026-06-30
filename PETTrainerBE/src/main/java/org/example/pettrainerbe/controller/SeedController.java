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
        errorLogRepository.deleteAll();
        workoutDetailRepository.deleteAll();
        exerciseRepository.deleteAll();
        muscleGroupRepository.deleteAll();

        jdbcTemplate.execute("ALTER TABLE exercises AUTO_INCREMENT = 1");
        jdbcTemplate.execute("ALTER TABLE muscle_groups AUTO_INCREMENT = 1");

        List<Exercise> all = new ArrayList<>();

        // ===== 1. CHEST =====
        MuscleGroup chest = saveGroup("Ngực", "Nhóm cơ ngực - phát triển toàn diện vòng 1.");
        all.add(ex(chest, "Knee Push Up",
                "Lower your chest toward the floor while keeping your knees on the ground, then push back up.",
                "Keep your core engaged and avoid arching your lower back.",
                "Keep your body straight from shoulders to knees with elbows at about 45°.",
                null, 0.25f, 12, 3, "1", null));
        all.add(ex(chest, "Push Up",
                "Lower your chest until just above the floor before pressing back to the starting position.",
                "Do not let your hips sag or elbows flare excessively.",
                "Maintain a straight body with elbows around 45°.",
                null, 0.40f, 12, 4, "2", null));
        all.add(ex(chest, "Diamond Push Up",
                "Perform a push-up with hands close together to increase triceps and inner chest activation.",
                "Keep wrists comfortable and avoid excessive elbow flare.",
                "Hands form a diamond directly under the chest.",
                null, 0.45f, 10, 4, "2", null));
        all.add(ex(chest, "Decline Push Up",
                "Place your feet on a chair or bench and perform a push-up to increase upper chest and shoulder activation.",
                "Keep your core tight and avoid letting your hips sag.",
                "Feet elevated on a stable surface with the body kept straight.",
                null, 0.55f, 10, 4, "3", null));

        // ===== 2. BACK =====
        MuscleGroup back = saveGroup("Lưng", "Nhóm cơ lưng - rèn luyện tư thế vững chắc.");
        all.add(ex(back, "Superman",
                "Lie face down, lift your arms, chest, and legs off the floor, then slowly lower.",
                "Avoid hyperextending your neck.",
                "Raise both arms and legs simultaneously while keeping the neck neutral.",
                null, 0.20f, 15, 3, "1", null));
        all.add(ex(back, "Australian Pull Up",
                "Hang beneath a low bar and pull your chest toward it before lowering under control.",
                "Avoid dropping quickly or shrugging your shoulders.",
                "Keep your body straight while pulling your chest toward the bar.",
                null, 0.45f, 10, 4, "2", null));
        all.add(ex(back, "Pull Up",
                "Pull yourself upward using your back and arms, then lower under control.",
                "Avoid swinging your body.",
                "Begin from a dead hang and pull until your chin clears the bar.",
                null, 0.70f, 8, 4, "2", null));
        all.add(ex(back, "Commando Pull Up",
                "Pull your body upward beside the bar while alternating which shoulder approaches the bar each repetition.",
                "Avoid twisting your lower back and control the descent.",
                "Grip the bar with one hand in front of the other and pull until your head reaches the bar.",
                null, 0.80f, 6, 4, "3", null));

        // ===== 3. SHOULDER =====
        MuscleGroup shoulders = saveGroup("Vai", "Nhóm cơ vai - vai rộng chuẩn form, sức mạnh thân trên.");
        all.add(ex(shoulders, "Pike Push Up",
                "Lower your head toward the floor before pressing back to the starting position.",
                "Keep your core tight throughout the movement.",
                "Hips high with torso nearly vertical.",
                null, 0.40f, 10, 3, "1", null));
        all.add(ex(shoulders, "Wall Handstand Hold",
                "Kick into a handstand using a wall for support and maintain the position.",
                "Keep your shoulders active and elbows locked.",
                "Body remains vertical against the wall.",
                null, 1.00f, 1, 3, "2", null));
        all.add(ex(shoulders, "Elevated Pike Push Up",
                "Perform a pike push-up with your feet elevated to increase shoulder loading.",
                "Lower under control and keep your elbows at about 45°.",
                "Feet elevated on a chair with hips stacked above the shoulders.",
                null, 0.65f, 8, 4, "3", null));
        all.add(ex(shoulders, "Planche Lean",
                "Hold a forward lean position to develop planche strength.",
                "Progress gradually to avoid wrist strain.",
                "Lean your shoulders forward beyond your wrists.",
                null, 1.00f, 1, 4, "3", null));

        // ===== 4. ARMS =====
        MuscleGroup arms = saveGroup("Tay", "Nhóm cơ tay - bắp tay săn chắc mạnh mẽ.");
        all.add(ex(arms, "Close Grip Push Up",
                "Perform push-ups while keeping your elbows close to your body.",
                "Maintain a straight body and avoid flaring the elbows.",
                "Hands placed slightly narrower than shoulder width.",
                null, 0.35f, 12, 3, "1", null));
        all.add(ex(arms, "Bench Dips",
                "Use a chair or bench to lower and raise your body using your arms.",
                "Avoid lowering too deeply if you feel shoulder discomfort.",
                "Lower until elbows reach approximately 90°.",
                null, 0.40f, 10, 4, "2", null));
        all.add(ex(arms, "Chin Up",
                "Pull yourself upward until your chin clears the bar before lowering slowly.",
                "Avoid swinging and maintain full range of motion.",
                "Use a shoulder-width underhand grip.",
                null, 0.70f, 8, 4, "2", null));
        all.add(ex(arms, "Bodyweight Triceps Extension",
                "Using a sturdy table edge, bar, or suspension trainer, lower your forehead toward your hands by bending your elbows, then extend your arms to return to the starting position.",
                "Keep your elbows close to your body and avoid letting your hips sag.",
                "Keep your body straight while bending only at the elbows.",
                null, 0.55f, 10, 4, "3", null));

        // ===== 5. CORE =====
        MuscleGroup core = saveGroup("Bụng", "Nhóm cơ bụng - cơ cốt lõi vững chắc, rèn luyện 6 múi.");
        all.add(ex(core, "Plank",
                "Support your body on your forearms and toes while keeping your core tight and your body aligned.",
                "Avoid letting your hips sag or rise too high.",
                "Body forms a straight line from head to heels.",
                null, 1.00f, 1, 3, "1", null));
        all.add(ex(core, "Leg Raise",
                "Raise your legs until they are perpendicular to the floor, then lower them slowly.",
                "Do not swing your legs or arch your lower back.",
                "Keep your legs straight and your lower back pressed against the floor.",
                null, 0.35f, 12, 4, "2", null));
        all.add(ex(core, "Hollow Body Hold",
                "Lift your shoulders and legs off the floor while maintaining a hollow body position.",
                "Keep your core engaged throughout the hold.",
                "Lower back remains in contact with the floor.",
                null, 1.10f, 1, 4, "2", null));
        all.add(ex(core, "Dragon Flag",
                "Raise and lower your body while only your shoulders remain on the bench.",
                "Attempt only after developing sufficient core strength.",
                "Maintain a straight body from shoulders to feet.",
                null, 0.90f, 5, 5, "3", null));

        // ===== 6. LEGS =====
        MuscleGroup legs = saveGroup("Chân", "Nhóm cơ chân - đôi chân linh hoạt, sức mạnh bức phá.");
        all.add(ex(legs, "Bodyweight Squat",
                "Squat down by bending your hips and knees, then return to standing.",
                "Keep your knees aligned with your toes.",
                "Lower until thighs are at least parallel to the floor.",
                null, 0.35f, 15, 3, "1", null));
        all.add(ex(legs, "Walking Lunges",
                "Step forward into a lunge and alternate legs while walking.",
                "Keep your torso upright throughout the movement.",
                "Front knee bends to approximately 90°.",
                null, 0.40f, 12, 3, "1", null));
        all.add(ex(legs, "Bulgarian Split Squat",
                "Lower yourself using the front leg while the rear foot stays elevated.",
                "Maintain balance and avoid leaning forward.",
                "Rear foot rests on a chair or bench.",
                null, 0.60f, 10, 4, "2", null));
        all.add(ex(legs, "Pistol Squat",
                "Perform a full squat using only one leg while keeping the opposite leg off the ground.",
                "Requires good balance, mobility, and leg strength.",
                "Keep one leg extended while squatting on the other.",
                null, 0.80f, 6, 4, "3", null));

        // ===== 7. GLUTES =====
        MuscleGroup glutes = saveGroup("Mông", "Nhóm cơ mông - phát triển vòng 3 săn chắc.");
        all.add(ex(glutes, "Glute Bridge",
                "Drive through your heels to raise your hips until your body forms a straight line.",
                "Avoid overextending your lower back.",
                "Knees bent at approximately 90°.",
                null, 0.35f, 15, 3, "1", null));
        all.add(ex(glutes, "Hip Thrust",
                "Lift your hips until fully extended while squeezing your glutes.",
                "Keep your chin tucked and avoid arching your back.",
                "Upper back supported on a bench or sofa.",
                null, 0.50f, 12, 4, "2", null));
        all.add(ex(glutes, "Single Leg Glute Bridge",
                "Perform a glute bridge while lifting one leg off the ground.",
                "Keep your hips level during the exercise.",
                "One leg remains extended throughout the movement.",
                null, 0.45f, 10, 4, "2", null));
        all.add(ex(glutes, "Single Leg Hip Thrust",
                "Perform a hip thrust using only one leg to increase glute activation.",
                "Move slowly and avoid rotating your hips.",
                "Drive through one heel while keeping the hips level.",
                null, 0.65f, 8, 4, "3", null));

        // ===== 8. SKILLS =====
        MuscleGroup skills = saveGroup("Skills", "Kỹ năng thể dục nâng cao - thách thức giới hạn cơ thể.");
        all.add(ex(skills, "Bear Crawl",
                "Move forward using opposite hand and foot while keeping your core engaged.",
                "Maintain a neutral spine throughout.",
                "Keep knees slightly above the floor.",
                null, 0.80f, 20, 3, "1", null));
        all.add(ex(skills, "L-Sit",
                "Support yourself on parallettes or sturdy chairs while holding your legs straight.",
                "Lock your elbows and keep your shoulders depressed.",
                "Legs remain parallel to the ground.",
                null, 1.20f, 1, 4, "2", null));
        all.add(ex(skills, "Handstand",
                "Balance upside down on your hands while maintaining body alignment.",
                "Practice against a wall before attempting a free-standing handstand.",
                "Maintain a straight vertical body line.",
                null, 1.30f, 1, 5, "3", null));
        all.add(ex(skills, "Human Flag",
                "Hold your body parallel to the ground while gripping a vertical pole.",
                "Requires advanced shoulder, core, and grip strength.",
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
