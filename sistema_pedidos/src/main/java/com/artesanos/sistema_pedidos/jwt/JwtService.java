package com.artesanos.sistema_pedidos.jwt;

import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.function.Function;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor

public class JwtService {
    @Value("${jwt.secret}")
    private String SECRET_KEY;

    @Value("${jwt.expiration-ms:72000000}")
    private long TOKEN_EXPIRATION_MS;

    public String getToken(UserDetails user) {
        return getToken(new HashMap<>(), user);
    }

    private String getToken(HashMap<String, Object> extraClaims, UserDetails user) {

        String role = user.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .findFirst()
                .orElse(null);
        extraClaims.put("role", role);
        return Jwts.builder()
                .claims(extraClaims)
                .subject(user.getUsername())
                .issuedAt(new Date(System.currentTimeMillis()))
                .expiration(new Date(System.currentTimeMillis() + TOKEN_EXPIRATION_MS))
                .signWith(getKey(), SignatureAlgorithm.HS256).compact();
    }

    private Key getKey() {
        byte[] keyBytes = Decoders.BASE64.decode(SECRET_KEY);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    public String getUsernameFromToken(String token) {
        return getClaim(token, Claims::getSubject);
    }

    public boolean isTokenValid(String token, UserDetails userDetails) {
    final String username = getUsernameFromToken(token);

    boolean isUsernameValid = username.equalsIgnoreCase(userDetails.getUsername());
    boolean isTokenExpired = isTokenExpired(token);

    return (isUsernameValid && !isTokenExpired);
}

    private Claims getAllClaims(String token) {
        try {
        return Jwts
                .parser()
                .verifyWith((javax.crypto.SecretKey) getKey()) 
                .build()
                .parseSignedClaims(token)
                .getPayload();
    } catch (Exception e) {
        throw e;
    }
    }

    public <T> T getClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = getAllClaims(token);
        return claimsResolver.apply(claims);
    }

    private Date getExpiration(String token) {
        return getClaim(token, Claims::getExpiration);
    }

    private boolean isTokenExpired(String token) {
        return getExpiration(token).before(new Date());
    }

}
