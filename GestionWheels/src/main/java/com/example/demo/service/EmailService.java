package com.example.demo.service;

import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.CrossOrigin;

import com.example.demo.model.Usuario;

import jakarta.mail.internet.MimeMessage;
@CrossOrigin(origins = "http://localhost:8081")
@Service
public class EmailService {
	@Autowired
	 private JavaMailSender mailSender;
	

    public void notificarNuevoUsuario(Usuario usuario) {
        try {
        	MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);

            helper.setTo("mantillajerson2@gmail.com"); // o el correo del administrador
            helper.setSubject("Nuevo usuario registrado");

			String baseUrl = "https://wheelsuis.onrender.com";
			String aprobarUrl = baseUrl + "/usuario/aprobar?token=" + usuario.getToken();
			String rechazarUrl = baseUrl + "/usuario/rechazar?token=" + usuario.getToken();
            String contenidoHtml = """
            	    <html>
            	    <body style='font-family: Arial, sans-serif;'>
            	        <h2>Nuevo usuario registrado</h2>
            	        <p>Se ha registrado un nuevo usuario:</p>
            	        <ul>
            	            <li><b>Nombre:</b> %s</li>
            	            <li><b>Correo:</b> %s</li>
            	            <li><b>Código:</b> %s</li>
            	            <li><b>Celular:</b> %s</li>
            	            <li><b>Tipo de Usuario:</b> %s</li>
            	        </ul>
            	        <p>Revisa y decide si aceptarlo:</p>
            	        <p>
            	            <a href='%s' 
            	               style='background-color:#28a745;color:white;padding:10px 15px;text-decoration:none;border-radius:5px;'>✅ Aceptar</a>
            	            &nbsp;
            	            <a href='%s' 
            	               style='background-color:#dc3545;color:white;padding:10px 15px;text-decoration:none;border-radius:5px;'>❌ Rechazar</a>
            	        </p>
            	    </body>
            	    </html>
            	""".formatted(
            	    usuario.getNombre(),
            	    usuario.getCorreo(),
            	    usuario.getCodigo(),
            	    usuario.getCelular(),
            	    usuario.getTipo(),
            	    aprobarUrl,
            	    rechazarUrl
            	);

                helper.setText(contenidoHtml, true); // <- true para HTML

                mailSender.send(message);


        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Error al enviar correo", e);
        }
    }
}
