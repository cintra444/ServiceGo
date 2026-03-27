package com.ServiceGo.api.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.ServiceGo.domain.entity.AgendamentoViagem;
import com.ServiceGo.domain.entity.AppUser;
import com.ServiceGo.domain.entity.Expense;
import com.ServiceGo.domain.entity.Trip;
import com.ServiceGo.domain.entity.Veiculo;
import com.ServiceGo.domain.enums.ExpenseCategory;
import com.ServiceGo.domain.enums.PlanType;
import com.ServiceGo.domain.enums.StatusAgendamento;
import com.ServiceGo.domain.enums.SubscriptionSource;
import com.ServiceGo.domain.enums.SubscriptionStatus;
import com.ServiceGo.domain.enums.TripStatus;
import com.ServiceGo.domain.enums.TripType;
import com.ServiceGo.domain.enums.UserRole;
import com.ServiceGo.domain.repository.AgendamentoViagemRepository;
import com.ServiceGo.domain.repository.AppUserRepository;
import com.ServiceGo.domain.repository.ExpenseRepository;
import com.ServiceGo.domain.repository.TripRepository;
import com.ServiceGo.security.PlanAccessService;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.validation.beanvalidation.LocalValidatorFactoryBean;

@ExtendWith(MockitoExtension.class)
class AgendamentoViagemControllerTest {

    @Mock
    private AgendamentoViagemRepository agendamentoRepository;

    @Mock
    private TripRepository tripRepository;

    @Mock
    private AppUserRepository appUserRepository;

    @Mock
    private ExpenseRepository expenseRepository;

    @Mock
    private PlanAccessService planAccessService;

    @InjectMocks
    private AgendamentoViagemController agendamentoController;

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        LocalValidatorFactoryBean validator = new LocalValidatorFactoryBean();
        validator.afterPropertiesSet();

        mockMvc = MockMvcBuilders.standaloneSetup(agendamentoController)
                .setValidator(validator)
                .setMessageConverters(new MappingJackson2HttpMessageConverter())
                .build();
    }

    @Test
    void shouldCreateTollExpenseWhenMarkingScheduleAsConcluded() throws Exception {
        AppUser authenticatedUser = buildUser(7L, "motorista@servicego.com");
        Trip trip = buildTrip(21L, authenticatedUser, new BigDecimal("18.50"));
        AgendamentoViagem agendamento = buildAgendamento(11L, authenticatedUser, trip, StatusAgendamento.AGENDADO);

        when(planAccessService.getAuthenticatedUser(any())).thenReturn(authenticatedUser);
        when(agendamentoRepository.findByIdAndUsuarioId(11L, authenticatedUser.getId())).thenReturn(Optional.of(agendamento));
        when(tripRepository.findByIdAndVeiculoDonoVeiculoId(21L, authenticatedUser.getId())).thenReturn(Optional.of(trip));
        when(appUserRepository.findById(authenticatedUser.getId())).thenReturn(Optional.of(authenticatedUser));
        when(agendamentoRepository.save(any(AgendamentoViagem.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(expenseRepository.findByTripId(21L)).thenReturn(List.of());
        when(expenseRepository.save(any(Expense.class))).thenAnswer(invocation -> invocation.getArgument(0));

        mockMvc.perform(put("/api/agendamentos/11")
                        .with(user("motorista@servicego.com"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "tripId": 21,
                                  "usuarioId": 7,
                                  "titulo": "Corrida aeroporto",
                                  "descricao": "Passageiro embarcando",
                                  "localEvento": "GRU",
                                  "inicioEm": "2026-03-26T09:00:00-03:00",
                                  "fimEm": "2026-03-26T10:00:00-03:00",
                                  "fusoHorario": "America/Sao_Paulo",
                                  "lembreteMinutos": 30,
                                  "status": "CONCLUIDO"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("CONCLUIDO"));

        ArgumentCaptor<Expense> expenseCaptor = ArgumentCaptor.forClass(Expense.class);
        verify(expenseRepository).save(expenseCaptor.capture());

        Expense savedExpense = expenseCaptor.getValue();
        Assertions.assertAll(
                () -> Assertions.assertEquals(ExpenseCategory.PEDAGIO, savedExpense.getCategory()),
                () -> Assertions.assertEquals(new BigDecimal("18.50"), savedExpense.getAmount()),
                () -> Assertions.assertEquals(trip, savedExpense.getTrip()),
                () -> Assertions.assertEquals(trip.getVeiculo(), savedExpense.getVeiculo()),
                () -> Assertions.assertEquals("Pedagio gerado automaticamente ao concluir agendamento", savedExpense.getDescription()),
                () -> Assertions.assertEquals(trip.getEndAt(), savedExpense.getOccurredAt())
        );
    }

    @Test
    void shouldNotCreateTollExpenseWhenTripHasNoToll() throws Exception {
        AppUser authenticatedUser = buildUser(7L, "motorista@servicego.com");
        Trip trip = buildTrip(21L, authenticatedUser, BigDecimal.ZERO);
        AgendamentoViagem agendamento = buildAgendamento(11L, authenticatedUser, trip, StatusAgendamento.AGENDADO);

        when(planAccessService.getAuthenticatedUser(any())).thenReturn(authenticatedUser);
        when(agendamentoRepository.findByIdAndUsuarioId(11L, authenticatedUser.getId())).thenReturn(Optional.of(agendamento));
        when(tripRepository.findByIdAndVeiculoDonoVeiculoId(21L, authenticatedUser.getId())).thenReturn(Optional.of(trip));
        when(appUserRepository.findById(authenticatedUser.getId())).thenReturn(Optional.of(authenticatedUser));
        when(agendamentoRepository.save(any(AgendamentoViagem.class))).thenAnswer(invocation -> invocation.getArgument(0));

        mockMvc.perform(put("/api/agendamentos/11")
                        .with(user("motorista@servicego.com"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "tripId": 21,
                                  "usuarioId": 7,
                                  "titulo": "Corrida sem pedagio",
                                  "descricao": "Sem custo adicional",
                                  "localEvento": "Centro",
                                  "inicioEm": "2026-03-26T09:00:00-03:00",
                                  "fimEm": "2026-03-26T10:00:00-03:00",
                                  "fusoHorario": "America/Sao_Paulo",
                                  "lembreteMinutos": 30,
                                  "status": "CONCLUIDO"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("CONCLUIDO"));

        verify(expenseRepository, never()).save(any(Expense.class));
    }

    private AppUser buildUser(Long id, String email) {
        AppUser user = new AppUser();
        user.setId(id);
        user.setName("Motorista Teste");
        user.setEmail(email);
        user.setPasswordHash("hash");
        user.setRole(UserRole.MOTORISTA);
        user.setActive(true);
        user.setPlanType(PlanType.PRO);
        user.setSubscriptionStatus(SubscriptionStatus.ACTIVE);
        user.setSubscriptionSource(SubscriptionSource.MANUAL);
        return user;
    }

    private Trip buildTrip(Long id, AppUser owner, BigDecimal tollAmount) {
        Veiculo veiculo = new Veiculo();
        veiculo.setId(3L);
        veiculo.setModelo("Onix");
        veiculo.setPlaca("ABC1234");
        veiculo.setAno(2022);
        veiculo.setAtivo(true);
        veiculo.setKmAtual(new BigDecimal("50000"));
        veiculo.setDonoVeiculo(owner);

        Trip trip = new Trip();
        trip.setId(id);
        trip.setVeiculo(veiculo);
        trip.setTripType(TripType.CORRIDA_APP);
        trip.setStatus(TripStatus.AGENDADA);
        trip.setOrigin("Origem");
        trip.setDestination("Destino");
        trip.setStartAt(OffsetDateTime.parse("2026-03-26T09:00:00-03:00"));
        trip.setEndAt(OffsetDateTime.parse("2026-03-26T10:30:00-03:00"));
        trip.setTollAmount(tollAmount);
        trip.setCreatedAt(OffsetDateTime.parse("2026-03-26T08:00:00-03:00"));
        return trip;
    }

    private AgendamentoViagem buildAgendamento(Long id, AppUser user, Trip trip, StatusAgendamento status) {
        AgendamentoViagem agendamento = new AgendamentoViagem();
        agendamento.setId(id);
        agendamento.setTrip(trip);
        agendamento.setUsuario(user);
        agendamento.setTitulo("Corrida");
        agendamento.setDescricao("Descricao");
        agendamento.setLocalEvento("Local");
        agendamento.setInicioEm(OffsetDateTime.parse("2026-03-26T09:00:00-03:00"));
        agendamento.setFimEm(OffsetDateTime.parse("2026-03-26T10:00:00-03:00"));
        agendamento.setFusoHorario("America/Sao_Paulo");
        agendamento.setLembreteMinutos(30);
        agendamento.setStatus(status);
        agendamento.setCriadoEm(OffsetDateTime.parse("2026-03-26T08:00:00-03:00"));
        agendamento.setAtualizadoEm(OffsetDateTime.parse("2026-03-26T08:00:00-03:00"));
        return agendamento;
    }
}
