package com.example.demo.service;

import com.example.demo.model.Usuario;
import com.sendgrid.*;
import com.sendgrid.helpers.mail.Mail;
import com.sendgrid.helpers.mail.objects.Content;
import com.sendgrid.helpers.mail.objects.Email;
import org.springframework.stereotype.Service;

import java.io.IOException;

@Service
public class EmailService {

    private static final String FROM_EMAIL = "mantillajerson2@gmail.com";
    private static final String SENDGRID_API_KEY = System.getenv("SENDGRID_API_KEY");

    public void notificarNuevoUsuario(Usuario usuario) {
        try {
            // URLs de aprobación y rechazo
            String baseUrl = "https://wheelsuis.onrender.com";
            String aprobarUrl = baseUrl + "/usuario/aprobar?token=" + usuario.getToken();
            String rechazarUrl = baseUrl + "/usuario/rechazar?token=" + usuario.getToken();

            // Contenido HTML
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
                            <a href='%s' style='background-color:#28a745;color:white;padding:10px 15px;text-decoration:none;border-radius:5px;'>✅ Aceptar</a>
                            &nbsp;
                            <a href='%s' style='background-color:#dc3545;color:white;padding:10px 15px;text-decoration:none;border-radius:5px;'>❌ Rechazar</a>
                        </p>
                    </body>
                </html>
            """, usuario.getNombre(), usuario.getCorreo(), usuario.getCodigo(),
                    usuario.getCelular(), usuario.getTipo(), aprobarUrl, rechazarUrl);

            // Construcción del correo
            Email from = new Email(FROM_EMAIL);
            Email to = new Email("mantillajerson2@gmail.com"); // administrador
            String subject = "Nuevo usuario registrado - WheelsUIS";
            Content content = new Content("text/html", htmlContent);
            Mail mail = new Mail(from, subject, to, content);

            // Envío con SendGrid
            SendGrid sg = new SendGrid(SENDGRID_API_KEY);
            Request request = new Request();
            request.setMethod(Method.POST);
            request.setEndpoint("mail/send");
            request.setBody(mail.build());

            // ⚠️ Importar explícitamente la clase de SendGrid:
            com.sendgrid.Response response = sg.api(request);

            System.out.println("✅ Correo enviado con estado: " + response.getStatusCode());

        } catch (IOException e) {
            e.printStackTrace();
            throw new RuntimeException("Error al enviar correo con SendGrid", e);
        }
    }
}
