package org.example.pettrainerbe.controller;

import org.example.pettrainerbe.dto.AuthDTO;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    // POST /api/auth/register — Trả về thông báo thành công sử dụng AuthDTO
    @PostMapping("/register")
    public AuthDTO register() {
        return new AuthDTO("success", "Đăng ký thành công!", null, null);
    }

    // POST /api/auth/login — Trả về Token và ID user sử dụng AuthDTO
    @PostMapping("/login")
    public AuthDTO login() {
        return new AuthDTO("success", "Đăng nhập thành công", "fake-jwt-token-123456", 1);
    }
}