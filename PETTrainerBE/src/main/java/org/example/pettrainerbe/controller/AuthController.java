package org.example.pettrainerbe.controller;

import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    // POST /api/auth/register — Trả về thông báo thành công giả
    @PostMapping("/register")
    public Map<String, String> register() {
        Map<String, String> response = new HashMap<>();
        response.put("status", "success");
        response.put("message", "Đăng ký thành công (Dữ liệu giả)!");
        return response;
    }

    // POST /api/auth/login — Trả về Token giả và ID user để Frontend lưu lại
    @PostMapping("/login")
    public Map<String, Object> login() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "success");
        response.put("token", "fake-jwt-token-123456");
        response.put("userId", 1); // Trả về ID giả định là 1 để Frontend dùng gọi API khác
        return response;
    }
}