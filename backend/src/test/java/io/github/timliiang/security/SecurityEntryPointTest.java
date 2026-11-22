package io.github.timliiang.security;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

// Full context with the real security filter chain (the controller tests turn filters off), so
// this checks what the browser actually gets back when its token is missing or no longer valid.
@SpringBootTest
@AutoConfigureMockMvc
class SecurityEntryPointTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void protectedRoute_withoutToken_shouldReturn401() throws Exception {
        mockMvc.perform(get("/api/reviews/user/1"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void protectedRoute_withInvalidToken_shouldReturn401() throws Exception {
        mockMvc.perform(get("/api/reviews/user/1")
                        .header("Authorization", "Bearer not.a.valid-token"))
                .andExpect(status().isUnauthorized());
    }
}
