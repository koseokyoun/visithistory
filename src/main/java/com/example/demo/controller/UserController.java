package com.example.demo.controller;

import com.example.demo.model.User;
import com.example.demo.service.UserService;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

@Controller
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping("/login")
    public String loginForm() {
        return "login";
    }

    @PostMapping("/login")
    public String login(@RequestParam String username, @RequestParam String password, Model model, HttpSession session) {
        User user = userService.authenticate(username, password);
        if (user != null) {
            session.setAttribute("loginUser", user);
            return "redirect:/";
        } else {
            model.addAttribute("error", "아이디 또는 비밀번호가 올바르지 않습니다.");
            return "login";
        }
    }

    @GetMapping("/signup")
    public String registerForm() {
        return "Signup";
    }

    @PostMapping("/signup")
    public String register(User user, Model model) {
        if (userService.isUsernameDuplicated(user.getUsername())) {
            model.addAttribute("error", "이미 사용 중인 아이디입니다.");
            return "Signup";
        }

        userService.registerUser(user);
        return "redirect:/login";
    }

    // 로그인 성공 시 이동할 페이지
    @GetMapping("/home")
    public String home() {
        return "Home"; // 간단한 환영 페이지
    }
}
