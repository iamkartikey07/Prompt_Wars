FROM eclipse-temurin:21-jdk

WORKDIR /app

RUN apt-get update && apt-get install -y unzip && rm -rf /var/lib/apt/lists/*

COPY . .

RUN chmod +x mvnw && ./mvnw clean package -DskipTests

EXPOSE 10000

CMD ["sh", "-c", "java -Dserver.port=${PORT:-10000} -jar target/*.jar"]
