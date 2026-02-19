package com.offficeVerse.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.*;

@Getter
@Setter
@Entity
@Table(name = "rooms")
public class Room {

        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        private Long id;

        @Column(nullable = false)
        private String name;

        private String roomType; // meeting, desk
        private int maxPlayers = 20;
        private boolean isPrivate = false;
        private String password;
        private String joinCode; // Unique code for employees to join
        private Long hostId;

        @OneToMany(mappedBy = "room", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
        private List<Player> players = new ArrayList<>();

        @OneToMany(mappedBy = "room", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
        private List<ChatMessage> messages = new ArrayList<>();

        // Stored in memory only (not persisted) — player ID -> ready status
        @Transient
        private Map<Long, Boolean> readyStatus = new HashMap<>();

        private LocalDateTime createdAt = LocalDateTime.now();

        public Room(String name) {
                this.name = name;
        }

        public Room() {

        }
}
