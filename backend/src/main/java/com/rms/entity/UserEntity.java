package com.rms.entity;

import com.rms.constants.RoleType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "tbl_users")
@Builder
public class UserEntity  implements UserDetails  {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @Column(unique = true, nullable = false)
    @JoinColumn(unique = true, nullable = false)
    private String email;

    private String password;

    @ElementCollection(fetch = FetchType.EAGER)
    @Enumerated(EnumType.STRING)
    @Column(name = "role")
    Set<RoleType> roles = new HashSet<>();

    private Date createdAt;

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return roles.stream()
                .map(roles -> new SimpleGrantedAuthority("ROLE_" + roles.name())).collect(Collectors.toSet());
    }

    @Column(name = "is_verified")
    private boolean isVerified = false;

    @Column(name = "otp")
    private String otp;

    @Column(name = "otp_generated_time")
    private LocalDateTime otpGeneratedTime;

    @Override
    public String getUsername(){
        return email;
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Transient
    public boolean isProfileComplete() {
        return true;
    }
}
