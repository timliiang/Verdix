package io.github.timliiang.controller;

import io.github.timliiang.dto.AuthResponse;
import io.github.timliiang.dto.LoginRequest;
import io.github.timliiang.dto.RegisterRequest;
import io.github.timliiang.security.CustomUserDetailsService;
import io.github.timliiang.security.JwtAuthFilter;
import io.github.timliiang.security.JwtProvider;
import io.github.timliiang.services.AuthService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.security.autoconfigure.SecurityAutoConfiguration;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import tools.jackson.databind.ObjectMapper;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;


@WebMvcTest(controllers = AuthController.class,
        excludeAutoConfiguration = SecurityAutoConfiguration.class)
@AutoConfigureMockMvc(addFilters = false)
public class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private AuthService authService;

    @MockitoBean
    private JwtAuthFilter jwtAuthFilter;

    @MockitoBean
    private JwtProvider jwtProvider;

    @MockitoBean
    private CustomUserDetailsService customUserDetailsService;


    // Register tests
    @Test
    void register_shouldReturn201OnSuccess() throws Exception {
        RegisterRequest request = new RegisterRequest();
        request.setUsername("username");
        request.setEmail("example@email.com");
        request.setPassword("password");

        AuthResponse mockResponse = new AuthResponse(
                "mocked.jwt.token", "username", "example@email.com");

        when(authService.register(any())).thenReturn(mockResponse);

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.token").value("mocked.jwt.token"))
                .andExpect(jsonPath("$.username").value("username"))
                .andExpect(jsonPath("$.email").value("example@email.com"));
    }

    @Test
    void register_shouldReturn400WhenUsernameIsBlank() throws Exception {
        RegisterRequest request = new RegisterRequest();
        request.setUsername("");
        request.setEmail("example@email.com");
        request.setPassword("password");

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.username").exists());
    }

    @Test
    void register_shouldReturn400WhenEmailIsInvalid() throws Exception {
        RegisterRequest request = new RegisterRequest();
        request.setUsername("username");
        request.setPassword("password");
        request.setEmail("example");

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.email").exists());
    }

    @Test
    void registerShouldReturn400WhenPasswordTooShort() throws Exception {
        RegisterRequest request = new RegisterRequest();
        request.setUsername("username");
        request.setPassword("pass");
        request.setEmail("example@email.com");

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.password").exists());
    }


    // Login
    @Test
    void login_shouldReturn200OnSuccess() throws Exception {
        LoginRequest request = new LoginRequest();
        request.setUsername("username");
        request.setPassword("password");

        AuthResponse mockResponse = new AuthResponse(
                "mocked.jwt.token", "username", "password");

        when(authService.login(any())).thenReturn(mockResponse);

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("mocked.jwt.token"))
                .andExpect(jsonPath("$.username").value("username"));
    }

    @Test
    void login_shouldReturn400WhenUsernameIsBlank() throws Exception {
        LoginRequest request = new LoginRequest();
        request.setUsername("");
        request.setPassword("password");

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.username").exists());
    }

}
