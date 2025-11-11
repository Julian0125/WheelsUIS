FROM amazoncorretto:17-alpine-jdk

# Copia tu JAR compilado dentro del contenedor
COPY build/libs/GestionWheels-0.0.1-SNAPSHOT.jar /api-v1.jar

# Ejecuta la aplicación
ENTRYPOINT ["java", "-jar", "/api-v1.jar"]

