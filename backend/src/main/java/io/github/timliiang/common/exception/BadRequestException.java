package io.github.timliiang.common.exception;

// 400: the request is well-formed but asks for something invalid (page 501, decade 2015).
// A dedicated type rather than IllegalArgumentException, which libraries also throw for real bugs
// that should stay 500s.
public class BadRequestException extends RuntimeException {
    public BadRequestException(String message) {
        super(message);
    }
}
