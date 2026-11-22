package io.github.timliiang.common.exception;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.TypeMismatchException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.ErrorResponse;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

// Spring picks the handler whose exception type is closest to the thrown one, so the specific
// handlers below win over the RuntimeException catch-all regardless of their order in this file.
//
// Body shapes: { "error": "..." } is shown to the user by the frontend's parseApiError;
// { field: "..." } is per-field validation; the 404/403 handlers keep their existing "message" key.
@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    // @Valid fails for DTO
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> handleValidationError(
            MethodArgumentNotValidException ex) {

        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getFieldErrors().forEach(error ->
                errors.put(error.getField(), error.getDefaultMessage()));

        return ResponseEntity.badRequest().body(errors);
    }

    // Spring MVC's own client errors that happen to be RuntimeExceptions (unparseable JSON body,
    // "abc" for a Long path variable). Without this they would fall into the 500 catch-all.
    @ExceptionHandler({HttpMessageNotReadableException.class, TypeMismatchException.class})
    public ResponseEntity<Map<String, String>> handleMalformedRequest(RuntimeException ex) {
        return error(HttpStatus.BAD_REQUEST, "Malformed request");
    }

    // 401: the caller is not (or no longer) identified, e.g. a wrong password at login.
    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<Map<String, String>> handleAuthentication(AuthenticationException ex) {
        return error(HttpStatus.UNAUTHORIZED, ex.getMessage());
    }

    @ExceptionHandler(ConflictException.class)
    public ResponseEntity<Map<String, String>> handleConflict(ConflictException ex) {
        return error(HttpStatus.CONFLICT, ex.getMessage());
    }

    // A unique constraint caught what an existsBy... check missed (two requests racing). The raw
    // message contains SQL, so it is logged, not returned.
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<Map<String, String>> handleDataIntegrity(DataIntegrityViolationException ex) {
        log.warn("Data integrity violation", ex);
        return error(HttpStatus.CONFLICT, "That conflicts with existing data");
    }

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<Map<String, String>> handleResourceNotFound(
            ResourceNotFoundException ex) {

        Map<String, String> error = new HashMap<>();
        error.put("message", ex.getMessage());

        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
    }

    // 403: the caller is identified but not allowed (editing someone else's review).
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<Map<String, String>> handleAccessDenied(
            AccessDeniedException ex) {

        Map<String, String> error = new HashMap<>();
        error.put("message", ex.getMessage());

        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
    }

    // Anything else is a bug or an upstream failure, not the user's mistake: log the real cause,
    // return a generic 500. ResponseStatusException and similar already carry a deliberate status.
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, String>> handleUnexpected(RuntimeException ex) {
        if (ex instanceof ErrorResponse errorResponse) {
            String detail = errorResponse.getBody().getDetail();
            return ResponseEntity.status(errorResponse.getStatusCode())
                    .body(Map.of("error", detail != null ? detail : "Request failed"));
        }
        log.error("Unhandled exception", ex);
        return error(HttpStatus.INTERNAL_SERVER_ERROR, "Something went wrong");
    }

    private static ResponseEntity<Map<String, String>> error(HttpStatus status, String message) {
        return ResponseEntity.status(status).body(Map.of("error", message));
    }
}
