package io.github.timliiang.security;

import io.github.timliiang.security.dto.AuthResponse;
import io.github.timliiang.security.dto.LoginRequest;
import io.github.timliiang.security.dto.RegisterRequest;
import io.github.timliiang.user.User;
import io.github.timliiang.user.UserRepository;
import io.github.timliiang.common.exception.ConflictException;
import lombok.AllArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.authentication.AuthenticationCredentialsNotFoundException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
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
            throw new ConflictException("Email is already in use");
        }
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new ConflictException("Username is already in use");
        }

        User user = new User();
        user.setUsername(request.getUsername());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setEmail(request.getEmail());

        // The checks above can both pass for two simultaneous sign-ups with the same name; the
        // unique constraint then rejects the second insert. save() runs in its own transaction
        // here, so the violation surfaces right at this call.
        try {
            userRepository.save(user);
        } catch (DataIntegrityViolationException e) {
            throw new ConflictException("Username or email is already in use");
        }

        String token = jwtProvider.generateToken(user.getUsername());

        return new AuthResponse(token, user.getUsername());
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new BadCredentialsException("Invalid credentials"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new BadCredentialsException("Invalid credentials");
        }

        String token = jwtProvider.generateToken(user.getUsername());

        return new AuthResponse(token, user.getUsername());
    }

    public String getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null) throw new AuthenticationCredentialsNotFoundException("Authentication required");
        return authentication.getName();
    }

    public Long getCurrentUserId() {
        User user = userRepository.findByUsername(getCurrentUser()).orElseThrow();
        return user.getId();
    }
}
