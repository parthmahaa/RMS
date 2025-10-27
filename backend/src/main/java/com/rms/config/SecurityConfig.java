    package com.rms.config;

    import com.rms.security.JwtAuthFilter;
    import jakarta.servlet.ServletException;
    import jakarta.servlet.http.HttpServletRequest;
    import jakarta.servlet.http.HttpServletResponse;
    import lombok.RequiredArgsConstructor;
    import org.springframework.context.annotation.Bean;
    import org.springframework.context.annotation.Configuration;
    import org.springframework.http.HttpMethod;
    import org.springframework.http.HttpStatus;
    import org.springframework.security.access.AccessDeniedException;
    import org.springframework.security.config.annotation.web.builders.HttpSecurity;
    import org.springframework.security.config.annotation.web.configurers.AnonymousConfigurer;
    import org.springframework.security.config.http.SessionCreationPolicy;
    import org.springframework.security.crypto.password.PasswordEncoder;
    import org.springframework.security.web.SecurityFilterChain;
    import org.springframework.security.web.access.AccessDeniedHandler;
    import org.springframework.security.web.authentication.HttpStatusEntryPoint;
    import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
    import org.springframework.web.cors.CorsConfiguration;
    import org.springframework.web.cors.CorsConfigurationSource;
    import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
    import org.springframework.web.servlet.HandlerExceptionResolver;

    import java.io.IOException;
    import java.util.Arrays;

    @Configuration
    @RequiredArgsConstructor
    public class SecurityConfig {

        private final PasswordEncoder passwordEncoder;
        private final JwtAuthFilter jwtAuthFilter;
        private final HandlerExceptionResolver handlerExceptionResolver;
        @Bean
        public SecurityFilterChain securityFilterChain(HttpSecurity httpSecurity) throws Exception{
            httpSecurity
                    .cors(cors-> {})
                    .csrf(csrf -> csrf.disable())
                    .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))  //jwt will manage session not default spring security
                    .anonymous(AnonymousConfigurer::disable)
                    .authorizeHttpRequests(auth -> auth
                            .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                            .requestMatchers("/public/**", "/api/auth/**").permitAll()

                            .requestMatchers("/api/candidate/**").hasRole("CANDIDATE")

                            .requestMatchers("/api/recruiter/**").hasRole("RECRUITER")

                            .requestMatchers("/api/skills").authenticated()

                            .anyRequest().authenticated()
                    )
                    .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)
                    .exceptionHandling(exceptionConfig ->
                            exceptionConfig.accessDeniedHandler(new AccessDeniedHandler() {
                                @Override
                                public void handle(HttpServletRequest request, HttpServletResponse response, AccessDeniedException accessDeniedException) throws IOException, ServletException {
                                    handlerExceptionResolver.resolveException(request,response,null,accessDeniedException);
                                }
                            }).authenticationEntryPoint(new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED))
                    );
            ;
            return httpSecurity.build();
        }
    }
