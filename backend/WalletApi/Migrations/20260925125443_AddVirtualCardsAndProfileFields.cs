using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WalletApi.Migrations
{
    /// <inheritdoc />
    public partial class AddVirtualCardsAndProfileFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                IF OBJECT_ID(N'[Notifications]', N'U') IS NULL
                BEGIN
                    CREATE TABLE [Notifications] (
                        [Id] int NOT NULL IDENTITY,
                        [UserId] int NOT NULL,
                        [Title] nvarchar(100) NOT NULL,
                        [Message] nvarchar(500) NOT NULL,
                        [Type] nvarchar(50) NOT NULL,
                        [IsRead] bit NOT NULL,
                        [CreatedAt] datetime2 NOT NULL DEFAULT (GETUTCDATE()),
                        [ReferenceId] int NULL,
                        CONSTRAINT [PK_Notifications] PRIMARY KEY ([Id]),
                        CONSTRAINT [FK_Notifications_Users] FOREIGN KEY ([UserId]) REFERENCES [AspNetUsers] ([Id]) ON DELETE CASCADE
                    );
                    CREATE INDEX [IX_Notifications_CreatedAt] ON [Notifications] ([CreatedAt]);
                    CREATE INDEX [IX_Notifications_UserId_IsRead] ON [Notifications] ([UserId], [IsRead]);
                END
            ");

            migrationBuilder.CreateTable(
                name: "VirtualCards",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    CardNumber = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ExpirationDate = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Cvv = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IsFrozen = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_VirtualCards", x => x.Id);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Notifications");

            migrationBuilder.DropTable(
                name: "VirtualCards");
        }
    }
}
