FROM amazoncorretto:17-alpine-jdk

COPY build/libs/GestionWheels-0.0.1-SNAPSHOT.jar/api-v1.jar
EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]