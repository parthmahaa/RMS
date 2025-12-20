package com.rms.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

@Entity
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "recipient_user_id")
    private UserEntity recipient;

    private String message;

    private boolean isRead = false;

    @Temporal(TemporalType.TIMESTAMP)
    private Date createdAt;

    private Long relatedJobId;
}
