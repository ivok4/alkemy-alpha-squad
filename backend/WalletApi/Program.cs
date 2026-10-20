using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi;

using System.Text;
using System.Security.Claims;
using WalletApi.Data;
using WalletApi.Data.Entities;
using WalletApi.Interfaces;
using WalletApi.Models;
using WalletApi.Services;
using WalletApi.Security;
using WalletApi.Middlewares;
using WalletApi.Exceptions;
using WalletApi.Options;
using Microsoft.AspNetCore.Mvc;

var builder = WebApplication.CreateBuilder(args);

// Configuración fuertemente tipada con Options Pattern y validación en arranque
builder.Services.AddOptions<JwtOptions>()
    .BindConfiguration(JwtOptions.SectionName)
    .ValidateDataAnnotations()
    .ValidateOnStart();

builder.Services.AddOptions<AdminUserOptions>()
    .BindConfiguration(AdminUserOptions.SectionName)
    .ValidateDataAnnotations()
    .ValidateOnStart();

System.IdentityModel.Tokens.Jwt.JwtSecurityTokenHandler.DefaultInboundClaimTypeMap.Clear();

// Add services to the container with unified validation error response
builder.Services.AddControllers()
    .ConfigureApiBehaviorOptions(options =>
    {
        options.InvalidModelStateResponseFactory = context =>
        {
            var problemDetails = new ValidationProblemDetails(context.ModelState)
            {
                Type = "https://httpstatuses.io/400",
                Title = "Error de validación",
                Status = StatusCodes.Status400BadRequest,
                Detail = "Uno o más campos contienen errores de validación.",
                Instance = context.HttpContext.Request.Path
            };
            problemDetails.Extensions["errorCode"] = "VALIDATION_ERROR";
            problemDetails.Extensions["timestamp"] = DateTime.UtcNow;

            return new BadRequestObjectResult(problemDetails)
            {
                ContentTypes = { "application/problem+json" }
            };
        };
    });

// Unified Error Handling (IExceptionHandler & RFC 7807 ProblemDetails)
builder.Services.AddProblemDetails();
builder.Services.AddExceptionHandler<GlobalExceptionHandler>();

// Configure OpenAPI & Swagger UI (.NET 10)
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddOpenApi(options =>
{
    options.AddDocumentTransformer<BearerSecuritySchemeTransformer>();
});
// Database context
// builder.Services.AddDbContext<WalletContext>(options =>
//     options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection"))
// );


var provider = builder.Configuration["DatabaseProvider"] ?? "Supabase";

builder.Services.AddDbContext<WalletContext>(options =>
{
    switch (provider.ToLowerInvariant())
    {
        case "supabase":
        case "postgresql":
        case "postgres":
            options.UseNpgsql(builder.Configuration.GetConnectionString("SupabaseConnection")
                ?? builder.Configuration.GetConnectionString("DefaultConnection"));
            break;

        case "sqlserver":
            options.UseSqlServer(builder.Configuration.GetConnectionString("SqlServerConnection")
                ?? builder.Configuration.GetConnectionString("DefaultConnection"));
            break;

        case "mysql":
            var mySqlConn = builder.Configuration.GetConnectionString("MySqlConnection")
                ?? builder.Configuration.GetConnectionString("DefaultConnection");
            // options.UseMySql(mySqlConn, ServerVersion.AutoDetect(mySqlConn));
            break;

        default:
            throw new InvalidOperationException($"Proveedor de base de datos no soportado: '{provider}'.");
    }
});

// ASP.NET Core Identity
builder.Services.AddIdentity<User, IdentityRole<int>>(options =>
{
    options.Password.RequireDigit = false;
    options.Password.RequiredLength = 6;
    options.Password.RequireNonAlphanumeric = false;
    options.Password.RequireUppercase = false;
    options.Password.RequireLowercase = false;
    options.User.RequireUniqueEmail = true;
})
.AddEntityFrameworkStores<WalletContext>()
.AddDefaultTokenProviders();

builder.Services.AddScoped<ICardService, CardService>();

// Inyección de dependencias para servicios de aplicación
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IAliasGeneratorService, AliasGeneratorService>();
builder.Services.AddScoped<ICvuGeneratorService, CvuGeneratorService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IAccountService, AccountService>();
builder.Services.AddScoped<INotificationService, NotificationService>();

// CORS configuration for Frontend integration
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:5173", "https://localhost:5173", "http://localhost:3000", "http://localhost:5016")
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials();
    });
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});
var jwtOptions = builder.Configuration.GetSection(JwtOptions.SectionName).Get<JwtOptions>()
    ?? throw new InvalidOperationException("No se configuró la sección Jwt en appsettings.json.");

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = jwtOptions.Issuer,

            ValidateAudience = true,
            ValidAudience = jwtOptions.Audience,

            ValidateLifetime = true,

            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(jwtOptions.Key)),

            ClockSkew = TimeSpan.Zero,

            RoleClaimType = ClaimTypes.Role
        };
        options.Events = new JwtBearerEvents
        {
            OnTokenValidated = async context =>
            {
                var userManager = context.HttpContext.RequestServices
                    .GetRequiredService<UserManager<User>>();

                // Extrae el ID del usuario autenticado en la petición
                var userId = context.Principal?.FindFirstValue("sub")
          ?? context.Principal?.FindFirstValue(ClaimTypes.NameIdentifier);

                if (string.IsNullOrEmpty(userId))
                {
                    context.Fail("Token no contiene un ID de usuario válido.");
                    return;
                }

                var user = await userManager.FindByIdAsync(userId);
                if (user == null || !user.IsActive)
                {
                    context.Fail("El usuario no existe o está inactivo.");
                    return;
                }

                // Si el SecurityStamp cambió en la BD (ej. cambio de clave o logout forzado), rechaza el token
                var tokenStamp = context.Principal?.FindFirstValue("AspNet.Identity.SecurityStamp")
              ?? context.Principal?.FindFirstValue("security_stamp");
                if (tokenStamp != user.SecurityStamp)
                {
                    context.Fail("La sesión ha expirado o ha sido revocada.");
                    return;
                }
            },
            OnAuthenticationFailed = context =>
            {
                Console.WriteLine($"Token inválido: {context.Exception.Message}");
                return Task.CompletedTask;
            },
            OnChallenge = async context =>
            {
                context.HandleResponse();
                context.Response.StatusCode = StatusCodes.Status401Unauthorized;
                context.Response.ContentType = "application/json";

                var failureMessage = context.AuthenticateFailure?.Message;
                var message = !string.IsNullOrEmpty(failureMessage)
                    ? failureMessage
                    : "No autorizado. Inicie sesión para continuar.";

                await context.Response.WriteAsync(System.Text.Json.JsonSerializer.Serialize(new { message }));
            },
            OnForbidden = async context =>
            {
                context.Response.StatusCode = StatusCodes.Status403Forbidden;
                context.Response.ContentType = "application/json";
                await context.Response.WriteAsync(System.Text.Json.JsonSerializer.Serialize(new { message = "No tienes permisos de Administrador para realizar esta acción." }));
            }
        };
    });

builder.Services.AddAuthorization();
builder.Services.AddScoped<ITokenService, JwtTokenService>();



var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    var logger = services.GetRequiredService<ILogger<Program>>();
    try
    {
        var context = services.GetRequiredService<WalletContext>();

        if (context.Database.IsSqlServer())
        {
            // Parche específico de SQL Server
            await context.Database.ExecuteSqlRawAsync(@"
                IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[AspNetUsers]') AND name = 'DebeCambiarPassword')
                BEGIN
                    ALTER TABLE [dbo].[AspNetUsers] ADD [DebeCambiarPassword] bit NOT NULL CONSTRAINT DF_AspNetUsers_DebeCambiarPassword DEFAULT 0;
                END
                IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE object_id = OBJECT_ID(N'[dbo].[Notifications]'))
                BEGIN
                    CREATE TABLE [dbo].[Notifications] (
                        [Id] int NOT NULL IDENTITY(1,1),
                        [UserId] int NOT NULL,
                        [Title] nvarchar(100) NOT NULL,
                        [Message] nvarchar(500) NOT NULL,
                        [Type] nvarchar(50) NOT NULL,
                        [IsRead] bit NOT NULL DEFAULT 0,
                        [CreatedAt] datetime2 NOT NULL DEFAULT CURRENT_TIMESTAMP,
                        [ReferenceId] int NULL,
                        CONSTRAINT [PK_Notifications] PRIMARY KEY ([Id]),
                        CONSTRAINT [FK_Notifications_Users] FOREIGN KEY ([UserId]) REFERENCES [dbo].[AspNetUsers] ([Id]) ON DELETE CASCADE
                    );
                    CREATE INDEX [IX_Notifications_UserId_IsRead] ON [dbo].[Notifications] ([UserId], [IsRead]);
                    CREATE INDEX [IX_Notifications_CreatedAt] ON [dbo].[Notifications] ([CreatedAt]);
                END
            ");
        }
        else if (context.Database.IsNpgsql())
        {
            // Para Supabase: Asegura que el esquema completo (tablas Identity y de negocio) exista
            await context.Database.EnsureCreatedAsync();
        }

        // Seeding común para AMBOS proveedores (Crea Tipos de Doc, Roles, Admin y Cuenta)
        var roleManager = services.GetRequiredService<RoleManager<IdentityRole<int>>>();
        var userManager = services.GetRequiredService<UserManager<User>>();
        var configuration = services.GetRequiredService<IConfiguration>();
        var accountService = services.GetRequiredService<IAccountService>();

        await DbSeeder.SeedAsync(context, roleManager, userManager, configuration, accountService, logger);
    }
    catch (Exception ex)
    {
        Console.ForegroundColor = ConsoleColor.Red;
        Console.WriteLine($"\n[SEEDER EXCEPTION] Error general: {ex.Message}");
        var inner = ex.InnerException;
        while (inner != null)
        {
            Console.WriteLine($"[SEEDER CAUSA INTERNA] {inner.Message}");
            inner = inner.InnerException;
        }
        Console.ResetColor();
        logger.LogError(ex, "Ocurrió un error durante la inicialización/seeding de la base de datos.");
    }
}

// Configure the HTTP request pipeline.
app.UseExceptionHandler();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();

    app.UseSwaggerUI(options =>
    {
        options.SwaggerEndpoint(
            "/openapi/v1.json",
            "WalletApi v1"
        );
    });
}

app.UseHttpsRedirection();

app.UseCors("AllowAll");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
