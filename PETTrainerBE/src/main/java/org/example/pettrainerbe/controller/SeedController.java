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
import java.util.HashMap;
import java.util.List;
import java.util.Map;

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

        // Đảm bảo cột avatar đủ lớn để chứa ảnh base64 (ddl-auto=update không tự đổi kiểu cột cũ)
        try { jdbcTemplate.execute("ALTER TABLE users MODIFY picture_url LONGTEXT"); } catch (Exception ignored) {}

        List<Exercise> all = new ArrayList<>();

        // ===== 1. CHEST =====
        MuscleGroup chest = saveGroup("Ngực", "Nhóm cơ ngực - phát triển toàn diện vòng 1.");
        all.add(ex(chest, "Knee Push Up",
                "Lower your chest toward the floor while keeping your knees on the ground, then push back up.",
                "Keep your core engaged and avoid arching your lower back.",
                "Keep your body straight from shoulders to knees with elbows at about 45°.",
                null, 0.25f, 12, 3, "1", null, null));
        all.add(ex(chest, "Push Up",
                "Lower your chest until just above the floor before pressing back to the starting position.",
                "Do not let your hips sag or elbows flare excessively.",
                "Maintain a straight body with elbows around 45°.",
                null, 0.40f, 12, 4, "2", null, "PUSH-UP"));
        all.add(ex(chest, "Diamond Push Up",
                "Perform a push-up with hands close together to increase triceps and inner chest activation.",
                "Keep wrists comfortable and avoid excessive elbow flare.",
                "Hands form a diamond directly under the chest.",
                null, 0.45f, 10, 4, "2", null, null));
        all.add(ex(chest, "Decline Push Up",
                "Place your feet on a chair or bench and perform a push-up to increase upper chest and shoulder activation.",
                "Keep your core tight and avoid letting your hips sag.",
                "Feet elevated on a stable surface with the body kept straight.",
                null, 0.55f, 10, 4, "3", null, null));

        // ===== 2. BACK =====
        MuscleGroup back = saveGroup("Lưng", "Nhóm cơ lưng - rèn luyện tư thế vững chắc.");
        all.add(ex(back, "Superman",
                "Lie face down, lift your arms, chest, and legs off the floor, then slowly lower.",
                "Avoid hyperextending your neck.",
                "Raise both arms and legs simultaneously while keeping the neck neutral.",
                null, 0.20f, 15, 3, "1", null, null));
        all.add(ex(back, "Australian Pull Up",
                "Hang beneath a low bar and pull your chest toward it before lowering under control.",
                "Avoid dropping quickly or shrugging your shoulders.",
                "Keep your body straight while pulling your chest toward the bar.",
                null, 0.45f, 10, 4, "2", null, null));
        all.add(ex(back, "Pull Up",
                "Pull yourself upward using your back and arms, then lower under control.",
                "Avoid swinging your body.",
                "Begin from a dead hang and pull until your chin clears the bar.",
                null, 0.70f, 8, 4, "2", null, "PULL-UP"));
        all.add(ex(back, "Commando Pull Up",
                "Pull your body upward beside the bar while alternating which shoulder approaches the bar each repetition.",
                "Avoid twisting your lower back and control the descent.",
                "Grip the bar with one hand in front of the other and pull until your head reaches the bar.",
                null, 0.80f, 6, 4, "3", null, null));

        // ===== 3. SHOULDER =====
        MuscleGroup shoulders = saveGroup("Vai", "Nhóm cơ vai - vai rộng chuẩn form, sức mạnh thân trên.");
        all.add(ex(shoulders, "Pike Push Up",
                "Lower your head toward the floor before pressing back to the starting position.",
                "Keep your core tight throughout the movement.",
                "Hips high with torso nearly vertical.",
                null, 0.40f, 10, 3, "1", null, null));
        all.add(ex(shoulders, "Wall Handstand Hold",
                "Kick into a handstand using a wall for support and maintain the position.",
                "Keep your shoulders active and elbows locked.",
                "Body remains vertical against the wall.",
                null, 1.00f, 1, 3, "2", null, "HANDSTAND"));
        all.add(ex(shoulders, "Elevated Pike Push Up",
                "Perform a pike push-up with your feet elevated to increase shoulder loading.",
                "Lower under control and keep your elbows at about 45°.",
                "Feet elevated on a chair with hips stacked above the shoulders.",
                null, 0.65f, 8, 4, "3", null, null));
        all.add(ex(shoulders, "Planche Lean",
                "Hold a forward lean position to develop planche strength.",
                "Progress gradually to avoid wrist strain.",
                "Lean your shoulders forward beyond your wrists.",
                null, 1.10f, 1, 4, "3", null, null));

        // ===== 4. ARMS =====
        MuscleGroup arms = saveGroup("Tay", "Nhóm cơ tay - bắp tay săn chắc mạnh mẽ.");
        all.add(ex(arms, "Close Grip Push Up",
                "Perform push-ups while keeping your elbows close to your body.",
                "Maintain a straight body and avoid flaring the elbows.",
                "Hands placed slightly narrower than shoulder width.",
                null, 0.35f, 12, 3, "1", null, null));
        all.add(ex(arms, "Bench Dips",
                "Use a chair or bench to lower and raise your body using your arms.",
                "Avoid lowering too deeply if you feel shoulder discomfort.",
                "Lower until elbows reach approximately 90°.",
                null, 0.40f, 10, 4, "2", null, null));
        all.add(ex(arms, "Chin Up",
                "Pull yourself upward until your chin clears the bar before lowering slowly.",
                "Avoid swinging and maintain full range of motion.",
                "Use a shoulder-width underhand grip.",
                null, 0.70f, 8, 4, "2", null, null));
        all.add(ex(arms, "Bodyweight Triceps Extension",
                "Using a sturdy table edge, bar, or suspension trainer, lower your forehead toward your hands by bending your elbows, then extend your arms to return to the starting position.",
                "Keep your elbows close to your body and avoid letting your hips sag.",
                "Keep your body straight while bending only at the elbows.",
                null, 0.55f, 10, 4, "3", null, null));

        // ===== 5. CORE =====
        MuscleGroup core = saveGroup("Bụng", "Nhóm cơ bụng - cơ cốt lõi vững chắc, rèn luyện 6 múi.");
        all.add(ex(core, "Plank",
                "Support your body on your forearms and toes while keeping your core tight and your body aligned.",
                "Avoid letting your hips sag or rise too high.",
                "Body forms a straight line from head to heels.",
                null, 1.00f, 1, 3, "1", null, "PLANK"));
        all.add(ex(core, "Leg Raise",
                "Raise your legs until they are perpendicular to the floor, then lower them slowly.",
                "Do not swing your legs or arch your lower back.",
                "Keep your legs straight and your lower back pressed against the floor.",
                null, 0.35f, 12, 4, "2", null, null));
        all.add(ex(core, "Hollow Body Hold",
                "Lift your shoulders and legs off the floor while maintaining a hollow body position.",
                "Keep your core engaged throughout the hold.",
                "Lower back remains in contact with the floor.",
                null, 1.10f, 1, 4, "2", null, null));
        all.add(ex(core, "Dragon Flag",
                "Raise and lower your body while only your shoulders remain on the bench.",
                "Attempt only after developing sufficient core strength.",
                "Maintain a straight body from shoulders to feet.",
                null, 0.90f, 5, 5, "3", null, null));

        // ===== 6. LEGS =====
        MuscleGroup legs = saveGroup("Chân", "Nhóm cơ chân - đôi chân linh hoạt, sức mạnh bức phá.");
        all.add(ex(legs, "Bodyweight Squat",
                "Squat down by bending your hips and knees, then return to standing.",
                "Keep your knees aligned with your toes.",
                "Lower until thighs are at least parallel to the floor.",
                null, 0.35f, 15, 3, "1", null, "SQUAT"));
        all.add(ex(legs, "Walking Lunges",
                "Step forward into a lunge and alternate legs while walking.",
                "Keep your torso upright throughout the movement.",
                "Front knee bends to approximately 90°.",
                null, 0.40f, 12, 3, "1", null, null));
        all.add(ex(legs, "Bulgarian Split Squat",
                "Lower yourself using the front leg while the rear foot stays elevated.",
                "Maintain balance and avoid leaning forward.",
                "Rear foot rests on a chair or bench.",
                null, 0.60f, 10, 4, "2", null, null));
        all.add(ex(legs, "Pistol Squat",
                "Perform a full squat using only one leg while keeping the opposite leg off the ground.",
                "Requires good balance, mobility, and leg strength.",
                "Keep one leg extended while squatting on the other.",
                null, 0.80f, 6, 4, "3", null, null));

        // ===== 7. GLUTES =====
        MuscleGroup glutes = saveGroup("Mông", "Nhóm cơ mông - phát triển vòng 3 săn chắc.");
        all.add(ex(glutes, "Glute Bridge",
                "Drive through your heels to raise your hips until your body forms a straight line.",
                "Avoid overextending your lower back.",
                "Knees bent at approximately 90°.",
                null, 0.35f, 15, 3, "1", null, null));
        all.add(ex(glutes, "Hip Thrust",
                "Lift your hips until fully extended while squeezing your glutes.",
                "Keep your chin tucked and avoid arching your back.",
                "Upper back supported on a bench or sofa.",
                null, 0.50f, 12, 4, "2", null, null));
        all.add(ex(glutes, "Single Leg Glute Bridge",
                "Perform a glute bridge while lifting one leg off the ground.",
                "Keep your hips level during the exercise.",
                "One leg remains extended throughout the movement.",
                null, 0.45f, 10, 4, "2", null, null));
        all.add(ex(glutes, "Single Leg Hip Thrust",
                "Perform a hip thrust using only one leg to increase glute activation.",
                "Move slowly and avoid rotating your hips.",
                "Drive through one heel while keeping the hips level.",
                null, 0.65f, 8, 4, "3", null, null));

        // ===== 8. SKILLS =====
        MuscleGroup skills = saveGroup("Skills", "Kỹ năng thể dục nâng cao - thách thức giới hạn cơ thể.");
        all.add(ex(skills, "Bear Crawl",
                "Move forward using opposite hand and foot while keeping your core engaged.",
                "Maintain a neutral spine throughout.",
                "Keep knees slightly above the floor.",
                null, 0.80f, 20, 3, "1", null, null));
        all.add(ex(skills, "L-Sit",
                "Support yourself on parallettes or sturdy chairs while holding your legs straight.",
                "Lock your elbows and keep your shoulders depressed.",
                "Legs remain parallel to the ground.",
                null, 1.20f, 1, 4, "2", null, null));
        all.add(ex(skills, "Handstand",
                "Balance upside down on your hands while maintaining body alignment.",
                "Practice against a wall before attempting a free-standing handstand.",
                "Maintain a straight vertical body line.",
                null, 1.30f, 1, 5, "3", null, "HANDSTAND"));
        all.add(ex(skills, "Human Flag",
                "Hold your body parallel to the ground while gripping a vertical pole.",
                "Requires advanced shoulder, core, and grip strength.",
                "Body remains horizontal throughout the hold.",
                null, 1.60f, 1, 5, "3", null, null));

        // Mô tả & lưu ý an toàn bằng tiếng Việt (áp theo tên bài) — [descVi, safetyVi]
        Map<String, String[]> vi = new HashMap<>();
        vi.put("Knee Push Up", new String[]{"Hạ ngực về phía sàn trong khi giữ đầu gối trên mặt đất, sau đó đẩy người lên lại.", "Giữ cơ trung tâm (core) siết chặt và tránh võng lưng dưới."});
        vi.put("Push Up", new String[]{"Hạ ngực xuống gần sát sàn rồi đẩy người trở về tư thế ban đầu.", "Không để hông võng xuống hoặc khuỷu tay xòe ra quá mức."});
        vi.put("Diamond Push Up", new String[]{"Thực hiện chống đẩy với hai tay chụm lại để tăng kích hoạt cơ tam đầu và ngực trong.", "Giữ cổ tay thoải mái và tránh xòe khuỷu tay quá mức."});
        vi.put("Decline Push Up", new String[]{"Đặt chân lên ghế hoặc băng ghế rồi chống đẩy để tăng kích hoạt ngực trên và vai.", "Giữ cơ core siết chặt và không để hông võng xuống."});
        vi.put("Superman", new String[]{"Nằm sấp, nâng tay, ngực và chân khỏi sàn, sau đó hạ xuống từ từ.", "Tránh ngửa cổ ra sau quá mức."});
        vi.put("Australian Pull Up", new String[]{"Treo người dưới thanh xà thấp và kéo ngực về phía thanh, sau đó hạ xuống có kiểm soát.", "Tránh buông người xuống nhanh hoặc rụt vai."});
        vi.put("Pull Up", new String[]{"Kéo người lên bằng cơ lưng và tay, sau đó hạ xuống có kiểm soát.", "Tránh đung đưa thân người."});
        vi.put("Commando Pull Up", new String[]{"Kéo người lên bên cạnh thanh xà, luân phiên đổi vai tiến sát thanh ở mỗi lần.", "Tránh vặn lưng dưới và kiểm soát khi hạ người."});
        vi.put("Pike Push Up", new String[]{"Hạ đầu về phía sàn rồi đẩy người trở lại tư thế ban đầu.", "Giữ cơ core siết chặt trong suốt động tác."});
        vi.put("Wall Handstand Hold", new String[]{"Đá chân lên trồng chuối dựa vào tường để hỗ trợ và giữ nguyên tư thế.", "Giữ vai hoạt động và khóa khuỷu tay."});
        vi.put("Elevated Pike Push Up", new String[]{"Thực hiện pike push-up với chân kê cao để tăng tải cho vai.", "Hạ người có kiểm soát và giữ khuỷu tay khoảng 45°."});
        vi.put("Planche Lean", new String[]{"Giữ tư thế nghiêng người về trước để phát triển sức mạnh cho động tác planche.", "Tăng độ khó từ từ để tránh căng cổ tay."});
        vi.put("Close Grip Push Up", new String[]{"Chống đẩy trong khi giữ khuỷu tay sát vào thân người.", "Giữ thân người thẳng và tránh xòe khuỷu tay."});
        vi.put("Bench Dips", new String[]{"Dùng ghế hoặc băng ghế để hạ và nâng cơ thể bằng lực của cánh tay.", "Tránh hạ người quá sâu nếu thấy khó chịu ở vai."});
        vi.put("Chin Up", new String[]{"Kéo người lên đến khi cằm vượt qua thanh xà rồi hạ xuống từ từ.", "Tránh đung đưa và giữ đủ biên độ chuyển động."});
        vi.put("Bodyweight Triceps Extension", new String[]{"Dùng mép bàn chắc chắn, thanh xà hoặc dây treo, gập khuỷu tay hạ trán về phía bàn tay rồi duỗi tay để trở về tư thế ban đầu.", "Giữ khuỷu tay sát thân và không để hông võng xuống."});
        vi.put("Plank", new String[]{"Chống người trên cẳng tay và mũi chân, giữ cơ core siết chặt và thân người thẳng hàng.", "Tránh để hông võng xuống hoặc nâng lên quá cao."});
        vi.put("Leg Raise", new String[]{"Nâng chân lên đến khi vuông góc với sàn, sau đó hạ xuống từ từ.", "Không đung đưa chân hoặc ưỡn lưng dưới."});
        vi.put("Hollow Body Hold", new String[]{"Nâng vai và chân khỏi sàn trong khi giữ tư thế thân lõm (hollow body).", "Giữ cơ core siết chặt trong suốt thời gian giữ."});
        vi.put("Dragon Flag", new String[]{"Nâng và hạ cơ thể trong khi chỉ có phần vai còn tựa trên băng ghế.", "Chỉ nên thực hiện sau khi đã đủ sức mạnh cơ core."});
        vi.put("Bodyweight Squat", new String[]{"Hạ người xuống bằng cách gập hông và gối, sau đó đứng thẳng trở lại.", "Giữ đầu gối thẳng hàng với mũi chân."});
        vi.put("Walking Lunges", new String[]{"Bước tới thành tư thế lunge và luân phiên đổi chân khi bước đi.", "Giữ thân trên thẳng đứng trong suốt động tác."});
        vi.put("Bulgarian Split Squat", new String[]{"Hạ người bằng chân trước trong khi chân sau kê cao.", "Giữ thăng bằng và tránh nghiêng người về trước."});
        vi.put("Pistol Squat", new String[]{"Thực hiện squat sâu bằng một chân trong khi giữ chân còn lại khỏi mặt đất.", "Cần thăng bằng, độ linh hoạt và sức mạnh chân tốt."});
        vi.put("Glute Bridge", new String[]{"Dồn lực vào gót chân để nâng hông lên đến khi cơ thể tạo thành đường thẳng.", "Tránh ưỡn lưng dưới quá mức."});
        vi.put("Hip Thrust", new String[]{"Nâng hông lên đến khi duỗi hết trong khi siết chặt cơ mông.", "Giữ cằm thu vào và tránh ưỡn lưng."});
        vi.put("Single Leg Glute Bridge", new String[]{"Thực hiện glute bridge trong khi nâng một chân khỏi mặt đất.", "Giữ hông cân bằng trong suốt bài tập."});
        vi.put("Single Leg Hip Thrust", new String[]{"Thực hiện hip thrust bằng một chân để tăng kích hoạt cơ mông.", "Di chuyển chậm rãi và tránh xoay hông."});
        vi.put("Bear Crawl", new String[]{"Di chuyển về trước bằng tay và chân đối nghịch trong khi giữ cơ core siết chặt.", "Giữ cột sống trung tính trong suốt động tác."});
        vi.put("L-Sit", new String[]{"Chống người trên thanh parallette hoặc ghế chắc chắn trong khi giữ chân duỗi thẳng.", "Khóa khuỷu tay và giữ vai hạ xuống."});
        vi.put("Handstand", new String[]{"Giữ thăng bằng lộn ngược trên hai tay trong khi giữ cơ thể thẳng hàng.", "Tập dựa tường trước khi thử trồng chuối tự do."});
        vi.put("Human Flag", new String[]{"Giữ cơ thể song song với mặt đất trong khi bám vào cột dọc.", "Cần sức mạnh vai, core và lực nắm ở trình độ cao."});

        // Ảnh minh họa từng bài tập (áp theo tên bài)
        Map<String, String> media = new HashMap<>();
        media.put("Knee Push Up", "https://cdn.nhathuoclongchau.com.vn/unsafe/800x0/knee_push_ups_loi_ich_ky_thuat_thuc_hien_va_cach_dam_bao_an_toan_3_80432a2dd8.jpeg");
        media.put("Push Up", "https://experiencelife.lifetime.life/wp-content/uploads/2007/04/apr07-pushup-1024x577.jpg");
        media.put("Diamond Push Up", "https://www.womenfitness.net/wp/wp-content/uploads/2018/03/brooke-stacey-arm-workout-triangle-push-up-1.jpg");
        media.put("Decline Push Up", "https://cdn.nhathuoclongchau.com.vn/unsafe/800x0/bai_tap_decline_push_up_phat_trien_nguc_tren_hieu_qua_3_7cdd671fc7.jpg");
        media.put("Superman", "https://bellabeat.com/wp-content/uploads/elementor/thumbs/Superman-exercise-Bellabeat-Coach-q5xmr2cn00tt0g2d5hj4ljinp8y1zzwjc36v02kyps.jpg");
        media.put("Australian Pull Up", "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQyu3iBZN9_8jbB6qzMBoEXmTCNBu2ryg5oVQ&s");
        media.put("Pull Up", "https://blogscdn.thehut.net/app/uploads/sites/478/2024/04/Untitled-design-20_1740137087-scaled.jpg");
        media.put("Commando Pull Up", "https://media.istockphoto.com/id/1203852043/vi/anh/v%E1%BA%ADn-%C4%91%E1%BB%99ng-vi%C3%AAn-th%E1%BB%B1c-hi%E1%BB%87n-m%E1%BB%99t-pull-up-commando.jpg?s=170667a&w=0&k=20&c=mRugRzm9tBOLgyQTOFbQxSl7wPyynroqvPwLBMwrUWc=");
        media.put("Pike Push Up", "https://i.ytimg.com/vi/x7_I5SUAd00/maxresdefault.jpg");
        media.put("Wall Handstand Hold", "https://b1494239.smushcdn.com/1494239/wp-content/uploads/2014/08/handstand-hold-against-wall-e1458363458858.jpg?lossy=0&strip=1&webp=1");
        media.put("Elevated Pike Push Up", "https://i.ytimg.com/vi/Pzth0n3oWBQ/maxresdefault.jpg");
        media.put("Planche Lean", "https://andrystrong.com/wp-content/uploads/2023/10/bas-1024x576.webp");
        media.put("Close Grip Push Up", "https://cdn.shopify.com/s/files/1/0272/2408/0419/files/Close-Grip_Push-Ups.webp?v=1719858923");
        media.put("Bench Dips", "https://hips.hearstapps.com/hmg-prod/images/img-2220-jpg-1571859261.jpg");
        media.put("Chin Up", "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS75kTEc1if5DRh0vbXKXC4EhV8GycpvAA5Hg&s");
        media.put("Bodyweight Triceps Extension", "https://i.ytimg.com/vi/MYw-v1WQgEk/hq720.jpg?sqp=-oaymwE7CK4FEIIDSFryq4qpAy0IARUAAAAAGAElAADIQj0AgKJD8AEB-AH-CYAC0AWKAgwIABABGF0gXShdMA8=&rs=AOn4CLAHGBaeoeyWY4LrXBzKmlz8S_Vc-w");
        media.put("Plank", "https://cdn2.fptshop.com.vn/unsafe/1920x0/filters:format(webp):quality(75)/plank_la_gi_2_2c615b3c8c.png");
        media.put("Leg Raise", "https://hips.hearstapps.com/hmg-prod/images/lying-leg-raises-1546550690.jpg?crop=0.750xw:1.00xh;0.0829xw,0&resize=640:*");
        media.put("Hollow Body Hold", "https://igapilates.vn/cms/uploads/hollow_body_hold_2_0e386f7fc5.webp");
        media.put("Dragon Flag", "https://i0.wp.com/www.muscleandfitness.com/wp-content/uploads/2026/05/Muscular-fit-and-athletic-man-with-a-solid-six-pack-performing-Bruce-Lees-dragon-flag-exercise-.jpg?w=1109&quality=86&strip=all");
        media.put("Bodyweight Squat", "https://cdn2.stylecraze.com/wp-content/uploads/2017/11/Squats-101-How-To-Do-A-Squat-Properly.jpg.webp");
        media.put("Walking Lunges", "https://i.ytimg.com/vi/L8fvypPrzzs/maxresdefault.jpg");
        media.put("Bulgarian Split Squat", "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQCSp_xz1Yj7dLhMPNdh3877JTGA_nad3jOqw&s");
        media.put("Pistol Squat", "https://hips.hearstapps.com/hmg-prod/images/pistol-squat-0076-665a17efc895d.jpg?crop=0.901xw:0.569xh;0,0.222xh&resize=980:*");
        media.put("Glute Bridge", "https://fitnfemale.com/wp-content/uploads/glute-bridge.jpg.webp");
        media.put("Hip Thrust", "https://ca.repfitness.com/cdn/shop/articles/Smith-Machine-Hip-Thrust.jpg?v=1760570121");
        media.put("Single Leg Glute Bridge", "https://images.ctfassets.net/hjcv6wdwxsdz/4iQuJ3qRQV5nyupE1KeoGe/b6915c592809195d06fcd7215f5b397e/woman-doing-single-leg-bridge-on-yoga-mat.png");
        media.put("Single Leg Hip Thrust", "https://www.puregym.com/media/0d3jgor4/single-leg-hip-thrust.jpg?quality=80");
        media.put("Bear Crawl", "https://experiencelife.lifetime.life/wp-content/uploads/2022/01/mar22-bid-bear-crawl.jpg");
        media.put("L-Sit", "https://experiencelife.lifetime.life/wp-content/uploads/2025/07/so25-bid-l-sit-1024x577.jpg");
        media.put("Handstand", "https://cdn.shopify.com/s/files/1/0568/6280/2107/files/handstand_0457e95e-8fca-41ee-b172-15eeb5cc23f0.jpg");
        media.put("Human Flag", "https://www.onnit.com/cdn/shop/articles/HumanFlag2_0d72b3c4-e1b7-4b11-ac75-b98c8be9b136.jpg?v=1772221742&width=1260");

        for (Exercise e : all) {
            String[] content = vi.get(e.getName());
            if (content != null) {
                e.setTechnicalDescriptionVi(content[0]);
                e.setSafetyNotesVi(content[1]);
            }
            String img = media.get(e.getName());
            if (img != null) {
                e.setMediaUrl(img);
            }
        }

        exerciseRepository.saveAll(all);

        return String.format("✅ Seed thành công! 8 nhóm cơ, %d bài tập đã được thêm vào database. [v3-media-urls]", all.size());
    }

    private MuscleGroup saveGroup(String name, String description) {
        MuscleGroup group = new MuscleGroup();
        group.setName(name);
        group.setDescription(description);
        return muscleGroupRepository.save(group);
    }

    private Exercise ex(MuscleGroup group, String name, String technicalDescription, String safetyNotes,
                        String standardAngles, String mediaUrl, float estimatedCaloriesPerRep,
                        int reps, int sets, String level, Boolean isJump, String aiMode) {
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
        e.setAiMode(aiMode);
        return e;
    }
}
