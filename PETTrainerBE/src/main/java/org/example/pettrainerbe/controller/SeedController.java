package org.example.pettrainerbe.controller;

import org.example.pettrainerbe.model.Exercise;
import org.example.pettrainerbe.model.MuscleGroup;
import org.example.pettrainerbe.repository.ExerciseRepository;
import org.example.pettrainerbe.repository.MuscleGroupRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/seed")
public class SeedController {

    @Autowired
    private MuscleGroupRepository muscleGroupRepository;

    @Autowired
    private ExerciseRepository exerciseRepository;

    @PostMapping
    public String seed() {
        // Xóa dữ liệu cũ nếu có
        exerciseRepository.deleteAll();
        muscleGroupRepository.deleteAll();

        // ===== NGỰC =====
        MuscleGroup chest = new MuscleGroup();
        chest.setName("Ngực");
        chest.setDescription("Nhóm cơ ngực (Chest)");
        muscleGroupRepository.save(chest);

        Exercise pushUp = new Exercise();
        pushUp.setMuscleGroup(chest);
        pushUp.setName("Hít đất (Push-up)");
        pushUp.setTechnicalDescription("Nằm sấp, hai tay rộng bằng vai, hạ người xuống rồi đẩy lên.");
        pushUp.setSafetyNotes("Giữ lưng thẳng, không võng hông.");
        pushUp.setMediaUrl("https://example.com/pushup.gif");
        pushUp.setEstimatedCaloriesPerRep(0.5f);
        exerciseRepository.save(pushUp);

        Exercise chestPress = new Exercise();
        chestPress.setMuscleGroup(chest);
        chestPress.setName("Chống đẩy hẹp (Diamond Push-up)");
        chestPress.setTechnicalDescription("Hai tay đặt gần nhau hình kim cương, hạ người xuống rồi đẩy lên.");
        chestPress.setSafetyNotes("Không để khuỷu tay bung ra ngoài.");
        chestPress.setMediaUrl("https://example.com/diamond-pushup.gif");
        chestPress.setEstimatedCaloriesPerRep(0.6f);
        exerciseRepository.save(chestPress);

        // ===== TAY =====
        MuscleGroup arms = new MuscleGroup();
        arms.setName("Tay");
        arms.setDescription("Nhóm cơ tay (Arms - Biceps & Triceps)");
        muscleGroupRepository.save(arms);

        Exercise tricepDip = new Exercise();
        tricepDip.setMuscleGroup(arms);
        tricepDip.setName("Tricep Dip");
        tricepDip.setTechnicalDescription("Chống tay sau lưng lên ghế, hạ người xuống rồi đẩy lên.");
        tricepDip.setSafetyNotes("Không để vai nhô lên quá cao.");
        tricepDip.setMediaUrl("https://example.com/tricep-dip.gif");
        tricepDip.setEstimatedCaloriesPerRep(0.4f);
        exerciseRepository.save(tricepDip);

        Exercise bicepCurl = new Exercise();
        bicepCurl.setMuscleGroup(arms);
        bicepCurl.setName("Bicep Curl (không tạ)");
        bicepCurl.setTechnicalDescription("Dùng vật nặng tại nhà, co tay từ thẳng lên gập 90 độ.");
        bicepCurl.setSafetyNotes("Giữ khuỷu tay cố định, không lắc người.");
        bicepCurl.setMediaUrl("https://example.com/bicep-curl.gif");
        bicepCurl.setEstimatedCaloriesPerRep(0.3f);
        exerciseRepository.save(bicepCurl);

        // ===== CHÂN =====
        MuscleGroup legs = new MuscleGroup();
        legs.setName("Chân");
        legs.setDescription("Nhóm cơ chân (Legs - Quads, Hamstrings, Glutes)");
        muscleGroupRepository.save(legs);

        Exercise squat = new Exercise();
        squat.setMuscleGroup(legs);
        squat.setName("Squat");
        squat.setTechnicalDescription("Đứng rộng bằng vai, hạ người xuống như ngồi ghế rồi đứng lên.");
        squat.setSafetyNotes("Không để đầu gối vượt quá mũi chân, không cụp đuôi sụn.");
        squat.setMediaUrl("https://example.com/squat.gif");
        squat.setEstimatedCaloriesPerRep(0.8f);
        exerciseRepository.save(squat);

        Exercise lunge = new Exercise();
        lunge.setMuscleGroup(legs);
        lunge.setName("Lunge");
        lunge.setTechnicalDescription("Bước một chân ra trước, hạ gối sau xuống gần sàn rồi đứng lên.");
        lunge.setSafetyNotes("Gối trước không vượt mũi chân, lưng thẳng.");
        lunge.setMediaUrl("https://example.com/lunge.gif");
        lunge.setEstimatedCaloriesPerRep(0.7f);
        exerciseRepository.save(lunge);

        // ===== LƯNG =====
        MuscleGroup back = new MuscleGroup();
        back.setName("Lưng");
        back.setDescription("Nhóm cơ lưng (Back)");
        muscleGroupRepository.save(back);

        Exercise superman = new Exercise();
        superman.setMuscleGroup(back);
        superman.setName("Superman");
        superman.setTechnicalDescription("Nằm sấp, nâng đồng thời tay và chân lên cao, giữ 2 giây.");
        superman.setSafetyNotes("Không ngẩng cổ quá cao, giữ cổ trung lập.");
        superman.setMediaUrl("https://example.com/superman.gif");
        superman.setEstimatedCaloriesPerRep(0.4f);
        exerciseRepository.save(superman);

        // ===== VAI =====
        MuscleGroup shoulders = new MuscleGroup();
        shoulders.setName("Vai");
        shoulders.setDescription("Nhóm cơ vai (Shoulders)");
        muscleGroupRepository.save(shoulders);

        Exercise pikePushUp = new Exercise();
        pikePushUp.setMuscleGroup(shoulders);
        pikePushUp.setName("Pike Push-up");
        pikePushUp.setTechnicalDescription("Chống đẩy với hông nâng cao, cơ thể hình chữ V ngược.");
        pikePushUp.setSafetyNotes("Giữ cổ thẳng, không để đầu chạm đất mạnh.");
        pikePushUp.setMediaUrl("https://example.com/pike-pushup.gif");
        pikePushUp.setEstimatedCaloriesPerRep(0.6f);
        exerciseRepository.save(pikePushUp);

        // ===== BỤNG =====
        MuscleGroup abs = new MuscleGroup();
        abs.setName("Bụng");
        abs.setDescription("Nhóm cơ bụng (Abs & Core)");
        muscleGroupRepository.save(abs);

        Exercise crunch = new Exercise();
        crunch.setMuscleGroup(abs);
        crunch.setName("Crunch");
        crunch.setTechnicalDescription("Nằm ngửa, gập gối, nâng vai lên khỏi sàn bằng cơ bụng.");
        crunch.setSafetyNotes("Không kéo cổ, tay đặt sau đầu nhẹ nhàng.");
        crunch.setMediaUrl("https://example.com/crunch.gif");
        crunch.setEstimatedCaloriesPerRep(0.3f);
        exerciseRepository.save(crunch);

        Exercise plank = new Exercise();
        plank.setMuscleGroup(abs);
        plank.setName("Plank");
        plank.setTechnicalDescription("Chống tay hoặc khuỷu tay, giữ thân thẳng như tấm ván.");
        plank.setSafetyNotes("Không để hông võng xuống hoặc nâng quá cao.");
        plank.setMediaUrl("https://example.com/plank.gif");
        plank.setEstimatedCaloriesPerRep(0.2f);
        exerciseRepository.save(plank);

        return "✅ Seed thành công! 6 nhóm cơ, 10 bài tập đã được thêm vào database.";
    }
}