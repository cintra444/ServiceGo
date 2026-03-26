package com.ServiceGo.api.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.ServiceGo.domain.entity.AppUser;
import com.ServiceGo.domain.entity.Customer;
import com.ServiceGo.domain.enums.PlanType;
import com.ServiceGo.domain.enums.SubscriptionSource;
import com.ServiceGo.domain.enums.SubscriptionStatus;
import com.ServiceGo.domain.enums.UserRole;
import com.ServiceGo.domain.repository.CustomerRepository;
import com.ServiceGo.security.PlanAccessService;
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
class CustomerControllerTest {

    @Mock
    private CustomerRepository customerRepository;

    @Mock
    private PlanAccessService planAccessService;

    @InjectMocks
    private CustomerController customerController;

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        LocalValidatorFactoryBean validator = new LocalValidatorFactoryBean();
        validator.afterPropertiesSet();

        mockMvc = MockMvcBuilders.standaloneSetup(customerController)
                .setValidator(validator)
                .setMessageConverters(new MappingJackson2HttpMessageConverter())
                .build();
    }

    @Test
    void shouldCreateCustomerAndReturnCreatedResponse() throws Exception {
        AppUser authenticatedUser = buildUser(7L, "motorista@servicego.com");

        when(planAccessService.getAuthenticatedUser(any())).thenReturn(authenticatedUser);
        when(customerRepository.save(any(Customer.class))).thenAnswer(invocation -> {
            Customer customer = invocation.getArgument(0);
            customer.setId(10L);
            return customer;
        });

        mockMvc.perform(post("/api/customers")
                        .with(user("motorista@servicego.com"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "name": "Maria Silva",
                                  "phone": "11999999999",
                                  "email": "maria@cliente.com",
                                  "notes": "Cliente frequente"
                                }
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(10))
                .andExpect(jsonPath("$.name").value("Maria Silva"))
                .andExpect(jsonPath("$.phone").value("11999999999"))
                .andExpect(jsonPath("$.email").value("maria@cliente.com"))
                .andExpect(jsonPath("$.notes").value("Cliente frequente"))
                .andExpect(jsonPath("$.createdAt").isNotEmpty());

        ArgumentCaptor<Customer> customerCaptor = ArgumentCaptor.forClass(Customer.class);
        verify(customerRepository).save(customerCaptor.capture());

        Customer savedCustomer = customerCaptor.getValue();
        Assertions.assertAll(
                () -> Assertions.assertEquals("Maria Silva", savedCustomer.getName()),
                () -> Assertions.assertEquals("11999999999", savedCustomer.getPhone()),
                () -> Assertions.assertEquals("maria@cliente.com", savedCustomer.getEmail()),
                () -> Assertions.assertEquals("Cliente frequente", savedCustomer.getNotes()),
                () -> Assertions.assertEquals(authenticatedUser, savedCustomer.getOwnerUser()),
                () -> Assertions.assertNotNull(savedCustomer.getCreatedAt())
        );
    }

    @Test
    void shouldReturnBadRequestWhenNameIsBlank() throws Exception {
        mockMvc.perform(post("/api/customers")
                        .with(user("motorista@servicego.com"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "name": "   ",
                                  "phone": "11999999999",
                                  "email": "maria@cliente.com",
                                  "notes": "Cliente frequente"
                                }
                                """))
                .andExpect(status().isBadRequest());
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
}
