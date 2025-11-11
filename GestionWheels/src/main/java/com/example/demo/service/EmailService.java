package com.example.demo.service;

import com.example.demo.model.Usuario;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Service
public class EmailService {

    private static final String API_URL = "https://api.brevo.com/v3/smtp/email";
    private static final String API_KEY = System.getenv("BREVO_API_KEY"); // ⚠️ Pónla en Render como variable de entorno

    public void notificarNuevoUsuario(Usuario usuario) {
        try {
            // Construcción de URLs
            String baseUrl = "https://wheelsuis.onrender.com";
            String aprobarUrl = baseUrl + "/usuario/aprobar?token=" + usuario.getToken();
            String rechazarUrl = baseUrl + "/usuario/rechazar?token=" + usuario.getToken();

            // HTML del correo
            String htmlContent = String.format("""
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
                        <a href='%s' style='background:#28a745;color:white;padding:10px 15px;text-decoration:none;border-radius:5px;'>Aceptar</a>
                        &nbsp;
                        <a href='%s' style='background:#dc3545;color:white;padding:10px 15px;text-decoration:none;border-radius:5px;'>Rechazar</a>
                    </p>
                </body>
                </html>
            """, usuario.getNombre(), usuario.getCorreo(), usuario.getCodigo(),
                    usuario.getCelular(), usuario.getTipo(), aprobarUrl, rechazarUrl);

            // Estructura del cuerpo
            Map<String, Object> emailBody = Map.of(
                "sender", Map.of("email", "mantillajerson2@gmail.com", "name", "WheelsUIS"),
                "to", new Object[]{ Map.of("email", "mantillajerson2@gmail.com") },
                "subject", "Nuevo usuario registrado - WheelsUIS",
                "htmlContent", htmlContent
            );

            // Configuración de cabeceras
            HttpHeaders headers = new HttpHeaders();
            headers.set("api-key", API_KEY);
            headers.setContentType(MediaType.APPLICATION_JSON);

            // Petición HTTP
            RestTemplate restTemplate = new RestTemplate();
            HttpEntity<Map<String, Object>> request = new HttpEntity<>(emailBody, headers);
            ResponseEntity<String> response = restTemplate.postForEntity(API_URL, request, String.class);

            System.out.println("✅ Correo enviado (Brevo API) - Status: " + response.getStatusCode());

        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("❌ Error al enviar correo con la API de Brevo", e);
        }
    }
}
