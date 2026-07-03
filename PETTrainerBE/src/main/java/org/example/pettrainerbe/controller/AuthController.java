package org.example.pettrainerbe.controller;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.ResponseCookie;

import java.time.Duration;
import org.example.pettrainerbe.model.User;
import org.example.pettrainerbe.repository.UserRepository;
import org.example.pettrainerbe.security.JwtUtil;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;

    @Value("${google.client.id}")
    private String clientId;

    @Value("${COOKIE_SECURE:false}")
    private boolean cookieSecure;

    public AuthController(UserRepository userRepository, JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/google-login")
    public ResponseEntity<?> googleLogin(@RequestBody Map<String, String> payload, HttpServletResponse response) {
        String tokenString = payload.get("credential");
        
        try {
            String email = null;
            String googleOauthId = null;
            String name = null;
            String pictureUrl = null;

            if (tokenString != null && tokenString.startsWith("ya29.")) {
                // Handle Access Token from custom useGoogleLogin
                RestTemplate restTemplate = new RestTemplate();
                HttpHeaders headers = new HttpHeaders();
                headers.setBearerAuth(tokenString);
                HttpEntity<String> entity = new HttpEntity<>("", headers);
                ResponseEntity<Map> userInfoResponse = restTemplate.exchange("https://www.googleapis.com/oauth2/v3/userinfo", HttpMethod.GET, entity, Map.class);
                Map<String, Object> userInfo = userInfoResponse.getBody();
                if (userInfo != null) {
                    email = (String) userInfo.get("email");
                    googleOauthId = (String) userInfo.get("sub");
                    name = (String) userInfo.get("name");
                    pictureUrl = (String) userInfo.get("picture");
                }
            } else {
                // Handle ID Token from traditional GoogleLogin
                GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(new NetHttpTransport(), new GsonFactory())
                        .setAudience(Collections.singletonList(clientId))
                        .build();

                GoogleIdToken idToken = verifier.verify(tokenString);
                if (idToken != null) {
                    GoogleIdToken.Payload googlePayload = idToken.getPayload();
                    email = googlePayload.getEmail();
                    googleOauthId = googlePayload.getSubject();
                    name = (String) googlePayload.get("name");
                    pictureUrl = (String) googlePayload.get("picture");
                }
            }

            if (email != null) {

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
                    if (user.getHeight() == null || user.getWeight() == null || user.getFitnessGoal() == null) {
                        needsOnboarding = true;
                    }
                }

                String jwt = jwtUtil.generateToken(email);

                ResponseCookie cookie = ResponseCookie.from("jwt-token", jwt)
                        .httpOnly(true)
                        .secure(cookieSecure)
                        .sameSite(cookieSecure ? "None" : "Lax")
                        .path("/")
                        .maxAge(Duration.ofHours(5))
                        .build();
                response.addHeader("Set-Cookie", cookie.toString());

                Map<String, Object> responseBody = new HashMap<>();
                responseBody.put("status", "success");
                responseBody.put("message", "Đăng nhập Google thành công");
                responseBody.put("needsOnboarding", needsOnboarding);
                // Trả JWT trong body để frontend gửi qua header Authorization: Bearer —
                // cookie cross-site (vercel.app ↔ railway.app) bị Safari/mobile chặn third-party cookie
                responseBody.put("token", jwt);
                
                // Don't send back password hash or circular references, create a safe user DTO or map
                Map<String, Object> userMap = new HashMap<>();
                userMap.put("userId", user.getUserId());
                userMap.put("email", user.getEmail());
                userMap.put("name", user.getName());
                userMap.put("pictureUrl", user.getPictureUrl());
                userMap.put("height", user.getHeight());
                userMap.put("weight", user.getWeight());
                userMap.put("bmi", user.getBmi());
                userMap.put("goal", user.getFitnessGoal());
                userMap.put("gender", user.getGender());
                userMap.put("fitnessLevel", user.getFitnessLevel());
                userMap.put("sessionsPerWeek", user.getSessionsPerWeek());
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