package io.github.timliiang.user;

import io.github.timliiang.common.exception.ResourceNotFoundException;
import io.github.timliiang.security.AuthService;
import lombok.AllArgsConstructor;
import org.springframework.security.authentication.AuthenticationCredentialsNotFoundException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.stereotype.Service;

import java.util.NoSuchElementException;

@Service
@AllArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final AuthService authService;

    public User getUserById(Long id) {
        return userRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    public User getCurrentUser() {
        Long currentUserId = authService.getCurrentUserId();
        return userRepository.findById(currentUserId).orElseThrow(
                () -> new AuthenticationCredentialsNotFoundException("Authentication required"));
    }

}
