using System;
using System.Linq;
using System.Threading.Tasks;
using FluentAssertions;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Moq;
using WalletApi.Data.Entities;
using WalletApi.Dtos;
using WalletApi.Exceptions;
using WalletApi.Interfaces;
using WalletApi.Models;
using WalletApi.Services;
using Xunit;

namespace WalletApi.Tests;

public class TransferServiceTests : IDisposable
{
    private readonly SqliteConnection _connection;
    private readonly WalletContext _context;
    private readonly Mock<IAliasGeneratorService> _aliasGeneratorMock;
    private readonly Mock<ICvuGeneratorService> _cvuGeneratorMock;
    private readonly Mock<INotificationService> _notificationServiceMock;
    private readonly AccountService _accountService;

    // Seeded test IDs
    private const int SourceUserId = 1;
    private const int TargetUserId = 2;
    private const int InactiveUserId = 3;

    private const string SourceCvu = "0000003100000000000001";
    private const string SourceAlias = "origen.cuenta.test";
    private const string TargetCvu = "0000003100000000000002";
    private const string TargetAlias = "destino.cuenta.test";
    private const string InactiveCvu = "0000003100000000000003";
    private const string InactiveAlias = "inactivo.cuenta.test";

    public TransferServiceTests()
    {
        // 1. Setup SQLite in-memory connection
        _connection = new SqliteConnection("DataSource=:memory:");
        _connection.Open();

        var options = new DbContextOptionsBuilder<WalletContext>()
            .UseSqlite(_connection)
            .Options;

        _context = new WalletContext(options);
        _context.Database.EnsureCreated();

        // 2. Setup mocks
        _aliasGeneratorMock = new Mock<IAliasGeneratorService>();
        _cvuGeneratorMock = new Mock<ICvuGeneratorService>();
        _notificationServiceMock = new Mock<INotificationService>();

        // 3. Instantiate service
        _accountService = new AccountService(
            _context,
            _aliasGeneratorMock.Object,
            _cvuGeneratorMock.Object,
            _notificationServiceMock.Object
        );

        // 4. Seed initial data
        SeedTestData();
    }

    private void SeedTestData()
    {
        var docType = new DocumentType
        {
            Id = 1,
            Code = "DNI",
            Name = "Documento Nacional de Identidad"
        };
        if (!_context.DocumentTypes.Any(d => d.Id == 1))
        {
            _context.DocumentTypes.Add(docType);
            _context.SaveChanges();
        }

        var sourceUser = new User
        {
            Id = SourceUserId,
            UserName = "source@test.com",
            Email = "source@test.com",
            NormalizedEmail = "SOURCE@TEST.COM",
            FirstName = "Juan",
            LastName = "Perez",
            DocumentTypeId = 1,
            DocumentNumber = "30111222",
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        var targetUser = new User
        {
            Id = TargetUserId,
            UserName = "target@test.com",
            Email = "target@test.com",
            NormalizedEmail = "TARGET@TEST.COM",
            FirstName = "Maria",
            LastName = "Gomez",
            DocumentTypeId = 1,
            DocumentNumber = "30333444",
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        var inactiveUser = new User
        {
            Id = InactiveUserId,
            UserName = "inactive@test.com",
            Email = "inactive@test.com",
            NormalizedEmail = "INACTIVE@TEST.COM",
            FirstName = "Carlos",
            LastName = "Inactivo",
            DocumentTypeId = 1,
            DocumentNumber = "30555666",
            IsActive = false,
            CreatedAt = DateTime.UtcNow
        };

        _context.Users.AddRange(sourceUser, targetUser, inactiveUser);
        _context.SaveChanges();

        var sourceAccount = new Account
        {
            Id = 1,
            UserId = SourceUserId,
            Balance = 1000.00m,
            Currency = "ARS",
            Alias = SourceAlias,
            Cvu = SourceCvu,
            CreatedAt = DateTime.UtcNow
        };

        var targetAccount = new Account
        {
            Id = 2,
            UserId = TargetUserId,
            Balance = 500.00m,
            Currency = "ARS",
            Alias = TargetAlias,
            Cvu = TargetCvu,
            CreatedAt = DateTime.UtcNow
        };

        var inactiveAccount = new Account
        {
            Id = 3,
            UserId = InactiveUserId,
            Balance = 200.00m,
            Currency = "ARS",
            Alias = InactiveAlias,
            Cvu = InactiveCvu,
            CreatedAt = DateTime.UtcNow
        };

        _context.Accounts.AddRange(sourceAccount, targetAccount, inactiveAccount);
        _context.SaveChanges();
    }

    public void Dispose()
    {
        _context.Dispose();
        _connection.Dispose();
    }

    #region 1. Saldo Insuficiente Tests

    [Fact]
    public async Task TransferAsync_ShouldThrowInsufficientFundsException_WhenAmountExceedsBalance()
    {
        // Arrange
        var request = new TransferRequestDto
        {
            Destination = TargetAlias,
            Amount = 1500.00m // Saldo disponible es 1000.00m
        };

        // Act
        var act = () => _accountService.TransferAsync(SourceUserId, request);

        // Assert
        var ex = await act.Should().ThrowAsync<InsufficientFundsException>();
        ex.WithMessage("*Saldo insuficiente*");

        // Verify balances remain untouched
        var sourceAcc = await _context.Accounts.AsNoTracking().FirstOrDefaultAsync(a => a.Id == 1);
        var targetAcc = await _context.Accounts.AsNoTracking().FirstOrDefaultAsync(a => a.Id == 2);
        sourceAcc!.Balance.Should().Be(1000.00m);
        targetAcc!.Balance.Should().Be(500.00m);
    }

    #endregion

    #region 2. Importe Inválido Tests

    [Theory]
    [InlineData(0)]
    [InlineData(-50)]
    [InlineData(-0.01)]
    public async Task TransferAsync_ShouldThrowArgumentException_WhenAmountIsZeroOrNegative(decimal invalidAmount)
    {
        // Arrange
        var request = new TransferRequestDto
        {
            Destination = TargetAlias,
            Amount = invalidAmount
        };

        // Act
        var act = () => _accountService.TransferAsync(SourceUserId, request);

        // Assert
        var ex = await act.Should().ThrowAsync<ArgumentException>();
        ex.WithMessage("*mayor a cero*");
    }

    [Theory]
    [InlineData(10.555)]
    [InlineData(100.1234)]
    [InlineData(0.001)]
    public async Task TransferAsync_ShouldThrowArgumentException_WhenAmountHasMoreThanTwoDecimals(decimal invalidDecimalsAmount)
    {
        // Arrange
        var request = new TransferRequestDto
        {
            Destination = TargetAlias,
            Amount = invalidDecimalsAmount
        };

        // Act
        var act = () => _accountService.TransferAsync(SourceUserId, request);

        // Assert
        var ex = await act.Should().ThrowAsync<ArgumentException>();
        ex.WithMessage("*más de 2 decimales*");
    }

    #endregion

    #region 3. Cuenta Destino Inexistente / Inactiva Tests

    [Fact]
    public async Task TransferAsync_ShouldThrowKeyNotFoundException_WhenDestinationCvuDoesNotExist()
    {
        // Arrange
        var request = new TransferRequestDto
        {
            Destination = "0000003199999999999999", // CVU inexistente
            Amount = 100.00m
        };

        // Act
        var act = () => _accountService.TransferAsync(SourceUserId, request);

        // Assert
        var ex = await act.Should().ThrowAsync<KeyNotFoundException>();
        ex.WithMessage("*No se encontró ninguna cuenta*");
    }

    [Fact]
    public async Task TransferAsync_ShouldThrowKeyNotFoundException_WhenDestinationAliasDoesNotExist()
    {
        // Arrange
        var request = new TransferRequestDto
        {
            Destination = "alias.inexistente.xyz",
            Amount = 100.00m
        };

        // Act
        var act = () => _accountService.TransferAsync(SourceUserId, request);

        // Assert
        var ex = await act.Should().ThrowAsync<KeyNotFoundException>();
        ex.WithMessage("*No se encontró ninguna cuenta*");
    }

    [Theory]
    [InlineData("invalido")]
    [InlineData("12345")]
    [InlineData("un.solo.punto.")]
    [InlineData("dos..puntos.juntos")]
    public async Task TransferAsync_ShouldThrowArgumentException_WhenDestinationFormatIsInvalid(string invalidFormat)
    {
        // Arrange
        var request = new TransferRequestDto
        {
            Destination = invalidFormat,
            Amount = 100.00m
        };

        // Act
        var act = () => _accountService.TransferAsync(SourceUserId, request);

        // Assert
        var ex = await act.Should().ThrowAsync<ArgumentException>();
        ex.WithMessage("*debe ser un CVU válido*o un Alias*");
    }

    [Fact]
    public async Task TransferAsync_ShouldThrowInvalidOperationException_WhenTargetUserIsInactive()
    {
        // Arrange
        var request = new TransferRequestDto
        {
            Destination = InactiveAlias,
            Amount = 100.00m
        };

        // Act
        var act = () => _accountService.TransferAsync(SourceUserId, request);

        // Assert
        var ex = await act.Should().ThrowAsync<InvalidOperationException>();
        ex.WithMessage("*pertenece a un usuario inactivo*");
    }

    #endregion

    #region 4. Transferencia a la Propia Cuenta Tests

    [Fact]
    public async Task TransferAsync_ShouldThrowInvalidOperationException_WhenTransferringToOwnAlias()
    {
        // Arrange
        var request = new TransferRequestDto
        {
            Destination = SourceAlias, // Mismo alias del usuario emisor
            Amount = 100.00m
        };

        // Act
        var act = () => _accountService.TransferAsync(SourceUserId, request);

        // Assert
        var ex = await act.Should().ThrowAsync<InvalidOperationException>();
        ex.WithMessage("*No podés transferir dinero a tu propia cuenta*");
    }

    [Fact]
    public async Task TransferAsync_ShouldThrowInvalidOperationException_WhenTransferringToOwnCvu()
    {
        // Arrange
        var request = new TransferRequestDto
        {
            Destination = SourceCvu, // Mismo CVU del usuario emisor
            Amount = 100.00m
        };

        // Act
        var act = () => _accountService.TransferAsync(SourceUserId, request);

        // Assert
        var ex = await act.Should().ThrowAsync<InvalidOperationException>();
        ex.WithMessage("*No podés transferir dinero a tu propia cuenta*");
    }

    #endregion

    #region 5. Atomicidad ante Error Simulado Tests

    [Fact]
    public async Task TransferAsync_ShouldRollbackAndPreserveBalances_WhenFailureOccursDuringTransaction()
    {
        // Arrange
        var request = new TransferRequestDto
        {
            Destination = TargetAlias,
            Amount = 200.00m
        };

        // Configuramos el contexto para que falle en el SaveChangesAsync durante la creación de transacciones
        // Para simular una falla en el flujo transaccional:
        var brokenContext = new FailingWalletContext(_contextOptions);
        var failingService = new AccountService(
            brokenContext,
            _aliasGeneratorMock.Object,
            _cvuGeneratorMock.Object,
            _notificationServiceMock.Object
        );

        // Act
        var act = () => failingService.TransferAsync(SourceUserId, request);

        // Assert
        await act.Should().ThrowAsync<Exception>();

        // Verificar que los saldos en la base de datos no fueron alterados tras el rollback
        var sourceAcc = await _context.Accounts.AsNoTracking().FirstOrDefaultAsync(a => a.Id == 1);
        var targetAcc = await _context.Accounts.AsNoTracking().FirstOrDefaultAsync(a => a.Id == 2);
        sourceAcc!.Balance.Should().Be(1000.00m);
        targetAcc!.Balance.Should().Be(500.00m);

        // Verificar que no se persistieron transacciones huérfanas
        var transactions = await _context.Transactions.AsNoTracking().ToListAsync();
        transactions.Should().BeEmpty();
    }

    #endregion

    #region 6. Transferencia Exitosa (Happy Path)

    [Fact]
    public async Task TransferAsync_ShouldSuccessfullyTransferFunds_WhenDataIsValid()
    {
        // Arrange
        var request = new TransferRequestDto
        {
            Destination = TargetAlias,
            Amount = 300.00m
        };

        // Act
        var result = await _accountService.TransferAsync(SourceUserId, request);

        // Assert
        result.Should().NotBeNull();
        result.Amount.Should().Be(300.00m);
        result.NewBalance.Should().Be(700.00m);
        result.RecipientName.Should().Be("Maria Gomez");
        result.RecipientAlias.Should().Be(TargetAlias);
        result.RecipientCvu.Should().Be(TargetCvu);
        result.DebitTransactionId.Should().BeGreaterThan(0);
        result.CreditTransactionId.Should().BeGreaterThan(0);

        // Verificar saldos actualizados en BD
        var sourceAcc = await _context.Accounts.AsNoTracking().FirstOrDefaultAsync(a => a.Id == 1);
        var targetAcc = await _context.Accounts.AsNoTracking().FirstOrDefaultAsync(a => a.Id == 2);
        sourceAcc!.Balance.Should().Be(700.00m);
        targetAcc!.Balance.Should().Be(800.00m);

        // Verificar registros de transacciones creados y vinculados
        var debitTx = await _context.Transactions.FindAsync(result.DebitTransactionId);
        var creditTx = await _context.Transactions.FindAsync(result.CreditTransactionId);

        debitTx.Should().NotBeNull();
        debitTx!.AccountId.Should().Be(1);
        debitTx.CounterpartAccountId.Should().Be(2);
        debitTx.Type.Should().Be(TransactionType.Debit);
        debitTx.Amount.Should().Be(300.00m);
        debitTx.RelatedTransactionId.Should().Be(creditTx!.Id);

        creditTx.Should().NotBeNull();
        creditTx.AccountId.Should().Be(2);
        creditTx.CounterpartAccountId.Should().Be(1);
        creditTx.Type.Should().Be(TransactionType.Credit);
        creditTx.Amount.Should().Be(300.00m);
        creditTx.RelatedTransactionId.Should().Be(debitTx.Id);

        // Verificar que se invocaron las notificaciones para ambos usuarios
        _notificationServiceMock.Verify(n => n.CreateNotificationAsync(
            SourceUserId,
            "Transferencia enviada",
            It.Is<string>(s => s.Contains("300,00") || s.Contains("300.00")),
            "transfer_sent",
            debitTx.Id
        ), Times.Once);

        _notificationServiceMock.Verify(n => n.CreateNotificationAsync(
            TargetUserId,
            "Transferencia recibida",
            It.Is<string>(s => s.Contains("300,00") || s.Contains("300.00")),
            "transfer_received",
            creditTx.Id
        ), Times.Once);
    }

    #endregion

    private DbContextOptions<WalletContext> _contextOptions =>
        new DbContextOptionsBuilder<WalletContext>().UseSqlite(_connection).Options;

    /// <summary>
    /// Contexto derivado que simula un error de base de datos durante SaveChangesAsync
    /// para testear el rollback y la atomicidad.
    /// </summary>
    private class FailingWalletContext : WalletContext
    {
        public FailingWalletContext(DbContextOptions<WalletContext> options) : base(options) { }

        public override Task<int> SaveChangesAsync(System.Threading.CancellationToken cancellationToken = default)
        {
            throw new InvalidOperationException("Simulated database failure during transaction processing.");
        }
    }
}
