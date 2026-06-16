package io.github.timliiang.services;

import io.github.timliiang.dto.AuthResponse;
import io.github.timliiang.dto.LoginRequest;
import io.github.timliiang.dto.RegisterRequest;
import io.github.timliiang.entities.User;
import io.github.timliiang.repositories.UserRepository;
import io.github.timliiang.security.JwtProvider;
import lombok.AllArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@AllArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final JwtProvider jwtProvider;

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email is already in use");
        }
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Username is already in use");
        }

        User user = new User();
        user.setUsername(request.getUsername());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setEmail(request.getEmail());

        userRepository.save(user);

        String token = jwtProvider.generateToken(user.getUsername());

        return new AuthResponse(token, user.getUsername(),user.getEmail());
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new RuntimeException("Invalid credentials"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid credentials");
        }

        String token = jwtProvider.generateToken(user.getUsername());

        return new AuthResponse(token, user.getUsername(),user.getEmail());
    }
}
