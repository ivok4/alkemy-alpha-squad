using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.OpenApi;
using Microsoft.OpenApi;

namespace WalletApi.Security;

internal sealed class BearerSecuritySchemeTransformer(
    IAuthenticationSchemeProvider authenticationSchemeProvider)
    : IOpenApiDocumentTransformer
{
    public async Task TransformAsync(
        OpenApiDocument document,
        OpenApiDocumentTransformerContext context,
        CancellationToken cancellationToken)
    {
        document.Info = new OpenApiInfo
        {
            Title = "DigitalArs Wallet API",
            Version = "v1",
            Description = "API REST integral para la billetera virtual DigitalArs (.NET 10). Incluye autenticación JWT, gestión de cuentas, depósitos, transferencias atómicas, historial de transacciones, notificaciones y administración de usuarios.",
            Contact = new OpenApiContact
            {
                Name = "Equipo Alkemy Alpha Squad",
                Email = "soporte@digitalars.com"
            }
        };

        var schemes = await authenticationSchemeProvider.GetAllSchemesAsync();

        if (!schemes.Any(scheme => scheme.Name == "Bearer"))
        {
            return;
        }

        document.Components ??= new OpenApiComponents();
        document.Components.SecuritySchemes =
            new Dictionary<string, IOpenApiSecurityScheme>
            {
                ["Bearer"] = new OpenApiSecurityScheme
                {
                    Type = SecuritySchemeType.Http,
                    Scheme = "bearer",
                    In = ParameterLocation.Header,
                    BearerFormat = "JWT"
                }
            };

        foreach (var operation in document.Paths.Values
            .SelectMany(path => path.Operations))
        {
            operation.Value.Security ??= [];
            operation.Value.Security.Add(new OpenApiSecurityRequirement
            {
                [new OpenApiSecuritySchemeReference("Bearer", document)] = []
            });
        }
    }
}
