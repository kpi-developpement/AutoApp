package com.nexus.RPA.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "steps")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class StepEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Integer orderIndex;

    @Column(nullable = false)
    private String type;

    private Integer xCoordinate;
    private Integer yCoordinate;

    @Column(nullable = false)
    private Double delay;

    private String actionName;

    // HADA L'CHAMP JDID (Kay-hzz l'JSON dyal les fichiers)
    @Column(length = 10000)
    private String parameter;
}