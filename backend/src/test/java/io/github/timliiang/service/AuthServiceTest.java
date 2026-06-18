package io.github.timliiang.service;

import io.github.timliiang.dto.AuthResponse;
import io.github.timliiang.dto.LoginRequest;
import io.github.timliiang.dto.RegisterRequest;
import io.github.timliiang.entities.User;
import io.github.timliiang.repositories.UserRepository;
import io.github.timliiang.security.JwtProvider;
import io.github.timliiang.services.AuthService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private BCryptPasswordEncoder passwordEncoder;

    @Mock
    private JwtProvider jwtProvider;

    @InjectMocks
    private AuthService authService;

    private RegisterRequest registerRequest;
    private LoginRequest loginRequest;
    private User savedUser;

    @BeforeEach
    void setUp() {
        registerRequest = new RegisterRequest();
        registerRequest.setUsername("username");
        registerRequest.setPassword("password");
        registerRequest.setEmail("example@email.com");

        loginRequest = new LoginRequest();
        loginRequest.setUsername("username");
        loginRequest.setPassword("password");

        savedUser = new User();
        savedUser.setUsername("username");
        savedUser.setPassword("$2a$10$hashedpassword");
        savedUser.setEmail("example@email.com");
    }

    // Register test
    @Test
    void register_shouldReturnTokenOnSuccess() {
        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(userRepository.existsByUsername(anyString())).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("$2a$10$hashedpassword");
        when(userRepository.save(any(User.class))).thenReturn(savedUser);
        when(jwtProvider.generateToken(anyString())).thenReturn("mocked.jwt.token");

        AuthResponse response = authService.register(registerRequest);

        assertNotNull(response);
        assertEquals("mocked.jwt.token", response.getToken());
        assertEquals("username", response.getUsername());
        assertEquals("example@email.com", response.getEmail());
    }

    @Test
    void register_shouldThrowWhenEmailAlreadyExists() {
        when(userRepository.existsByEmail(anyString())).thenReturn(true);

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> authService.register(registerRequest));

        assertEquals("Email is already in use", ex.getMessage());

        verify(userRepository, never()).save(any());
    }

    @Test
    void register_shouldThrowWhenUsernameAlreadyExists() {
        when(userRepository.existsByUsername(anyString())).thenReturn(true);

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> authService.register(registerRequest));

        assertEquals("Username is already in use", ex.getMessage());
        verify(userRepository, never()).save(any());
    }

    @Test
    void register_shouldEncodePasswordBeforeSaving() {
        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(userRepository.existsByUsername(anyString())).thenReturn(false);
        when(passwordEncoder.encode("password")).thenReturn("$2a$10$hashedpassword");
        when(userRepository.save(any(User.class))).thenReturn(savedUser);
        when(jwtProvider.generateToken(anyString())).thenReturn("mocked.jwt.token");

        authService.register(registerRequest);

        verify(userRepository).save(argThat(user ->
                user.getPassword().equals("$2a$10$hashedpassword")));
    }


    // Login tests
    @Test
    void login_shouldReturnTokenOnSuccess() {
        when(userRepository.findByUsername("username")).thenReturn(Optional.of(savedUser));
        when(passwordEncoder.matches("password", "$2a$10$hashedpassword")).thenReturn(true);
        when(jwtProvider.generateToken("username")).thenReturn("mocked.jwt.token");

        AuthResponse response = authService.login(loginRequest);

        assertNotNull(response);
        assertEquals("mocked.jwt.token", response.getToken());
        assertEquals("username", response.getUsername());
    }

    @Test
    void login_shouldThrowWhenUsernameNotFound() {
        when(userRepository.findByUsername("username")).thenReturn(Optional.empty());

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> authService.login(loginRequest));

        assertEquals("Invalid credentials", ex.getMessage());
    }

    @Test void login_shouldThrowWhenPasswordIsWrong() {
        when(userRepository.findByUsername("username")).thenReturn(Optional.of(savedUser));
        when(passwordEncoder.matches(anyString(), anyString())).thenReturn(false);

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> authService.login(loginRequest));

        assertEquals("Invalid credentials", ex.getMessage());
    }

}
