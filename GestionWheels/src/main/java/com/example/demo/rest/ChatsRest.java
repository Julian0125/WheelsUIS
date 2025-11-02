package com.example.demo.rest;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.model.Mensaje;
import com.example.demo.repository.MensajeRepository;

@RestController
public class ChatsRest {
	
    private final SimpMessagingTemplate messagingTemplate;
    private final MensajeRepository mensajeRepository;

    public ChatsRest(SimpMessagingTemplate messagingTemplate,
                                   MensajeRepository mensajeRepository) {
        this.messagingTemplate = messagingTemplate;
        this.mensajeRepository = mensajeRepository;
    }
	@MessageMapping("/chat.enviar")
	public void getMessage(Mensaje mensaje) {
		 mensajeRepository.save(mensaje);
	     messagingTemplate.convertAndSend("/topic/viaje/" + mensaje.getChat().getViaje().getId(), mensaje);
	}
}
