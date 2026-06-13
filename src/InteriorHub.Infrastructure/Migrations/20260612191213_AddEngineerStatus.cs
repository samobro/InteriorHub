using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace InteriorHub.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddEngineerStatus : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Engineers_IsApproved",
                table: "Engineers");

            migrationBuilder.AddColumn<string>(
                name: "Status",
                table: "Engineers",
                type: "character varying(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "Pending");

            migrationBuilder.CreateIndex(
                name: "IX_Engineers_Status",
                table: "Engineers",
                column: "Status");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Engineers_Status",
                table: "Engineers");

            migrationBuilder.DropColumn(
                name: "Status",
                table: "Engineers");

            migrationBuilder.CreateIndex(
                name: "IX_Engineers_IsApproved",
                table: "Engineers",
                column: "IsApproved");
        }
    }
}
