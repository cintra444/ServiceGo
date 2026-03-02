package com.ServiceGo.api.erro;

import com.ServiceGo.dominio.excecao.ConflitoNegocioException;
import com.ServiceGo.dominio.excecao.RegraNegocioException;
import com.ServiceGo.dominio.excecao.RecursoNaoEncontradoException;
import jakarta.servlet.http.HttpServletRequest;
import java.time.OffsetDateTime;
import java.util.LinkedHashMap;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class ApiExceptionHandler {

    @ExceptionHandler(RecursoNaoEncontradoException.class)
    public ResponseEntity<ErroPadraoResponse> handleNotFound(RecursoNaoEncontradoException ex, HttpServletRequest request) {
        return responder(HttpStatus.NOT_FOUND, "Recurso nao encontrado", ex.getMessage(), request, null);
    }

    @ExceptionHandler(ConflitoNegocioException.class)
    public ResponseEntity<ErroPadraoResponse> handleConflict(ConflitoNegocioException ex, HttpServletRequest request) {
        return responder(HttpStatus.CONFLICT, "Conflito de negocio", ex.getMessage(), request, null);
    }

    @ExceptionHandler(RegraNegocioException.class)
    public ResponseEntity<ErroPadraoResponse> handleBusiness(RegraNegocioException ex, HttpServletRequest request) {
        return responder(HttpStatus.UNPROCESSABLE_ENTITY, "Regra de negocio violada", ex.getMessage(), request, null);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErroPadraoResponse> handleValidation(MethodArgumentNotValidException ex, HttpServletRequest request) {
        Map<String, String> erros = new LinkedHashMap<>();
        for (FieldError fieldError : ex.getBindingResult().getFieldErrors()) {
            erros.put(fieldError.getField(), fieldError.getDefaultMessage());
        }
        return responder(HttpStatus.BAD_REQUEST, "Erro de validacao", "Existem campos invalidos na requisicao", request, erros);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErroPadraoResponse> handleUnexpected(Exception ex, HttpServletRequest request) {
        return responder(HttpStatus.INTERNAL_SERVER_ERROR, "Erro interno", "Erro inesperado no servidor", request, null);
    }

    private ResponseEntity<ErroPadraoResponse> responder(
            HttpStatus status,
            String titulo,
            String detalhe,
            HttpServletRequest request,
            Map<String, String> errosValidacao
    ) {
        ErroPadraoResponse response = new ErroPadraoResponse(
                OffsetDateTime.now(),
                status.value(),
                titulo,
                detalhe,
                request.getRequestURI(),
                errosValidacao
        );
        return ResponseEntity.status(status).body(response);
    }
}
