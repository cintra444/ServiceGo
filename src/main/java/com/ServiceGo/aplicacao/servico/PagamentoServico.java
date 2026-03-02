package com.ServiceGo.aplicacao.servico;

import com.ServiceGo.domain.entity.Payment;
import com.ServiceGo.domain.repository.PaymentRepository;
import com.ServiceGo.dominio.excecao.RecursoNaoEncontradoException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PagamentoServico {

    private final PaymentRepository paymentRepository;

    public PagamentoServico(PaymentRepository paymentRepository) {
        this.paymentRepository = paymentRepository;
    }

    @Transactional(readOnly = true)
    public Payment buscarPorId(Long pagamentoId) {
        return paymentRepository.findById(pagamentoId)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Pagamento nao encontrado"));
    }
}
