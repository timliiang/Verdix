package io.github.timliiang.common.exception;

// The request is valid but clashes with existing data, e.g. a username that is already taken.
// Maps to 409 Conflict: unlike a 400, resending the same request will never succeed.
public class ConflictException extends RuntimeException {
    public ConflictException(String message) {
        super(message);
    }
}
