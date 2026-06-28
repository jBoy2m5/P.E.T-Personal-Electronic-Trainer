package org.example.pettrainerbe.controller;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import org.example.pettrainerbe.model.User;
import org.example.pettrainerbe.repository.UserRepository;
import org.example.pettrainerbe.security.JwtUtil;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;
    
    // Client ID from user request
    private final String clientId = "691147162344-2iulu9dr1tm8e2olaqtvsjtrq26mkj0d.apps.googleusercontent.com";

    public AuthController(UserRepository userRepository, JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/google-login")
    public ResponseEntity<?> googleLogin(@RequestBody Map<String, String> payload, HttpServletResponse response) {
        String tokenString = payload.get("credential");
        
        try {
            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(new NetHttpTransport(), new GsonFactory())
                    .setAudience(Collections.singletonList(clientId))
                    .build();

            GoogleIdToken idToken = verifier.verify(tokenString);
            if (idToken != null) {
                GoogleIdToken.Payload googlePayload = idToken.getPayload();
                String email = googlePayload.getEmail();
                String googleOauthId = googlePayload.getSubject();
                String name = (String) googlePayload.get("name");
                String pictureUrl = (String) googlePayload.get("picture");

                User user = userRepository.findByEmail(email);
                boolean needsOnboarding = false;

                if (user == null) {
                    user = new User();
                    user.setEmail(email);
                    user.setGoogleOauthId(googleOauthId);
                    user.setName(name);
                    user.setPictureUrl(pictureUrl);
                    userRepository.save(user);
                    needsOnboarding = true;
                } else {
                    // Update name and picture in case they changed or were null
                    user.setName(name);
                    user.setPictureUrl(pictureUrl);
                    userRepository.save(user);

                    if (user.getHeight() == null || user.getWeight() == null || user.getFitnessGoal() == null) {
                        needsOnboarding = true;
                    }
                }

                String jwt = jwtUtil.generateToken(email);

                Cookie cookie = new Cookie("jwt-token", jwt);
                cookie.setHttpOnly(true);
                cookie.setSecure(false);
                cookie.setPath("/");
                cookie.setMaxAge(5 * 60 * 60);
                response.addCookie(cookie);

                Map<String, Object> responseBody = new HashMap<>();
                responseBody.put("status", "success");
                responseBody.put("message", "Đăng nhập Google thành công");
                responseBody.put("needsOnboarding", needsOnboarding);
                
                // Don't send back password hash or circular references, create a safe user DTO or map
                Map<String, Object> userMap = new HashMap<>();
                userMap.put("userId", user.getUserId());
                userMap.put("email", user.getEmail());
                userMap.put("name", user.getName());
                userMap.put("pictureUrl", user.getPictureUrl());
                userMap.put("height", user.getHeight());
                userMap.put("weight", user.getWeight());
                responseBody.put("user", userMap);

                return ResponseEntity.ok(responseBody);

            } else {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid ID token.");
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Authentication failed: " + e.getMessage());
        }
    }
}