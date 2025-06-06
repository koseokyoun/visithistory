package com.example.demo.controller;

import com.example.demo.model.User;
import com.example.demo.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

@Controller
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping("/login")
    public String loginForm() {
        return "Login";
    }

    @GetMapping("/signup")
    public String registerForm() {
        return "Signup";
    }

    @GetMapping("/api/check-username")
    @ResponseBody
    public boolean checkUsernameDuplicate(@RequestParam String username) {
        return userService.isUsernameDuplicated(username);
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
}
