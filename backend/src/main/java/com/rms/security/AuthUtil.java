package com.rms.security;

import com.rms.entity.UserEntity;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Component
@RequiredArgsConstructor
public class AuthUtil {

    @Value("${jwt.secretKey}")
    private String JWT_SECRET;

    // convert the jwt to HMACSHA256 key
    private SecretKey getSecretKey() {
        return Keys.hmacShaKeyFor(JWT_SECRET.getBytes(StandardCharsets.UTF_8));
    }

    public String generateAccessToken(UserEntity user){
        String userId = String.valueOf(user.getId());
        return Jwts.builder()
                .subject(user.getEmail())
                .claim("userId", userId)
                .claim("role", user.getRoles())
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() +1000L * 60 * 60 * 24 * 10))
                .signWith(getSecretKey())
                .compact();
    }

    public String getUsernameFromToken(String token) {
        Claims claims = Jwts.parser()
                .verifyWith(getSecretKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();

        return claims.getSubject();
    }
}
