FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY MangalFoods/MangalFoods.csproj MangalFoods/
RUN dotnet restore MangalFoods/MangalFoods.csproj

COPY . .
RUN dotnet publish MangalFoods/MangalFoods.csproj -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app
COPY --from=build /app/publish .

EXPOSE 8080
ENTRYPOINT ["sh", "-c", "dotnet MangalFoods.dll --urls http://0.0.0.0:${PORT:-8080}"]
