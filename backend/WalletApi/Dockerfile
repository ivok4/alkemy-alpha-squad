# Etapa 1: Construcción
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Copiamos los archivos y restauramos dependencias
COPY ["WalletApi.csproj", "./"]
RUN dotnet restore "WalletApi.csproj"

# Copiamos el resto del código y compilamos
COPY . .
RUN dotnet publish "WalletApi.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Etapa 2: Producción (Imagen súper liviana)
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app
COPY --from=build /app/publish .

# Exponemos el puerto 8080 (el estándar de .NET 8 en contenedores)
EXPOSE 8080
ENV ASPNETCORE_HTTP_PORTS=8080

ENTRYPOINT ["dotnet", "WalletApi.dll"]