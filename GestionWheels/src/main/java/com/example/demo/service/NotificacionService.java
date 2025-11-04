package com.example.demo.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.CrossOrigin;
@CrossOrigin(origins = "http://localhost:8081")
@Service
public class NotificacionService {
	@Autowired
    private SimpMessagingTemplate messagingTemplate;

    public void enviar(int idPasajero, String mensaje) {
        messagingTemplate.convertAndSend("/topic/notificaciones/" + idPasajero, mensaje);
    }
}

