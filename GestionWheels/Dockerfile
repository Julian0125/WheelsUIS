# ---------- ETAPA 1: COMPILACIÓN ----------
FROM gradle:8.5-jdk17 AS build
WORKDIR /app
COPY . .
RUN gradle build -x test


# ---------- ETAPA 2: EJECUCIÓN ----------
FROM amazoncorretto:17-alpine-jdk
WORKDIR /app
COPY --from=build /app/build/libs/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
", "-jar", "app.jar"]