package com.rms.repository;

import com.rms.entity.UserEntity;
import org.apache.catalina.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepo extends JpaRepository<UserEntity,Integer> {


    Optional<UserEntity> findByEmail(String email);
}
