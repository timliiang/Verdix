package io.github.timliiang.user.dto;


import io.github.timliiang.user.User;

import java.time.LocalDateTime;


public record UserResponse(
    Long id,
    String username,
    LocalDateTime createdAt,
    String imageUrl,
    String bio
) {

    public static UserResponse from(User user) {
        return new UserResponse(
                user.getId(),
                user.getUsername(),
                user.getCreatedAt(),
                user.getImageUrl(),
                user.getBio()
        );
    }

}
