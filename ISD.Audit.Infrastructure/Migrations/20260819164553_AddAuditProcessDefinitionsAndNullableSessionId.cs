using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace ISD.Audit.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddAuditProcessDefinitionsAndNullableSessionId : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.EnsureSchema(
                name: "audit");

            migrationBuilder.CreateTable(
                name: "ProcessDefinition",
                schema: "audit",
                columns: table => new
                {
                    ProcessId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ProcessName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    StepName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    StepOrder = table.Column<int>(type: "int", nullable: false),
                    IsFinalStep = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    Description = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProcessDefinition", x => x.ProcessId);
                });

            migrationBuilder.CreateTable(
                name: "UserJourneyLogs",
                schema: "audit",
                columns: table => new
                {
                    LogId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    SessionId = table.Column<Guid>(type: "uniqueidentifier", maxLength: 150, nullable: true),
                    UserId = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    ProcessName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    StepName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Status = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    FailureReason = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: true),
                    MetadataJson = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserJourneyLogs", x => x.LogId);
                    table.CheckConstraint("CK_UserJourneyLogs_Status", "Status IN ('Success', 'Failed')");
                });

            migrationBuilder.InsertData(
                schema: "audit",
                table: "ProcessDefinition",
                columns: new[] { "ProcessId", "CreatedAt", "Description", "ProcessName", "StepName", "StepOrder" },
                values: new object[,]
                {
                    { 1, new DateTime(2026, 8, 15, 0, 0, 0, 0, DateTimeKind.Unspecified), null, "Registration", "SendRegistrationOTPAsync", 1 },
                    { 2, new DateTime(2026, 8, 15, 0, 0, 0, 0, DateTimeKind.Unspecified), null, "Registration", "RegisterAnonymousAsync", 2 },
                    { 3, new DateTime(2026, 8, 15, 0, 0, 0, 0, DateTimeKind.Unspecified), null, "Registration", "AddAddressInfoAsync", 3 },
                    { 4, new DateTime(2026, 8, 15, 0, 0, 0, 0, DateTimeKind.Unspecified), null, "Registration", "AddPersonalDataAsync", 4 },
                    { 5, new DateTime(2026, 8, 15, 0, 0, 0, 0, DateTimeKind.Unspecified), null, "Registration", "UpdatePersonalDocAsync", 5 }
                });

            migrationBuilder.InsertData(
                schema: "audit",
                table: "ProcessDefinition",
                columns: new[] { "ProcessId", "CreatedAt", "Description", "IsFinalStep", "ProcessName", "StepName", "StepOrder" },
                values: new object[] { 6, new DateTime(2026, 8, 15, 0, 0, 0, 0, DateTimeKind.Unspecified), null, true, "Registration", "AddSelfie", 6 });

            migrationBuilder.CreateIndex(
                name: "UQ_Process_StepName",
                schema: "audit",
                table: "ProcessDefinition",
                columns: new[] { "ProcessName", "StepName" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "UQ_Process_StepOrder",
                schema: "audit",
                table: "ProcessDefinition",
                columns: new[] { "ProcessName", "StepOrder" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_UserJourneyLogs_ProcessName_CreatedAt",
                schema: "audit",
                table: "UserJourneyLogs",
                columns: new[] { "ProcessName", "CreatedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_UserJourneyLogs_SessionId",
                schema: "audit",
                table: "UserJourneyLogs",
                column: "SessionId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ProcessDefinition",
                schema: "audit");

            migrationBuilder.DropTable(
                name: "UserJourneyLogs",
                schema: "audit");
        }
    }
}
